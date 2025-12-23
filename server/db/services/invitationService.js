import firestoreConnect from "../firestoreconnect.js";
import { roleService } from "./roleService.js";

const COLLECTION = "invitations";

// Helper to convert Firestore doc to invitation object
const docToInvitation = (doc) => {
  if (!doc.exists) return null;
  const data = doc.data();
  return {
    _id: doc.id,
    ...data,
    id: doc.id,
  };
};

export const invitationService = {
  // Find invitation by token
  async findByToken(token) {
    const db = await firestoreConnect();
    const snapshot = await db
      .collection(COLLECTION)
      .where("token", "==", token)
      .limit(1)
      .get();

    if (snapshot.empty) return null;
    return docToInvitation(snapshot.docs[0]);
  },

  // Find invitation by email
  async findByEmail(email) {
    const db = await firestoreConnect();
    const snapshot = await db
      .collection(COLLECTION)
      .where("email", "==", email.toLowerCase())
      .limit(1)
      .get();

    if (snapshot.empty) return null;
    return docToInvitation(snapshot.docs[0]);
  },

  // Create invitation
  async create(invitationData) {
    const db = await firestoreConnect();
    const now = new Date();

    const invitation = {
      ...invitationData,
      email: invitationData.email?.toLowerCase(),
      accepted: invitationData.accepted || false,
      createdAt: now,
      updatedAt: now,
    };

    const docRef = db.collection(COLLECTION).doc();
    await docRef.set(invitation);

    // Set expiration using Firestore TTL (if supported) or manual cleanup
    if (invitation.expiresAt) {
      // Note: Firestore doesn't have automatic TTL like MongoDB, 
      // but we can query by expiresAt in our code
    }

    return { _id: docRef.id, id: docRef.id, ...invitation };
  },

  // Update invitation
  async update(id, updates) {
    const db = await firestoreConnect();
    const invitationRef = db.collection(COLLECTION).doc(id);
    updates.updatedAt = new Date();
    await invitationRef.update(updates);
    return this.findById(id);
  },

  // Find by ID
  async findById(id) {
    const db = await firestoreConnect();
    const doc = await db.collection(COLLECTION).doc(id).get();
    return docToInvitation(doc);
  },

  // Populate roles
  async populateRoles(invitation) {
    if (!invitation || !invitation.roles || !Array.isArray(invitation.roles)) {
      return { ...invitation, roles: [] };
    }

    const roles = await Promise.all(
      invitation.roles.map((roleId) => roleService.findById(roleId))
    );

    return {
      ...invitation,
      roles: roles.filter((r) => r !== null),
    };
  },

  // Clean up expired invitations (should be called periodically)
  async cleanupExpired() {
    const db = await firestoreConnect();
    const now = new Date();
    const snapshot = await db
      .collection(COLLECTION)
      .where("expiresAt", "<", now)
      .get();

    const batch = db.batch();
    snapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });

    await batch.commit();
    return snapshot.size;
  },
};

