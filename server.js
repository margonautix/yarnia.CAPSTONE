const express = require("express");
const app = express();
const prisma = require("./prisma");

const PORT = 3000;

app.use(express.json());
app.use(require("morgan")("dev"));
// API routes go here

app.get("/api/stories", async (req, res, next) => {
  try {
    const stories = await prisma.story.findMany();
    res.json(stories);
  } catch (err) {
    next(err);
  }
});

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
