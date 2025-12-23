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
import firestoreConnect from "./db/firestoreconnect.js";

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

// Initialize everything asynchronously
async function initialize() {
  try {
    console.log("🔧 Initializing server...");
    await loadSecrets();
    console.log("✅ Secrets loaded");
    await firestoreConnect();
    console.log("✅ Firestore connected");
    await configureSession(app);
    console.log("✅ Session configured");
    configurePassport(app);
    console.log("✅ Passport configured");
    
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
    
    console.log("✅ Routes registered");
    console.log("✅ Initialization complete");
  } catch (error) {
    console.error("❌ Initialization error:", error);
    console.error("Stack:", error.stack);
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
// Initialize everything, then start the server
const PORT = process.env.PORT || 3000;

initialize().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT} (${process.env.NODE_ENV})`);
  });
}).catch((error) => {
  console.error("❌ Failed to start server:", error);
  process.exit(1);
});
