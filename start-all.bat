@echo off
REM Start All LeadFlow Services (Windows Batch Version)
REM Double-click this file to start all services

echo.
echo ========================================
echo   Starting LeadFlow Application
echo ========================================
echo.

REM Start App Backend
echo Starting App Backend (port 4000)...
start "App Backend" cmd /k "cd /d %~dp0app-backend && node src\server.js"
timeout /t 2 /nobreak >nul

REM Start Zoho Lead Backend
echo Starting Zoho Lead Backend (port 3000)...
start "Zoho Lead Backend" cmd /k "cd /d %~dp0zoho-lead-backend && node src\server.js"
timeout /t 2 /nobreak >nul

REM Start Frontend
echo Starting Frontend (port 5173)...
start "Frontend" cmd /k "cd /d %~dp0 && npm run dev"
timeout /t 2 /nobreak >nul

echo.
echo ========================================
echo   All services started!
echo ========================================
echo.
echo Services running at:
echo   Frontend:           http://localhost:5173
echo   App Backend:        http://localhost:4000
echo   Zoho Lead Backend:  http://localhost:3000
echo.
echo AI Status:
echo   Check logs for "AI-Powered Calling ENABLED"
echo   or "Basic IVR Calling" message
echo.
echo To stop all services, close the terminal windows
echo or run stop-all.bat
echo.
pause
