require("dotenv").config();
const express = require("express");
const app = express();
const prisma = require("./prisma");

const cors = require("cors");

const PORT = 3000;

const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const JWT = process.env.JWT || "shhh";

app.use(express.json());
app.use(require("morgan")("dev"));
app.use(
  cors({
    origin: "http://localhost:5173", // Only allow your frontend origin
    credentials: true, // Allow credentials such as Authorization headers or cookies
  })
);

// Helper function to generate JWT
const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, isAdmin: user.isAdmin }, // Include isAdmin in the token
    JWT,
    { expiresIn: "1h" }
  );
};

// Middleware to authenticate the user using JWT
const authenticateUser = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1]; // Extract the token
  if (!token) {
    return res.status(401).json({ message: "Unauthorized, token missing" });
  }

  try {
    const decoded = jwt.verify(token, JWT); // Verify the token
    req.user = decoded; // Attach the decoded user data (id, etc.) to the request
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

// Middleware to check if the user is an admin
const authenticateAdmin = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1]; // Extract token from header

  if (!token) {
    return res.status(401).json({ message: "Authorization header missing" });
  }

  try {
    const decoded = jwt.verify(token, JWT); // Verify token

    if (!decoded.isAdmin) {
      return res.status(403).json({ message: "Access denied. Admins only." });
    }

    req.user = decoded; // Attach decoded token to req object
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

// API routes go here

// GET all stories
app.get("/api/stories", async (req, res, next) => {
  try {
    const stories = await prisma.story.findMany();
    res.json(stories);
  } catch (err) {
    next(err);
  }
});

// GET a single story by ID
app.get("/api/stories/:storyId", async (req, res, next) => {
  const { storyId } = req.params; // Extract storyId from the URL
  try {
    const story = await prisma.story.findUnique({
      where: { storyId: parseInt(storyId) },
    });

    if (!story) {
      return res.status(404).json({ message: "Story not found." });
    }

    res.json(story);
  } catch (err) {
    next(err);
  }
});

// DELETE a single story by ID
app.delete("/api/stories/:storyId", async (req, res, next) => {
  const { storyId } = req.params;
  try {
    const story = await prisma.story.delete({
      where: { storyId: parseInt(storyId) },
    });

    res.json({ message: "Story deleted successfully.", story });
  } catch (err) {
    if (err.code === "P2025") {
      return res.status(404).json({ message: "Story not found." });
    }
    next(err);
  }
});

// POST (create) a new story
app.post("/api/stories", async (req, res, next) => {
  const { title, authorId, summary, content } = req.body;

  try {
    // Ensure all required fields are provided
    if (!title || !authorId || !content) {
      return res
        .status(400)
        .json({ message: "Title, authorId, and content are required." });
    }

    // Create a new story in the database
    const newStory = await prisma.story.create({
      data: {
        title,
        authorId: parseInt(authorId), // Convert to integer if necessary
        summary,
        content,
      },
    });

    res.status(201).json({ message: "Story created successfully.", newStory });
  } catch (err) {
    next(err);
  }
});

// PUT (update) a story by ID
app.put("/api/stories/:storyId", async (req, res, next) => {
  const { storyId } = req.params;
  const { title, summary, content } = req.body;

  try {
    // Ensure all required fields are provided
    if (!title || !content) {
      return res
        .status(400)
        .json({ message: "Title and content are required." });
    }

    // Update the story in the database
    const updatedStory = await prisma.story.update({
      where: { storyId: parseInt(storyId) },
      data: {
        title,
        summary,
        content,
      },
    });

    res.json({ message: "Story updated successfully.", updatedStory });
  } catch (err) {
    if (err.code === "P2025") {
      return res.status(404).json({ message: "Story not found." });
    }
    next(err);
  }
});

// GET all comments on individual story
app.get("/api/stories/:storyId/comments", async (req, res, next) => {
  const { storyId } = req.params; // Extract storyId from the URL
  try {
    const comments = await prisma.comment.findMany({
      where: {
        storyId: parseInt(storyId), // Filter comments by storyId
      },
    });
    res.json(comments);
  } catch (err) {
    next(err);
  }
});

// POST new comment on individual story
app.post("/api/stories/:storyId/comments", async (req, res, next) => {
  const { storyId } = req.params;
  const { userId, content } = req.body;

  try {
    if (!userId || !content) {
      return res
        .status(400)
        .json({ message: "User ID and content are required" });
    }

    const newComment = await prisma.comment.create({
      data: {
        userId: parseInt(userId),
        storyId: parseInt(storyId),
        content,
      },
    });

    res
      .status(201)
      .json({ message: "Comment added successfully.", newComment });
  } catch (err) {
    next(err);
  }
});

// DELETE a specific comment
app.delete("/api/stories/:storyId/comments/:commentId", async (req, res) => {
  const { commentId } = req.params;

  try {
    // Delete the comment
    const deletedComment = await prisma.comment.delete({
      where: { commentId: parseInt(commentId) },
    });

    res.status(200).json(deletedComment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error deleting comment" });
  }
});

// GET all comments by specific user
app.get("/api/users/:authorId/comments", async (req, res, next) => {
  const { authorId } = req.params; // Extract authorId from the URL
  try {
    // Fetch comments where the authorId matches the specified user
    const comments = await prisma.comment.findMany({
      where: {
        authorId: parseInt(authorId), // Filter comments by authorId
      },
    });

    res.status(200).json(comments);
  } catch (err) {
    next(err);
  }
});

app.put("/api/users/me", authenticateUser, async (req, res, next) => {
  const { username, bio } = req.body;

  try {
    const updatedUser = await prisma.user.update({
      where: { id: req.user.id }, // Use the authenticated user's ID
      data: { username, bio }, // Update the username and bio fields
    });

    res.json(updatedUser); // Return the updated user data
  } catch (error) {
    next(error); // Pass any errors to your error-handling middleware
  }
});

// GET all comments in database
app.get("/api/comments", authenticateAdmin, async (req, res, next) => {
  try {
    // Fetch all comments from the database
    const comments = await prisma.comment.findMany();

    res.status(200).json(comments);
  } catch (err) {
    next(err);
  }
});

// Route to get all bookmarks for a specific user
app.get("/api/users/:authorId/bookmarks", async (req, res, next) => {
  const { authorId } = req.params; // Extract authorId from request params

  try {
    // Check if the author exists (optional but recommended)
    const author = await prisma.user.findUnique({
      where: { id: parseInt(authorId) },
    });

    if (!author) {
      return res.status(404).json({ message: "Author not found." });
    }

    // Find all bookmarks for the author
    const bookmarks = await prisma.bookmark.findMany({
      where: { authorId: parseInt(authorId) }, // Filter bookmarks by authorId (mapped to authorId)
      include: {
        story: true, // Optionally include the related story information
      },
    });

    // Return bookmarks in the response
    res.json(bookmarks);
  } catch (err) {
    next(err);
  }
});

// Route to post a new bookmark to a story
app.post("/api/stories/:storyId/bookmarks", async (req, res, next) => {
  const { authorId } = req.body;
  const { storyId } = req.params;

  try {
    // Validate input
    if (!authorId) {
      return res.status(400).json({ message: "authorId is required." });
    }

    // Create a new bookmark
    const bookmark = await prisma.bookmark.create({
      data: {
        userId: parseInt(authorId), // Assuming authorId maps to the user who created the bookmark
        storyId: parseInt(storyId), // Use the storyId from the URL
      },
    });

    // Return the created bookmark
    res.status(201).json(bookmark);
  } catch (err) {
    next(err);
  }
});

//Route to delete a bookmark from a story
app.delete(
  "/api/stories/:storyId/bookmarks/:bookmarkId",
  async (req, res, next) => {
    const { bookmarkId } = req.params;

    try {
      await prisma.bookmark.delete({
        where: { bookmarkId: parseInt(bookmarkId) },
      });
      res.status(200).json({ message: "Bookmark deleted successfully." });
    } catch (err) {
      if (err.code === "P2025") {
        return res.status(404).json({ message: "Bookmark not found." });
      }
      next(err);
    }
  }
);

// Route to get all bookmarks for a specific story
app.get("/api/stories/:storyId/bookmarks", async (req, res, next) => {
  const { storyId } = req.params; // Extract storyId from request params

  try {
    // Check if the story exists (optional but recommended)
    const story = await prisma.story.findUnique({
      where: { storyId: parseInt(storyId) },
    });

    if (!story) {
      return res.status(404).json({ message: "Story not found." });
    }

    // Find all bookmarks for the story
    const bookmarks = await prisma.bookmark.findMany({
      where: { storyId: parseInt(storyId) }, // Filter bookmarks by storyId
      include: {
        user: true, // Optionally include the user who bookmarked the story
      },
    });

    // Return bookmarks in the response
    res.json(bookmarks);
  } catch (err) {
    next(err);
  }
});

app.post("/api/stories/:storyId/bookmarks", async (req, res, next) => {
  const { userId, storyId, createdAt } = req.body;

  try {
    if (!userId || !storyId) {
      return res.status(400).json({
        message: "userId and storyId are required",
      });
    }

    const bookmark = await prisma.bookmark.create({
      data: {
        userId: parseInt(userId),
        storyId: parseInt(storyId),
        createdAt: createdAt ? new Date(createdAt) : new Date(), // Use current date if createdAt is not provided
      },
    });

    res
      .status(201)
      .json({ message: "Bookmark created successfully", bookmark });
  } catch (err) {
    if (err.code === "P2002") {
      return res.status(409).json({ message: "Bookmark already exists." });
    }

    next(err);
  }
});

app.get("/api/user/:authorId/bookmarks", async (req, res, next) => {
  const { bookmarkId } = req.params;
  try {
    const bookmark = await prisma.bookmark.findUnique({
      where: { bookmarkId: parseInt(bookmarkId) },
    });

    if (!bookmark) {
      return res.status(404).json({ message: "Story not found." });
    }
    res.json(bookmark);
  } catch (err) {
    next(err);
  }
});

// === Auth Routes ===

// POST (create) a new user
app.post("/api/auth/register", async (req, res, next) => {
  const { username, email, password, bio, isAdmin = false } = req.body;

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
        isAdmin, // Save the isAdmin field
      },
    });

    // Generate a token for the new user
    const token = generateToken(newUser);

    res.status(201).json({ message: "User registered successfully", token });
  } catch (err) {
    next(err);
  }
});

