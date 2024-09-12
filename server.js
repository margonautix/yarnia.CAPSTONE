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

// PUT update a user by authorId
app.put("/api/users/:authorId", async (req, res, next) => {
  try {
    const { authorId } = req.params;
    const { name, email } = req.body;
    const updatedAuthor = await prisma.author.update({
      where: { id: parseInt(authorId, 10) },
      data: {
        name,
        email,
      },
    });
    res.json(updatedAuthor);
  } catch (err) {
    if (err.code === "P2025") {
      return next({ status: 404, message: "User not found." });
    }
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
