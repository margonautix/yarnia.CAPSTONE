const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const prisma = require("./prisma"); // Assuming Prisma client is set up
const app = express();
const PORT = 3000;
const faker = require("@faker-js/faker");

// JWT secret key (this should be an environment variable in production)
const JWT_SECRET = "your_jwt_secret_key";

app.use(express.json());
app.use(require("morgan")("dev"));

// Helper function to generate JWT
const generateToken = (user) => {
  return jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, {
    expiresIn: "1h", // Token expires in 1 hour
  });
};

// Middleware to authenticate the user using JWT
const authenticateUser = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1]; // Extract Bearer token
  if (!token) {
    return res.status(401).json({ message: "Unauthorized, token missing" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // Attach the decoded token to the request object
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

// === Auth Routes ===

// POST /api/auth/register - Register a new user
app.post("/api/auth/register", async (req, res, next) => {
  const { username, email, password, bio } = req.body;

  try {
    // Validate input
    if (!username || !email || !password) {
      return res
        .status(400)
        .json({ message: "Username, email, and password are required." });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ message: "Email already in use." });
    }

    // Hash password before storing
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        bio,
      },
    });

    // Generate a token for the new user
    const token = generateToken(newUser);

    res.status(201).json({ message: "User registered successfully", token });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/login - Login a user
app.post("/api/auth/login", async (req, res, next) => {
  const { email, password } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    // Compare hashed passwords
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    // Generate a token for the authenticated user
    const token = generateToken(user);

    res.json({ message: "Login successful", token });
  } catch (err) {
    next(err);
  }
});

// GET /api/auth/me - Get the authenticated user
app.get("/api/auth/me", authenticateUser, async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
    });
    res.json(user);
  } catch (err) {
    next(err);
  }
});

// === Bookmark Routes ===

// POST /api/bookmarks - Create a new bookmark (Requires authentication)
app.post(
  "/api/bookmarks/:storyId",
  authenticateUser,
  async (req, res, next) => {
    const { storyId } = req.params;

    try {
      // Check if the story already exists in bookmarks
      const existingBookmark = await prisma.bookmark.findFirst({
        where: {
          userId: req.user.id,
          storyId: parseInt(storyId, 10),
        },
      });

      if (existingBookmark) {
        return res.status(409).json({ message: "Story already bookmarked." });
      }

      // Create a new bookmark
      const newBookmark = await prisma.bookmark.create({
        data: {
          userId: req.user.id,
          storyId: parseInt(storyId, 10),
        },
      });

      res
        .status(201)
        .json({ message: "Story bookmarked successfully", newBookmark });
    } catch (err) {
      next(err);
    }
  }
);

// GET /api/bookmarks - Get all bookmarked stories of the authenticated user
app.get("/api/bookmarks", authenticateUser, async (req, res, next) => {
  try {
    const bookmarks = await prisma.bookmark.findMany({
      where: { userId: req.user.id },
      include: { story: true }, // Include the related story data
    });

    res.json(bookmarks.map((bookmark) => bookmark.story)); // Return only the stories
  } catch (err) {
    next(err);
  }
});

// DELETE /api/bookmarks/:bookmarkId - Delete a bookmark (Requires authentication)
app.delete(
  "/api/bookmarks/:storyId",
  authenticateUser,
  async (req, res, next) => {
    const { storyId } = req.params;

    try {
      const bookmark = await prisma.bookmark.findFirst({
        where: {
          userId: req.user.id,
          storyId: parseInt(storyId, 10),
        },
      });

      if (!bookmark) {
        return res.status(404).json({ message: "Bookmark not found." });
      }

      // Delete the bookmark
      await prisma.bookmark.delete({
        where: { bookmarkId: bookmark.bookmarkId },
      });

      res.status(204).json({ message: "Story unbookmarked successfully." });
    } catch (err) {
      next(err);
    }
  }
);

// === Comment on Bookmark Routes ===
// POST /api/stories/:storyId/comments - Add a comment to a story (Requires authentication)
app.post(
  "/api/stories/:storyId/comments",
  authenticateUser,
  async (req, res, next) => {
    const { storyId } = req.params;
    const { content } = req.body;

    try {
      // Find the story by ID
      const story = await prisma.story.findUnique({
        where: { id: parseInt(storyId, 10) },
      });

      if (!story) {
        return res.status(404).json({ message: "Story not found." });
      }

      // Create a new comment attached to the story
      const newComment = await prisma.comment.create({
        data: {
          storyId: parseInt(storyId, 10),
          userId: req.user.id,
          content,
        },
      });

      res.status(201).json({ message: "Comment added to story", newComment });
    } catch (err) {
      next(err);
    }
  }
);

// GET /api/bookmarks/:bookmarkId/comments - Get comments on a bookmark
app.get(
  "/api/stories/:storyId/comments",
  authenticateUser,
  async (req, res, next) => {
    const { storyId } = req.params;

    try {
      // Fetch comments related to the story
      const comments = await prisma.comment.findMany({
        where: { storyId: parseInt(storyId, 10) },
        include: { user: true }, // Include user info for the comment
      });

      res.json(comments);
    } catch (err) {
      next(err);
    }
  }
);

// DELETE /api/stories/:storyId/comments/:commentId - Delete a comment on a story (Requires authentication)
app.delete(
  "/api/stories/:storyId/comments/:commentId",
  authenticateUser,
  async (req, res, next) => {
    const { commentId } = req.params;

    try {
      // Find the comment by its ID
      const comment = await prisma.comment.findUnique({
        where: { id: parseInt(commentId, 10) },
      });

      if (!comment || comment.userId !== req.user.id) {
        return res
          .status(403)
          .json({ message: "You are not authorized to delete this comment." });
      }

      // Delete the comment
      await prisma.comment.delete({
        where: { id: parseInt(commentId, 10) },
      });

      res.sendStatus(204); // No content
    } catch (err) {
      next(err);
    }
  }
);

// === Error Handling Middleware ===
app.use((err, req, res, next) => {
  console.error(err);
  const status = err.status || 500;
  res.status(status).json({ message: err.message || "Internal server error" });
});

// === Server Listening ===
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
