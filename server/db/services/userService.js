import firestoreConnect from "../firestoreconnect.js";
import bcrypt from "bcryptjs";
import { roleService } from "./roleService.js";

const COLLECTION = "users";

// Helper to convert Firestore doc to user object
const docToUser = (doc) => {
  if (!doc.exists) return null;
  const data = doc.data();
  return {
    _id: doc.id,
    ...data,
    id: doc.id,
  };
};

// Helper to convert user object to Firestore data
const userToFirestore = (user) => {
  const { _id, id, ...data } = user;
  return data;
};

export const userService = {
  // Find user by ID
  async findById(id) {
    const db = await firestoreConnect();
    const doc = await db.collection(COLLECTION).doc(id).get();
    return docToUser(doc);
  },

  // Find user by email
  async findByEmail(email) {
    const db = await firestoreConnect();
    const snapshot = await db
      .collection(COLLECTION)
      .where("email", "==", email.toLowerCase())
      .limit(1)
      .get();

    if (snapshot.empty) return null;
    return docToUser(snapshot.docs[0]);
  },

  // Find user by Google ID
  async findByGoogleId(googleId) {
    const db = await firestoreConnect();
    const snapshot = await db
      .collection(COLLECTION)
      .where("googleId", "==", googleId)
      .limit(1)
      .get();

    if (snapshot.empty) return null;
    return docToUser(snapshot.docs[0]);
  },

  // Find user by password reset token
  async findByPasswordResetToken(token) {
    const db = await firestoreConnect();
    const snapshot = await db
      .collection(COLLECTION)
      .where("passwordResetToken", "==", token)
      .limit(1)
      .get();

    if (snapshot.empty) return null;
    
    const user = docToUser(snapshot.docs[0]);
    if (!user || !user.passwordResetExpires) return null;
    
    // Check expiration - handle both Date and Firestore Timestamp
    const expiresAt = user.passwordResetExpires.toDate 
      ? user.passwordResetExpires.toDate() 
      : new Date(user.passwordResetExpires);
    
    if (expiresAt < new Date()) {
      return null; // Token expired
    }
    
    return user;
  },

  // Find all users
  async findAll() {
    const db = await firestoreConnect();
    const snapshot = await db.collection(COLLECTION).get();
    return snapshot.docs.map((doc) => docToUser(doc));
  },

  // Create user
  async create(userData) {
    const db = await firestoreConnect();
    const now = new Date();

    const user = {
      ...userData,
      email: userData.email?.toLowerCase(),
      status: userData.status || "invited",
      createdAt: now,
      updatedAt: now,
      permissionsOverride: userData.permissionsOverride || {},
    };

    // Hash password if provided
    if (userData.password) {
      user.hash = await bcrypt.hash(userData.password, 10);
      delete user.password;
    }

    const docRef = db.collection(COLLECTION).doc();
    await docRef.set(user);
    return { _id: docRef.id, id: docRef.id, ...user };
  },

  // Update user
  async update(id, updates) {
    const db = await firestoreConnect();
    const userRef = db.collection(COLLECTION).doc(id);
    
    // Hash password if provided
    if (updates.password) {
      updates.hash = await bcrypt.hash(updates.password, 10);
      delete updates.password;
    }

    updates.updatedAt = new Date();
    await userRef.update(updates);
    return userService.findById(id);
  },

  // Delete user
  async delete(id) {
    const db = await firestoreConnect();
    await db.collection(COLLECTION).doc(id).delete();
  },

  // Set password
  async setPassword(id, password) {
    const hash = await bcrypt.hash(password, 10);
    return userService.update(id, { hash });
  },

  // Verify password
  async verifyPassword(user, password) {
    if (!user.hash) return false;
    return await bcrypt.compare(password, user.hash);
  },

  // Populate roles (load role documents)
  async populateRoles(user) {
    if (!user || !user.roles || !Array.isArray(user.roles)) {
      return { ...user, roles: [] };
    }

    // Filter out invalid role IDs (null, undefined, empty string)
    const validRoleIds = user.roles.filter(
      (id) => id && typeof id === 'string' && id.trim() !== ''
    );

    if (validRoleIds.length === 0) {
      return { ...user, roles: [] };
    }

    const roles = await Promise.all(
      validRoleIds.map((roleId) => roleService.findById(roleId))
    );

    return {
      ...user,
      roles: roles.filter((r) => r !== null),
    };
  },

  // Populate roles for multiple users
  async populateRolesForUsers(users) {
    return Promise.all(users.map((user) => userService.populateRoles(user)));
  },
};

