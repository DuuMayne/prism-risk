@echo off
title PRISM - Predictive Risk Intelligence and Scoring Model
cd /d "%~dp0"

echo.
echo   ===================================================
echo     PRISM - Predictive Risk Intelligence
echo              and Scoring Model
echo   ===================================================
echo.

:: Check for Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo   ERROR: Node.js is not installed.
    echo.
    echo   Please install Node.js from: https://nodejs.org
    echo   (Download the LTS version)
    echo.
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('node -v') do set NODE_VERSION=%%i
echo   Node.js %NODE_VERSION% detected

:: Install dependencies if needed
if not exist "node_modules" (
    echo   Installing dependencies (first run only)...
    npm install --silent
    echo   Dependencies installed
) else (
    echo   Dependencies already installed
)

:: Create data directory
if not exist "data" mkdir data

echo.
echo   Starting PRISM...
echo   ---------------------------------------------------
echo.
echo   App will open at: http://localhost:3000
echo   Close this window to stop the server.
echo.

:: Open browser after delay
start /b cmd /c "timeout /t 3 /nobreak >nul && start http://localhost:3000"

:: Start dev server
npm run dev
