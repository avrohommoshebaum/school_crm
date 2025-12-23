# Deploying to Cloud Run (Free Tier)

## Why Cloud Run?
- **Free Tier**: 2 million requests/month, 360,000 GB-seconds
- **Pay-per-use**: Only pay when handling requests
- **Auto-scaling**: Scales to zero when not in use
- **Cost**: Likely $0-5/month for 20 users

## Setup Steps

### 1. Build and Deploy
```bash
# From the server directory
cd server

# Build and deploy
gcloud run deploy school-app \
  --source . \
  --region us-central1 \
  --platform managed \
  --allow-unauthenticated \
  --memory 512Mi \
  --cpu 1 \
  --min-instances 0 \
  --max-instances 10 \
  --set-env-vars NODE_ENV=production,GOOGLE_CLOUD_PROJECT=your-project-id
```

### 2. Set Environment Variables
```bash
gcloud run services update school-app \
  --region us-central1 \
  --set-env-vars CLIENT_URL=https://your-cloud-run-url.run.app
```

### 3. Update Firebase Hosting (Optional - for frontend)
If you want to use Firebase Hosting for the frontend:
1. Build React app: `cd client && npm run build`
2. Deploy to Firebase Hosting
3. Configure rewrites to proxy `/api/*` to Cloud Run

## Cost Comparison

| Service | Free Tier | Your Usage (20 users) | Monthly Cost |
|---------|-----------|------------------------|--------------|
| **Cloud Run** | 2M requests, 360K GB-sec | ~50K requests | **$0-5** |
| **App Engine F1** | 28 instance-hours/day | Always on | **$36+** |
| **App Engine F1 (auto-scale)** | 28 instance-hours/day | Pay per use | **$0-36** |

## Notes
- Cloud Run scales to zero when idle (no cost)
- App Engine F1 with auto-scaling can also be cheap if traffic is low
- Both work great with Firestore!

