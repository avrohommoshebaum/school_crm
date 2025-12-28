/**
 * Setup SMS Schema
 * Creates SMS-related tables in PostgreSQL
 */

import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { query } from "../postgresConnect.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function setupSMSSchema() {
  try {
    // Check if all required tables exist
    const checkResult = await query(`
      SELECT table_name
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('sms_messages', 'scheduled_sms', 'sms_recipient_logs')
      ORDER BY table_name;
    `);

    const existingTables = checkResult.rows.map(r => r.table_name);
    const allTablesExist = 
      existingTables.includes('sms_messages') && 
      existingTables.includes('scheduled_sms') && 
      existingTables.includes('sms_recipient_logs');

    if (allTablesExist) {
      // All tables already exist, skip setup
      return;
    }

    console.log("📋 Setting up SMS schema (creating missing tables)...");

    // If sms_recipient_logs is missing, create it directly
    if (!existingTables.includes('sms_recipient_logs')) {
      try {
        console.log("Creating sms_recipient_logs table...");
        await query(`
          CREATE TABLE IF NOT EXISTS sms_recipient_logs (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            sms_message_id UUID NOT NULL REFERENCES sms_messages(id) ON DELETE CASCADE,
            phone_number TEXT NOT NULL,
            twilio_sid VARCHAR(255),
            status VARCHAR(50),
            error_code VARCHAR(20),
            error_message TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
          );
        `);

        await query(`
          CREATE INDEX IF NOT EXISTS idx_sms_recipient_logs_sms_message_id ON sms_recipient_logs(sms_message_id);
        `);

        await query(`
          CREATE INDEX IF NOT EXISTS idx_sms_recipient_logs_phone_number ON sms_recipient_logs(phone_number);
        `);

        await query(`
          CREATE INDEX IF NOT EXISTS idx_sms_recipient_logs_status ON sms_recipient_logs(status);
        `);

        await query(`
          DROP TRIGGER IF EXISTS update_sms_recipient_logs_updated_at ON sms_recipient_logs;
        `);

        await query(`
          CREATE TRIGGER update_sms_recipient_logs_updated_at 
          BEFORE UPDATE ON sms_recipient_logs
          FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
        `);

        console.log("✅ sms_recipient_logs table created!");
      } catch (error) {
        if (error.message && (error.message.includes("already exists") || error.code === "42P07" || error.code === "42710")) {
          console.log("⚠️ Table already exists");
        } else {
          console.error("❌ Error creating sms_recipient_logs table:", error.message);
          throw error;
        }
      }
    }

    // Read and execute the full schema file for any other missing tables
    const schemaPath = join(__dirname, "..", "schema_sms.sql");
    const schemaSQL = readFileSync(schemaPath, "utf-8");

    // Execute the entire schema SQL file
    // PostgreSQL's IF NOT EXISTS will handle existing tables gracefully
    try {
      await query(schemaSQL);
      console.log("✅ SMS schema setup complete!");
    } catch (error) {
      // If error is about objects already existing, that's okay
      if (error.message && (error.message.includes("already exists") || error.code === "42P07" || error.code === "42710")) {
        console.log("⚠️ Some objects already exist (this is okay)");
        return;
      }
      // Re-throw other errors
      throw error;
    }
  } catch (error) {
    // If error is about tables already existing, that's okay
    if (error.message && (error.message.includes("already exists") || error.code === "42P07" || error.code === "42710")) {
      console.log("⚠️ Some tables already exist, continuing...");
      return;
    }
    console.error("❌ Error setting up SMS schema:", error.message);
    throw error;
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  setupSMSSchema()
    .then(() => {
      console.log("✅ Done");
      process.exit(0);
    })
    .catch((error) => {
      console.error("❌ Failed:", error);
      process.exit(1);
    });
}

export default setupSMSSchema;

