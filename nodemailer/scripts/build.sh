#!/bin/bash

echo "🔨 Building Nodemailer service..."

# Clean dist folder
rm -rf dist

# Compile TypeScript
pnpm exec tsc

echo "✅ Build complete!"
