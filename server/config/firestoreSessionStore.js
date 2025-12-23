import firestoreConnect from "../db/firestoreconnect.js";
import session from "express-session";

class FirestoreStore extends session.Store {
  constructor(options = {}) {
    super();
    this.collection = options.collection || "sessions";
    this.db = null;
  }

  async getDb() {
    if (!this.db) {
      this.db = await firestoreConnect();
    }
    return this.db;
  }

  async get(sid, callback) {
    try {
      const db = await this.getDb();
      const doc = await db.collection(this.collection).doc(sid).get();

      if (!doc.exists) return callback(null, null);

      const data = doc.data();
      if (!data?.session) return callback(null, null);

      const sess = JSON.parse(data.session);
      callback(null, sess);
    } catch (err) {
      callback(err);
    }
  }

  async set(sid, sess, callback) {
    try {
      const db = await this.getDb();

      const sessionToStore = { ...sess };
      delete sessionToStore.store;

      await db.collection(this.collection).doc(sid).set({
        session: JSON.stringify(sessionToStore),
        updatedAt: new Date(),
      });

      callback(null);
    } catch (err) {
      callback(err);
    }
  }

  async destroy(sid, callback) {
    try {
      const db = await this.getDb();
      await db.collection(this.collection).doc(sid).delete();
      callback(null);
    } catch (err) {
      callback(err);
    }
  }
}

export default FirestoreStore;
