import mongoose from "mongoose";

const mongooseConnect = async () => {
  const mongoUri = process.env.MONGO_URI;

  if (!mongoUri) {
    console.error("❌ ERROR: MONGO_URI is not defined in environment variables.");
    process.exit(1);
  }

  try {
    mongoose.set("strictQuery", true);

    await mongoose.connect(mongoUri, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 8000, // fail fast if unreachable
      socketTimeoutMS: 45000,        // prevents stale sockets
    });

    if (process.env.NODE_ENV !== "production") {
      console.log("✅ DB connected:");
    }

    // When connection is open
    mongoose.connection.on("connected", () => {
      if (process.env.NODE_ENV !== "production") {
        console.log("📦 Mongoose connected to DB");
      }
    });

    // When connection throws error after initial connection
    mongoose.connection.on("error", (err) => {
      console.error("❌ Mongoose connection error:", err);
    });

    // When connection is disconnected
    mongoose.connection.on("disconnected", () => {
      console.warn("⚠️ Mongoose disconnected");
    });

    return mongoose.connection;
  } catch (err) {
    console.error("❌ Initial MongoDB connection error:", err.message);

    // Retry after 5 seconds
    setTimeout(() => {
      console.log("🔄 Retrying MongoDB connection...");
      mongooseConnect();
    }, 5000);
  }
};

export default mongooseConnect;
