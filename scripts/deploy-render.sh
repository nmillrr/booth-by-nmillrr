#!/bin/bash

# Render deployment script

# Check if Render CLI is installed
if ! command -v render &> /dev/null; then
    echo "Render CLI is not installed. Installing..."
    npm install -g @render/cli
fi

# Ensure we're in the project root
PROJECT_ROOT=$(pwd)

# Deploy backend to Render
echo "Deploying backend to Render..."
cd "$PROJECT_ROOT/backend"
render deploy

echo "Deployment complete! Check the Render dashboard for status."