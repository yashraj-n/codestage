#!/bin/bash

# Find and use the CLI
CLI_PATH=$(find / -name "index.js" -path "*/cli/*" 2>/dev/null | head -1)
API_PATH=$(find / -name "index.js" -path "*/api/*" 2>/dev/null | head -1)

echo "Found CLI at: $CLI_PATH"
echo "Found API at: $API_PATH"

if [ -z "$CLI_PATH" ]; then
    echo "CLI not found, listing piston directories..."
    ls -la /piston* 2>/dev/null || true
    find / -name "ppman*" 2>/dev/null | head -5
fi

# Install packages
install_pkg() {
    echo "Installing $1..."
    if [ -n "$CLI_PATH" ]; then
        node "$CLI_PATH" ppman install "$1" || true
    fi
}

install_pkg gcc
install_pkg java  
install_pkg node
install_pkg python

# Start the API
echo "Starting Piston API..."
if [ -n "$API_PATH" ]; then
    exec node "$API_PATH"
else
    echo "API not found, trying default locations..."
    ls -la /
fi
