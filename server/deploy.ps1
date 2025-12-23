# Cloud Run Deployment Script for PowerShell

$ErrorActionPreference = "Stop"

Write-Host "Deploying to Cloud Run..." -ForegroundColor Cyan

# Get project ID from gcloud or use environment variable
$PROJECT_ID = $env:GOOGLE_CLOUD_PROJECT
if (-not $PROJECT_ID) {
    $PROJECT_ID = (gcloud config get-value project 2>$null)
}

if (-not $PROJECT_ID) {
    Write-Host "ERROR: GOOGLE_CLOUD_PROJECT not set and gcloud project not configured" -ForegroundColor Red
    Write-Host "   Run: gcloud config set project YOUR_PROJECT_ID" -ForegroundColor Yellow
    exit 1
}

Write-Host "Project ID: $PROJECT_ID" -ForegroundColor Green

# Build React app first (if not already built)
if (-not (Test-Path "public") -or (Get-ChildItem "public" -ErrorAction SilentlyContinue | Measure-Object).Count -eq 0) {
    Write-Host "Building React app..." -ForegroundColor Cyan
    Push-Location "../client"
    npm install
    npm run build
    Pop-Location
}

# Deploy to Cloud Run
Write-Host "Deploying to Cloud Run..." -ForegroundColor Cyan

gcloud run deploy school-app `
  --source . `
  --region us-central1 `
  --platform managed `
  --allow-unauthenticated `
  --memory 512Mi `
  --cpu 1 `
  --min-instances 0 `
  --max-instances 20 `
  --timeout 300 `
  --set-env-vars "NODE_ENV=production,GOOGLE_CLOUD_PROJECT=$PROJECT_ID,SENDGRID_FROM=notifications@nachlasby.org"

Write-Host "Getting Cloud Run URL..." -ForegroundColor Cyan
$SERVICE_URL = (gcloud run services describe school-app --region us-central1 --format 'value(status.url)')

if ($SERVICE_URL) {
    Write-Host "Updating CLIENT_URL environment variable..." -ForegroundColor Cyan
    gcloud run services update school-app `
      --region us-central1 `
      --set-env-vars "NODE_ENV=production,GOOGLE_CLOUD_PROJECT=$PROJECT_ID,CLIENT_URL=$SERVICE_URL,SENDGRID_FROM=notifications@nachlasby.org"
    
    Write-Host "Deployment complete!" -ForegroundColor Green
    Write-Host "Your app URL: $SERVICE_URL" -ForegroundColor Cyan
} else {
    Write-Host "Deployment complete, but could not get URL. Check Cloud Console." -ForegroundColor Yellow
}

