import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { readFileSync } from "fs";
import { initializePostgres, query } from "../postgresConnect.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, "../../.env") });

async function setupStaffManagementSchema() {
  try {
    console.log("🚀 Setting up Staff Management PostgreSQL database schema...\n");
    
    await initializePostgres();
    
    const schemaPath = join(__dirname, "../schema_staff_management.sql");
    const schemaSQL = readFileSync(schemaPath, "utf8");
    
    console.log("📝 Executing Staff Management schema SQL...\n");
    
    try {
      await query(schemaSQL);
      console.log("✅ Staff Management schema SQL executed successfully");
    } catch (error) {
      if (error.code === "42P07" || error.code === "42710" || error.message.includes("already exists")) {
        console.log("⚠️  Some Staff Management objects already exist (this is okay if re-running)");
      } else {
        console.error(`\n❌ Error executing Staff Management schema:`, error.message);
        throw error;
      }
    }
    
    console.log("\n✅ Staff Management database schema created successfully!");
    
    console.log("\n📊 Verifying Staff Management tables...\n");
    
    const tables = await query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('staff_salaries', 'staff_benefits', 'staff_documents')
      ORDER BY table_name
    `);
    
    console.log("Created Staff Management tables:");
    tables.rows.forEach(row => {
      console.log(`  ✓ ${row.table_name}`);
    });
    
    console.log("\n✅ Staff Management schema setup complete!");
    // Do not exit process here, let server.js handle it
  } catch (error) {
    console.error("\n❌ Staff Management schema setup failed:", error);
    throw error; // Re-throw to be caught by server.js
  }
}

// Only run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  setupStaffManagementSchema()
    .then(() => {
      console.log("✅ Staff Management schema setup complete!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("❌ Setup failed:", error);
      process.exit(1);
    });
}

export default setupStaffManagementSchema;

