// config/session.js
import session from "express-session";
import MongoStore from "connect-mongo";

 const isProd = process.env.NODE_ENV === "production";

export default function configureSession(app) {
  app.use(
    session({
      secret: process.env.SESSION_SECRET,
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        secure: isProd,                 // ✅ only secure in prod
        sameSite: isProd ? "none" : "lax",
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
      },
      store: MongoStore.create({
        mongoUrl: process.env.MONGO_URI,
        collectionName: "sessions",
      }),
    })
  );
}
