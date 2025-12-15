import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import session from "express-session";
import MongoStore from "connect-mongo";
import passport from "passport";
import expressMongoSanitize from "@exortek/express-mongo-sanitize";
import rateLimit from "express-rate-limit";
import path from "path";



// Load .env only in development
if (process.env.NODE_ENV !== "production") {
  dotenv.config();
}

// DB connection
import mongooseConnect from "./db/mongooseconnect.js";

// Passport + session configuration
import configureSession from "./config/session.js";
import configurePassport from "./config/passport.js";
import sessionTimout from "./middleware/sessionTimeout.js"

// Routes
import userRoutes from "./routes/userRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import roleRoutes from "./routes/roleRoutes.js";
import inviteRoutes from "./routes/inviteRoutes.js";
import userProfileRoutes from "./routes/userProfileRoutes.js";

// App init
const app = express();

// ------------------------------
// 1. SECURITY HEADERS (HELMET)
// ------------------------------
app.use(
  helmet({
    crossOriginResourcePolicy: false,
  })
);

// Content Security Policy
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      imgSrc: ["'self'", "data:"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
    },
  })
);

// ------------------------------
// 2. CORS (STRICT)
// ------------------------------
const allowedOrigins = [
  process.env.CLIENT_URL?.replace(/\/$/, ""),
  "http://localhost:5173",
  "http://localhost:5174",
];


app.use(
  cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true); // mobile apps, curl, etc.

    const cleanOrigin = origin.split("?")[0];

    if (allowedOrigins.includes(cleanOrigin)) {
      return callback(null, true);
    }

    console.error("❌ BLOCKED ORIGIN:", origin);
    return callback(new Error("CORS Not Allowed"));
  },
  credentials: true,
})
)

// ------------------------------
// 3. REQUEST BODY PARSING
// ------------------------------
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// ------------------------------
// 4. INPUT SANITIZATION
// ------------------------------
app.use(expressMongoSanitize());

// ------------------------------
// 5. RATE LIMITING
// ------------------------------
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 40,
  message: "Too many login attempts. Try again later.",
});
app.use("/auth/login", authLimiter);

// ------------------------------
// 6. SESSION CONFIGURATION
// ------------------------------
configureSession(app);

// ------------------------------
// 7. PASSPORT INITIALIZATION
// ------------------------------
configurePassport(app);

// ------------------------------
// 7.5 SESSION IDLE TIMEOUT
// ------------------------------
app.use(
  sessionTimout({
    idleTimeoutMs: 30 * 60 * 1000, // 30 minutes
  })
);

// ------------------------------
// 8. ROUTES
// ------------------------------
app.use("/auth", authRoutes);
app.use("/roles", roleRoutes);
app.use("/invite", inviteRoutes);
app.use("/users", userRoutes);
app.use("/profile", userProfileRoutes);

// ------------------------------
// 9. GLOBAL ERROR HANDLER
// ------------------------------
app.use((err, req, res, next) => {
  console.error("SERVER ERROR:", err);
  res.status(500).json({ message: "Server error", error: err.message });
});

// ------------------------------
// 10. START SERVER
// ------------------------------
mongooseConnect().then(() => {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT} (${process.env.NODE_ENV})`);
  });
});
