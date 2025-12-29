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

# Cloud SQL instance connection name (PROJECT:REGION:INSTANCE)
# Update this if your Cloud SQL instance name is different
$CLOUDSQL_INSTANCE = "${PROJECT_ID}:us-central1:free-trial-first-project"

# Client URL - use your custom domain or Cloud Run URL
# Update this to your custom domain if you have one
$CLIENT_URL = "https://portal.nachlasby.org"

Write-Host "Cloud SQL Instance: $CLOUDSQL_INSTANCE" -ForegroundColor Cyan
Write-Host "Client URL: $CLIENT_URL" -ForegroundColor Cyan

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
  --add-cloudsql-instances "$CLOUDSQL_INSTANCE" `
  --set-env-vars "NODE_ENV=production,GOOGLE_CLOUD_PROJECT=$PROJECT_ID,CLIENT_URL=$CLIENT_URL,SENDGRID_FROM=notifications@nachlasby.org"

Write-Host "Getting Cloud Run URL..." -ForegroundColor Cyan
$SERVICE_URL = (gcloud run services describe school-app --region us-central1 --format 'value(status.url)')

if ($SERVICE_URL) {
    Write-Host "Service deployed successfully!" -ForegroundColor Green
    Write-Host "Cloud Run URL: $SERVICE_URL" -ForegroundColor Cyan
    Write-Host "Client URL (for invites): $CLIENT_URL" -ForegroundColor Cyan
    
    Write-Host "Deployment complete!" -ForegroundColor Green
    Write-Host "Your app URL: $SERVICE_URL" -ForegroundColor Cyan
} else {
    Write-Host "Deployment complete, but could not get URL. Check Cloud Console." -ForegroundColor Yellow
}

