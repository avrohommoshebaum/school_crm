// config/session.js
import session from "express-session";
import FirestoreStore from "./firestoreSessionStore.js";

const isProd = process.env.NODE_ENV === "production";

export default async function configureSession(app) {
  app.use(
    session({
      proxy: true,
      secret: process.env.SESSION_SECRET,
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        secure: isProd,                 // ✅ only secure in prod
        sameSite: "lax",            // ✅ helps against CSRF
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
      },
      store: new FirestoreStore({
        collection: "sessions",
      }),
    })
  );
}
