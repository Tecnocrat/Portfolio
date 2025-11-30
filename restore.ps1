# Portfolio Restore Utility
# Usage: .\restore.ps1 -Backup "2025-11-30_160509"

param(
    [Parameter(Mandatory=$true)]
    [string]$Backup
)

$backupPath = "backups/$Backup"

if (-not (Test-Path $backupPath)) {
    Write-Host "❌ Backup not found: $backupPath" -ForegroundColor Red
    Write-Host "`n📁 Available backups:" -ForegroundColor Yellow
    Get-ChildItem backups -Directory | Sort-Object Name -Descending | ForEach-Object {
        Write-Host "   $($_.Name)"
    }
    exit 1
}

# Create safety backup before restore
$safetyBackup = "backups/$(Get-Date -Format 'yyyy-MM-dd_HHmmss')_pre-restore"
New-Item -ItemType Directory -Path $safetyBackup -Force | Out-Null
Copy-Item index.html, styles.css, script.js -Destination $safetyBackup -ErrorAction SilentlyContinue
Write-Host "🔒 Safety backup created: $safetyBackup" -ForegroundColor Cyan

# Restore files
$files = @("index.html", "styles.css", "script.js")
foreach ($file in $files) {
    $source = "$backupPath/$file"
    if (Test-Path $source) {
        Copy-Item $source -Destination . -Force
        Write-Host "   ✅ Restored: $file" -ForegroundColor Green
    }
}

Write-Host "`n✅ Restore complete from: $Backup" -ForegroundColor Green
