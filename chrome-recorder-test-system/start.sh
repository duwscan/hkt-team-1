#!/bin/bash

echo "🚀 Chrome Recorder Test Management System - Startup Script"
echo "=========================================================="
echo ""

# Check if required tools are installed
check_requirements() {
    echo "📋 Checking requirements..."
    
    if ! command -v php &> /dev/null; then
        echo "❌ PHP is not installed. Please install PHP 8.1+"
        exit 1
    fi
    
    if ! command -v composer &> /dev/null; then
        echo "❌ Composer is not installed. Please install Composer"
        exit 1
    fi
    
    if ! command -v node &> /dev/null; then
        echo "❌ Node.js is not installed. Please install Node.js 18+"
        exit 1
    fi
    
    if ! command -v npm &> /dev/null; then
        echo "❌ npm is not installed. Please install npm"
        exit 1
    fi
    
    echo "✅ All requirements are met!"
    echo ""
}

# Setup API Backend
setup_api_backend() {
    echo "🔧 Setting up API Backend (Laravel)..."
    cd api-backend
    
    if [ ! -f "vendor/autoload.php" ]; then
        echo "📦 Installing Composer dependencies..."
        composer install --no-interaction
    fi
    
    if [ ! -f ".env" ]; then
        echo "⚙️  Creating environment file..."
        cp .env.example .env
        echo "⚠️  Please configure your database settings in api-backend/.env"
        echo "   Then run: php artisan key:generate && php artisan migrate"
    fi
    
    cd ..
    echo "✅ API Backend setup complete!"
    echo ""
}

# Setup Web Admin
setup_web_admin() {
    echo "🌐 Setting up Web Admin (Next.js)..."
    cd web-admin
    
    if [ ! -d "node_modules" ]; then
        echo "📦 Installing npm dependencies..."
        npm install
    fi
    
    cd ..
    echo "✅ Web Admin setup complete!"
    echo ""
}

# Setup PC App
setup_pc_app() {
    echo "💻 Setting up PC App (Electron)..."
    cd pc-app
    
    if [ ! -d "node_modules" ]; then
        echo "📦 Installing npm dependencies..."
        npm install
    fi
    
    cd ..
    echo "✅ PC App setup complete!"
    echo ""
}

# Start services
start_services() {
    echo "🚀 Starting services..."
    echo ""
    
    # Start API Backend
    echo "🔧 Starting API Backend on http://localhost:8000..."
    cd api-backend
    php artisan serve --host=0.0.0.0 --port=8000 > ../logs/api.log 2>&1 &
    API_PID=$!
    cd ..
    
    # Wait a moment for API to start
    sleep 3
    
    # Start Web Admin
    echo "🌐 Starting Web Admin on http://localhost:3000..."
    cd web-admin
    npm run dev > ../logs/web.log 2>&1 &
    WEB_PID=$!
    cd ..
    
    # Save PIDs for cleanup
    echo $API_PID > logs/api.pid
    echo $WEB_PID > logs/web.pid
    
    echo ""
    echo "✅ Services started successfully!"
    echo ""
    echo "📱 Access points:"
    echo "   - API Backend: http://localhost:8000"
    echo "   - Web Admin:   http://localhost:3000"
    echo "   - PC App:      Run 'cd pc-app && npm start' in a new terminal"
    echo ""
    echo "📋 Logs are available in the logs/ directory"
    echo "🛑 To stop services, run: ./stop.sh"
    echo ""
}

# Create logs directory
mkdir -p logs

# Main execution
main() {
    check_requirements
    setup_api_backend
    setup_web_admin
    setup_pc_app
    start_services
}

# Run main function
main