// Route to get all users (only accessible to admin users)
app.get("/api/users", authenticateAdmin, async (req, res, next) => {
  try {
    // Fetch all users from the database
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        bio: true,
        isAdmin: true,
        joinedOn: true,
      },
    });

    res.status(200).json(users);
  } catch (err) {
    next(err);
  }
});

app.get("/api/users/:authorId", async (req, res, next) => {
  const { authorId } = req.params;

  try {
    // Find the user by ID
    const user = await prisma.user.findUnique({
      where: { id: parseInt(authorId, 10) },
      select: {
        id: true,
        username: true,
        password: true,
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

app.delete(
  "/api/users/:authorId",
  authenticateUser,
  authenticateAdmin,
  async (req, res, next) => {
    const { authorId } = req.params;

    try {
      await prisma.user.delete({
        where: { id: parseInt(authorId, 10) },
      });

      res.status(204).json({ message: "User deleted successfully." });
    } catch (err) {
      next(err);
    }
  }
);

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

// Get new bookmarks in database

app.get("/api/user/bookmarks", async (req, res, next) => {
  const { bookmarkId } = req.params;
  try {
    const bookmark = await prisma.bookmark.findUnique({
      where: { bookmarkId: parseInt(bookmarkId) },
    });

    if (!bookmark) {
      return res.status(404).json({ message: "bookmark not found." });
    }
    res.json(bookmark);
  } catch (err) {
    next(err);
  }
});

// POST /api/stories/:storyId/bookmarks

app.post("/api/stories/:storyId/bookmarks", async (req, res, next) => {
  const { bookmarkId, userId, storyId, createdAt } = req.body;

  try {
    if (!userId || !storyId || !createdAt || !bookmarkId) {
      return res.status(400).json({
        message: "userId, storyId, createdAt, and bookmarkId are required",
      });
    }

    const bookmark = await prisma.bookmark.create({
      data: {
        userId: parseInt(userId),
        storyId: parseInt(storyId),
        createdAt: new Date(createdAt),
      },
    });

    res
      .status(201)
      .json({ message: "Bookmark created successfully", bookmark });
  } catch (err) {
    if (err.code === "P2002") {
      return res.status(409).json({ message: "Bookmark already exists." });
    }

    next(err);
  }
});

// DELETE /api/stories/:storyId/bookmarks

app.delete(
  "/api/stories/:storyId/bookmarks/:bookmarkId",
  async (req, res, next) => {
    const { storyId, bookmarkId } = req.params;

    try {
      await prisma.bookmark.delete({
        where: { id: parseInt(bookmarkId) },
      });
      res.status(200).json({ message: "Bookmark deleted successfully." });
    } catch (err) {
      if (err.code === "P2025") {
        return res.status(404).json({ message: "Bookmark not found." });
      }
      next(err);
    }
  }
);

// GET /api/user/:authorId/bookmarks

app.get("/api/user/:authorId/bookmarks", async (req, res, next) => {
  const { bookmarkId } = req.params;
  try {
    const bookmark = await prisma.bookmark.findUnique({
      where: { bookmarkId: parseInt(bookmarkId) },
    });

    if (!bookmark) {
      return res.status(404).json({ message: "Story not found." });
    }
    res.json(bookmark);
  } catch (err) {
    next(err);
  }
});

// Simple error handling middleware
app.use((err, req, res, next) => {
  console.error(err);
  const status = err.status ?? 500;
  const message = err.message ?? "Internal server error.";
  res.status(status).json({ message });
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
