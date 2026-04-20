#!/bin/bash
# PRISM - One-time Mac setup
# Double-click this file to set up PRISM and create a desktop shortcut.
# (macOS may ask you to right-click > Open the first time)

cd "$(dirname "$0")"
PROJECT_DIR="$(pwd)"

echo ""
echo "  ╔═══════════════════════════════════════════════╗"
echo "  ║  PRISM Setup                                 ║"
echo "  ║  Predictive Risk Intelligence                ║"
echo "  ║  and Scoring Model                           ║"
echo "  ╚═══════════════════════════════════════════════╝"
echo ""

# Check for Node.js
if ! command -v node &> /dev/null; then
    echo "  Node.js is not installed."
    echo ""
    echo "  Please install Node.js from: https://nodejs.org"
    echo "  (Download the LTS version)"
    echo ""
    echo "  After installing, run this setup again."
    echo ""
    read -p "  Press Enter to exit..."
    exit 1
fi

echo "  ✓ Node.js $(node -v) detected"

# Install dependencies
echo "  → Installing dependencies..."
npm install --silent 2>/dev/null
echo "  ✓ Dependencies installed"

# Create data directory
mkdir -p data

# Make start.command executable
chmod +x start.command

# Create the .app bundle
echo "  → Creating PRISM.app..."

APP_PATH="$PROJECT_DIR/PRISM.app"
rm -rf "$APP_PATH"
mkdir -p "$APP_PATH/Contents/MacOS"
mkdir -p "$APP_PATH/Contents/Resources"

# Info.plist
cat > "$APP_PATH/Contents/Info.plist" << 'PLIST'
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>CFBundleExecutable</key>
    <string>launch</string>
    <key>CFBundleIdentifier</key>
    <string>com.prism.risk</string>
    <key>CFBundleName</key>
    <string>PRISM</string>
    <key>CFBundleDisplayName</key>
    <string>PRISM</string>
    <key>CFBundleVersion</key>
    <string>0.1.0</string>
    <key>CFBundlePackageType</key>
    <string>APPL</string>
    <key>NSHighResolutionCapable</key>
    <true/>
</dict>
</plist>
PLIST

# Launch script
cat > "$APP_PATH/Contents/MacOS/launch" << LAUNCHER
#!/bin/bash
PROJECT="$PROJECT_DIR"
cd "\$PROJECT"

# Check if server is already running
if curl -s http://localhost:3000 > /dev/null 2>&1; then
    open http://localhost:3000
    exit 0
fi

# Start server and open browser
export PATH="/opt/homebrew/bin:/usr/local/bin:\$PATH"
npm run dev &
SERVER_PID=\$!

# Wait for server to be ready
for i in {1..30}; do
    if curl -s http://localhost:3000 > /dev/null 2>&1; then
        open http://localhost:3000
        break
    fi
    sleep 1
done

# Keep running until server dies
wait \$SERVER_PID
LAUNCHER

chmod +x "$APP_PATH/Contents/MacOS/launch"

echo "  ✓ PRISM.app created"

# Offer to copy to Desktop
echo ""
read -p "  Copy PRISM.app to your Desktop? (y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    cp -R "$APP_PATH" "$HOME/Desktop/PRISM.app"
    echo "  ✓ PRISM.app copied to Desktop"
    echo ""
    echo "  You can double-click PRISM on your Desktop to launch."
else
    echo ""
    echo "  You can double-click PRISM.app in this folder to launch."
fi

echo ""
echo "  ╔═══════════════════════════════════════════════╗"
echo "  ║  Setup complete!                             ║"
echo "  ║                                              ║"
echo "  ║  To start PRISM:                             ║"
echo "  ║  • Double-click PRISM.app                    ║"
echo "  ║  • Or double-click start.command             ║"
echo "  ║  • Or run: npm run dev                       ║"
echo "  ╚═══════════════════════════════════════════════╝"
echo ""
read -p "  Press Enter to close..."
