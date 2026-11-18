# ==============================================================================
# Expensify Pro - Personal Expense Tracker Prototype
# Autonomous Full-Stack Startup Launcher for Windows PowerShell
# ==============================================================================

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "   Expensify Pro - Personal Expense Tracker System        " -ForegroundColor Green
Write-Host "   Modern Full-Stack Prototype (Spring Boot + React + H2) " -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$backendDir = Join-Path $root "backend"
$frontendDir = Join-Path $root "frontend"

# 1. Environment & Java Home Detection
if (-not $env:JAVA_HOME) {
    if (Test-Path "C:\Program Files\Java\jdk-24") {
        $env:JAVA_HOME = "C:\Program Files\Java\jdk-24"
        Write-Host "[OK] Using Java JDK: $env:JAVA_HOME" -ForegroundColor Green
    } else {
        Write-Host "[WARNING] JAVA_HOME is not set. Ensure JDK 17+ or 21+ is in your PATH." -ForegroundColor Yellow
    }
} else {
    Write-Host "[OK] Found JAVA_HOME: $env:JAVA_HOME" -ForegroundColor Green
}

# 2. Start Spring Boot Backend in a dedicated window
Write-Host "`n[1/3] Launching Spring Boot Backend (Port 8080)..." -ForegroundColor Yellow
$backendCmd = "Set-Location '$backendDir'; .\mvnw.ps1 spring-boot:run"
Start-Process powershell.exe -ArgumentList "-NoExit", "-ExecutionPolicy", "Bypass", "-Command", "$backendCmd" -WindowStyle Normal

# 3. Wait for Backend to become active
Write-Host "Waiting for backend server to initialize and seed database..." -ForegroundColor Gray
$backendReady = $false
for ($i = 0; $i -lt 30; $i++) {
    Start-Sleep -Seconds 2
    try {
        $test = Invoke-WebRequest -Uri "http://localhost:8080/api/categories" -Method Get -TimeoutSec 2 -ErrorAction SilentlyContinue
    } catch {
        if ($_.Exception.Response.StatusCode.value__ -eq 401) {
            $backendReady = $true
            break
        }
    }
}

if ($backendReady) {
    Write-Host "[OK] Backend server is online and responding at http://localhost:8080" -ForegroundColor Green
} else {
    Write-Host "[INFO] Backend process started. If port 8080 takes a few seconds to warm up, it will connect shortly." -ForegroundColor Yellow
}

# 4. Start React Vite Frontend in a dedicated window
Write-Host "`n[2/3] Launching React Vite Frontend (Port 5173)..." -ForegroundColor Yellow
$frontendCmd = "Set-Location '$frontendDir'; npm run dev"
Start-Process powershell.exe -ArgumentList "-NoExit", "-ExecutionPolicy", "Bypass", "-Command", "$frontendCmd" -WindowStyle Normal

# 5. Open Web Browser
Start-Sleep -Seconds 3
Write-Host "`n[3/3] Opening Financial Dashboard in default browser..." -ForegroundColor Yellow
Start-Process "http://localhost:5173"

Write-Host "`n==========================================================" -ForegroundColor Green
Write-Host " APPLICATION IS RUNNING!" -ForegroundColor Green
Write-Host "  -> Frontend Dashboard:  http://localhost:5173" -ForegroundColor White
Write-Host "  -> Backend REST API:    http://localhost:8080/api" -ForegroundColor White
Write-Host "  -> H2 Database Console: http://localhost:8080/h2-console" -ForegroundColor White
Write-Host "==========================================================" -ForegroundColor Green
Write-Host "`nDemo Credentials for Quick Testing:" -ForegroundColor Cyan
Write-Host "  Email:    demo@expensetracker.com" -ForegroundColor White
Write-Host "  Password: Password123!" -ForegroundColor White
Write-Host "  (Or click 'Fill Demo Credentials (1-Click)' on the Login page)" -ForegroundColor Gray
Write-Host "`nYou can also click 'Create an account' to register a new user." -ForegroundColor Gray
