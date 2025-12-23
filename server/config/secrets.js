import { SecretManagerServiceClient } from "@google-cloud/secret-manager";

const client = new SecretManagerServiceClient();

async function accessSecret(name) {
  const projectId = process.env.GOOGLE_CLOUD_PROJECT || process.env.GCLOUD_PROJECT;
  
  if (!projectId) {
    throw new Error(
      `GOOGLE_CLOUD_PROJECT not set. Cannot access secret "${name}". ` +
      `Set GOOGLE_CLOUD_PROJECT environment variable.`
    );
  }

  try {
    const [version] = await client.accessSecretVersion({
      name: `projects/${projectId}/secrets/${name}/versions/latest`,
    });

    return version.payload.data.toString();
  } catch (err) {
    throw new Error(
      `Failed to access secret "${name}" in project "${projectId}": ${err.message}. ` +
      `Make sure the secret exists and the service account has Secret Manager Secret Accessor role.`
    );
  }
}

export async function loadSecrets() {
  const projectId = process.env.GOOGLE_CLOUD_PROJECT || process.env.GCLOUD_PROJECT;
  const isProduction = process.env.NODE_ENV === "production" && projectId;

  // LOCAL DEVELOPMENT: Use .env file only (already loaded by server.js)
  if (!isProduction) {
    console.log("✅ Using .env file for local development");
    // Check if required secrets are present (optional warning)
    const requiredSecrets = [
      "SESSION_SECRET",
      "SENDGRID_API_KEY",
      "SENDGRID_FROM",
    ];

    const missingSecrets = requiredSecrets.filter(
      (secret) => !process.env[secret]
    );

    if (missingSecrets.length > 0) {
      console.warn(
        `⚠️ Missing secrets in .env: ${missingSecrets.join(", ")}`
      );
      console.warn(
        "   Add these to your .env file for local development"
      );
    }
    // Don't try Secret Manager in local dev - use .env only
    return;
  }

  // PRODUCTION: Use Google Secret Manager only
  if (!projectId) {
    throw new Error(
      "GOOGLE_CLOUD_PROJECT not set in production. " +
      "Cannot load secrets from Secret Manager."
    );
  }

  console.log(`✅ Loading secrets from Google Secret Manager (project: ${projectId})`);

  // PRODUCTION: Load all secrets from Secret Manager
  try {
    // Firebase credentials - can be loaded from secrets or environment
    if (!process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
      try {
        const firebaseKey = await accessSecret("FIREBASE_SERVICE_ACCOUNT_KEY");
        process.env.FIREBASE_SERVICE_ACCOUNT_KEY = firebaseKey;
        console.log("✅ FIREBASE_SERVICE_ACCOUNT_KEY loaded from Secret Manager");
      } catch (err) {
        // If secret doesn't exist, will use other methods (FIREBASE_PROJECT_ID, GOOGLE_APPLICATION_CREDENTIALS)
        console.log("⚠️ FIREBASE_SERVICE_ACCOUNT_KEY not found in secrets:", err.message);
        console.log("   Will try alternative methods (FIREBASE_PROJECT_ID, GOOGLE_APPLICATION_CREDENTIALS)");
      }
    }

    // Load other secrets from Secret Manager (required in production)
    const requiredSecrets = {
      SESSION_SECRET: "SESSION_SECRET",
      SENDGRID_API_KEY: "SENDGRID_API_KEY",
    };

    const optionalSecrets = {
      SENDGRID_FROM: "SENDGRID_FROM",
      TWILIO_ACCOUNT_SID: "TWILIO_ACCOUNT_SID",
      TWILIO_AUTH_TOKEN: "TWILIO_AUTH_TOKEN",
      TWILIO_PHONE_NUMBER: "TWILIO_PHONE_NUMBER",
    };

    // Load required secrets (must exist)
    for (const [envVar, secretName] of Object.entries(requiredSecrets)) {
      try {
        const secretValue = await accessSecret(secretName);
        process.env[envVar] = secretValue;
        console.log(`✅ ${envVar} loaded from Secret Manager`);
      } catch (err) {
        console.error(`❌ Error loading secret "${secretName}":`, err.message);
        throw new Error(
          `Required secret "${secretName}" not found in Secret Manager. ` +
          `Please create this secret in Google Cloud Secret Manager for production.`
        );
      }
    }

    // Load optional secrets (can be missing, will use env var or default)
    for (const [envVar, secretName] of Object.entries(optionalSecrets)) {
      if (!process.env[envVar]) {
        try {
          const secretValue = await accessSecret(secretName);
          process.env[envVar] = secretValue;
          console.log(`✅ ${envVar} loaded from Secret Manager`);
        } catch (err) {
          console.warn(`⚠️ ${secretName} not found in Secret Manager: ${err.message}`);
          console.warn(`   Will use environment variable or default value if set`);
        }
      }
    }

    console.log("✅ All secrets loaded successfully from Google Secret Manager");
  } catch (err) {
    console.error("❌ Error loading secrets from Secret Manager:", err.message);
    throw err;
  }
}
