/**
 * Google Cloud Storage Utility
 * Handles audio file uploads and generates signed URLs for secure access
 * Uses GCS for long-term, cost-effective storage
 */

import { Storage } from "@google-cloud/storage";

let storageClient = null;
let bucketName = null;

/**
 * Initialize GCS client
 */
export function initializeGCS() {
  try {
    const projectId = process.env.GOOGLE_CLOUD_PROJECT;
    if (!projectId) {
      console.warn("⚠️ GOOGLE_CLOUD_PROJECT not set. GCS storage will be disabled.");
      return null;
    }

    // Initialize Storage client
    // In Cloud Run, credentials are automatically provided
    storageClient = new Storage({
      projectId,
    });

    // Get bucket name from env or use default
    bucketName = process.env.GCS_BUCKET_NAME || `${projectId}-robocall-audio`;
    
    console.log(`✅ GCS Storage initialized with bucket: ${bucketName}`);
    return storageClient;
  } catch (error) {
    console.error("❌ Error initializing GCS:", error.message);
    return null;
  }
}

/**
 * Get GCS client (initialize if needed)
 */
function getStorageClient() {
  if (!storageClient) {
    return initializeGCS();
  }
  return storageClient;
}

/**
 * Upload audio file to GCS
 * @param {Buffer|Uint8Array} fileBuffer - File buffer
 * @param {string} fileName - Original file name
 * @param {string} contentType - MIME type (e.g., 'audio/mpeg', 'audio/wav')
 * @returns {Promise<{url: string, gcsPath: string, publicUrl: string}>}
 */
export async function uploadAudioFile(fileBuffer, fileName, contentType = "audio/mpeg") {
  const client = getStorageClient();
  if (!client) {
    throw new Error("GCS client not initialized");
  }

  if (!bucketName) {
    throw new Error("GCS bucket name not configured");
  }

  try {
    // Ensure bucket exists, create if it doesn't
    const bucket = client.bucket(bucketName);
    const [exists] = await bucket.exists();
    
    if (!exists) {
      console.log(`Creating bucket: ${bucketName}`);
      await bucket.create({
        location: "us-central1",
        storageClass: "STANDARD", // Standard storage for frequent access
      });
    }

    // Generate unique file path with timestamp
    const timestamp = Date.now();
    const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, "_");
    const gcsFileName = `robocalls/${timestamp}_${sanitizedFileName}`;

    // Upload file
    const file = bucket.file(gcsFileName);
    
    await file.save(fileBuffer, {
      metadata: {
        contentType,
        cacheControl: "public, max-age=31536000", // Cache for 1 year
      },
    });

    // Make file private (not publicly accessible)
    await file.makePrivate();

    // Generate signed URL valid for 1 year (long-term for robocalls)
    const [signedUrl] = await file.getSignedUrl({
      action: "read",
      expires: Date.now() + 365 * 24 * 60 * 60 * 1000, // 1 year
      version: "v4",
    });

    return {
      url: signedUrl,
      gcsPath: gcsFileName,
      publicUrl: `gs://${bucketName}/${gcsFileName}`,
    };
  } catch (error) {
    console.error("Error uploading to GCS:", error);
    throw new Error(`Failed to upload audio file: ${error.message}`);
  }
}

/**
 * Generate signed URL for existing file
 * @param {string} gcsPath - Path to file in GCS (e.g., 'robocalls/1234567890_file.mp3')
 * @param {number} expiresInHours - Hours until URL expires (default: 24)
 * @returns {Promise<string>} Signed URL
 */
export async function getSignedUrl(gcsPath, expiresInHours = 24) {
  const client = getStorageClient();
  if (!client || !bucketName) {
    throw new Error("GCS not initialized");
  }

  try {
    const file = client.bucket(bucketName).file(gcsPath);
    const [exists] = await file.exists();
    
    if (!exists) {
      throw new Error("File not found in GCS");
    }

    const [signedUrl] = await file.getSignedUrl({
      action: "read",
      expires: Date.now() + expiresInHours * 60 * 60 * 1000,
      version: "v4",
    });

    return signedUrl;
  } catch (error) {
    console.error("Error generating signed URL:", error);
    throw new Error(`Failed to generate signed URL: ${error.message}`);
  }
}

/**
 * Delete audio file from GCS
 * @param {string} gcsPath - Path to file in GCS
 * @returns {Promise<void>}
 */
export async function deleteAudioFile(gcsPath) {
  const client = getStorageClient();
  if (!client || !bucketName) {
    throw new Error("GCS not initialized");
  }

  try {
    const file = client.bucket(bucketName).file(gcsPath);
    await file.delete();
  } catch (error) {
    console.error("Error deleting from GCS:", error);
    throw new Error(`Failed to delete audio file: ${error.message}`);
  }
}

/**
 * Check if file exists in GCS
 * @param {string} gcsPath - Path to file in GCS
 * @returns {Promise<boolean>}
 */
export async function fileExists(gcsPath) {
  const client = getStorageClient();
  if (!client || !bucketName) {
    return false;
  }

  try {
    const file = client.bucket(bucketName).file(gcsPath);
    const [exists] = await file.exists();
    return exists;
  } catch (error) {
    console.error("Error checking file existence:", error);
    return false;
  }
}

