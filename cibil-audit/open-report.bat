@echo off
echo Starting IS 17802 Accessibility Report...

:: Kill any existing instance on port 3000
for /f "tokens=5" %%a in ('netstat -ano 2^>nul ^| findstr ":3000 "') do (
  taskkill /F /PID %%a >nul 2>&1
)

:: Start server in background
start /B node "%~dp0serve.js"

:: Wait briefly then open browser
timeout /t 1 /nobreak >nul
start http://localhost:3000

echo Report is running at http://localhost:3000
echo Close this window to stop the server.
echo.
pause
taskkill /F /IM node.exe >nul 2>&1
