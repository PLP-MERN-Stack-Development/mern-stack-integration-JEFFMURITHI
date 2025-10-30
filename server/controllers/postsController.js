const fs = require("fs");
const path = require("path");
const Post = require("../models/Post");

/**
 * Utility function to generate a unique, SEO-friendly slug
 */
const generateSlug = async (title) => {
  try {
    let baseSlug = title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");

    let slug = baseSlug;
    let count = 1;

    while (await Post.findOne({ slug })) {
      slug = `${baseSlug}-${count++}`;
    }

    return slug;
  } catch (err) {
    console.error("❌ Error generating slug:", err.message);
    throw new Error("Failed to generate slug");
  }
};

/**
 * Helper for error responses
 */
const sendError = (res, err, req) => {
  const message =
    typeof err === "string"
      ? err
      : err?.message
      ? err.message
      : "Internal Server Error";

  console.error("❌ Controller Error", {
    route: req.originalUrl,
    method: req.method,
    message,
    stack: err?.stack,
    body: req.body,
  });

  return res
    .status(500)
    .json({ success: false, error: message || "Internal Server Error" });
};

/**
 * 🟢 GET /api/posts
 */
const getPosts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || "";
    const category = req.query.category || "";

    const filter = {};
    if (search) {
      const regex = new RegExp(search, "i");
      filter.$or = [{ title: regex }, { content: regex }];
    }
    if (category) filter.category = category;

    const total = await Post.countDocuments(filter);
    const posts = await Post.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    res.json({
      success: true,
      data: posts,
      meta: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    return sendError(res, err, req);
  }
};

/**
 * 🟢 GET /api/posts/:id
 */
const getPostById = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post)
      return res.status(404).json({ success: false, message: "Post not found" });

    res.json({ success: true, data: post });
  } catch (err) {
    return sendError(res, err, req);
  }
};

/**
 * 🟢 POST /api/posts
 * Create new post with optional image upload
 */
const createPost = async (req, res) => {
  try {
    // When using multer, uploaded file (if any) is in req.file and text fields are in req.body
    const { title, content, category, author, featuredImage: featuredImageFromBody } = req.body;

    if (!title || !content) {
      return res.status(400).json({
        success: false,
        error: 'Title and content are required.',
      });
    }

    const slug = await generateSlug(title);

    // If multer saved a file, use its served URL; otherwise use any provided featuredImage string
    const featuredImage = req.file ? `/uploads/${req.file.filename}` : (featuredImageFromBody || undefined);

    const post = new Post({
      title: title.trim(),
      content,
      author: author?.trim() || 'Anonymous',
      slug,
      category: category || undefined,
      featuredImage,
    });

    await post.save();

    const fresh = await Post.findById(post._id).populate('category', 'name');
    res.status(201).json({ success: true, data: fresh });
  } catch (err) {
    console.error('❌ Create Post Error:', err.message);
    next(err);
  }
};

/**
 * 🟢 PUT /api/posts/:id
 */
const updatePost = async (req, res) => {
  try {
    const { title, content, category, author, featuredImage: featuredImageFromBody } = req.body;

    const post = await Post.findById(req.params.id);
    if (!post)
      return res.status(404).json({ success: false, message: 'Post not found' });

    if (title && title !== post.title) {
      post.slug = await generateSlug(title);
    }

    post.title = title !== undefined ? title.trim() : post.title;
    post.content = content !== undefined ? content : post.content;
    post.category = category !== undefined ? category : post.category;
    post.author = author !== undefined ? author : post.author;

    // If multer provided a new file, update featuredImage; else use body value if provided
    if (req.file) {
      post.featuredImage = `/uploads/${req.file.filename}`;
    } else if (featuredImageFromBody !== undefined) {
      post.featuredImage = featuredImageFromBody || post.featuredImage;
    }

    await post.save();

    const fresh = await Post.findById(post._id).populate('category', 'name');
    res.json({ success: true, data: fresh });
  } catch (err) {
    next(err);
  }
};

/**
 * 🟢 DELETE /api/posts/:id
 */
const deletePost = async (req, res) => {
  try {
    const post = await Post.findByIdAndDelete(req.params.id);
    if (!post)
      return res
        .status(404)
        .json({ success: false, message: "Post not found" });

    // Delete image from server
    if (post.featuredImage) {
      const filePath = path.join(__dirname, `../public${post.featuredImage}`);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }

    res.json({
      success: true,
      message: "Post deleted successfully",
      id: post._id,
    });
  } catch (err) {
    return sendError(res, err, req);
  }
};

module.exports = {
  getPosts,
  getPostById,
  createPost,
  updatePost,
  deletePost,
};
