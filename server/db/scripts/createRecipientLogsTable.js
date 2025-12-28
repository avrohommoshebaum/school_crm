/**
 * Create sms_recipient_logs table if it doesn't exist
 * Quick fix script to create the missing table
 */

import { query } from "../postgresConnect.js";
import { initializePostgres } from "../postgresConnect.js";

async function createRecipientLogsTable() {
  try {
    await initializePostgres();
    console.log("📋 Creating sms_recipient_logs table...");

    // Create the table
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

    // Create indexes
    await query(`
      CREATE INDEX IF NOT EXISTS idx_sms_recipient_logs_sms_message_id ON sms_recipient_logs(sms_message_id);
    `);

    await query(`
      CREATE INDEX IF NOT EXISTS idx_sms_recipient_logs_phone_number ON sms_recipient_logs(phone_number);
    `);

    await query(`
      CREATE INDEX IF NOT EXISTS idx_sms_recipient_logs_status ON sms_recipient_logs(status);
    `);

    // Create trigger for updated_at
    await query(`
      DROP TRIGGER IF EXISTS update_sms_recipient_logs_updated_at ON sms_recipient_logs;
    `);

    await query(`
      CREATE TRIGGER update_sms_recipient_logs_updated_at 
      BEFORE UPDATE ON sms_recipient_logs
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    `);

    console.log("✅ sms_recipient_logs table created successfully!");
    process.exit(0);
  } catch (error) {
    if (error.message && (error.message.includes("already exists") || error.code === "42P07" || error.code === "42710")) {
      console.log("✅ Table already exists!");
      process.exit(0);
    }
    console.error("❌ Error creating table:", error.message);
    console.error(error);
    process.exit(1);
  }
}

createRecipientLogsTable();

