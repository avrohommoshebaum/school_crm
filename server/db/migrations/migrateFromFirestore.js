/**
 * Migration Script: Firestore to PostgreSQL
 * 
 * This script migrates all data from Firestore to PostgreSQL.
 * 
 * Usage:
 *   node server/db/migrateFromFirestore.js
 * 
 * Make sure to:
 * 1. Have both Firestore and PostgreSQL connections configured
 * 2. Run schema.sql first to create the database structure
 * 3. Backup your data before running
 */

import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, "../../.env") });

import firestoreConnect from "./firestoreconnect.js";
import { initializePostgres, query } from "../postgresConnect.js";
import { v4 as uuidv4 } from "uuid";

// Map to store Firestore IDs to PostgreSQL UUIDs
const idMapping = {
  roles: new Map(),
  users: new Map(),
  invitations: new Map(),
  communicationGroups: new Map(),
  groupMembers: new Map(),
};

async function migrateRoles() {
  console.log("📦 Migrating roles...");
  const db = await firestoreConnect();
  const snapshot = await db.collection("roles").get();
  
  for (const doc of snapshot.docs) {
    const data = doc.data();
    const newId = uuidv4();
    idMapping.roles.set(doc.id, newId);
    
    // Store mapping in database
    await query(
      "INSERT INTO id_mapping (firestore_id, postgres_uuid, entity_type) VALUES ($1, $2, $3) ON CONFLICT (firestore_id) DO NOTHING",
      [doc.id, newId, "roles"]
    );
    
    // Convert Firestore Timestamp to Date
    const createdAt = data.createdAt?.toDate ? data.createdAt.toDate() : data.createdAt || new Date();
    const updatedAt = data.updatedAt?.toDate ? data.updatedAt.toDate() : data.updatedAt || new Date();
    
    await query(
      `INSERT INTO roles (id, name, display_name, description, color, is_system, permissions, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       ON CONFLICT (name) DO UPDATE SET
         display_name = EXCLUDED.display_name,
         description = EXCLUDED.description,
         color = EXCLUDED.color,
         is_system = EXCLUDED.is_system,
         permissions = EXCLUDED.permissions,
         updated_at = EXCLUDED.updated_at`,
      [
        newId,
        data.name,
        data.displayName || data.display_name,
        data.description || null,
        data.color || null,
        data.isSystem || data.is_system || false,
        JSON.stringify(data.permissions || {}),
        createdAt,
        updatedAt,
      ]
    );
  }
  console.log(`✅ Migrated ${snapshot.docs.length} roles`);
}

async function migrateUsers() {
  console.log("📦 Migrating users...");
  const db = await firestoreConnect();
  const snapshot = await db.collection("users").get();
  
  for (const doc of snapshot.docs) {
    const data = doc.data();
    const newId = uuidv4();
    idMapping.users.set(doc.id, newId);
    
    // Store mapping in database
    await query(
      "INSERT INTO id_mapping (firestore_id, postgres_uuid, entity_type) VALUES ($1, $2, $3) ON CONFLICT (firestore_id) DO NOTHING",
      [doc.id, newId, "users"]
    );
    
    // Convert role IDs
    const roleIds = (data.roles || []).map(roleId => idMapping.roles.get(roleId)).filter(Boolean);
    
    // Convert Firestore Timestamp to Date
    const createdAt = data.createdAt?.toDate ? data.createdAt.toDate() : data.createdAt || new Date();
    const updatedAt = data.updatedAt?.toDate ? data.updatedAt.toDate() : data.updatedAt || new Date();
    const passwordResetExpires = data.passwordResetExpires?.toDate 
      ? data.passwordResetExpires.toDate() 
      : data.passwordResetExpires || null;
    const hireDate = data.hireDate ? (data.hireDate.toDate ? data.hireDate.toDate() : new Date(data.hireDate)) : null;
    
    await query(
      `INSERT INTO users (
        id, email, name, phone, hash, google_id, status, roles, permissions_override,
        password_reset_token, password_reset_expires, employee_id, department,
        hire_date, address, city, state, zip_code, emergency_contact, emergency_phone, bio,
        created_at, updated_at
       ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23
       )
       ON CONFLICT (email) DO UPDATE SET
         name = EXCLUDED.name,
         phone = EXCLUDED.phone,
         hash = COALESCE(EXCLUDED.hash, users.hash),
         google_id = EXCLUDED.google_id,
         status = EXCLUDED.status,
         roles = EXCLUDED.roles,
         permissions_override = EXCLUDED.permissions_override,
         password_reset_token = EXCLUDED.password_reset_token,
         password_reset_expires = EXCLUDED.password_reset_expires,
         updated_at = EXCLUDED.updated_at`,
      [
        newId,
        (data.email || "").toLowerCase(),
        data.name || null,
        data.phone || null,
        data.hash || null,
        data.googleId || data.google_id || null,
        data.status || "invited",
        roleIds,
        JSON.stringify(data.permissionsOverride || data.permissions_override || {}),
        data.passwordResetToken || data.password_reset_token || null,
        passwordResetExpires,
        data.employeeId || data.employee_id || null,
        data.department || null,
        hireDate,
        data.address || null,
        data.city || null,
        data.state || null,
        data.zipCode || data.zip_code || null,
        data.emergencyContact || data.emergency_contact || null,
        data.emergencyPhone || data.emergency_phone || null,
        data.bio || null,
        createdAt,
        updatedAt,
      ]
    );
  }
  console.log(`✅ Migrated ${snapshot.docs.length} users`);
}

