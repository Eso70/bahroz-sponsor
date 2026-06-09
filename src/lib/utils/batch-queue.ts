/**
 * Batch queue for analytics inserts
 * Reduces database load by batching multiple inserts together via Redis
 */

import { query } from "@/lib/database/client";
import { getRedisClient, isCacheAvailable } from "@/lib/database/redis";

interface ViewRecord {
  linktree_id: string;
  ip_address: string;
  session_id: string | null;
  viewed_at: string;
}

interface ClickRecord {
  link_id: string;
  linktree_id: string;
  ip_address: string;
  session_id: string | null;
  clicked_at: string;
}

class BatchQueue<T extends ViewRecord | ClickRecord> {
  private queueKey: string;
  private flushInterval: NodeJS.Timeout | null = null;
  private readonly maxBatchSize: number;
  private readonly flushIntervalMs: number;
  private readonly insertFn: (items: T[]) => Promise<void>;
  private isProcessing = false;

  constructor(
    queueKey: string,
    insertFn: (items: T[]) => Promise<void>,
    maxBatchSize = 1000,
    flushIntervalMs = 3600000 // 1 hour interval fallback for safety
  ) {
    this.queueKey = queueKey;
    this.insertFn = insertFn;
    this.maxBatchSize = maxBatchSize;
    this.flushIntervalMs = flushIntervalMs;
    this.startFlushInterval();
  }

  async add(item: T): Promise<void> {
    const client = getRedisClient();
    if (client && isCacheAvailable()) {
      try {
        await client.rpush(this.queueKey, JSON.stringify(item));
        
        // Immediate flush check in the background
        const len = await client.llen(this.queueKey);
        if (len >= this.maxBatchSize) {
          this.flush().catch(() => {});
        }
      } catch (err) {
        console.warn(`⚠️ Failed to queue item in Redis for key "${this.queueKey}":`, err);
        // Fallback: write directly to database immediately if Redis is throwing exceptions
        this.insertFn([item]).catch(() => {});
      }
    } else {
      // Redis is offline: fallback to direct database insert immediately
      this.insertFn([item]).catch(() => {});
    }
  }

  private startFlushInterval(): void {
    if (typeof window !== "undefined") return; // Skip on client
    
    this.flushInterval = setInterval(() => {
      this.flush().catch((error) => {
        const isIgnorableError = 
          error && 
          typeof error === 'object' && 
          'code' in error && 
          (String(error.code).includes('23505') || String(error.code).includes('23503'));
        
        if (!isIgnorableError) {
          console.error(`Auto-flush error for key "${this.queueKey}":`, error);
        }
      });
    }, this.flushIntervalMs);
  }

  async flush(): Promise<void> {
    if (this.isProcessing) {
      return;
    }

    const client = getRedisClient();
    if (!client || !isCacheAvailable()) {
      return;
    }

    this.isProcessing = true;

    try {
      // Retrieve and remove batch from Redis list atomically using Lua script
      const rawItems = await client.popBatch(this.queueKey, this.maxBatchSize);
      
      if (!rawItems || rawItems.length === 0) {
        this.isProcessing = false;
        return;
      }

      const itemsToInsert = rawItems.map(item => JSON.parse(item) as T);

      try {
        await this.insertFn(itemsToInsert);
      } catch (error) {
        const isIgnorableError = 
          error && 
          typeof error === 'object' && 
          'code' in error && 
          (String(error.code).includes('23505') || String(error.code).includes('23503'));
        
        if (!isIgnorableError) {
          console.error(`Batch insert error for key "${this.queueKey}":`, error);
          
          // Re-queue the failed items at the head of the Redis list so they are retried first
          const rawItemsToRequeue = itemsToInsert.map(item => JSON.stringify(item));
          if (rawItemsToRequeue.length > 0) {
            await client.lpush(this.queueKey, ...rawItemsToRequeue);
          }
          throw error;
        }
      }
    } catch (error) {
      console.warn(`⚠️ Failed to flush Redis queue for "${this.queueKey}":`, error);
    } finally {
      this.isProcessing = false;
    }
  }

  destroy(): void {
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
      this.flushInterval = null;
    }
  }
}

// Global queues (singleton pattern)
let viewQueue: BatchQueue<ViewRecord> | null = null;
let clickQueue: BatchQueue<ClickRecord> | null = null;

