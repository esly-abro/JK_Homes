@echo off
REM Stop All LeadFlow Services (Windows Batch Version)

echo.
echo ========================================
echo   Stopping LeadFlow Application
echo ========================================
echo.

echo Stopping all Node.js processes...
taskkill /F /IM node.exe 2>nul

echo.
echo ========================================
echo   All services stopped!
echo ========================================
echo.
pause
