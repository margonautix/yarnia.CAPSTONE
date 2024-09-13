const express = require("express");
const app = express();
const prisma = require("./prisma");

const PORT = 3000;

const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const JWT = process.env.JWT || "shhh";

app.use(express.json());
app.use(require("morgan")("dev"));

// Helper function to generate JWT
const generateToken = (user) => {
  return jwt.sign({ id: user.id, email: user.email }, JWT, {
    expiresIn: "1h", // Token expires in 1 hour
  });
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

// === Auth Routes ===
// Middleware to authenticate the user using JWT
const authenticateUser = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1]; // Extract Bearer token
  if (!token) {
    return res.status(401).json({ message: "Unauthorized, token missing" });
  }

  try {
    const decoded = jwt.verify(token, JWT);
    req.user = decoded; // Attach the decoded token to the request object
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

// POST (create) a new user
app.post("/api/auth/register", async (req, res, next) => {
  const { username, email, password, bio } = req.body;

  try {
    // Validate input
    if (!username || !email || !password) {
      return res
        .status(400)
        .json({ message: "Username, email, and password are required." });
    }

    // Check if email already exists
    const existingEmail = await prisma.user.findUnique({ where: { email } });
    if (existingEmail) {
      return res.status(409).json({ message: "Email already in use." });
    }

    // Check if username already exists
    const existingUsername = await prisma.user.findUnique({
      where: { username },
    });
    if (existingUsername) {
      return res.status(409).json({ message: "Username already in use." });
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
