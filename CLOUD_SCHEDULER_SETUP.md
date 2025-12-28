# Cloud Scheduler Setup for Scheduled SMS

Since you're using Cloud Run, we need to use **Cloud Scheduler** instead of node-cron to handle scheduled SMS. Cloud Run instances can scale to zero, so cron jobs won't run when the instance is sleeping.

## Why This Approach is FREE

- ✅ **Only ONE Cloud Scheduler job needed** (first 3 jobs are FREE)
- ✅ **Processes ALL pending SMS in batches** - not one job per SMS
- ✅ Works with Cloud Run (wakes up instances when needed)
- ✅ Reliable and managed by Google
- ✅ No need to keep instances running

**Cost Breakdown:**
- Cloud Scheduler: **FREE** (1 job = within free tier)
- Cloud Run: Only pays when processing (~1-2 seconds per minute)
- **Total cost: $0/month** for unlimited scheduled SMS!

## How It Works

1. User schedules an SMS via the UI
2. Scheduled SMS is saved to `scheduled_sms` table with `status='pending'`
3. **ONE Cloud Scheduler job** calls `/api/sms/process-scheduled` every minute
4. The endpoint checks for **ALL** pending SMS where `scheduled_for <= now()`
5. Processes them in parallel batches of 50 (to respect Twilio rate limits)
6. Sends SMS via Twilio and updates status
7. Cloud Run instance can sleep between calls (saves money!)

**Key Point:** You only need **ONE** Cloud Scheduler job, regardless of how many SMS you schedule. This job processes **ALL** pending SMS in one call, whether it's 10 or 10,000 SMS.

**Large Batch Handling:**
- If you schedule 1,000 SMS for the same time, they will ALL be processed in one Cloud Scheduler run
- The system processes them in parallel batches of 50 to avoid overwhelming Twilio's API
- Each batch waits for completion before starting the next (respects rate limits)
- Progress is logged for large batches so you can monitor processing

## Setup Steps

### 1. Create the Database Tables

Run the SMS schema setup:
```bash
cd server
node db/scripts/setupSMSSchema.js
```

### 2. Add Secret Token to Secret Manager (for security)

```bash
# Generate a secure random token
openssl rand -hex 32

# Create the secret in Secret Manager
echo -n "YOUR_GENERATED_TOKEN" | gcloud secrets create SCHEDULER_SECRET_TOKEN --data-file=-
```

### 3. Set Up Cloud Scheduler Job (ONE job only!)

**Using gcloud CLI:**
```bash
gcloud scheduler jobs create http process-scheduled-sms \
  --location=us-central1 \
  --schedule="* * * * *" \
  --uri="https://YOUR-CLOUD-RUN-URL/api/sms/process-scheduled" \
  --http-method=POST \
  --headers="Content-Type=application/json,x-scheduler-token=YOUR_SECRET_TOKEN" \
  --oidc-service-account-email=YOUR-SERVICE-ACCOUNT@PROJECT-ID.iam.gserviceaccount.com
```

**Or use the Cloud Console:**
1. Go to Cloud Scheduler in Google Cloud Console
2. Click "Create Job"
3. Name: `process-scheduled-sms`
4. Region: `us-central1` (or your Cloud Run region)
5. Frequency: `* * * * *` (every minute)
6. Target: HTTP
7. URL: `https://YOUR-CLOUD-RUN-URL/api/sms/process-scheduled`
8. HTTP method: POST
9. Headers: 
   - `Content-Type: application/json`
   - `x-scheduler-token: YOUR_SECRET_TOKEN`
10. Auth header: Add OIDC token (use your Cloud Run service account)

### 4. Update Secrets Config

The `processScheduledSMS` endpoint already checks for the `x-scheduler-token` header. Make sure `SCHEDULER_SECRET_TOKEN` is in your `server/config/secrets.js` optional secrets list.

## Security

The endpoint is protected by a secret token that must be included in the request headers. This prevents unauthorized access to the scheduled SMS processing endpoint.

## Cost Summary

- **Cloud Scheduler**: **FREE** (1 job = within free tier of 3 jobs/month)
- **Cloud Run**: ~$0.000024 per request (wakes up for ~1-2 seconds)
- **Total**: **Essentially FREE** for unlimited scheduled SMS!

Even if you schedule 1000 SMS per month, you still only need 1 Cloud Scheduler job. The job processes all pending SMS in batches, so the cost doesn't scale with the number of scheduled SMS.

