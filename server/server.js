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
import { generateNonce } from "./middleware/cspNonce.js"

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
    const setupDivisionsSchema = (await import("./db/scripts/setupDivisionsSchema.js")).default;
    try {
      await setupDivisionsSchema();
    } catch (error) {
      // Schema already exists or minor issues - continue
      console.warn("⚠️  Warning: Could not setup divisions schema:", error.message);
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
    
    // Division routes
    const divisionRoutes = (await import("./routes/divisionRoutes.js")).default;
    app.use("/api/divisions", divisionRoutes);
    
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
// 1. CSP NONCE GENERATION (must be before helmet CSP)
// ------------------------------
app.use(generateNonce);

// ------------------------------
// 2. SECURITY HEADERS (HELMET)
// ------------------------------
app.use(
  helmet({
    crossOriginResourcePolicy: false,
  })
);

// Content Security Policy with nonces
app.use((req, res, next) => {
  const nonce = req.nonce || "";
  const isProduction = process.env.NODE_ENV === "production";
  
  // Build connect-src based on environment
  const connectSrc = ["'self'"];
  
  // In development, always allow localhost connections for local dev server
  if (!isProduction) {
    connectSrc.push(
      "http://localhost:8080",
      "http://127.0.0.1:8080",
      "ws://localhost:5173",
      "ws://localhost:5174",
      "ws://127.0.0.1:5173",
      "ws://127.0.0.1:5174"
    );
  }
  
  // If CLIENT_URL is set and different from current origin, allow it
  const clientUrl = process.env.CLIENT_URL?.replace(/\/$/, "");
  if (clientUrl && !connectSrc.includes(clientUrl)) {
    connectSrc.push(clientUrl);
  }
  
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
      // Remove 'unsafe-inline' from script-src, use nonce instead
      scriptSrc: [
        "'self'",
        nonce ? `'nonce-${nonce}'` : null,
      ].filter(Boolean),
      // Keep 'unsafe-inline' for style-src for now (MUI uses inline styles)
      // TODO: Consider moving to nonces for styles in the future
      styleSrc: ["'self'", "'unsafe-inline'"],
      // Allow API connections (fetch, XMLHttpRequest, WebSocket, etc.)
      connectSrc: connectSrc,
    },
    // Don't set CSP header on API responses - only on HTML pages
    // This prevents CSP from blocking API calls
    setAllHeaders: false,
  })(req, res, next);
});


// ------------------------------
// 3. CORS (STRICT) - Selective for API routes only
// ------------------------------
const allowedOrigins = [
  process.env.CLIENT_URL?.replace(/\/$/, ""),
  "https://portal.nachlasby.org",
  "http://localhost:5173",
  "http://localhost:5174",
];

// CORS for API routes (with credentials)
app.use(
  "/api",
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
    credentials: true, // ✅ Only for API routes where cookies are needed
  })
);

// CORS for static assets (no credentials needed)
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      const cleanOrigin = origin.split("?")[0];
      if (allowedOrigins.includes(cleanOrigin)) {
        return callback(null, true);
      }
      return callback(new Error("CORS Not Allowed"));
    },
    credentials: false, // ✅ No credentials for static assets
  })
);

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
// Note: This runs at module load time, so we use dynamic import
const setupStaticFiles = async () => {
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

    // React Router fallback - inject nonce into HTML and set CSP header
    app.get(/^\/(?!api).*/, async (req, res) => {
      const indexPath = path.join(publicPath, "index.html");
      
      try {
        const fsSync = await import("fs");
        let html = fsSync.readFileSync(indexPath, "utf8");
        const nonce = req.nonce || "";
        const isProduction = process.env.NODE_ENV === "production";
        
        // Build CSP header for HTML response
        const connectSrc = ["'self'"];
        if (!isProduction) {
          connectSrc.push(
            "http://localhost:8080",
            "http://127.0.0.1:8080",
            "ws://localhost:5173",
            "ws://localhost:5174"
          );
        }
        
        const cspHeader = [
          "default-src 'self'",
          `script-src 'self' 'nonce-${nonce}'`,
          "style-src 'self' 'unsafe-inline'",
          `connect-src ${connectSrc.join(" ")}`,
          "img-src 'self' data: https://storage.googleapis.com https://storage.cloud.google.com",
          "media-src 'self' blob:",
        ].join("; ");
        
        // Set CSP header on HTML response
        res.setHeader("Content-Security-Policy", cspHeader);
        
        // Inject nonce into all script tags
        html = html.replace(
          /<script\s+([^>]*)>/gi,
          (match, attrs) => {
            if (attrs.includes('nonce=')) return match;
            return `<script nonce="${nonce}" ${attrs}>`;
          }
        );
        
        res.setHeader("Content-Type", "text/html");
        res.send(html);
      } catch (error) {
        console.error("Error reading index.html:", error);
        res.status(404).json({ message: "Frontend not built. Please build React app." });
      }
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
};

// Call setup function immediately (runs at module load)
setupStaticFiles();

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
