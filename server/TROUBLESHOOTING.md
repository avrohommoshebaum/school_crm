# Cloud Run Deployment Troubleshooting

## Container Failed to Start

If you see: "The user-provided container failed to start and listen on the port defined provided by the PORT=8080 environment variable"

### Common Causes:

1. **Missing Secrets in Secret Manager**
   - Check: Google Cloud Console → Secret Manager
   - Required secrets:
     - `SESSION_SECRET`
     - `SENDGRID_API_KEY`
     - `SENDGRID_FROM`
     - `FIREBASE_SERVICE_ACCOUNT_KEY` (optional if using ADC)

2. **Service Account Permissions**
   - Cloud Run service account needs: `Secret Manager Secret Accessor` role
   - Check: IAM & Admin → Service Accounts → Cloud Run service account

3. **React Build Missing**
   - Ensure `public/` folder exists in server directory
   - Build React app: `cd client && npm run build`

4. **Environment Variables Not Set**
   - Check: Cloud Run → school-app → Variables & Secrets
   - Required: `NODE_ENV=production`, `GOOGLE_CLOUD_PROJECT=your-project-id`

### Check Logs:

```bash
gcloud run services logs read school-app --region us-central1 --limit 50
```

Look for:
- "Initialization error"
- "Failed to access secret"
- "Cannot find module"
- "ENOENT: no such file or directory"

### Quick Fixes:

1. **Set Environment Variables:**
   ```bash
   gcloud run services update school-app \
     --region us-central1 \
     --set-env-vars NODE_ENV=production,GOOGLE_CLOUD_PROJECT=your-project-id
   ```

2. **Grant Secret Manager Access:**
   ```bash
   PROJECT_NUMBER=$(gcloud projects describe your-project-id --format='value(projectNumber)')
   gcloud projects add-iam-policy-binding your-project-id \
     --member="serviceAccount:$PROJECT_NUMBER-compute@developer.gserviceaccount.com" \
     --role="roles/secretmanager.secretAccessor"
   ```

3. **Rebuild React App:**
   ```bash
   cd client
   npm run build
   cd ../server
   ```

4. **Redeploy:**
   ```bash
   cd server
   .\deploy.ps1
   ```

