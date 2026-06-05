# Compress hero background video for GUMÜÇROYAL
# Requires ffmpeg: winget install Gyan.FFmpeg
# Run from repo root: .\scripts\compress-hero-video.ps1

$ErrorActionPreference = "Stop"
$Dir = Join-Path $PSScriptRoot "..\frontend\public\videos"
$Input = Join-Path $Dir "hero.mp4"

if (-not (Test-Path $Input)) {
  Write-Error "Missing $Input — place your source video first."
}

$ffmpeg = (Get-Command ffmpeg -ErrorAction SilentlyContinue)?.Source
if (-not $ffmpeg) {
  Write-Error "ffmpeg not found. Install: winget install Gyan.FFmpeg — then reopen terminal."
}

Write-Host "Input size:" ([math]::Round((Get-Item $Input).Length / 1MB, 2)) "MB"

# 1. Poster — first frame, local instant load
& $ffmpeg -y -i $Input -ss 00:00:00.5 -vframes 1 -q:v 2 (Join-Path $Dir "hero-poster.jpg")

# 2. WebM VP9 (preferred in browser, smaller)
& $ffmpeg -y -i $Input `
  -c:v libvpx-vp9 -crf 35 -b:v 0 `
  -vf "scale='min(1920,iw)':-2" `
  -an -row-mt 1 -deadline good `
  (Join-Path $Dir "hero.webm")

# 3. MP4 H.264 fallback (faststart for streaming)
$Mp4Out = Join-Path $Dir "hero-compressed.mp4"
& $ffmpeg -y -i $Input `
  -c:v libx264 -crf 28 -preset slow `
  -vf "scale='min(1920,iw)':-2" `
  -movflags +faststart -an -profile:v main `
  $Mp4Out

Move-Item -Force $Mp4Out (Join-Path $Dir "hero.mp4")

Write-Host "Done."
Write-Host "  poster:" (Join-Path $Dir "hero-poster.jpg") ([math]::Round((Get-Item (Join-Path $Dir "hero-poster.jpg")).Length / 1KB, 0)) "KB"
Write-Host "  webm:  " (Join-Path $Dir "hero.webm") ([math]::Round((Get-Item (Join-Path $Dir "hero.webm")).Length / 1MB, 2)) "MB"
Write-Host "  mp4:   " (Join-Path $Dir "hero.mp4") ([math]::Round((Get-Item (Join-Path $Dir "hero.mp4")).Length / 1MB, 2)) "MB"
