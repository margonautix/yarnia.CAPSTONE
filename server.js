const express = require("express");
const app = express();
const prisma = require("./prisma");

const PORT = 3000;

app.use(express.json());
app.use(require("morgan")("dev"));
//API routes go here 

app.get("/api/stories/:storyId/comments", async (req, res, next) => {
    try {
      const comments = await prisma.comments.findMany();
      res.json(comments);
    } catch (err) {
      next(err);
    }
  });

  app.post("/api/stories/:storyId/comments", async (req, res, next) => { 
    const { storyId } = req.params;
    const { userId, content } = req.body;

    try {
      if (!userId || !content)  {
        return res.status(400).json({ message: "User ID and content are required" });
      }

      const newComment = await prisma.comment.create({
        data: {
          userId: parseInt(userId),
          storyId: parseInt(storyId),
          content,
        },
      });

      res.status(201).json({ message: "Comment added successfully.", newComment });
    } catch (err) {
      next(err);
    }
  });

  app.delete('/api/stories/:storyId/comments/:commentId', async (req, res) => {
    const { commentId } = req.params;
  
    try {
      // Delete the comment
      const deletedComment = await prisma.comment.delete({
        where: { commentId: parseInt(commentId, 10) }
      });
  
      res.status(200).json(deletedComment);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error deleting comment' });
    }
  });

  app.get('/api/user/:authorId/comments', async (req, res) => {
    const { authorId } = req.params;
  
    try {
      // Fetch comments by the user (authorId)
      const comments = await prisma.comment.findMany({
        where: { userId: parseInt(authorId, 10) }
      });
  
      res.status(200).json(comments);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error fetching comments' });
    }
  });

  app.get('/api/user/comments', async (req, res) => {
    try {
      // Fetch all comments from the database
      const comments = await prisma.comment.findMany();
  
      res.status(200).json(comments);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error fetching comments' });
    }
  });

       

//Simple error handling middleware
app.use((err, req, res, next) => {
    console.error(err);
    const status = err.status ?? 500;
    const message = err.message ?? "Internal server error.";
    res.status(status).json({ message });
  });
  
  app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });