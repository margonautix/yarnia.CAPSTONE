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
app.use((err, req, res, next) => {
  console.error(err);
  const status = err.status ?? 500;
  const message = err.message ?? "Internal server error.";
  res.status(status).json({ message });
});

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
    req.user = decoded;
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
    console.log("Decoded token:", decoded); // Log decoded token for debugging

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

// Example of your `fetchAllStories` backend endpoint
app.get("/api/stories", async (req, res) => {
  try {
    const stories = await prisma.story.findMany({
      include: {
        author: {
          select: { username: true }, // Include only the author's username
        },
      },
    });
    res.json(stories);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch stories." });
  }
});

app.get("/api/stories/:storyId", async (req, res, next) => {
  const { storyId } = req.params;
  console.log(`Received storyId: ${storyId}`); // Log the storyId

  try {
    const story = await prisma.story.findUnique({
      where: { storyId: parseInt(storyId) }, // Ensure storyId is an integer
      include: {
        author: {
          // Include the related author information
          select: { username: true }, // Only select the username (or add more fields if needed)
        },
      },
    });

    if (!story) {
      return res.status(404).json({ message: "Story not found." });
    }

    res.json(story); // Return the story with author information included
  } catch (err) {
    console.error("Error fetching story:", err); // Log the error
    next(err);
  }
});

app.delete(
  "/api/stories/:storyId",
  authenticateUser,
  authenticateAdmin,
  async (req, res) => {
    const { storyId } = req.params;

    try {
      const deletedStory = await prisma.story.delete({
        where: { storyId: parseInt(storyId) },
      });

      res
        .status(200)
        .json({ message: "Story deleted successfully", deletedStory });
    } catch (error) {
      if (error.code === "P2025") {
        return res.status(404).json({ message: "Story not found." });
      }
      console.error("Error deleting story:", error);
      res.status(500).json({ message: "Server error." });
    }
  }
);

// POST (create) a new story
app.post("/api/stories", authenticateUser, async (req, res) => {
  const { title, summary, content } = req.body;

  if (!title || !content) {
    return res.status(400).json({ message: "Title and content are required." });
  }

  try {
    const newStory = await prisma.story.create({
      data: {
        title,
        summary,
        content,
        authorId: req.user.id, // Assuming you're attaching the authenticated user's ID
      },
    });

    res.status(201).json(newStory);
  } catch (error) {
    console.error("Error creating story:", error);
    res.status(500).json({ message: "Failed to create story." });
  }
});

// PUT (update) a story by ID
app.put("/api/stories/:storyId", async (req, res, next) => {
  const { storyId } = req.params;
  const { title, summary, content } = req.body;

  try {
    // Ensure at least one field is provided
    if (!title && !content) {
      return res
        .status(400)
        .json({ message: "At least title or content is required." });
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
  const { storyId } = req.params;
  try {
    // Fetch comments with user details
    const comments = await prisma.comment.findMany({
      where: {
        storyId: parseInt(storyId),
      },
      include: {
        user: {
          select: { username: true }, // Include only the user's username
        },
      },
    });
    res.json(comments);
  } catch (error) {
    console.error("Error fetching comments:", error);
    res.status(500).json({ message: "Failed to fetch comments." });
  }
});

// POST new comment on individual story
app.post(
  "/api/stories/:storyId/comments",
  authenticateUser,
  async (req, res, next) => {
    const { storyId } = req.params;
    const { content } = req.body;

    // Validate content
    if (!content) {
      return res.status(400).json({ message: "Content is required" });
    }

    try {
      // Create the comment in the database
      const newComment = await prisma.comment.create({
        data: {
          userId: req.user.id, // Use authenticated user's ID
          storyId: parseInt(storyId), // Ensure the storyId is an integer
          content, // Use content from the request body
        },
      });

      res
        .status(201)
        .json({ message: "Comment added successfully.", newComment });
    } catch (error) {
      console.error("Error posting comment:", error);
      res.status(500).json({ message: "Failed to post comment." });
    }
  }
);

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
app.get("/api/users/:userId/comments", async (req, res, next) => {
  const { userId } = req.params; // Extract authorId from the URL
  try {
    // Fetch comments where the authorId matches the specified user
    const comments = await prisma.comment.findMany({
      where: {
        userId: parseInt(userId), // Filter comments by authorId
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

// GET all comments in the database with user information
app.get("/api/comments", authenticateAdmin, async (req, res, next) => {
  try {
    const comments = await prisma.comment.findMany({
      include: {
        user: {
          select: { username: true }, // Include only the user's username
        },
      },
    });

    res.status(200).json(comments);
  } catch (err) {
    next(err);
  }
});

// Route to get all bookmarks for a specific user
app.get("/api/users/:userId/bookmarks", async (req, res, next) => {
  const { userId } = req.params; // Extract authorId from request params

  try {
    // Check if the author exists (optional but recommended)
    const author = await prisma.user.findUnique({
      where: { id: parseInt(userId) },
    });

    if (!author) {
      return res.status(404).json({ message: "Author not found." });
    }

    // Find all bookmarks for the author
    const bookmarks = await prisma.bookmark.findMany({
      where: { userId: parseInt(userId) }, // Filter bookmarks by authorId (mapped to authorId)
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

// // Route to post a new bookmark to a story
// app.post("/api/stories/:storyId/bookmarks", async (req, res, next) => {
//   const { authorId } = req.body;
//   const { storyId } = req.params;

//   try {
//     // Validate input
//     if (!authorId) {
//       return res.status(400).json({ message: "authorId is required." });
//     }

//     // Create a new bookmark
//     const bookmark = await prisma.bookmark.create({
//       data: {
//         userId: parseInt(authorId), // Assuming authorId maps to the user who created the bookmark
//         storyId: parseInt(storyId), // Use the storyId from the URL
//       },
//     });

//     // Return the created bookmark
//     res.status(201).json(bookmark);
//   } catch (err) {
//     next(err);
//   }
// });

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

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    const token = generateToken(user);

    res.json({ message: "Login successful", token, user }); // Send both token and user
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
  console.log("milk")
  const { userId, storyId } = req.body;
  console.log(userId, userId);
  try {
    if (!userId || !storyId ) {
      return res.status(400).json({
        message: "userId and storyId are required",
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

// GET (`${API_URL}/users/${userId}/bookmarks`, {

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

app.get("/api/users/:userId/stories", authenticateUser, async (req, res) => {
  const { userId } = req.params;

  try {
    const stories = await prisma.story.findMany({
      where: { authorId: parseInt(userId, 10) }, // Ensure the userId is correctly parsed as an integer
    });

    if (!stories.length) {
      return res
        .status(404)
        .json({ message: "No stories found for this user." });
    }

    res.status(200).json(stories);
  } catch (error) {
    console.error("Error fetching stories:", error);
    res.status(500).json({ message: "Failed to fetch stories." });
  }
});

app.get("/api/users/:userId/comments", async (req, res) => {
  const { userId } = req.params;
  try {
    const comments = await prisma.comment.findMany({
      where: { userId: Number(userId) },
      include: { story: true }, // Include the related story
    });
    res.json(comments);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch user comments" });
  }
});
