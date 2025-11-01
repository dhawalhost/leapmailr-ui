# Docker Setup for LeapMailr UI

This guide covers running the LeapMailr UI dashboard using Docker.

## Quick Start

#### Prerequisites
- Docker installed
- Docker Compose installed
- Backend API running (or accessible)

### Production Mode

```bash
# 1. Copy environment file
cp .env.example .env

# 2. Edit .env with your backend URL
# NEXT_PUBLIC_API_URL=http://localhost:8080/api/v1

# 3. Build and run
docker-compose up -d

# 4. Access the UI
# http://localhost:3000
```

### Development Mode (with hot reload)

```bash
# 1. Copy environment file
cp .env.example .env.local

# 2. Run development container
docker-compose -f docker-compose.dev.yml up

# Code changes will hot-reload automatically
```

## Available Configurations

### 1. Standalone UI (docker-compose.yml)
Runs only the frontend UI. Requires backend to be running separately.

```bash
docker-compose up -d
```

### 2. Development Mode (docker-compose.dev.yml)
Runs UI with hot reload for development.

```bash
docker-compose -f docker-compose.dev.yml up
```

### 3. Full Stack (../docker-compose.yml)
Runs frontend, backend, and database together.

```bash
cd ..
docker-compose up -d
```

## Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API endpoint | `http://localhost:8080/api/v1` |
| `FRONTEND_PORT` | Port to expose UI | `3000` |
| `NODE_ENV` | Environment mode | `production` |

### Connecting to Backend

**Option 1: Backend on host machine**
```env
NEXT_PUBLIC_API_URL=http://localhost:8080/api/v1
```

**Option 2: Backend in Docker (same network)**
```env
NEXT_PUBLIC_API_URL=http://backend:8080/api/v1
```

**Option 3: Remote backend**
```env
NEXT_PUBLIC_API_URL=https://api.yourdomain.com/api/v1
```

## Common Commands

### Build and Start
```bash
# Production
docker-compose up -d

# Development
docker-compose -f docker-compose.dev.yml up
```

### View Logs
```bash
docker-compose logs -f frontend
```

### Rebuild After Changes
```bash
docker-compose up -d --build
```

### Stop Services
```bash
docker-compose down
```

### Clean Everything
```bash
docker-compose down -v
docker system prune -f
```

## Troubleshooting

### UI Can't Connect to Backend

1. **Check backend is running:**
   ```bash
   curl http://localhost:8080/api/v1/health
   ```

2. **Verify CORS settings** in backend allow your frontend URL

3. **Check network connectivity:**
   ```bash
   docker-compose exec frontend wget -O- http://backend:8080/api/v1/health
   ```

### Port Already in Use

```bash
# Use different port
FRONTEND_PORT=3001 docker-compose up -d
```

### Container Keeps Restarting

```bash
# Check logs
docker-compose logs frontend

# Common issues:
# - Missing environment variables
# - Can't connect to backend
# - Build errors
```

### Hot Reload Not Working (Development)

1. Make sure you're using `docker-compose.dev.yml`
2. Verify volume mounts are working:
   ```bash
   docker-compose -f docker-compose.dev.yml exec frontend-dev ls -la /app
   ```

## Advanced Usage

### Custom Network (Connect to Existing Backend)

If your backend is running in a separate Docker network:

1. Edit `docker-compose.yml`:
   ```yaml
   networks:
     leapmailr-network:
       external: true  # Use existing network
   ```

2. Start UI:
   ```bash
   docker-compose up -d
   ```

### Production Deployment

```bash
# Build optimized image
docker build -t leapmailr-ui:latest .

# Tag for registry
docker tag leapmailr-ui:latest your-registry.com/leapmailr-ui:1.0.0

# Push to registry
docker push your-registry.com/leapmailr-ui:1.0.0

# Deploy
docker run -d \
  -p 3000:3000 \
  -e NEXT_PUBLIC_API_URL=https://api.yourdomain.com/api/v1 \
  --name leapmailr-ui \
  your-registry.com/leapmailr-ui:1.0.0
```

### Health Checks

The container includes a health check that pings the UI every 30 seconds:

```bash
# Check health status
docker-compose ps

# Should show "healthy" status
```

## Integration with Main Stack

To run the UI as part of the complete LeapMailr stack:

```bash
# From the root directory
cd ..
docker-compose up -d

# This starts:
# - PostgreSQL (port 5432)
# - Backend API (port 8080)  
# - Frontend UI (port 3000)
```

## Development Workflow

### 1. Local Development (Recommended)

Run backend in Docker, UI locally:

```bash
# Terminal 1: Start backend and database
cd ..
docker-compose up -d postgres backend

# Terminal 2: Run UI locally
cd leapmailr-ui
npm install
npm run dev
```

### 2. Full Docker Development

All services in Docker with hot reload:

```bash
# From root directory
docker-compose up -d postgres backend

# From UI directory
cd leapmailr-ui
docker-compose -f docker-compose.dev.yml up
```

## Performance Tips

1. **Use `.dockerignore`** - Already configured to exclude `node_modules`, `.git`, etc.

2. **Layer caching** - The Dockerfile is optimized for layer caching

3. **Multi-stage build** - Production image only includes built files

4. **Resource limits** (optional):
   ```yaml
   services:
     frontend:
       deploy:
         resources:
           limits:
             cpus: '0.5'
             memory: 512M
   ```

## Monitoring

### Container Stats
```bash
docker stats leapmailr-ui
```

### Logs
```bash
# Real-time logs
docker-compose logs -f frontend

# Last 100 lines
docker-compose logs --tail=100 frontend
```

### Health Status
```bash
curl http://localhost:3000
# Should return 200 if healthy
```

## Security Considerations

1. **Environment Variables**: Never commit `.env` files
2. **API URLs**: Use HTTPS in production
3. **Network Isolation**: Use Docker networks
4. **Regular Updates**: Keep base images updated
5. **Scan Images**: `docker scan leapmailr-ui`

## Support

For issues or questions:
- Check logs: `docker-compose logs frontend`
- Verify environment: `docker-compose exec frontend env`
- Test API connection: `docker-compose exec frontend wget -O- $NEXT_PUBLIC_API_URL/health`

---

For the complete stack setup, see [../DOCKER.md](../DOCKER.md)