export async function initializeQueues() {
  if (typeof window !== 'undefined') return; // Client-side, skip

  // Initialize view queue with Redis key
  if (!viewQueue) {
    viewQueue = new BatchQueue<ViewRecord>(
      "queue:analytics:views",
      async (items) => {
        if (!items || items.length === 0) return;
        
        const validItems = items.filter(item => 
          item && 
          item.linktree_id && 
          item.linktree_id.trim() && 
          item.ip_address && 
          item.ip_address.trim()
        );
        
        if (validItems.length === 0) return;
        
        try {
          // Check which linktree_ids actually exist to avoid foreign key violations and data loss
          const uniqueLinktreeIds = Array.from(new Set(validItems.map(item => item.linktree_id)));
          if (uniqueLinktreeIds.length === 0) return;

          const placeholdersIds = uniqueLinktreeIds.map((_, i) => `$${i + 1}`).join(', ');
          const existsResult = await query<{ id: string }>(
            `SELECT id FROM linktrees WHERE id IN (${placeholdersIds})`,
            uniqueLinktreeIds
          );
          const existingIds = new Set(existsResult.rows.map(row => row.id));

          const itemsToInsert = validItems.filter(item => existingIds.has(item.linktree_id));
          if (itemsToInsert.length === 0) return;

          const values: unknown[] = [];
          const placeholders: string[] = [];
          let paramIndex = 1;

          for (const item of itemsToInsert) {
            const viewedDay = new Date(item.viewed_at).toISOString().slice(0, 10);
            placeholders.push(`($${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++})`);
            values.push(
              item.linktree_id,
              item.ip_address,
              item.session_id || null,
              item.viewed_at,
              viewedDay
            );
          }

          await query(
            `INSERT INTO page_views (linktree_id, ip_address, session_id, viewed_at, viewed_day)
             VALUES ${placeholders.join(', ')}
             ON CONFLICT DO NOTHING`,
            values
          );
        } catch (error: unknown) {
          const errorCode = error && typeof error === 'object' && 'code' in error ? String(error.code) : '';
          if (!errorCode.includes('23505') && !errorCode.includes('23503')) {
            throw error;
          }
        }
      }
    );
  }

  // Initialize click queue with Redis key
  if (!clickQueue) {
    clickQueue = new BatchQueue<ClickRecord>(
      "queue:analytics:clicks",
      async (items) => {
        if (!items || items.length === 0) return;
        
        const validItems = items.filter(item => 
          item && 
          item.link_id && 
          item.link_id.trim() && 
          item.linktree_id && 
          item.linktree_id.trim() && 
          item.ip_address && 
          item.ip_address.trim()
        );
        
        if (validItems.length === 0) return;
        
        try {
          // Check which linktree_ids and link_ids exist to avoid foreign key violations and data loss
          const uniqueLinktreeIds = Array.from(new Set(validItems.map(item => item.linktree_id)));
          const uniqueLinkIds = Array.from(new Set(validItems.map(item => item.link_id)));
          
          if (uniqueLinktreeIds.length === 0 || uniqueLinkIds.length === 0) return;

          const ltPlaceholders = uniqueLinktreeIds.map((_, i) => `$${i + 1}`).join(', ');
          const ltExistsResult = await query<{ id: string }>(
            `SELECT id FROM linktrees WHERE id IN (${ltPlaceholders})`,
            uniqueLinktreeIds
          );
          const existingLtIds = new Set(ltExistsResult.rows.map(row => row.id));

          const lPlaceholders = uniqueLinkIds.map((_, i) => `$${i + 1}`).join(', ');
          const lExistsResult = await query<{ id: string }>(
            `SELECT id FROM links WHERE id IN (${lPlaceholders})`,
            uniqueLinkIds
          );
          const existingLIds = new Set(lExistsResult.rows.map(row => row.id));

          const itemsToInsert = validItems.filter(item => 
            existingLtIds.has(item.linktree_id) && existingLIds.has(item.link_id)
          );
          if (itemsToInsert.length === 0) return;

          const values: unknown[] = [];
          const placeholders: string[] = [];
          let paramIndex = 1;

          for (const item of itemsToInsert) {
            const clickedDay = new Date(item.clicked_at).toISOString().slice(0, 10);
            placeholders.push(`($${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++})`);
            values.push(
              item.link_id,
              item.linktree_id,
              item.ip_address,
              item.session_id || null,
              item.clicked_at,
              clickedDay
            );
          }

          await query(
            `INSERT INTO link_clicks (link_id, linktree_id, ip_address, session_id, clicked_at, clicked_day)
             VALUES ${placeholders.join(', ')}
             ON CONFLICT DO NOTHING`,
            values
          );
        } catch (error: unknown) {
          const errorCode = error && typeof error === 'object' && 'code' in error ? String(error.code) : '';
          if (!errorCode.includes('23505') && !errorCode.includes('23503')) {
            throw error;
          }
        }
      }
    );
  }
}

