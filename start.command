#!/bin/bash
# PRISM - Predictive Risk Intelligence and Scoring Model
# Double-click this file to start PRISM locally.

cd "$(dirname "$0")"

echo ""
echo "  ╔═══════════════════════════════════════════════╗"
echo "  ║  PRISM - Predictive Risk Intelligence        ║"
echo "  ║          and Scoring Model                   ║"
echo "  ╚═══════════════════════════════════════════════╝"
echo ""

# Check for Node.js
if ! command -v node &> /dev/null; then
    echo "  ❌ Node.js is not installed."
    echo ""
    echo "  Please install Node.js from: https://nodejs.org"
    echo "  (Download the LTS version)"
    echo ""
    echo "  Press any key to exit..."
    read -n 1
    exit 1
fi

NODE_VERSION=$(node -v)
echo "  ✓ Node.js $NODE_VERSION detected"

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "  → Installing dependencies (first run only)..."
    npm install --silent
    echo "  ✓ Dependencies installed"
else
    echo "  ✓ Dependencies already installed"
fi

# Run migration to ensure DB is up to date
echo "  → Checking database..."
mkdir -p data

echo ""
echo "  Starting PRISM..."
echo "  ────────────────────────────────────────────────"
echo ""
echo "  App will open at: http://localhost:3000"
echo "  Press Ctrl+C in this window to stop the server."
echo ""

# Open browser after a short delay
(sleep 3 && open http://localhost:3000) &

# Start the dev server
npm run dev