async function migrateUserSettings() {
  console.log("📦 Migrating user settings...");
  const db = await firestoreConnect();
  const snapshot = await db.collection("userSettings").get();
  
  for (const doc of snapshot.docs) {
    const data = doc.data();
    const userId = idMapping.users.get(data.user || data.userId);
    
    if (!userId) {
      console.warn(`⚠️  Skipping user settings for unknown user: ${data.user || data.userId}`);
      continue;
    }
    
    // Remove user/userId from settings data
    const { user, userId: _, _id, id, ...settingsData } = data;
    
    const createdAt = data.createdAt?.toDate ? data.createdAt.toDate() : data.createdAt || new Date();
    const updatedAt = data.updatedAt?.toDate ? data.updatedAt.toDate() : data.updatedAt || new Date();
    
    await query(
      `INSERT INTO user_settings (user_id, settings, created_at, updated_at)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (user_id) DO UPDATE SET
         settings = EXCLUDED.settings,
         updated_at = EXCLUDED.updated_at`,
      [userId, JSON.stringify(settingsData), createdAt, updatedAt]
    );
  }
  console.log(`✅ Migrated ${snapshot.docs.length} user settings`);
}

async function migrateInvitations() {
  console.log("📦 Migrating invitations...");
  const db = await firestoreConnect();
  const snapshot = await db.collection("invitations").get();
  
  for (const doc of snapshot.docs) {
    const data = doc.data();
    const newId = uuidv4();
    idMapping.invitations.set(doc.id, newId);
    
    // Store mapping in database
    await query(
      "INSERT INTO id_mapping (firestore_id, postgres_uuid, entity_type) VALUES ($1, $2, $3) ON CONFLICT (firestore_id) DO NOTHING",
      [doc.id, newId, "invitations"]
    );
    
    // Convert role IDs
    const roleIds = (data.roleIds || data.roles || []).map(roleId => idMapping.roles.get(roleId)).filter(Boolean);
    
    const createdAt = data.createdAt?.toDate ? data.createdAt.toDate() : data.createdAt || new Date();
    const updatedAt = data.updatedAt?.toDate ? data.updatedAt.toDate() : data.updatedAt || new Date();
    const expiresAt = data.expiresAt?.toDate ? data.expiresAt.toDate() : data.expiresAt || null;
    
    await query(
      `INSERT INTO invitations (id, email, token, role_ids, accepted, expires_at, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       ON CONFLICT (token) DO UPDATE SET
         email = EXCLUDED.email,
         role_ids = EXCLUDED.role_ids,
         accepted = EXCLUDED.accepted,
         expires_at = EXCLUDED.expires_at,
         updated_at = EXCLUDED.updated_at`,
      [
        newId,
        (data.email || "").toLowerCase(),
        data.token,
        roleIds,
        data.accepted || false,
        expiresAt,
        createdAt,
        updatedAt,
      ]
    );
  }
  console.log(`✅ Migrated ${snapshot.docs.length} invitations`);
}

