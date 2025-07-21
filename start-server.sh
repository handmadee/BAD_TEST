#!/bin/bash

echo "🚀 Starting Badminton Court Management System..."

# Function to check if Docker is running
check_docker() {
    if ! docker info > /dev/null 2>&1; then
        echo "❌ Docker is not running. Please start Docker Desktop first."
        exit 1
    fi
    echo "✅ Docker is running"
}

# Function to check if docker-compose is available
check_docker_compose() {
    if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
        echo "❌ Docker Compose is not available. Please install Docker Compose."
        exit 1
    fi
    echo "✅ Docker Compose is available"
}

# Function to start services
start_services() {
    echo "🔧 Building and starting services..."
    
    # Use docker compose if available, otherwise use docker-compose
    if docker compose version &> /dev/null; then
        docker compose up --build -d
    else
        docker-compose up --build -d
    fi
    
    if [ $? -eq 0 ]; then
        echo "✅ Services started successfully!"
        echo ""
        echo "📍 Services available at:"
        echo "  🌐 Backend API: http://localhost:8081"
        echo "  🐬 MySQL: localhost:3308"
        echo "  🔴 Redis: localhost:6379"
        echo ""
        echo "📋 Useful commands:"
        echo "  📊 Check logs: docker-compose logs -f"
        echo "  🔍 Check status: docker-compose ps"
        echo "  🛑 Stop services: ./stop-server.sh"
        echo ""
        echo "⏳ Waiting for services to be ready..."
        sleep 10
        
        echo "🔍 Checking service health..."
        curl -f http://localhost:8081/actuator/health > /dev/null 2>&1
        if [ $? -eq 0 ]; then
            echo "✅ Backend is healthy!"
        else
            echo "⚠️  Backend is starting up... Check logs with: docker-compose logs backend"
        fi
    else
        echo "❌ Failed to start services"
        exit 1
    fi
}

# Main execution
main() {
    check_docker
    check_docker_compose
    start_services
}

main "$@" 