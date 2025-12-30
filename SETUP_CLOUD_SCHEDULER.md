# Cloud Scheduler Setup Instructions

Follow these steps to set up Cloud Scheduler to automatically process scheduled SMS.

## Step 1: Get Your Cloud Run URL

```powershell
# Get your Cloud Run service URL
gcloud run services describe school-app --region us-central1 --format 'value(status.url)'
```

Copy this URL - you'll need it in Step 3.

## Step 2: Generate and Add Secret Token

### 2a. Generate a secure random token:

**Option 1: Using PowerShell:**
```powershell
# Generate a 64-character random hex token
-join ((48..57) + (65..70) + (97..102) | Get-Random -Count 64 | ForEach-Object {[char]$_})
```

**Option 2: Using OpenSSL (if installed):**
```powershell
openssl rand -hex 32
```

Copy the generated token.

### 2b. Add token to Google Secret Manager:

```powershell
# Replace YOUR_TOKEN with the token you generated above
$token = "YOUR_TOKEN"
echo -n $token | gcloud secrets create SCHEDULER_SECRET_TOKEN --data-file=-
```

**Note:** If you get an error saying the secret already exists, you can update it instead:
```powershell
echo -n $token | gcloud secrets versions add SCHEDULER_SECRET_TOKEN --data-file=-
```

## Step 3: Get Your Project Number (for service account)

```powershell
# Get your project number (needed for service account email)
gcloud projects describe credible-runner-468819-f9 --format='value(projectNumber)'
```

Copy this number - you'll use it as `PROJECT_NUMBER` in the next step.

## Step 4: Create Cloud Scheduler Job

**Replace the placeholders:**
- `YOUR_CLOUD_RUN_URL` - from Step 1
- `YOUR_TOKEN` - from Step 2a
- `PROJECT_NUMBER` - from Step 3

```powershell
gcloud scheduler jobs create http process-scheduled-sms `
  --location=us-central1 `
  --schedule="* * * * *" `
  --uri="YOUR_CLOUD_RUN_URL/api/sms/process-scheduled" `
  --http-method=POST `
  --headers="Content-Type=application/json,x-scheduler-token=YOUR_TOKEN" `
  --oidc-service-account-email="PROJECT_NUMBER-compute@developer.gserviceaccount.com" `
  --time-zone="America/New_York"
```

**Example (replace with your actual values):**
```powershell
gcloud scheduler jobs create http process-scheduled-sms `
  --location=us-central1 `
  --schedule="* * * * *" `
  --uri="https://school-app-iuwhs6msyq-uc.a.run.app/api/sms/process-scheduled" `
  --http-method=POST `
  --headers="Content-Type=application/json,x-scheduler-token=your-64-char-token-here" `
  --oidc-service-account-email="1078347267371-compute@developer.gserviceaccount.com" `
  --time-zone="America/New_York"
```

## Step 5: Grant Cloud Scheduler Access to Cloud Run

The service account needs permission to invoke Cloud Run:

```powershell
gcloud run services add-iam-policy-binding school-app `
  --region=us-central1 `
  --member="serviceAccount:PROJECT_NUMBER-compute@developer.gserviceaccount.com" `
  --role="roles/run.invoker"
```

Replace `PROJECT_NUMBER` with your project number from Step 3.

## Step 6: Test the Job

### Option 1: Test manually in Cloud Console
1. Go to [Cloud Scheduler](https://console.cloud.google.com/cloudscheduler)
2. Find `process-scheduled-sms`
3. Click "RUN NOW" to test it immediately

### Option 2: Test using gcloud
```powershell
gcloud scheduler jobs run process-scheduled-sms --location=us-central1
```

### Check the logs:
```powershell
gcloud scheduler jobs describe process-scheduled-sms --location=us-central1
```

Or check Cloud Run logs:
```powershell
gcloud run services logs read school-app --region us-central1 --limit 50
```

## Verification

After setup, the job will:
- Run every minute (`* * * * *`)
- Call `/api/sms/process-scheduled` on your Cloud Run service
- Process all pending SMS that are ready to send
- Update their status in the database

**Your scheduled SMS from 2:09 PM should process on the next run (within 1 minute).**

## Troubleshooting

### Job fails with 401 Unauthorized
- Check that `SCHEDULER_SECRET_TOKEN` is in Secret Manager
- Verify the token in the job headers matches the secret
- Make sure your server has loaded the secret (check server logs)

### Job fails with 403 Forbidden
- Run Step 5 to grant the service account permission
- Verify the service account email is correct

### Job doesn't run
- Check Cloud Scheduler logs in Google Cloud Console
- Verify the schedule is `* * * * *` (every minute)
- Check the time zone is correct

### SMS still showing as pending
- Check Cloud Run logs for errors
- Verify the endpoint is accessible (try manual curl test)
- Check that `scheduled_for` time has passed

