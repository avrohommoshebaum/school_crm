import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import session from "express-session";
import passport from "passport";
import rateLimit from "express-rate-limit";
import path from "path";


// Load .env FIRST in local development (before secrets)
if (process.env.NODE_ENV !== "production") {
  dotenv.config();
  console.log("✅ Loaded .env file for local development");
}

// Load secrets from Google Secret Manager (production) or use .env (local)
import { loadSecrets } from "./config/secrets.js";

// DB connection
import { initializePostgres } from "./db/postgresConnect.js";

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
import groupRoutes from "./routes/groupRoutes.js";
import smsRoutes from "./routes/smsRoutes.js";

// App init
const app = express();

// Initialize everything asynchronously
async function initialize() {
  try {
    console.log("🔧 Initializing server...");
    console.log(`🔧 NODE_ENV: ${process.env.NODE_ENV}`);
    console.log(`🔧 GOOGLE_CLOUD_PROJECT: ${process.env.GOOGLE_CLOUD_PROJECT || 'not set'}`);
    
    console.log("🔧 Step 1: Loading secrets...");
    await loadSecrets();
    console.log("✅ Secrets loaded");
    
    console.log("🔧 Step 2: Connecting to PostgreSQL...");
    await initializePostgres();
    console.log("✅ PostgreSQL connected");
    
    // Initialize SMS schema if tables don't exist
    console.log("🔧 Step 3: Verifying SMS schema...");
    const setupSMSSchema = (await import("./db/scripts/setupSMSSchema.js")).default;
    try {
      await setupSMSSchema();
      console.log("✅ SMS schema verified");
    } catch (error) {
      console.warn("⚠️ SMS schema setup warning:", error.message);
      // Don't fail startup if schema already exists or has minor issues
    }

    // Initialize Email schema if tables don't exist
    console.log("🔧 Step 3a: Verifying Email schema...");
    const setupEmailSchema = (await import("./db/scripts/setupEmailSchema.js")).default;
    try {
      await setupEmailSchema();
      console.log("✅ Email schema verified");
    } catch (error) {
      console.warn("⚠️ Email schema setup warning:", error.message);
      // Don't fail startup if schema already exists or has minor issues
    }

    // Initialize user schema (add missing columns like last_login)
    console.log("🔧 Step 3b: Verifying user schema...");
    const setupUserSchema = (await import("./db/scripts/setupUserSchema.js")).default;
    try {
      await setupUserSchema();
      console.log("✅ User schema verified");
    } catch (error) {
      console.warn("⚠️ User schema setup warning:", error.message);
      // Don't fail startup if schema already exists or has minor issues
    }

    // Initialize 2FA schema (add SMS/phone 2FA columns)
    console.log("🔧 Step 3c: Verifying 2FA schema...");
    const add2FASchema = (await import("./db/scripts/add2FASchema.js")).default;
    try {
      await add2FASchema();
      console.log("✅ 2FA schema verified");
    } catch (error) {
      console.warn("⚠️ 2FA schema setup warning:", error.message);
      // Don't fail startup if schema already exists or has minor issues
    }

    // Initialize backup codes schema
    console.log("🔧 Step 3d: Verifying backup codes schema...");
    const addBackupCodesSchema = (await import("./db/scripts/addBackupCodesSchema.js")).default;
    try {
      await addBackupCodesSchema();
      console.log("✅ Backup codes schema verified");
    } catch (error) {
      console.warn("⚠️ Backup codes schema setup warning:", error.message);
      // Don't fail startup if schema already exists or has minor issues
    }

    // Initialize system settings schema
    console.log("🔧 Step 3e: Verifying system settings schema...");
    const addSystemSettingsSchema = (await import("./db/scripts/addSystemSettingsSchema.js")).default;
    try {
      await addSystemSettingsSchema();
      console.log("✅ System settings schema verified");
    } catch (error) {
      console.warn("⚠️ System settings schema setup warning:", error.message);
      // Don't fail startup if schema already exists or has minor issues
    }
    
    console.log("🔧 Step 4: Configuring session...");
    await configureSession(app);
    console.log("✅ Session configured");
    
    console.log("🔧 Step 5: Configuring Passport...");
    configurePassport(app);
    console.log("✅ Passport configured");
    
    // Apply session timeout middleware AFTER session is configured
    app.use(
      sessionTimout({
        idleTimeoutMs: 30 * 60 * 1000, // 30 minutes
      })
    );
    
    // Register routes AFTER session and passport are configured
    console.log("🔧 Step 6: Registering routes...");
    app.use("/api/auth", authRoutes);
    app.use("/api/roles", roleRoutes);
    app.use("/api/invite", inviteRoutes);
    app.use("/api/users", userRoutes);
    app.use("/api/profile", userProfileRoutes);
    app.use("/api/groups", groupRoutes);
    app.use("/api/sms", smsRoutes);
    
    // Email routes
    const emailRoutes = (await import("./routes/emailRoutes.js")).default;
    app.use("/api/email", emailRoutes);
    
    // Twilio routes (for TwiML responses)
    const twilioRoutes = (await import("./routes/twilioRoutes.js")).default;
    app.use("/api/twilio", twilioRoutes);
    
    // System settings routes
    const systemSettingsRoutes = (await import("./routes/systemSettingsRoutes.js")).default;
    app.use("/api/system-settings", systemSettingsRoutes);
    
    // Initialize Twilio
    console.log("🔧 Step 7: Initializing Twilio...");
    const { initializeTwilio } = await import("./utils/twilio.js");
    initializeTwilio();
    console.log("✅ Twilio initialized");
    
    console.log("✅ Routes registered");
    console.log("✅ Initialization complete");
  } catch (error) {
    console.error("❌ Initialization error:", error);
    console.error("❌ Error message:", error.message);
    console.error("❌ Error stack:", error.stack);
    throw error; // Re-throw to be caught by the caller
  }
}

