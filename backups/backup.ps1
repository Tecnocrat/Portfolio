# Portfolio Backup Utility
# Usage: .\backups\backup.ps1 [-Name "optional_label"]
# Run from Portfolio root folder

param(
    [string]$Name = ""
)

# Ensure we're in Portfolio root
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$portfolioRoot = Split-Path -Parent $scriptDir
Set-Location $portfolioRoot

$timestamp = Get-Date -Format "yyyy-MM-dd_HHmmss"
$backupName = if ($Name) { "${timestamp}_$Name" } else { $timestamp }
$backupPath = "backups/$backupName"

# Create backup directory
New-Item -ItemType Directory -Path $backupPath -Force | Out-Null

# Copy web files
$files = @("index.html", "styles.css", "script.js", "README.md")
foreach ($file in $files) {
    if (Test-Path $file) {
        Copy-Item $file -Destination $backupPath
    }
}

# Create backup metadata
$metadata = @{
    timestamp = Get-Date -Format "o"
    label = $Name
    files = (Get-ChildItem $backupPath -File).Name
} | ConvertTo-Json

$metadata | Out-File "$backupPath/backup.json"

Write-Host "✅ Backup created: $backupPath" -ForegroundColor Green
Write-Host "   Files: $((Get-ChildItem $backupPath -File).Count)" -ForegroundColor Cyan

# List recent backups
Write-Host "`n📁 Recent backups:" -ForegroundColor Yellow
Get-ChildItem backups -Directory | Sort-Object Name -Descending | Select-Object -First 5 | ForEach-Object {
    $size = (Get-ChildItem $_.FullName -File | Measure-Object -Property Length -Sum).Sum / 1KB
    Write-Host "   $($_.Name) ($([math]::Round($size, 1)) KB)"
}
