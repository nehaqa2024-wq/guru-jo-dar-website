# Publish Guru Jo Dar to GitHub Pages
# Run in PowerShell:  .\publish-to-github.ps1

$ErrorActionPreference = "Stop"
$gh = "C:\Program Files\GitHub CLI\gh.exe"

if (-not (Test-Path $gh)) {
    Write-Host "GitHub CLI not found. Install from: https://cli.github.com/" -ForegroundColor Red
    exit 1
}

$env:Path = "C:\Program Files\GitHub CLI;" + $env:Path
Set-Location $PSScriptRoot

Write-Host "`n=== Step 1: Sign in to GitHub (browser will open) ===" -ForegroundColor Cyan
& $gh auth login -h github.com -p https -w
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host "`n=== Step 2: Create repo and upload site ===" -ForegroundColor Cyan
& $gh auth status
$repoName = "guru-jo-dar-website"
$exists = & $gh repo view $repoName 2>$null
if ($LASTEXITCODE -eq 0) {
    Write-Host "Repo $repoName already exists — pushing latest code..."
    git remote remove origin 2>$null
    $user = (& $gh api user -q .login)
    git remote add origin "https://github.com/$user/$repoName.git"
    git push -u origin main
} else {
    & $gh repo create $repoName --public --source=. --remote=origin --push
}
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host "`n=== Step 3: Enable GitHub Pages ===" -ForegroundColor Cyan
$user = (& $gh api user -q .login)
& $gh api "repos/$user/$repoName/pages" -X POST -f "build_type=legacy" -f "source[branch]=main" -f "source[path]=/" 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "Pages may already be on — check: https://github.com/$user/$repoName/settings/pages" -ForegroundColor Yellow
}

$siteUrl = "https://$user.github.io/$repoName/"
Write-Host "`nDone! Your site will be live in 1-3 minutes at:" -ForegroundColor Green
Write-Host $siteUrl
Start-Process $siteUrl
