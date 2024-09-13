const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const prisma = require("./prisma"); // Assuming Prisma client is set up
const app = express();
const PORT = 3000;
require("dotenv").config();
const JWT_SECRET = process.env.JWT_SECRET;

app.use(express.json());
app.use(require("morgan")("dev"));

// Helper function to generate JWT
const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    {
      expiresIn: "1h", // Token expires in 1 hour
    }
  );
};

// Middleware to authenticate the user using JWT
const authenticateUser = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1]; // Extract Bearer token
  if (!token) {
    return res.status(401).json({ message: "Unauthorized, token missing" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET); // Verify the token using the secret key
    req.user = decoded; // Attach decoded token data to the request object
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

// Middleware to check if user is an admin
const requireAdmin = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res
      .status(403)
      .json({ message: "Access denied, admin privileges required" });
  }
  next();
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

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the new user (default role is "user")
    const newUser = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        bio,
        role: "user", // default role
      },
    });

    // Generate JWT
    const token = generateToken(newUser);

    // Respond with the token and user data
    res.status(201).json({
      message: "User registered successfully",
      token,
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
      },
      expiresIn: 3600,
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/login - Login a user
app.post("/api/auth/login", async (req, res, next) => {
  const { email, password } = req.body;

  try {
    // Find the user by email
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    // Compare the hashed passwords
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    // Generate JWT
    const token = generateToken(user);

    // Respond with the token and user data
    res.json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
      expiresIn: 3600,
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/auth/me - Get the authenticated user
app.get("/api/auth/me", authenticateUser, async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        username: true,
        email: true,
        bio: true,
        role: true,
      },
    });
    res.json(user);
  } catch (err) {
    next(err);
  }
});

// === User Management Routes (Admin Only) ===

// GET /api/users - Get all users (Admin only)
app.get(
  "/api/users",
  authenticateUser,
  requireAdmin,
  async (req, res, next) => {
    try {
      const users = await prisma.user.findMany({
        select: {
          id: true,
          username: true,
          email: true,
          bio: true,
          role: true,
        },
      });

      res.json(users);
    } catch (err) {
      next(err);
    }
  }
);

// Get a user not authenticated
app.get("/api/users/:userId", async (req, res, next) => {
  const { userId } = req.params;

  try {
    // Find the user by ID
    const user = await prisma.user.findUnique({
      where: { id: parseInt(userId, 10) },
      select: {
        id: true,
        username: true,
        email: true, // You can choose whether to expose the email or not
        bio: true,
      },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Respond with the user data
    res.json(user);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/users/:userId - Delete a user (Admin only)
app.delete(
  "/api/users/:userId",
  authenticateUser,
  requireAdmin,
  async (req, res, next) => {
    const { userId } = req.params;

    try {
      await prisma.user.delete({
        where: { id: parseInt(userId, 10) },
      });

      res.status(204).json({ message: "User deleted successfully." });
    } catch (err) {
      next(err);
    }
  }
);

// === Bookmark Routes ===

// POST /api/bookmarks - Create a new bookmark (Requires authentication)
app.post(
  "/api/bookmarks/:storyId",
  authenticateUser,
  async (req, res, next) => {
    const { storyId } = req.params;

    try {
      const existingBookmark = await prisma.bookmark.findFirst({
        where: {
          userId: req.user.id,
          storyId: parseInt(storyId, 10),
        },
      });

      if (existingBookmark) {
        return res.status(409).json({ message: "Story already bookmarked." });
      }

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

// GET /api/bookmarks - Get all bookmarked stories (with pagination)
app.get("/api/bookmarks", authenticateUser, async (req, res, next) => {
  const { page = 1, limit = 10 } = req.query;

  try {
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);

    if (isNaN(pageNum) || isNaN(limitNum) || pageNum <= 0 || limitNum <= 0) {
      return res
        .status(400)
        .json({ message: "Invalid pagination parameters." });
    }

    const bookmarks = await prisma.bookmark.findMany({
      where: { userId: req.user.id },
      include: { story: true },
      take: limitNum,
      skip: (pageNum - 1) * limitNum,
    });

    res.json(bookmarks.map((bookmark) => bookmark.story));
  } catch (err) {
    next(err);
  }
});

// DELETE /api/bookmarks/:bookmarkId - Delete a bookmark (Requires authentication)
app.delete(
  "/api/bookmarks/:bookmarkId",
  authenticateUser,
  async (req, res, next) => {
    const { bookmarkId } = req.params;

    try {
      const bookmark = await prisma.bookmark.findFirst({
        where: {
          id: parseInt(bookmarkId, 10),
          userId: req.user.id,
        },
      });

      if (!bookmark) {
        return res.status(404).json({ message: "Bookmark not found." });
      }

      await prisma.bookmark.delete({
        where: { id: bookmark.id },
      });

      res.status(204).json({ message: "Bookmark deleted successfully." });
    } catch (err) {
      next(err);
    }
  }
);

// === Comment Routes ===

// POST /api/stories/:storyId/comments - Add a comment to a story (Requires authentication)
app.post(
  "/api/stories/:storyId/comments",
  authenticateUser,
  async (req, res, next) => {
    const { storyId } = req.params;
    const { content } = req.body;

    try {
      const story = await prisma.story.findUnique({
        where: { id: parseInt(storyId, 10) },
      });

      if (!story) {
        return res.status(404).json({ message: "Story not found." });
      }

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

// GET /api/stories/:storyId/comments - Get comments on a story (with pagination)
app.get(
  "/api/stories/:storyId/comments",
  authenticateUser,
  async (req, res, next) => {
    const { storyId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    try {
      const pageNum = parseInt(page, 10);
      const limitNum = parseInt(limit, 10);

      if (isNaN(pageNum) || isNaN(limitNum) || pageNum <= 0 || limitNum <= 0) {
        return res
          .status(400)
          .json({ message: "Invalid pagination parameters." });
      }

      const comments = await prisma.comment.findMany({
        where: { storyId: parseInt(storyId, 10) },
        include: { user: true }, // Include user info for the comment
        take: limitNum,
        skip: (pageNum - 1) * limitNum,
      });

      res.json(comments);
    } catch (err) {
      next(err);
    }
  }
);

// DELETE /api/stories/:storyId/comments/:commentId - Delete a comment (Requires authentication)
app.delete(
  "/api/stories/:storyId/comments/:commentId",
  authenticateUser,
  async (req, res, next) => {
    const { commentId } = req.params;

    try {
      const comment = await prisma.comment.findUnique({
        where: { id: parseInt(commentId, 10) },
      });

      if (
        !comment ||
        (comment.userId !== req.user.id && req.user.role !== "admin")
      ) {
        return res
          .status(403)
          .json({ message: "You are not authorized to delete this comment." });
      }

      await prisma.comment.delete({
        where: { id: parseInt(commentId, 10) },
      });

      res.sendStatus(204);
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
