# ============================================
# POSTGRESQL DATABASE
# ============================================
DB_HOST=localhost
DB_PORT=5432
DB_NAME=bahroz
DB_USER=postgres
DB_PASSWORD=Esma4hel3@xade04
PGCLIENTENCODING=UTF8


# ============================================
# REDIS DATABASE
# ============================================
REDIS_HOST=127.0.0.1
REDIS_PORT=6379

# ============================================
# AUTHENTICATION
# ============================================
JWT_SECRET=55d10fcd7a681d216630b5233f566d1e95ae4027a8e99378c1b597dfdb0bfd7d
IRON_SESSION_PASSWORD=6b38ac52ef37e3337ce24a86dc1648efd11ee4da60e0787007bd1302d9a86fb5
# ============================================
# APP CONFIGURATION
# ============================================
PORT=3007
# Internal URL - Next.js runs on localhost:3007, Nginx reverse proxy handles domain routing
# Nginx will forward requests from bahroz.net to localhost:3007
NEXT_PUBLIC_APP_URL=http://localhost:3007
NEXT_PUBLIC_APP_NAME=BAHROZ

# ============================================
# CORS CONFIGURATION (Comma-separated list of allowed origins)
# ============================================
ALLOWED_DEV_ORIGINS=192.168.1.2,localhost,127.0.0.1,0.0.0.0,194.62.1.126

# ============================================
# TIKTOK INTEGRATION (Optional)
# ============================================
TIKTOK_EVENTS_API_TOKEN=

# ============================================
# DEVELOPMENT/PRODUCTION
# ============================================
NODE_ENV=production