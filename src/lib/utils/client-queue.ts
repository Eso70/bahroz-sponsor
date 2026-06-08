/**
 * Client-side queue for analytics events
 * Queues events in localStorage and sends them in batches to reduce API calls
 */

const QUEUE_KEY = 'analytics_queue';
const QUEUE_MAX_SIZE = 100; // Max items to queue before forcing flush
const FLUSH_INTERVAL = 3600000; // Flush every 1 hour (3600 seconds) - minimal API calls for free tier
const MAX_AGE = 7 * 24 * 60 * 60 * 1000; // 7 days

// Race condition protection - prevent concurrent flushes
let isFlushing = false;

interface QueuedView {
  type: 'view';
  uid: string;
  timestamp: number;
  eventId?: string;
  contentId?: string;
  contentName?: string;
  contentType?: string;
  description?: string;
  url?: string;
}

interface QueuedClick {
  type: 'click';
  linkId: string;
  linktreeId: string;
  timestamp: number;
  platform?: string;
  eventName?: 'ClickButton' | 'Contact' | 'Lead';
  eventId?: string;
  contentId?: string;
  contentName?: string;
  contentType?: string;
  description?: string;
  url?: string;
}

type QueuedEvent = QueuedView | QueuedClick;

function getDayKeyFromTimestamp(timestamp: number): string {
  return new Date(timestamp).toISOString().slice(0, 10);
}

function isLocalStorageAvailable(): boolean {
  try {
    const test = '__localStorage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
}

function getQueue(): QueuedEvent[] {
  if (!isLocalStorageAvailable()) return [];
  
  try {
    const stored = localStorage.getItem(QUEUE_KEY);
    if (!stored) return [];
    
    const queue: QueuedEvent[] = JSON.parse(stored);
    const now = Date.now();
    
    // Filter out old items (older than MAX_AGE)
    const filtered = queue.filter(item => (now - item.timestamp) < MAX_AGE);
    
    // Update storage if items were filtered
    if (filtered.length !== queue.length) {
      localStorage.setItem(QUEUE_KEY, JSON.stringify(filtered));
    }
    
    return filtered;
  } catch {
    return [];
  }
}

function saveQueue(queue: QueuedEvent[]): void {
  if (!isLocalStorageAvailable()) return;
  
  try {
    localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
  } catch {
    // Ignore errors (localStorage might be full)
  }
}

function addToQueue(event: QueuedEvent): void {
  const queue = getQueue();
  queue.push(event);
  
  // Limit queue size
  if (queue.length > QUEUE_MAX_SIZE) {
    // Remove oldest items
    queue.splice(0, queue.length - QUEUE_MAX_SIZE);
  }
  
  saveQueue(queue);
  
  // Flush if queue is full - fire and forget (background operation)
  if (queue.length >= QUEUE_MAX_SIZE) {
    flushQueue().catch(() => {
      // Silently fail - will retry on next flush or interval
    });
  }
}

async function flushQueue(): Promise<void> {
  // Prevent concurrent flushes
  if (isFlushing) {
    return;
  }
  
  const queue = getQueue();
  // Early return if queue is empty
  if (queue.length === 0) return;
  
  isFlushing = true;
  
  try {
    // Group events by type BEFORE clearing queue (so we can restore on failure)
    const views = queue.filter((e): e is QueuedView => e.type === 'view');
    const clicks = queue.filter((e): e is QueuedClick => e.type === 'click');
    
    // Early return if both queues are empty
    if (views.length === 0 && clicks.length === 0) {
      saveQueue([]);
      return; // No data to send, skip API calls
    }
    
    // Prepare batch payload
    const batchViews: Array<Omit<QueuedView, 'type'>> = [];
    const batchClicks: Array<Omit<QueuedClick, 'type'>> = [];
    
    // Collect unique views
    if (views.length > 0) {
      const uniqueViews = new Map<string, QueuedView>();
      views.forEach(view => {
        // Only add if UID is valid and not empty/null
        if (view.uid && view.uid.trim()) {
          const key = `${view.uid.trim()}_${getDayKeyFromTimestamp(view.timestamp)}`;
          if (!uniqueViews.has(key)) {
            uniqueViews.set(key, view);
          }
        }
      });
      
      // Add to batch payload
      for (const view of uniqueViews.values()) {
        if (view.uid && view.uid.trim()) {
          batchViews.push({
            uid: view.uid.trim(),
            timestamp: view.timestamp,
            eventId: view.eventId,
            contentId: view.contentId,
            contentName: view.contentName,
            contentType: view.contentType,
            description: view.description,
            url: view.url,
          });
        }
      }
    }
    
    // Collect unique clicks
    if (clicks.length > 0) {
      const uniqueClicks = new Map<string, QueuedClick>();
      clicks.forEach(click => {
        // Only add if linkId and linktreeId are valid and not empty/null
        if (click.linkId && click.linkId.trim() && click.linktreeId && click.linktreeId.trim()) {
          const key = `${click.linkId.trim()}_${click.linktreeId.trim()}_${getDayKeyFromTimestamp(click.timestamp)}`;
          if (!uniqueClicks.has(key)) {
            uniqueClicks.set(key, click);
          }
        }
      });
      
      // Add to batch payload
      for (const click of uniqueClicks.values()) {
        if (click.linkId && click.linkId.trim() && click.linktreeId && click.linktreeId.trim()) {
          batchClicks.push({
            linkId: click.linkId.trim(),
            linktreeId: click.linktreeId.trim(),
            timestamp: click.timestamp,
            platform: click.platform?.trim() || undefined,
            eventName: click.eventName,
            eventId: click.eventId,
            contentId: click.contentId,
            contentName: click.contentName,
            contentType: click.contentType,
            description: click.description,
            url: click.url,
          });
        }
      }
    }
    
    // Send single batch request instead of individual requests
    if (batchViews.length > 0 || batchClicks.length > 0) {
      // Clear queue BEFORE sending (optimistic approach)
      saveQueue([]);
      
      const response = await fetch('/api/analytics/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          views: batchViews,
          clicks: batchClicks,
        }),
        keepalive: true,
      });
      
      if (!response.ok) {
        // On failure, restore events to queue for retry
        const failedEvents: QueuedEvent[] = [];
        
        // Restore views
        if (batchViews.length > 0 && views.length > 0) {
          const viewMap = new Map<string, QueuedView>();
          views.forEach(v => {
            if (v.uid && v.uid.trim() && !viewMap.has(v.uid)) {
              viewMap.set(v.uid, v);
            }
          });
          failedEvents.push(...viewMap.values());
        }
        
        // Restore clicks
        if (batchClicks.length > 0 && clicks.length > 0) {
          const clickMap = new Map<string, QueuedClick>();
          clicks.forEach(c => {
            if (c.linkId && c.linkId.trim() && c.linktreeId && c.linktreeId.trim()) {
              const key = `${c.linkId.trim()}_${c.linktreeId.trim()}`;
              if (!clickMap.has(key)) {
                clickMap.set(key, c);
              }
            }
          });
          failedEvents.push(...clickMap.values());
        }
        
        if (failedEvents.length > 0) {
          const currentQueue = getQueue();
          currentQueue.push(...failedEvents);
          saveQueue(currentQueue);
        }
        
        throw new Error(`Failed to flush queue: ${response.status} ${response.statusText}`);
      }
      
      // Wait for response to ensure data is received by server
      await response.json();
    } else {
      // No valid data to send, clear queue
      saveQueue([]);
    }
  } catch (error) {
    // Re-throw error so caller knows flush failed
    throw error;
  } finally {
    isFlushing = false;
  }
}

