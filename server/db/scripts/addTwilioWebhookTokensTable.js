/**
 * Add Twilio Webhook Tokens Table
 * Creates the twilio_webhook_tokens table if it doesn't exist
 */

import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { query } from "../postgresConnect.js";
import { initializePostgres } from "../postgresConnect.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env for local development
dotenv.config({ path: join(__dirname, "../../.env") });

export default async function addTwilioWebhookTokensTable() {
  try {
    await initializePostgres();
    
    // Create the table
    await query(`
      CREATE TABLE IF NOT EXISTS twilio_webhook_tokens (
        token TEXT PRIMARY KEY,
        call_sid TEXT,
        session_id UUID,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        expires_at TIMESTAMP WITH TIME ZONE NOT NULL
      );
    `);

    // Create indexes
    await query(`
      CREATE INDEX IF NOT EXISTS idx_twilio_webhook_tokens_expires_at 
      ON twilio_webhook_tokens(expires_at);
    `);

    await query(`
      CREATE INDEX IF NOT EXISTS idx_twilio_webhook_tokens_call_sid 
      ON twilio_webhook_tokens(call_sid);
    `);

    await query(`
      CREATE INDEX IF NOT EXISTS idx_twilio_webhook_tokens_session_id 
      ON twilio_webhook_tokens(session_id);
    `);

    console.log("✅ twilio_webhook_tokens table created successfully");
  } catch (error) {
    if (error.message.includes("already exists")) {
      console.log("ℹ️ twilio_webhook_tokens table already exists");
      return;
    }
    throw error;
  }
}

// If run directly, execute the function
if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.includes('addTwilioWebhookTokensTable')) {
  addTwilioWebhookTokensTable()
    .then(() => {
      console.log("✅ Done");
      process.exit(0);
    })
    .catch((error) => {
      console.error("❌ Error:", error);
      process.exit(1);
    });
}