app.set("trust proxy", 1);

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
      imgSrc: [
        "'self'",
        "data:",
        "https://storage.googleapis.com",
        "https://storage.cloud.google.com"
      ],
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
  "https://portal.nachlasby.org",
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
// Note: MongoDB-specific sanitization removed. Consider adding general input validation if needed.

// ------------------------------
// 5. RATE LIMITING
// ------------------------------
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 40,
  message: "Too many login attempts. Try again later.",
});
app.use("/api/auth/login", authLimiter);

// ------------------------------
// 6. SESSION CONFIGURATION & PASSPORT INITIALIZATION
// ------------------------------
// These will be initialized in the initialize() function before server starts
// Routes are also registered in initialize() to ensure session is configured first
// Serve static React files
const __dirname = path.resolve();
const publicPath = path.join(__dirname, "public");

// Only serve static files if public folder exists
try {
  const fs = await import("fs");
  if (fs.existsSync(publicPath)) {
    app.use(
      express.static(publicPath, {
        maxAge: "1y",
        etag: false,
        setHeaders: (res, filePath) => {
          // Never cache index.html
          if (filePath.endsWith("index.html")) {
            res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
          }
        },
      })
    );

    // React Router fallback
    app.get(/^\/(?!api).*/, (req, res) => {
      res.sendFile(path.join(publicPath, "index.html"));
    });
  } else {
    console.warn("⚠️ Public folder not found. Static files will not be served.");
    // API-only fallback
    app.get(/^\/(?!api).*/, (req, res) => {
      res.status(404).json({ message: "Frontend not built. Please build React app." });
    });
  }
} catch (error) {
  console.error("Error setting up static file serving:", error);
}




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
// Use PORT environment variable (Cloud Run automatically sets PORT=8080)
// We must listen on whatever PORT Cloud Run provides
const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0'; // Required for Cloud Run - must listen on all interfaces

console.log(`🔧 Starting server on PORT=${PORT} (from process.env.PORT=${process.env.PORT || 'not set'})`);

// Initialize everything first (database, sessions, routes), then start listening
initialize().then(() => {
  app.listen(PORT, HOST, () => {
    console.log(`✅ Server running on ${HOST}:${PORT} (${process.env.NODE_ENV})`);
  });
}).catch((error) => {
  console.error("❌ Failed to start server:", error);
  console.error("❌ Error message:", error.message);
  console.error("❌ Stack trace:", error.stack);
  process.exit(1);
});
