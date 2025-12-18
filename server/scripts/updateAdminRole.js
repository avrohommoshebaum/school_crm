import dotenv from "dotenv";
dotenv.config();

import mongooseConnect from "../db/mongooseconnect.js";
import Role from "../db/models/role.js";
import buildFullPermissions from "../utils/buildFullPermissions.js";

const run = async () => {
  await mongooseConnect();

  const admin = await Role.findOne({ name: "admin" });

  if (!admin) {
    console.log("❌ Admin role not found");
    process.exit(1);
  }

  admin.permissions = buildFullPermissions();
  admin.isSystem = true;

  await admin.save();

  console.log("✅ Admin role updated with full permissions");
  process.exit(0);
};

run().catch((err) => {
  console.error("❌ Script error:", err);
  process.exit(1);
});
