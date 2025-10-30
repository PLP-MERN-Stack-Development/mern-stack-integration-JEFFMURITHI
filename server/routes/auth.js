const express = require("express");
const { requireAuth } = require("@clerk/express");
const router = express.Router();

// Protected route example
router.get("/profile", requireAuth(), (req, res) => {
  // Access authenticated user's info from req.auth
  const { userId, sessionId } = req.auth;

  res.json({
    message: "Authenticated user info",
    userId,
    sessionId,
  });
});

// Public route example
router.get("/", (req, res) => {
  res.send("Auth route working — public access");
});

module.exports = router;
