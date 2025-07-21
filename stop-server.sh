#!/bin/bash

echo "🛑 Stopping Badminton Court Management System..."

# Function to stop services
stop_services() {
    echo "🔧 Stopping services..."
    
    # Use docker compose if available, otherwise use docker-compose
    if docker compose version &> /dev/null; then
        docker compose down
    else
        docker-compose down
    fi
    
    if [ $? -eq 0 ]; then
        echo "✅ Services stopped successfully!"
    else
        echo "❌ Failed to stop some services"
        exit 1
    fi
}

# Function to stop services and remove volumes (complete cleanup)
cleanup_all() {
    echo "🗑️  Performing complete cleanup (removing volumes)..."
    
    # Use docker compose if available, otherwise use docker-compose
    if docker compose version &> /dev/null; then
        docker compose down -v --remove-orphans
    else
        docker-compose down -v --remove-orphans
    fi
    
    echo "✅ Complete cleanup finished!"
}

# Main execution
main() {
    if [ "$1" = "--cleanup" ] || [ "$1" = "-c" ]; then
        cleanup_all
    else
        stop_services
    fi
}

echo "Usage: $0 [--cleanup|-c]"
echo "  Default: Stop services only"
echo "  --cleanup: Stop services and remove all data volumes"
echo ""

main "$@" 