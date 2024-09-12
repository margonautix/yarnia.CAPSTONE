const express = require("express");
const app = express();
const prisma = require("./prisma");

const PORT = 3000;

app.use(express.json());
app.use(require("morgan")("dev"));

// Simple error handling middleware
app.use((err, req, res, next) => {
  console.error(err);
  const status = err.status ?? 500;
  const message = err.message ?? "Internal server error.";
  res.status(status).json({ message });
});

// Server start
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

// GET all users (Admin route)
app.get("/api/users", async (req, res, next) => {
  try {
    const users = await prisma.user.findMany();
    res.json(users);
  } catch (err) {
    next(err);
  }
});

// GET a single user by authorId
app.get("/api/users/:authorId", async (req, res, next) => {
  try {
    const { authorId } = req.params;
    const user = await prisma.user.findUnique({
      where: { id: parseInt(authorId, 10) },
    });
    if (!user) {
      return next({ status: 404, message: "User not found." });
    }
    res.json(user);
  } catch (err) {
    next(err);
  }
});

// POST create a new user
app.post("/api/users", async (req, res, next) => {
  try {
    const { name, email } = req.body;
    const users = await prisma.user.create({
      data: {
        name,
        email,
      },
    });
    res.status(201).json(users);
  } catch (err) {
    next(err);
  }
});

app.put("/api/users/:authorId", async (req, res, next) => {
  try {
    const { authorId } = req.params;
    const { name, email } = req.body;

    // Validate input
    if (!name || !email) {
      return res.status(400).json({ message: "Name and email are required." });
    }

    // Optional: If you have user authentication, check if the current user can update this author
    const loggedInUserId = req.user.id; // Assuming req.user contains the authenticated user info
    if (parseInt(authorId, 10) !== loggedInUserId) {
      return res
        .status(403)
        .json({ message: "You are not authorized to update this profile." });
    }

    // Update the author in the database
    const updatedAuthor = await prisma.author.update({
      where: { id: parseInt(authorId, 10) },
      data: {
        name,
        email,
      },
    });

    // Return the updated author object, excluding any sensitive fields
    const { password, ...safeAuthorData } = updatedAuthor; // Assuming password field exists
    res.json(safeAuthorData);
  } catch (err) {
    // Handle Prisma record not found error (P2025)
    if (err.code === "P2025") {
      return next({ status: 404, message: "User not found." });
    }
    // Forward any other errors
    next(err);
  }
});

// DELETE a user by authorId
app.delete("/api/users/:authorId", async (req, res, next) => {
  try {
    const { authorId } = req.params;
    const user = await prisma.user.findUnique({
      where: { id: parseInt(authorId, 10) },
    });

    if (!user) {
      return next({
        status: 404,
        message: `Could not find user with id ${authorId}.`,
      });
    }

    await prisma.user.delete({
      where: { id: parseInt(authorId, 10) },
    });

    res.sendStatus(204);
  } catch (err) {
    next(err);
  }
});

app.use(express.json());
app.use(require("morgan")("dev"));

// Simple error handling middleware
app.use((err, req, res, next) => {
  console.error(err);
  const status = err.status ?? 500;
  const message = err.message ?? "Internal server error.";
  res.status(status).json({ message });
});

// Server start
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

// GET all users (Admin route)
app.get("/api/users", async (req, res, next) => {
  try {
    const users = await prisma.user.findMany();
    res.json(users);
  } catch (err) {
    next(err);
  }
});

// GET a single user by authorId
app.get("/api/users/:authorId", async (req, res, next) => {
  try {
    const { authorId } = req.params;
    const user = await prisma.user.findUnique({
      where: { id: parseInt(authorId, 10) },
    });
    if (!user) {
      return next({ status: 404, message: "User not found." });
    }
    res.json(user);
  } catch (err) {
    next(err);
  }
});

// POST (create) a new user
app.post("/api/users", async (req, res, next) => {
  const { username, email, password, bio } = req.body;

  try {
    // Ensure all required fields are provided
    if (!username || !email || !password) {
      return res
        .status(400)
        .json({ message: "Username, email, and password are required." });
    }

    // Create a new user in the database
    const newUser = await prisma.user.create({
      data: {
        username,
        email,
        password, // Ensure you hash passwords before storing them in production
        bio,
      },
    });

    res.status(201).json({ message: "User created successfully.", newUser });
  } catch (err) {
    // Handle any errors
    if (err.code === "P2002") {
      // P2002 is Prisma's error code for unique constraint violation
      return res
        .status(409)
        .json({ message: "Username or email already in use." });
    }
    next(err);
  }
});

// PUT to update a user by authorId
app.put("/api/users/:authorId", async (req, res, next) => {
  try {
    const { authorId } = req.params;
    const { username, email, bio } = req.body;

    // Validate input
    if (!username || !email) {
      return res
        .status(400)
        .json({ message: "Username and email are required." });
    }

    // Update the user in the database
    const updatedUser = await prisma.user.update({
      where: { id: parseInt(authorId, 10) },
      data: {
        username,
        email,
        bio,
      },
    });

    res.json(updatedUser);
  } catch (err) {
    // Handle Prisma record not found error (P2025)
    if (err.code === "P2025") {
      return next({ status: 404, message: "User not found." });
    }
    // Forward any other errors
    next(err);
  }
});

// DELETE a user by authorId
app.delete("/api/users/:authorId", async (req, res, next) => {
  try {
    const { authorId } = req.params;
    const user = await prisma.user.findUnique({
      where: { id: parseInt(authorId, 10) },
    });

    if (!user) {
      return next({
        status: 404,
        message: `Could not find user with id ${authorId}.`,
      });
    }

    await prisma.user.delete({
      where: { id: parseInt(authorId, 10) },
    });

    res.sendStatus(204);
  } catch (err) {
    next(err);
  }
});
