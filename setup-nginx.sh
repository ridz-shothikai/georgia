#!/bin/bash

# Script to set up system-level nginx configuration for Georgia Platform
set -e

echo "🔧 Setting up system-level Nginx configuration for Georgia Platform"
echo "====================================================================="

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo "❌ Please run as root (use sudo)"
    exit 1
fi

# Check if nginx is installed
if ! command -v nginx &> /dev/null; then
    echo "📦 Nginx is not installed. Installing..."
    if command -v apt-get &> /dev/null; then
        apt-get update
        apt-get install -y nginx
    elif command -v yum &> /dev/null; then
        yum install -y nginx
    else
        echo "❌ Could not detect package manager. Please install nginx manually."
        exit 1
    fi
fi

# Configuration file name
CONFIG_NAME="georgia-platform"
CONFIG_FILE="/etc/nginx/sites-available/${CONFIG_NAME}"
SYMLINK_FILE="/etc/nginx/sites-enabled/${CONFIG_NAME}"

# Check if config file exists in current directory
if [ ! -f "nginx-georgia-platform.conf" ]; then
    echo "❌ nginx-georgia-platform.conf not found in current directory!"
    echo "📝 Please run this script from the directory containing nginx-georgia-platform.conf"
    exit 1
fi

# Copy configuration file
echo "📋 Copying nginx configuration to /etc/nginx/sites-available/"
cp nginx-georgia-platform.conf "$CONFIG_FILE"

# Create symlink if it doesn't exist
if [ ! -L "$SYMLINK_FILE" ]; then
    echo "🔗 Creating symlink in sites-enabled..."
    ln -s "$CONFIG_FILE" "$SYMLINK_FILE"
else
    echo "✅ Symlink already exists"
fi

# Test nginx configuration
echo "🧪 Testing nginx configuration..."
if nginx -t; then
    echo "✅ Nginx configuration is valid"
else
    echo "❌ Nginx configuration test failed!"
    echo "📝 Please check the configuration file: $CONFIG_FILE"
    exit 1
fi

# Reload nginx
echo "🔄 Reloading nginx..."
systemctl reload nginx || service nginx reload

echo ""
echo "✅ Setup complete!"
echo ""
echo "📊 Configuration details:"
echo "   - Config file: $CONFIG_FILE"
echo "   - Enabled link: $SYMLINK_FILE"
echo "   - Listening on: Port 3023"
echo "   - Proxying to: http://127.0.0.1:80"
echo ""
echo "🌐 Access your application at: http://your-server-ip:3023"
echo ""
echo "📋 Useful commands:"
echo "   Check nginx status: systemctl status nginx"
echo "   View logs: tail -f /var/log/nginx/georgia-platform-*.log"
echo "   Reload nginx: systemctl reload nginx"
echo "   Remove config: rm $SYMLINK_FILE $CONFIG_FILE && systemctl reload nginx"
echo ""
