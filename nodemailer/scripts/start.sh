#!/bin/bash

echo "🚀 Starting Nodemailer service..."

# Check if dist exists
if [ ! -d "dist" ]; then
  echo "⚠️  dist folder not found. Building first..."
  pnpm run build
fi

# Start the service
node dist/index.js