export async function addView(view: ViewRecord): Promise<void> {
  if (!view || !view.linktree_id || !view.linktree_id.trim() || !view.ip_address || !view.ip_address.trim()) {
    return;
  }

  // Deduplicate views per session/IP per day inside Redis Set
  const client = getRedisClient();
  if (client && isCacheAvailable()) {
    try {
      const viewedDay = new Date(view.viewed_at).toISOString().slice(0, 10);
      const userKey = view.session_id || view.ip_address;
      const redisKey = `dedup:views:${viewedDay}:${view.linktree_id}`;
      
      const added = await client.sadd(redisKey, userKey);
      if (added === 0) {
        // Already tracked today, skip adding to queue
        return;
      }
      
      // Set key to expire in 26 hours (longer than 24 hours to cover day boundaries safely)
      await client.expire(redisKey, 93600);
    } catch (err) {
      console.warn("⚠️ Redis view deduplication error:", err);
      // Fallback: continue and let Postgres index handle deduplication on conflict
    }
  }
  
  if (!viewQueue) {
    await initializeQueues();
  }
  
  if (viewQueue) {
    await viewQueue.add(view);
  }
}

export async function addClick(click: ClickRecord): Promise<void> {
  if (!click || !click.link_id || !click.link_id.trim() || !click.linktree_id || !click.linktree_id.trim() || !click.ip_address || !click.ip_address.trim()) {
    return;
  }

  // Deduplicate clicks per session/IP per day inside Redis Set
  const client = getRedisClient();
  if (client && isCacheAvailable()) {
    try {
      const clickedDay = new Date(click.clicked_at).toISOString().slice(0, 10);
      const userKey = click.session_id || click.ip_address;
      const redisKey = `dedup:clicks:${clickedDay}:${click.link_id}`;
      
      const added = await client.sadd(redisKey, userKey);
      if (added === 0) {
        // Already tracked today, skip adding to queue
        return;
      }
      
      await client.expire(redisKey, 93600);
    } catch (err) {
      console.warn("⚠️ Redis click deduplication error:", err);
    }
  }
  
  if (!clickQueue) {
    await initializeQueues();
  }
  
  if (clickQueue) {
    await clickQueue.add(click);
  }
}

// Flush queues on server shutdown to prevent data loss
if (typeof process !== 'undefined') {
  const flushAll = async () => {
    if (viewQueue) {
      await viewQueue.flush();
      viewQueue.destroy();
    }
    if (clickQueue) {
      await clickQueue.flush();
      clickQueue.destroy();
    }
  };

  process.on('SIGTERM', async () => {
    await flushAll();
    process.exit(0);
  });
  process.on('SIGINT', async () => {
    await flushAll();
    process.exit(0);
  });
  process.on('beforeExit', async () => {
    await flushAll();
  });
}

// Export function to manually flush all queues (for admin refresh)
export async function flushAllQueues(): Promise<void> {
  if (typeof window !== 'undefined') return; // Client-side, skip
  
  try {
    await initializeQueues();
  } catch (initError) {
    console.error("Error initializing queues:", initError);
    throw new Error(`Failed to initialize queues: ${initError instanceof Error ? initError.message : String(initError)}`);
  }
  
  const flushPromises: Promise<void>[] = [];
  
  if (viewQueue) {
    flushPromises.push(viewQueue.flush());
  }
  
  if (clickQueue) {
    flushPromises.push(clickQueue.flush());
  }
  
  if (flushPromises.length > 0) {
    try {
      await Promise.all(flushPromises);
    } catch (error) {
      console.error("Error flushing queues:", error);
      throw error;
    }
  }
}

// Initialize queues on module load
if (typeof window === 'undefined') {
  initializeQueues().catch(() => {});
}
