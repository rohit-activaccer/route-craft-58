# Docker Deployment Guide

## Quick Start

### Option 1: Using Docker Compose (Recommended)
```bash
docker-compose up -d
```
Access the app at: http://localhost:3000

### Option 2: Using Docker Build Script
```bash
chmod +x docker-build.sh
./docker-build.sh
```

### Option 3: Manual Docker Commands
```bash
# Build the image
docker build -t freight-bidding-app .

# Run the container
docker run -d -p 3000:80 --name freight-app freight-bidding-app
```

## Environment Variables

Create a `.env.production` file for production deployment:
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Production Deployment

1. **Clone the repository**
2. **Set environment variables**
3. **Run with Docker Compose**:
   ```bash
   docker-compose up -d
   ```

## Development with Docker

For development with hot reload:
```bash
# Install dependencies locally first
npm install

# Then run in development mode
npm run dev
```

## Downloading the Codebase

To get the full codebase:
1. **Via GitHub**: Connect your Lovable project to GitHub (button in top-right)
2. **Via Dev Mode**: Enable Dev Mode in Lovable and download files
3. **Via Git Clone**: After GitHub connection:
   ```bash
   git clone your-repo-url
   cd your-project
   npm install
   ```

## Project Structure

- `Dockerfile` - Multi-stage build for production
- `docker-compose.yml` - Easy deployment orchestration
- `nginx.conf` - Optimized Nginx configuration
- `.dockerignore` - Excludes unnecessary files from Docker build