async function migrateCommunicationGroups() {
  console.log("📦 Migrating communication groups...");
  const db = await firestoreConnect();
  const snapshot = await db.collection("communicationGroups").get();
  
  for (const doc of snapshot.docs) {
    const data = doc.data();
    const newId = uuidv4();
    idMapping.communicationGroups.set(doc.id, newId);
    
    // Store mapping in database
    await query(
      "INSERT INTO id_mapping (firestore_id, postgres_uuid, entity_type) VALUES ($1, $2, $3) ON CONFLICT (firestore_id) DO NOTHING",
      [doc.id, newId, "communicationGroups"]
    );
    
    const createdAt = data.createdAt?.toDate ? data.createdAt.toDate() : data.createdAt || new Date();
    const updatedAt = data.updatedAt?.toDate ? data.updatedAt.toDate() : data.updatedAt || new Date();
    
    await query(
      `INSERT INTO communication_groups (id, name, description, pin, member_count, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (pin) DO UPDATE SET
         name = EXCLUDED.name,
         description = EXCLUDED.description,
         member_count = EXCLUDED.member_count,
         updated_at = EXCLUDED.updated_at`,
      [
        newId,
        data.name,
        data.description || null,
        data.pin,
        data.memberCount || data.member_count || 0,
        createdAt,
        updatedAt,
      ]
    );
  }
  console.log(`✅ Migrated ${snapshot.docs.length} communication groups`);
}

async function migrateGroupMembers() {
  console.log("📦 Migrating group members...");
  const db = await firestoreConnect();
  const snapshot = await db.collection("groupMembers").get();
  
  for (const doc of snapshot.docs) {
    const data = doc.data();
    const groupId = idMapping.communicationGroups.get(data.groupId || data.group_id);
    
    if (!groupId) {
      console.warn(`⚠️  Skipping group member for unknown group: ${data.groupId || data.group_id}`);
      continue;
    }
    
    const newId = uuidv4();
    idMapping.groupMembers.set(doc.id, newId);
    
    // Store mapping in database
    await query(
      "INSERT INTO id_mapping (firestore_id, postgres_uuid, entity_type) VALUES ($1, $2, $3) ON CONFLICT (firestore_id) DO NOTHING",
      [doc.id, newId, "groupMembers"]
    );
    
    // Ensure emails and phones are arrays
    const emails = Array.isArray(data.emails) ? data.emails : (data.email ? [data.email] : []);
    const phones = Array.isArray(data.phones) ? data.phones : (data.phone ? [data.phone] : []);
    
    const createdAt = data.createdAt?.toDate ? data.createdAt.toDate() : data.createdAt || new Date();
    const updatedAt = data.updatedAt?.toDate ? data.updatedAt.toDate() : data.updatedAt || new Date();
    
    await query(
      `INSERT INTO group_members (id, group_id, first_name, last_name, name, emails, phones, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [
        newId,
        groupId,
        data.firstName || data.first_name || null,
        data.lastName || data.last_name || null,
        data.name || null,
        emails,
        phones,
        createdAt,
        updatedAt,
      ]
    );
  }
  console.log(`✅ Migrated ${snapshot.docs.length} group members`);
}

async function main() {
  try {
    console.log("🚀 Starting Firestore to PostgreSQL migration...\n");
    
    // Initialize connections
    await firestoreConnect();
    console.log("✅ Connected to Firestore");
    
    await initializePostgres();
    console.log("✅ Connected to PostgreSQL\n");
    
    // Run migrations in order (respecting dependencies)
    await migrateRoles();
    await migrateUsers();
    await migrateUserSettings();
    await migrateInvitations();
    await migrateCommunicationGroups();
    await migrateGroupMembers();
    
    console.log("\n✅ Migration completed successfully!");
    console.log("\n📊 Migration Summary:");
    console.log(`   - Roles: ${idMapping.roles.size}`);
    console.log(`   - Users: ${idMapping.users.size}`);
    console.log(`   - Invitations: ${idMapping.invitations.size}`);
    console.log(`   - Communication Groups: ${idMapping.communicationGroups.size}`);
    console.log(`   - Group Members: ${idMapping.groupMembers.size}`);
    console.log("\n⚠️  Important: Update your application to use PostgreSQL services before going live!");
    
    process.exit(0);
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  }
}

main();

