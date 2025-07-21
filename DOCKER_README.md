# 🏸 Badminton Court Management System - Docker Setup

## 🚀 Quick Start

### Prerequisites

- Docker Desktop installed and running
- At least 4GB RAM available for Docker

### 1. Start the System

```bash
# Make scripts executable
chmod +x start-server.sh stop-server.sh

# Start all services
./start-server.sh
```

### 2. Access the Application

- **Backend API**: http://localhost:8081
- **API Documentation**: http://localhost:8081/swagger-ui.html
- **Health Check**: http://localhost:8081/actuator/health
- **MySQL Database**: localhost:3308 (root/root)
- **Redis**: localhost:6379

### 3. Stop the System

```bash
# Stop services only
./stop-server.sh

# Stop services and remove all data
./stop-server.sh --cleanup
```

## 📋 Manual Commands

### Start Services

```bash
# Using Docker Compose v2
docker compose up --build -d

# Using Docker Compose v1
docker-compose up --build -d
```

### Check Status

```bash
# View running containers
docker compose ps

# View logs
docker compose logs -f

# View specific service logs
docker compose logs -f backend
docker compose logs -f mysql
docker compose logs -f redis
```

### Stop Services

```bash
# Stop only
docker compose down

# Stop and remove volumes (all data)
docker compose down -v
```

## 🔧 Development

### Database Access

```bash
# Connect to MySQL
docker exec -it badminton_mysql mysql -u root -p
# Password: root

# Connect to Redis
docker exec -it badminton_redis redis-cli
```

### Rebuild Backend Only

```bash
# Rebuild and restart backend service
docker compose up --build backend -d
```

### View Application Logs

```bash
# Real-time logs
docker compose logs -f backend

# Last 100 lines
docker compose logs --tail=100 backend
```

## 🗂️ Services Overview

| Service | Container Name    | Port | Purpose         |
| ------- | ----------------- | ---- | --------------- |
| MySQL   | badminton_mysql   | 3308 | Database        |
| Redis   | badminton_redis   | 6379 | Cache & Session |
| Backend | badminton_backend | 8081 | Spring Boot API |

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   MySQL 8.0     │    │   Redis 7       │    │  Spring Boot    │
│   Port: 3308    │    │   Port: 6379    │    │   Port: 8081    │
│                 │    │                 │    │                 │
│ - Database      │    │ - Cache         │    │ - REST API      │
│ - Persistent    │    │ - Sessions      │    │ - Business      │
│   Storage       │    │ - Temp Data     │    │   Logic         │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🔍 Troubleshooting

### Common Issues

1. **Port Already in Use**

   ```bash
   # Find process using port
   lsof -i :8081
   lsof -i :3308
   lsof -i :6379

   # Kill process if needed
   kill -9 <PID>
   ```

2. **Database Connection Issues**

   ```bash
   # Check MySQL container
   docker compose logs mysql

   # Verify MySQL is ready
   docker exec badminton_mysql mysqladmin ping -h localhost
   ```

3. **Backend Startup Issues**

   ```bash
   # Check backend logs
   docker compose logs backend

   # Restart backend only
   docker compose restart backend
   ```

4. **Complete Reset**

   ```bash
   # Stop and remove everything
   ./stop-server.sh --cleanup

   # Remove Docker images
   docker rmi $(docker images "*badminton*" -q)

   # Start fresh
   ./start-server.sh
   ```

## 📊 Health Checks

All services include health checks:

- **MySQL**: `mysqladmin ping`
- **Redis**: `redis-cli ping`
- **Backend**: `curl http://localhost:8081/actuator/health`

## 🔐 Default Credentials

### MySQL

- **Root Password**: `root`
- **Database**: `badminton_management`
- **User**: `badminton`
- **Password**: `badminton123`

### Application

Check the sample data in `database/sample-data-simple.sql` for user accounts.

## 📱 API Testing

### Using curl

```bash
# Health check
curl http://localhost:8081/actuator/health

# API endpoints (after startup)
curl http://localhost:8081/api/health
```

### Using Swagger UI

Visit: http://localhost:8081/swagger-ui.html

---

_Created with ❤️ for Đạt đại ca_
