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
    await loadSecrets();
    await initializePostgres();
    
    // Initialize schemas (silently handle if already exist)
    const setupSMSSchema = (await import("./db/scripts/setupSMSSchema.js")).default;
    try {
      await setupSMSSchema();
    } catch (error) {
      // Schema already exists or minor issues - continue
    }

    const setupEmailSchema = (await import("./db/scripts/setupEmailSchema.js")).default;
    try {
      await setupEmailSchema();
    } catch (error) {
      // Schema already exists or minor issues - continue
    }

    const setupUserSchema = (await import("./db/scripts/setupUserSchema.js")).default;
    try {
      await setupUserSchema();
    } catch (error) {
      // Schema already exists or minor issues - continue
    }

    const add2FASchema = (await import("./db/scripts/add2FASchema.js")).default;
    try {
      await add2FASchema();
    } catch (error) {
      // Schema already exists or minor issues - continue
    }

    const addBackupCodesSchema = (await import("./db/scripts/addBackupCodesSchema.js")).default;
    try {
      await addBackupCodesSchema();
    } catch (error) {
      // Schema already exists or minor issues - continue
    }

    const addSystemSettingsSchema = (await import("./db/scripts/addSystemSettingsSchema.js")).default;
    try {
      await addSystemSettingsSchema();
    } catch (error) {
      // Schema already exists or minor issues - continue
    }

    const setupRobocallSchema = (await import("./db/scripts/setupRobocallSchema.js")).default;
    try {
      await setupRobocallSchema();
    } catch (error) {
      // Schema already exists or minor issues - continue
    }

    const setupExtendedSchema = (await import("./db/scripts/setupExtendedSchema.js")).default;
    try {
      await setupExtendedSchema();
    } catch (error) {
      // Schema already exists or minor issues - continue
    }

    const setupPrincipalCenterSchema = (await import("./db/scripts/setupPrincipalCenterSchema.js")).default;
    try {
      await setupPrincipalCenterSchema();
    } catch (error) {
      // Schema already exists or minor issues - continue
    }

    const setupStaffManagementSchema = (await import("./db/scripts/setupStaffManagementSchema.js")).default;
    try {
      await setupStaffManagementSchema();
    } catch (error) {
      // Schema already exists or minor issues - continue
    }

    const setupPositionsSchema = (await import("./db/scripts/setupPositionsSchema.js")).default;
    try {
      await setupPositionsSchema();
    } catch (error) {
      // Schema already exists or minor issues - continue
    }

    const setupPayrollSchema = (await import("./db/scripts/setupPayrollSchema.js")).default;
    try {
      await setupPayrollSchema();
    } catch (error) {
      // Schema already exists or minor issues - continue
    }
    
    // Ensure admin role has all permissions (including newly added ones)
    const ensureAdminHasAllPermissions = (await import("./scripts/ensureAdminHasAllPermissions.js")).default;
    try {
      await ensureAdminHasAllPermissions();
    } catch (error) {
      console.error("⚠️  Warning: Could not update admin role permissions:", error.message);
      // Continue anyway - admin override should still work
    }
    
    await configureSession(app);
    configurePassport(app);
    
    // Apply session timeout middleware AFTER session is configured
    app.use(
      sessionTimout({
        idleTimeoutMs: 30 * 60 * 1000, // 30 minutes
      })
    );
    
    // Register routes AFTER session and passport are configured
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
    
    // Robocall routes
    const robocallRoutes = (await import("./routes/robocallRoutes.js")).default;
    app.use("/api/robocall", robocallRoutes);
    
    // Twilio routes (for TwiML responses)
    const twilioRoutes = (await import("./routes/twilioRoutes.js")).default;
    app.use("/api/twilio", twilioRoutes);
    
    // System settings routes
    const systemSettingsRoutes = (await import("./routes/systemSettingsRoutes.js")).default;
    app.use("/api/system-settings", systemSettingsRoutes);
    
    // Principal Center routes
    const principalRoutes = (await import("./routes/principalRoutes.js")).default;
    app.use("/api/principal", principalRoutes);
    
    // Grade routes
    const gradeRoutes = (await import("./routes/gradeRoutes.js")).default;
    app.use("/api/grades", gradeRoutes);
    
    // Student routes
    const studentRoutes = (await import("./routes/studentRoutes.js")).default;
    app.use("/api/students", studentRoutes);
    
    // Class routes
    const classRoutes = (await import("./routes/classRoutes.js")).default;
    app.use("/api/classes", classRoutes);
    
    // Staff routes
    const staffRoutes = (await import("./routes/staffRoutes.js")).default;
    app.use("/api/staff", staffRoutes);
    
    // Family routes
    const familyRoutes = (await import("./routes/familyRoutes.js")).default;
    app.use("/api/families", familyRoutes);
    
    // Principal assignment routes (admin only)
    const principalAssignmentRoutes = (await import("./routes/principalAssignmentRoutes.js")).default;
    app.use("/api/principal-assignments", principalAssignmentRoutes);
    
    // Import routes
    const importRoutes = (await import("./routes/importRoutes.js")).default;
    app.use("/api/import", importRoutes);
    
    // Position routes
    const positionRoutes = (await import("./routes/positionRoutes.js")).default;
    app.use("/api/positions", positionRoutes);
    
    // Payroll routes
    const payrollRoutes = (await import("./routes/payrollRoutes.js")).default;
    app.use("/api/payroll", payrollRoutes);
    
    // Initialize Twilio
    const { initializeTwilio } = await import("./utils/twilio.js");
    initializeTwilio();
    
    // Initialize GCS Storage
    const { initializeGCS } = await import("./utils/storage/gcsStorage.js");
    initializeGCS();
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
      mediaSrc: ["'self'", "blob:"], // Allow blob URLs for audio/video playback
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

// Server will start after initialization

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
