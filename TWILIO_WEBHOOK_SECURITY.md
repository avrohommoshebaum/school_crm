# Twilio Webhook Security Setup

## ✅ Security Implementation

All TwiML endpoints are now secured with token-based authentication to prevent unauthorized access.

### Protected Endpoints:
- `/api/twilio/robocall-tts` - Text-to-speech robocall
- `/api/twilio/robocall-audio` - Audio robocall
- `/api/twilio/call-to-record` - Call-to-record
- `/api/twilio/recording-status` - Recording status webhook (also validates Twilio signature)

## 🔐 Setup Instructions

### 1. Generate a Secure Token

**Option 1: Using PowerShell:**
```powershell
# Generate a 64-character random hex token
-join ((48..57) + (65..70) + (97..102) | Get-Random -Count 64 | ForEach-Object {[char]$_})
```

**Option 2: Using OpenSSL (if installed):**
```powershell
openssl rand -hex 32
```

### 2. Add Token to Google Secret Manager

```powershell
# Replace YOUR_TOKEN with the token you generated above
$token = "YOUR_TOKEN"
echo -n $token | gcloud secrets create TWILIO_WEBHOOK_TOKEN --data-file=-
```

**Note:** If the secret already exists, update it:
```powershell
echo -n $token | gcloud secrets versions add TWILIO_WEBHOOK_TOKEN --data-file=-
```

### 3. Fallback Behavior

If `TWILIO_WEBHOOK_TOKEN` is not set, the system will:
1. Try to use `SCHEDULER_SECRET_TOKEN` (if available)
2. Use a default token (development only - **NOT SECURE FOR PRODUCTION**)

**⚠️ IMPORTANT:** Always set `TWILIO_WEBHOOK_TOKEN` in production!

## 🔧 Server URL Configuration

The server URL is determined in this order:
1. `SERVER_URL` environment variable (preferred)
2. `CLIENT_URL` environment variable (fallback)
3. Hardcoded fallback (development only)

**For Production:** Set `SERVER_URL` in Cloud Run:
```powershell
gcloud run services update school-app `
  --region us-central1 `
  --set-env-vars SERVER_URL=https://your-actual-cloud-run-url.run.app
```

## 🛡️ How It Works

1. **Token Generation**: When creating a robocall, the system includes a token in the TwiML URL
2. **Token Validation**: When Twilio calls the TwiML endpoint, it must include the correct token
3. **Dual Security**: The recording-status webhook validates both:
   - Token (query parameter)
   - Twilio signature (HTTP header)

## 📝 Example TwiML URL

```
https://your-server.com/api/twilio/robocall-tts?message=Hello&fromName=School&token=YOUR_SECRET_TOKEN
```

Only requests with the correct token will be processed.

## ✅ Verification

After setup, test by:
1. Sending a robocall from the UI
2. Check server logs - should not see "Invalid Twilio webhook token" warnings
3. Verify calls are working correctly

If you see 403 Forbidden errors, check:
- Token is set in Secret Manager
- Token matches in the URL
- Server has loaded the secret (check startup logs)

