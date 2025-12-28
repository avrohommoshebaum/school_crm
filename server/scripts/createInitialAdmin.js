import dotenv from "dotenv";
dotenv.config();

import { initializePostgres } from "../db/postgresConnect.js";
import { roleService } from "../db/services/roleService.js";
import { userService } from "../db/services/userService.js";
import { invitationService } from "../db/services/invitationService.js";
import crypto from "crypto";

const createInitialAdmin = async () => {
  await initializePostgres();

  const email = "rabbi.baum@nachlasby.com";

  console.log("🔍 Checking if user already exists...");
  let existing = await userService.findByEmail(email);

  if (existing) {
    console.log("❗ User already exists. Aborting bootstrap.");
    process.exit(0);
  }

  console.log("🔍 Ensuring admin role exists...");
  let adminRole = await roleService.findByName("admin");

  if (!adminRole) {
    adminRole = await roleService.create({
      name: "admin",
      displayName: "Administrator",
      description: "System Administrator",
      isSystem: true,
      color: "#d32f2f",
      permissions: {
        students: { view: true, create: true, edit: true, delete: true },
        classes: { view: true, create: true, edit: true, delete: true },
        reportCards: { view: true, create: true, edit: true, delete: true },
        communications: { view: true, create: true, edit: true, delete: true },
        applications: { view: true, create: true, edit: true, delete: true },
        financial: { view: true, create: true, edit: true, delete: true },
        users: { view: true, create: true, edit: true, delete: true },
        settings: { view: true, create: true, edit: true, delete: true },
        reports: { view: true, create: true, edit: true, delete: true },
      },
    });
    console.log("✔️ Admin role created.");
  } else {
    console.log("✔️ Admin role already exists.");
  }

  console.log("📨 Creating user with 'invited' status...");
  
  // Create the user first (required for invite completion)
  const user = await userService.create({
    email,
    roles: [adminRole._id || adminRole.id],
    status: "invited",
    invitedBy: null, // no admin exists yet
  });
  console.log("✔️ User created with ID:", user._id || user.id);

  console.log("📨 Creating one-time invite for:", email);

  const token = crypto.randomBytes(32).toString("hex");

  const invite = await invitationService.create({
    email,
    token,
    roles: [adminRole._id || adminRole.id],
    createdBy: null,      // no admin exists yet
    expiresAt: new Date(Date.now() + 24 * 3600 * 1000 * 7), // 7 days
  });

  const inviteLink = `${process.env.CLIENT_URL}/invite/accept?token=${token}`;

  console.log("🎉 INITIAL ADMIN INVITE CREATED!");
  console.log("-----------------------------------------");
  console.log("Invite Email:", email);
  console.log("Invite Link:", inviteLink);
  console.log("-----------------------------------------");

  process.exit(0);
};

export default createInitialAdmin;


createInitialAdmin().catch((err) => {
  console.error("❌ Bootstrap error:", err);
  process.exit(1);
});
