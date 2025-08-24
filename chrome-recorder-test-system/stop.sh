#!/bin/bash

echo "🛑 Chrome Recorder Test Management System - Stop Script"
echo "======================================================="
echo ""

# Stop API Backend
if [ -f "logs/api.pid" ]; then
    API_PID=$(cat logs/api.pid)
    if kill -0 $API_PID 2>/dev/null; then
        echo "🔧 Stopping API Backend (PID: $API_PID)..."
        kill $API_PID
        echo "✅ API Backend stopped"
    else
        echo "ℹ️  API Backend is not running"
    fi
    rm -f logs/api.pid
else
    echo "ℹ️  No API Backend PID file found"
fi

# Stop Web Admin
if [ -f "logs/web.pid" ]; then
    WEB_PID=$(cat logs/web.pid)
    if kill -0 $WEB_PID 2>/dev/null; then
        echo "🌐 Stopping Web Admin (PID: $WEB_PID)..."
        kill $WEB_PID
        echo "✅ Web Admin stopped"
    else
        echo "ℹ️  Web Admin is not running"
    fi
    rm -f logs/web.pid
else
    echo "ℹ️  No Web Admin PID file found"
fi

# Kill any remaining Node.js processes (for development servers)
echo "🧹 Cleaning up any remaining Node.js processes..."
pkill -f "next dev" 2>/dev/null || true
pkill -f "php artisan serve" 2>/dev/null || true

echo ""
echo "✅ All services stopped successfully!"
echo "📋 Logs are preserved in the logs/ directory"
echo "🚀 To start services again, run: ./start.sh"