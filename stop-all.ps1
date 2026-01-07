#!/usr/bin/env pwsh
# Stop All LeadFlow Services
# This script stops all running node processes

Write-Host "🛑 Stopping LeadFlow Application..." -ForegroundColor Red
Write-Host "===================================" -ForegroundColor Red
Write-Host ""

# Stop all node processes
Write-Host "Stopping all Node.js processes..." -ForegroundColor Yellow
Stop-Process -Name node -Force -ErrorAction SilentlyContinue

Write-Host ""
Write-Host "✅ All services stopped!" -ForegroundColor Green
Write-Host ""
