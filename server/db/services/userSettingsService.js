import firestoreConnect from "../firestoreconnect.js";

const COLLECTION = "userSettings";

// Helper to convert Firestore doc to settings object
const docToSettings = (doc) => {
  if (!doc.exists) return null;
  const data = doc.data();
  return {
    _id: doc.id,
    ...data,
    id: doc.id,
  };
};

export const userSettingsService = {
  // Find settings by user ID
  async findByUserId(userId) {
    const db = await firestoreConnect();
    const snapshot = await db
      .collection(COLLECTION)
      .where("user", "==", userId)
      .limit(1)
      .get();

    if (snapshot.empty) return null;
    return docToSettings(snapshot.docs[0]);
  },

  // Create or update settings
  async upsert(userId, settingsData) {
    const db = await firestoreConnect();
    const existing = await this.findByUserId(userId);

    const now = new Date();
    const settings = {
      user: userId,
      ...settingsData,
      updatedAt: now,
    };

    if (existing) {
      // Update existing
      await db.collection(COLLECTION).doc(existing._id).update(settings);
      return { _id: existing._id, id: existing._id, ...settings };
    } else {
      // Create new
      settings.createdAt = now;
      const docRef = db.collection(COLLECTION).doc();
      await docRef.set(settings);
      return { _id: docRef.id, id: docRef.id, ...settings };
    }
  },

  // Update settings
  async update(userId, updates) {
    const db = await firestoreConnect();
    const existing = await this.findByUserId(userId);

    if (!existing) {
      return this.upsert(userId, updates);
    }

    updates.updatedAt = new Date();
    await db.collection(COLLECTION).doc(existing._id).update(updates);
    return this.findByUserId(userId);
  },
};

