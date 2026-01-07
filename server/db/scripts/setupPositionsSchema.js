import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { readFileSync } from "fs";
import { initializePostgres, query } from "../postgresConnect.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, "../../.env") });

async function setupPositionsSchema() {
  try {
    console.log("🚀 Setting up Positions PostgreSQL database schema...\n");
    
    await initializePostgres();
    
    const schemaPath = join(__dirname, "../schema_positions.sql");
    const schemaSQL = readFileSync(schemaPath, "utf8");
    
    console.log("📝 Executing Positions schema SQL...\n");
    
    try {
      await query(schemaSQL);
      console.log("✅ Positions schema SQL executed successfully");
    } catch (error) {
      if (error.code === "42P07" || error.code === "42710" || error.message.includes("already exists")) {
        console.log("⚠️  Some Positions objects already exist (this is okay if re-running)");
      } else {
        console.error(`\n❌ Error executing Positions schema:`, error.message);
        throw error;
      }
    }
    
    console.log("\n✅ Positions database schema created successfully!");
    
    // Do not exit process here, let server.js handle it
  } catch (error) {
    console.error("\n❌ Positions schema setup failed:", error);
    throw error; // Re-throw to be caught by server.js
  }
}

// Only run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  setupPositionsSchema()
    .then(() => {
      console.log("✅ Positions schema setup complete!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("❌ Setup failed:", error);
      process.exit(1);
    });
}

export default setupPositionsSchema;

