import firestoreConnect from "../firestoreconnect.js";
// If using Admin SDK, you could do:
// import { FieldValue } from "firebase-admin/firestore";

const COLLECTION = "roles";

// Helper to remove undefined values from object (Firestore doesn't allow undefined)
const removeUndefined = (obj) => {
  const cleaned = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      cleaned[key] = value;
    }
  }
  return cleaned;
};

const docToRole = (doc) => {
  if (!doc.exists) return null;
  const data = doc.data();
  return {
    _id: doc.id,
    id: doc.id, // keep both if your app expects _id
    ...data,
  };
};

export const roleService = {
  async findById(id) {
    if (!id || typeof id !== "string" || id.trim() === "") {
      return null;
    }
    const db = await firestoreConnect();
    const doc = await db.collection(COLLECTION).doc(id).get();
    return docToRole(doc);
  },

  async findByName(name) {
    if (!name || typeof name !== "string" || name.trim() === "") {
      return null;
    }

    const db = await firestoreConnect();
    const snapshot = await db
      .collection(COLLECTION)
      .where("name", "==", name)
      .limit(1)
      .get();

    if (snapshot.empty) return null;
    return docToRole(snapshot.docs[0]);
  },

  async findByIds(ids) {
    if (!Array.isArray(ids) || ids.length === 0) return [];

    const db = await firestoreConnect();
    const results = await Promise.all(
      ids.map(async (id) => {
        if (!id) return null;
        const doc = await db.collection(COLLECTION).doc(id).get();
        return docToRole(doc);
      })
    );

    return results.filter((r) => r !== null);
  },

  async findAll() {
    const db = await firestoreConnect();
    const snapshot = await db.collection(COLLECTION).get();

    const roles = snapshot.docs.map((doc) => docToRole(doc));
    
    // Sort in memory: system roles first, then by displayName
    return roles.sort((a, b) => {
      // First sort by isSystem (system roles first)
      if (a.isSystem !== b.isSystem) {
        return b.isSystem ? 1 : -1; // true (system) comes first
      }
      // Then sort by displayName
      return (a.displayName || "").localeCompare(b.displayName || "");
    });
  },

  async create(roleData) {
    const db = await firestoreConnect();

    // const now = FieldValue.serverTimestamp(); // preferred (if using Admin SDK)
    const now = new Date(); // works, but serverTimestamp is nicer

    const role = {
      ...roleData,
      isSystem: roleData?.isSystem ?? false,
      createdAt: now,
      updatedAt: now,
    };

    // Remove undefined values before saving to Firestore
    const cleanedRole = removeUndefined(role);

    const docRef = db.collection(COLLECTION).doc();
    await docRef.set(cleanedRole);
    return { _id: docRef.id, id: docRef.id, ...cleanedRole };
  },

  async update(id, updates) {
    if (!id || typeof id !== "string" || id.trim() === "") {
      throw new Error("Invalid role id");
    }

    const db = await firestoreConnect();
    const roleRef = db.collection(COLLECTION).doc(id);

    // updates.updatedAt = FieldValue.serverTimestamp();
    updates.updatedAt = new Date();

    // Remove undefined values before updating Firestore
    const cleanedUpdates = removeUndefined(updates);

    await roleRef.update(cleanedUpdates);
    return roleService.findById(id); // avoid `this`
  },

  async delete(id) {
    if (!id || typeof id !== "string" || id.trim() === "") {
      throw new Error("Invalid role id");
    }

    const db = await firestoreConnect();
    await db.collection(COLLECTION).doc(id).delete();
  },

  async findAllWithUserCount() {
    const db = await firestoreConnect();
    const roles = await roleService.findAll(); // avoid `this`

    const usersSnapshot = await db.collection("users").get();
    const users = usersSnapshot.docs.map((doc) => doc.data());

    return roles.map((role) => {
      const userCount = users.filter((user) =>
        user.roles?.includes(role._id)
      ).length;
      return { ...role, userCount };
    });
  },
};
