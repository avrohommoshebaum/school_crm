import admin from "firebase-admin";

let db = null;

const firestoreConnect = async () => {
  if (db) {
    return db;
  }

  try {
    // Initialize Firebase Admin if not already initialized
    if (!admin.apps.length) {
      // Priority order:
      // 1. GOOGLE_APPLICATION_CREDENTIALS (file path) - most reliable
      // 2. FIREBASE_SERVICE_ACCOUNT_KEY (JSON string)
      // 3. FIREBASE_PROJECT_ID (with Application Default Credentials)
      
      const serviceAccountPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
      const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
      
      // First, try file path method (most reliable) - prioritize this
      if (serviceAccountPath && serviceAccountPath.trim() !== '') {
        try {
          // Import the service account file
          const path = await import("path");
          const fs = await import("fs");
          const { fileURLToPath } = await import("url");
          
          // Resolve the file path (handle both relative and absolute paths)
          let fullPath = serviceAccountPath;
          if (!path.isAbsolute(serviceAccountPath)) {
            // Get the directory of the current module
            const __filename = fileURLToPath(import.meta.url);
            const __dirname = path.dirname(__filename);
            // Go up from db/ to server/, then use the provided path
            fullPath = path.resolve(__dirname, "..", serviceAccountPath);
          }
          
          // Check if file exists
          if (!fs.existsSync(fullPath)) {
            throw new Error(`Service account file not found at: ${fullPath}`);
          }
          
          // Read and parse the JSON file
          const serviceAccountJson = JSON.parse(fs.readFileSync(fullPath, "utf8"));
          
          admin.initializeApp({
            credential: admin.credential.cert(serviceAccountJson),
          });
          
          if (process.env.NODE_ENV !== "production") {
            console.log(`✅ Loaded Firebase credentials from: ${fullPath}`);
          }
        } catch (fileErr) {
          throw new Error(
            `Failed to load credentials from ${serviceAccountPath}: ${fileErr.message}. ` +
            `Please check the file path and that it contains valid JSON.`
          );
        }
      } else if (serviceAccountKey && serviceAccountKey.trim() !== '') {
        // Second, try JSON string method
        try {
          // If service account key is provided as JSON string
          let serviceAccount;
          if (typeof serviceAccountKey === 'string') {
            // Try to parse as JSON string
            // First, try to clean up common issues (extra quotes, whitespace)
            let cleaned = serviceAccountKey.trim();
            // Remove surrounding quotes if present
            if ((cleaned.startsWith('"') && cleaned.endsWith('"')) || 
                (cleaned.startsWith("'") && cleaned.endsWith("'"))) {
              cleaned = cleaned.slice(1, -1);
            }
            // Replace escaped newlines
            cleaned = cleaned.replace(/\\n/g, '\n');
            serviceAccount = JSON.parse(cleaned);
          } else {
            serviceAccount = serviceAccountKey;
          }
          
          // Validate required fields
          if (!serviceAccount.project_id || !serviceAccount.private_key || !serviceAccount.client_email) {
            throw new Error("Service account JSON is missing required fields (project_id, private_key, or client_email)");
          }
          
          admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
          });
          
          if (process.env.NODE_ENV !== "production") {
            console.log("✅ Loaded Firebase credentials from FIREBASE_SERVICE_ACCOUNT_KEY");
          }
        } catch (parseErr) {
          // If FIREBASE_SERVICE_ACCOUNT_KEY is invalid, log and continue to next method
          console.warn(`⚠️ FIREBASE_SERVICE_ACCOUNT_KEY is invalid (${parseErr.message}), trying other methods...`);
          // Fall through to next method
        }
      }
      
      // If still not initialized, try Application Default Credentials (for Cloud Run/GCP)
      if (!admin.apps.length) {
        // Try with project ID from environment or from GOOGLE_CLOUD_PROJECT
        const projectId = process.env.FIREBASE_PROJECT_ID || process.env.GOOGLE_CLOUD_PROJECT || process.env.GCLOUD_PROJECT;
        if (projectId) {
          // Third, try Application Default Credentials (for GCP environments like Cloud Run)
          try {
            admin.initializeApp({
              projectId: projectId,
            });
            console.log(`✅ Loaded Firebase credentials using Application Default Credentials (project: ${projectId})`);
          } catch (adcErr) {
            console.warn(`⚠️ Application Default Credentials failed: ${adcErr.message}`);
            // Fall through to error
          }
        }
      }
      
      // If still not initialized, throw error
      if (!admin.apps.length) {
        throw new Error(
          "Firebase credentials not found. Please set one of the following:\n" +
          "  - GOOGLE_APPLICATION_CREDENTIALS (path to service account JSON file) - Recommended\n" +
          "  - FIREBASE_SERVICE_ACCOUNT_KEY (JSON string of service account)\n" +
          "  - FIREBASE_PROJECT_ID (with Application Default Credentials)\n\n" +
          "See: https://firebase.google.com/docs/admin/setup#initialize-sdk"
        );
      }
    }

    // Get Firestore instance
    // For default database, just use admin.firestore()
    // For named databases, you would need to use getFirestore() with database ID
    db = admin.firestore();
    
    if (process.env.NODE_ENV !== "production") {
      console.log("✅ Firestore connected");
    }

    return db;
  } catch (err) {
    console.error("❌ Firestore connection error:", err.message);
    console.error("\nTo fix this error:");
    console.error("1. Create a Firebase project at https://console.firebase.google.com");
    console.error("2. Generate a service account key (Project Settings > Service Accounts)");
    console.error("3. Set GOOGLE_APPLICATION_CREDENTIALS to the path of the JSON file");
    console.error("   OR set FIREBASE_SERVICE_ACCOUNT_KEY with the JSON content");
    throw err;
  }
};

export default firestoreConnect;

