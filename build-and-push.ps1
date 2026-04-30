# Script para construir y subir cambios a Hostinger
# Uso: .\build-and-push.ps1 "mensaje del commit"

param([string]$message = "build: update")

Write-Host "Construyendo..." -ForegroundColor Cyan
Push-Location "$PSScriptRoot\apps\web"
npx vite build
Pop-Location

# Eliminar .htaccess generado por Vite (no necesario en Node.js/Express)
if (Test-Path "$PSScriptRoot\apps\api\public\.htaccess") {
    Remove-Item "$PSScriptRoot\apps\api\public\.htaccess" -Force
    Write-Host "  Eliminado: .htaccess" -ForegroundColor Yellow
}

Write-Host "Limpiando bundles viejos..." -ForegroundColor Cyan
$keepJs  = (Get-ChildItem "$PSScriptRoot\apps\api\public\assets\*.js"  | Sort-Object LastWriteTime | Select-Object -Last 1).Name
$keepCss = (Get-ChildItem "$PSScriptRoot\apps\api\public\assets\*.css" | Sort-Object LastWriteTime | Select-Object -Last 1).Name

Push-Location "$PSScriptRoot"
git ls-files apps/api/public/assets/ | ForEach-Object {
    $file = Split-Path $_ -Leaf
    if ($file -ne $keepJs -and $file -ne $keepCss) {
        git rm -f $_
        Write-Host "  Eliminado: $_" -ForegroundColor Yellow
    }
}

git add -A
git commit -m $message
git push
Pop-Location

Write-Host "Listo!" -ForegroundColor Green
