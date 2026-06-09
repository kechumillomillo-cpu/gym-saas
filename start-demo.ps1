# GymSaaS Demo Startup Script
# Run this script to start the API and create a public tunnel
# Usage: Right-click > Run with PowerShell

Write-Host "🚀 Starting GymSaaS Demo..." -ForegroundColor Green

# Kill any existing API processes
$existing = Get-NetTCPConnection -LocalPort 4000 -ErrorAction SilentlyContinue
if ($existing) {
    $pid = $existing.OwningProcess | Select-Object -First 1
    Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
    Write-Host "✓ Stopped existing API process" -ForegroundColor Yellow
}

# Kill existing SSH tunnels
Get-Process -Name "ssh" -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue

# Start the API
Write-Host "📡 Starting NestJS API on port 4000..." -ForegroundColor Cyan
$apiProcess = Start-Process -FilePath "node" `
    -ArgumentList "C:\Users\Administrator\Desktop\GymSaaS\apps\api\dist\main.js" `
    -WorkingDirectory "C:\Users\Administrator\Desktop\GymSaaS\apps\api" `
    -WindowStyle Minimized `
    -PassThru

Write-Host "✓ API started (PID: $($apiProcess.Id))" -ForegroundColor Green

# Wait for API to initialize
Start-Sleep -Seconds 5

# Test API is working
try {
    $body = '{"email":"admin@fitpro.com","password":"Admin1234!","gymSlug":"demo-gym"}'
    $r = Invoke-RestMethod -Uri "http://localhost:4000/api/v1/auth/login" -Method POST -Body $body -ContentType "application/json" -TimeoutSec 5
    Write-Host "✓ API responding correctly" -ForegroundColor Green
} catch {
    Write-Host "⚠ API not responding yet, waiting..." -ForegroundColor Yellow
    Start-Sleep -Seconds 5
}

# Start serveo.net SSH tunnel
Write-Host "🌐 Creating public tunnel via serveo.net..." -ForegroundColor Cyan
$sshPath = "C:\Program Files\Git\usr\bin\ssh.exe"
$tunnelProcess = Start-Process -FilePath $sshPath `
    -ArgumentList "-o StrictHostKeyChecking=no -R gymsaas:80:localhost:4000 serveo.net" `
    -WindowStyle Minimized `
    -PassThru `
    -RedirectStandardOutput "$env:TEMP\serveo_out.txt" `
    -RedirectStandardError "$env:TEMP\serveo_err.txt"

Start-Sleep -Seconds 8

$tunnelOutput = Get-Content "$env:TEMP\serveo_err.txt" -ErrorAction SilentlyContinue -Raw
Write-Host "Tunnel output: $tunnelOutput"

Write-Host ""
Write-Host "================================================================" -ForegroundColor Green
Write-Host "🎉 GymSaaS Demo is RUNNING!" -ForegroundColor Green
Write-Host "================================================================" -ForegroundColor Green
Write-Host ""
Write-Host "🌍 Frontend (Vercel):" -ForegroundColor Cyan
Write-Host "   https://gym-saas-one.vercel.app" -ForegroundColor White
Write-Host ""
Write-Host "⚙️  API (local tunnel):" -ForegroundColor Cyan
Write-Host "   https://gymsaas.serveousercontent.com/api/v1" -ForegroundColor White
Write-Host "   (or check serveo output above for exact URL)" -ForegroundColor Gray
Write-Host ""
Write-Host "👤 Demo credentials:" -ForegroundColor Cyan
Write-Host "   Email:    admin@fitpro.com" -ForegroundColor White
Write-Host "   Password: Admin1234!" -ForegroundColor White
Write-Host "   Gym slug: demo-gym" -ForegroundColor White
Write-Host ""
Write-Host "❌ To stop: Close this window and kill node/ssh processes" -ForegroundColor Yellow
Write-Host ""

Read-Host "Press Enter to close this window (API will keep running)"
