#!/bin/bash
# Cloud Run Deployment Script

set -e

echo "🚀 Deploying to Cloud Run..."

# Get project ID from gcloud or use environment variable
PROJECT_ID=${GOOGLE_CLOUD_PROJECT:-$(gcloud config get-value project)}

if [ -z "$PROJECT_ID" ]; then
  echo "❌ Error: GOOGLE_CLOUD_PROJECT not set and gcloud project not configured"
  echo "   Run: gcloud config set project YOUR_PROJECT_ID"
  exit 1
fi

echo "📦 Project ID: $PROJECT_ID"

# Build React app first (if not already built)
if [ ! -d "public" ] || [ -z "$(ls -A public 2>/dev/null)" ]; then
  echo "📦 Building React app..."
  cd ../client
  npm install
  npm run build
  cd ../server
fi

# Deploy to Cloud Run
echo "🚀 Deploying to Cloud Run..."
gcloud run deploy school-app \
  --source . \
  --region us-central1 \
  --platform managed \
  --allow-unauthenticated \
  --memory 512Mi \
  --cpu 1 \
  --min-instances 0 \
  --max-instances 20 \
  --timeout 300 \
  --set-env-vars NODE_ENV=production,GOOGLE_CLOUD_PROJECT=$PROJECT_ID \
  --set-env-vars CLIENT_URL=https://school-app-$(echo $PROJECT_ID | cut -d'-' -f1)-uc.a.run.app

echo "✅ Deployment complete!"
echo "🔗 Your app URL will be shown above"

