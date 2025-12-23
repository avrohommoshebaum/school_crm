# Migration from App Engine to Cloud Run

## ✅ What Changed

### Files Deleted:
- ❌ `app.yaml` - No longer needed (App Engine config)

### Files Created:
- ✅ `Dockerfile` - Container configuration for Cloud Run
- ✅ `.dockerignore` - Files to exclude from Docker build
- ✅ `.gcloudignore` - Files to exclude from gcloud deployment
- ✅ `deploy.sh` - Deployment script (Mac/Linux)
- ✅ `deploy.ps1` - Deployment script (Windows)
- ✅ `DEPLOY.md` - Deployment instructions
- ✅ `cloudbuild.yaml` - Optional Cloud Build config

### Files Updated:
- ✅ `.dockerignore` - Updated to exclude App Engine files

## 🚀 Quick Start

1. **Build React App** (if not already built):
   ```bash
   cd client
   npm install
   npm run build
   cd ../server
   ```

2. **Deploy to Cloud Run**:
   
   **Windows:**
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

   **Or manually:**
   ```bash
   gcloud run deploy school-app \
     --source . \
     --region us-central1 \
     --platform managed \
     --allow-unauthenticated \
     --memory 512Mi \
     --cpu 1 \
     --min-instances 0 \
     --max-instances 20
   ```

3. **Set Environment Variables**:
   ```bash
   # Get your Cloud Run URL
   URL=$(gcloud run services describe school-app --region us-central1 --format 'value(status.url)')
   
   # Set environment variables
   gcloud run services update school-app \
     --region us-central1 \
     --set-env-vars NODE_ENV=production,GOOGLE_CLOUD_PROJECT=YOUR_PROJECT_ID,CLIENT_URL=$URL
   ```

## 💰 Cost Benefits

| Scenario | App Engine | Cloud Run |
|----------|------------|----------|
| **Normal usage (20 users)** | $36/month | $0-5/month |
| **400 users spike (1 hour)** | $2/hour | $0.50-1.00/hour |
| **Idle (no traffic)** | $36/month (min 1 instance) | $0 (scales to zero) |
| **Monthly (with spikes)** | $60-100/month | $15-30/month |

**Savings: 50-70% cheaper!**

## 🔧 Key Differences

### App Engine
- Always running (min 1 instance)
- Fixed instance types
- Simpler deployment (`gcloud app deploy`)

### Cloud Run
- Scales to zero (no cost when idle)
- Pay per request
- Container-based (Docker)
- Better for unpredictable traffic

## 📋 Prerequisites

1. **Enable APIs**:
   ```bash
   gcloud services enable run.googleapis.com
   gcloud services enable cloudbuild.googleapis.com
   gcloud services enable containerregistry.googleapis.com
   ```

2. **Set Project**:
   ```bash
   gcloud config set project YOUR_PROJECT_ID
   ```

3. **Authenticate**:
   ```bash
   gcloud auth login
   ```

## 🔍 Monitoring

- **View Logs**: `gcloud run services logs read school-app --region us-central1`
- **View Metrics**: Google Cloud Console → Cloud Run → school-app
- **Set Budget Alerts**: Billing → Budgets & alerts

## ⚠️ Important Notes

1. **React Build**: Must build React app (`npm run build` in `client/`) before deploying
2. **Environment Variables**: Set `CLIENT_URL` to your Cloud Run URL after first deployment
3. **Secrets**: Still use Google Secret Manager (no changes needed)
4. **Firestore**: Works exactly the same (no changes needed)

## 🆘 Troubleshooting

See `DEPLOY.md` for detailed troubleshooting guide.

## 📚 Next Steps

1. Deploy using the scripts above
2. Update `CLIENT_URL` environment variable
3. Test the application
4. Set up budget alerts
5. Monitor costs for first month

