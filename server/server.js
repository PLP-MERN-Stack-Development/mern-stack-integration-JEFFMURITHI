// server.js
require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const { clerkMiddleware } = require("@clerk/express");

const connectDB = require("./config/db");

// ✅ Initialize app
const app = express();
const PORT = process.env.PORT || 5000;

// ✅ Connect to MongoDB
connectDB();

// ✅ Middleware setup
app.use(cors());

// Important: only parse JSON *after* multer for image upload routes
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Add multer for handling file uploads
const multer = require("multer");
const uploadDir = path.join(__dirname, "uploads");
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const safeName = `${Date.now()}-${Math.round(Math.random() * 1e9)}-${file.originalname.replace(/\s+/g, "-")}`;
    cb(null, safeName);
  },
});
const upload = multer({ storage });

// Serve uploaded files statically
app.use("/uploads", express.static(uploadDir));

// ✅ Logger (for development)
if (process.env.NODE_ENV === "development") {
  app.use((req, res, next) => {
    console.log(`📦 ${req.method} ${req.url}`);
    next();
  });
}

// ✅ Check Clerk key
if (!process.env.CLERK_SECRET_KEY) {
  console.error("❌ Clerk Secret Key missing in .env");
  process.exit(1);
}

// ✅ Global Clerk middleware
app.use(clerkMiddleware());

// ✅ Import routes
const postRoutes = require("./routes/posts");
const categoryRoutes = require("./routes/categories");
const authRoutes = require("./routes/auth");

// ✅ Basic route
app.get("/", (req, res) => {
  res.send("✅ MERN Blog API running with Clerk authentication & image upload support");
});

// ✅ Use routes (important order)
app.use("/api/categories", categoryRoutes);
app.use("/api/auth", authRoutes);

// Posts route handles its own Clerk + multer middleware
app.use("/api/posts", postRoutes);

// ✅ Error handler
app.use((err, req, res, next) => {
  console.error("❌ Error:", err.stack);
  res.status(err.statusCode || 500).json({
    success: false,
    error: err.message || "Server Error",
  });
});

// ✅ Start server
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

// ✅ Handle unhandled rejections
process.on("unhandledRejection", (err) => {
  console.error("Unhandled Promise Rejection:", err);
  process.exit(1);
});

module.exports = app;
