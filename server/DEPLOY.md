# Cloud Run Deployment Guide

## Prerequisites

1. **Install Google Cloud SDK**
   ```bash
   # Download from: https://cloud.google.com/sdk/docs/install
   ```

2. **Authenticate**
   ```bash
   gcloud auth login
   gcloud config set project YOUR_PROJECT_ID
   ```

3. **Enable APIs**
   ```bash
   gcloud services enable run.googleapis.com
   gcloud services enable cloudbuild.googleapis.com
   gcloud services enable containerregistry.googleapis.com
   ```

## Quick Deploy

### Option 1: Using Deployment Script (Recommended)

**Windows (PowerShell):**
```powershell
cd server
.\deploy.ps1
```

**Mac/Linux:**
```bash
cd server
chmod +x deploy.sh
./deploy.sh
```

### Option 2: Manual Deploy

1. **Build React App**
   ```bash
   cd client
   npm install
   npm run build
   cd ../server
   ```

2. **Deploy to Cloud Run**
   ```bash
   gcloud run deploy school-app \
     --source . \
     --region us-central1 \
     --platform managed \
     --allow-unauthenticated \
     --memory 512Mi \
     --cpu 1 \
     --min-instances 0 \
     --max-instances 20 \
     --timeout 300
   ```

3. **Set Environment Variables**
   ```bash
   # Get your Cloud Run URL first
   gcloud run services describe school-app --region us-central1 --format 'value(status.url)'
   
   # Then set environment variables
   gcloud run services update school-app \
     --region us-central1 \
     --set-env-vars NODE_ENV=production,GOOGLE_CLOUD_PROJECT=YOUR_PROJECT_ID,CLIENT_URL=YOUR_CLOUD_RUN_URL
   ```

## Environment Variables

Set these in Cloud Run:
- `NODE_ENV=production`
- `GOOGLE_CLOUD_PROJECT=your-project-id`
- `CLIENT_URL=https://your-cloud-run-url.run.app`
- `SENDGRID_FROM=notifications@nachlasby.org`

**Note:** Secrets (like `SENDGRID_API_KEY`, `SESSION_SECRET`, `FIREBASE_SERVICE_ACCOUNT_KEY`) should be in Google Secret Manager and will be loaded automatically.

## Updating Deployment

Just run the deploy script again - it will update the existing service.

## Cost Monitoring

1. **Set Budget Alerts**
   - Go to: Google Cloud Console → Billing → Budgets & alerts
   - Create budget: $50-100/month
   - Set alerts at 50%, 90%, 100%

2. **Monitor Usage**
   - Cloud Run Dashboard: https://console.cloud.google.com/run
   - Check: Requests, CPU time, Memory usage

## Troubleshooting

### Build Fails
- Check Dockerfile syntax
- Ensure all dependencies are in package.json
- Check .dockerignore isn't excluding needed files

### Deployment Fails
- Verify gcloud is authenticated: `gcloud auth list`
- Check project is set: `gcloud config get-value project`
- Ensure APIs are enabled (see Prerequisites)

### App Doesn't Start
- Check logs: `gcloud run services logs read school-app --region us-central1`
- Verify environment variables are set correctly
- Check Firestore connection (credentials in Secret Manager)

## Rollback

If something goes wrong:
```bash
# List revisions
gcloud run revisions list --service school-app --region us-central1

# Rollback to previous revision
gcloud run services update-traffic school-app \
  --region us-central1 \
  --to-revisions PREVIOUS_REVISION=100
```

