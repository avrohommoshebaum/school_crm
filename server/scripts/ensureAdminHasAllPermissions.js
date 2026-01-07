/**
 * Ensure Admin Role Has All Permissions
 * Updates the admin role to include all permissions from PERMISSION_KEYS
 * This should be run when new permissions are added to the system
 */

import dotenv from "dotenv";
dotenv.config();

import { initializePostgres } from "../db/postgresConnect.js";
import { roleService } from "../db/services/roleService.js";
import buildFullPermissions from "../utils/buildFullPermissions.js";

async function ensureAdminHasAllPermissions() {
  try {
    await initializePostgres();

    const admin = await roleService.findByName("admin");

    if (!admin) {
      console.log("⚠️  Admin role not found - it will be created on first admin user creation");
      return;
    }

    const fullPermissions = buildFullPermissions();
    
    // Update admin role with all permissions
    await roleService.update(admin._id || admin.id, {
      permissions: fullPermissions,
      isSystem: true,
    });

    console.log("✅ Admin role updated with all permissions including principalCenter");
  } catch (error) {
    console.error("❌ Error updating admin role:", error);
    throw error;
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  ensureAdminHasAllPermissions()
    .then(() => {
      console.log("✅ Script completed successfully");
      process.exit(0);
    })
    .catch((error) => {
      console.error("❌ Script failed:", error);
      process.exit(1);
    });
}

export default ensureAdminHasAllPermissions;

