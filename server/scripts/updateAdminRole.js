import dotenv from "dotenv";
dotenv.config();

import { initializePostgres } from "../db/postgresConnect.js";
import { roleService } from "../db/services/roleService.js";
import buildFullPermissions from "../utils/buildFullPermissions.js";

const run = async () => {
  await initializePostgres();

  const admin = await roleService.findByName("admin");

  if (!admin) {
    console.log("❌ Admin role not found");
    process.exit(1);
  }

  await roleService.update(admin._id || admin.id, {
    permissions: buildFullPermissions(),
    isSystem: true,
  });

  console.log("✅ Admin role updated with full permissions");
  process.exit(0);
};

run().catch((err) => {
  console.error("❌ Script error:", err);
  process.exit(1);
});
