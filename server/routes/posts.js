// server/routes/posts.js
const express = require("express");
const { requireAuth } = require("@clerk/express");
const postsController = require("../controllers/postsController");
const validate = require("../middleware/validate");
const multer = require("multer");
const path = require("path");
const {
  createOrUpdatePost,
  getPostsQuery,
  idParam,
} = require("../validators/postsValidator");

const router = express.Router();

/* ---------------------- 🖼️ MULTER UPLOAD CONFIG ---------------------- */
// Define where and how files will be stored
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Folder to store images
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

// File filter (only allow images)
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) cb(null, true);
  else cb(new Error("Only image uploads are allowed"), false);
};

const upload = multer({ storage, fileFilter });

/* ---------------------- 🧭 ROUTES START HERE ---------------------- */

/**
 * ✅ GET all posts
 * Public endpoint with query params: ?search=&category=&page=
 */
router.get("/", validate(getPostsQuery), postsController.getPosts);

/**
 * ✅ GET single post by ID
 * Public endpoint
 */
router.get("/:id", validate(idParam), postsController.getPostById);

/**
 * ✅ CREATE new post
 * Protected route (requires Clerk authentication)
 * Accepts multipart/form-data (optional image upload)
 */
router.post(
  "/",
  requireAuth(),
  upload.single("image"),
  validate(createOrUpdatePost),
  async (req, res, next) => {
    try {
      const { userId } = req.auth; // Clerk user
      const { title, content, category } = req.body;

      console.log("📦 Incoming Post Data:", req.body);

      if (!title || !content) {
        return res
          .status(400)
          .json({ success: false, error: "Title and content are required." });
      }

      // Attach file path if image exists
      if (req.file) {
        req.body.image = `/uploads/${req.file.filename}`;
      }

      // Add authorId for tracking
      req.body.authorId = userId;

      await postsController.createPost(req, res);
    } catch (err) {
      console.error("❌ Error creating post:", err);
      res.status(500).json({
        success: false,
        error: "Internal Server Error - Could not create post.",
        details: err.message,
      });
      next(err);
    }
  }
);

/**
 * ✅ UPDATE post by ID
 * Protected route — allows replacing image
 */
router.put(
  "/:id",
  requireAuth(),
  upload.single("image"),
  validate([...idParam, ...createOrUpdatePost]),
  async (req, res, next) => {
    try {
      if (req.file) {
        req.body.image = `/uploads/${req.file.filename}`;
      }
      await postsController.updatePost(req, res);
    } catch (err) {
      console.error("❌ Error updating post:", err);
      res.status(500).json({
        success: false,
        error: "Internal Server Error - Could not update post.",
        details: err.message,
      });
      next(err);
    }
  }
);

/**
 * ✅ DELETE post
 * Protected route
 */
router.delete("/:id", requireAuth(), validate(idParam), async (req, res, next) => {
  try {
    await postsController.deletePost(req, res);
  } catch (err) {
    console.error("❌ Error deleting post:", err);
    res.status(500).json({
      success: false,
      error: "Internal Server Error - Could not delete post.",
      details: err.message,
    });
    next(err);
  }
});

module.exports = router;
