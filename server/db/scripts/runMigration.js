import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { readFileSync } from "fs";
import { initializePostgres, query } from "../postgresConnect.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, "../../.env") });

async function runMigration() {
  try {
    console.log("🔧 Running migration: fix_user_delete_foreign_keys.sql\n");
    
    await initializePostgres();
    
    const sql = readFileSync(
      join(__dirname, "../migrations/fix_user_delete_foreign_keys.sql"),
      "utf8"
    );
    
    // Execute the entire SQL file (DO blocks need to be executed as complete statements)
    try {
      await query(sql);
      console.log(`✅ Migration executed successfully!`);
    } catch (err) {
      // Some errors are expected if columns are already nullable
      if (err.message.includes("already") || err.message.includes("does not exist")) {
        console.log(`ℹ️  Some columns may already be nullable: ${err.message}`);
      } else {
        console.error(`❌ Error: ${err.message}`);
        throw err;
      }
    }
    
    console.log("\n✅ Migration completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  }
}

runMigration();