// Auto-flush queue periodically to ensure data is sent to server
let flushIntervalId: ReturnType<typeof setInterval> | null = null;

if (typeof window !== 'undefined') {
  // Flush every FLUSH_INTERVAL (1 hour) to send queued data to server
  flushIntervalId = setInterval(() => {
    const queue = getQueue();
    if (queue && queue.length > 0) {
      flushQueue().catch(() => {
        // Silently fail - will retry on next interval or manual flush
      });
    }
  }, FLUSH_INTERVAL);
  
  // Flush on page unload to ensure data is sent before page closes
  window.addEventListener('beforeunload', () => {
    if (flushIntervalId) {
      clearInterval(flushIntervalId);
    }
    // Use sendBeacon for reliable delivery on page unload
    const queue = getQueue();
    if (queue && queue.length > 0) {
      // Try to flush synchronously if possible
      flushQueue().catch(() => {});
    }
  });
  
  // Flush on visibility change (when tab becomes hidden) to send data to server
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      const queue = getQueue();
      if (queue && queue.length > 0) {
        flushQueue().catch(() => {});
      }
    }
  });
}

export function queueView(uid: string, metadata?: Omit<QueuedView, 'type' | 'uid' | 'timestamp'>): void {
  // Only queue if UID is valid and not empty/null
  if (!uid || !uid.trim()) {
    return;
  }
  addToQueue({
    type: 'view',
    uid: uid.trim(),
    timestamp: Date.now(),
    ...metadata,
  });
}

export function queueClick(
  linkId: string,
  linktreeId: string,
  platform?: string,
  metadata?: Omit<QueuedClick, 'type' | 'linkId' | 'linktreeId' | 'timestamp' | 'platform'>
): void {
  // Only queue if both linkId and linktreeId are valid and not empty/null
  if (!linkId || !linkId.trim() || !linktreeId || !linktreeId.trim()) {
    return;
  }
  addToQueue({
    type: 'click',
    linkId: linkId.trim(),
    linktreeId: linktreeId.trim(),
    timestamp: Date.now(),
    platform: platform?.trim() || undefined,
    ...metadata,
  });
}

export function flushNow(): Promise<void> {
  return flushQueue();
}
