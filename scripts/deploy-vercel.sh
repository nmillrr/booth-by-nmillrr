#!/bin/bash

# Vercel deployment script

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "Vercel CLI is not installed. Installing..."
    npm install -g vercel
fi

# Ensure we're in the project root
PROJECT_ROOT=$(pwd)

# Build the frontend
echo "Building frontend..."
cd "$PROJECT_ROOT/frontend"
npm run build

# Deploy to Vercel
echo "Deploying to Vercel..."
cd "$PROJECT_ROOT"
vercel --prod

echo "Deployment complete!"