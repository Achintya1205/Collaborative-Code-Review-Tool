const Comment = require('../models/Comment.model');
const ReviewSession = require('../models/ReviewSession.model');
const { getIO } = require('../sockets/io');

async function createComment(req, res, next) {
  try {
    const { sessionId } = req.params;
    const { filePath, lineNumber, authorName, content, parentComment } = req.body;

    if (!filePath || lineNumber === undefined || !authorName || !content) {
      return res.status(400).json({
        message: 'filePath, lineNumber, authorName, and content are required',
      });
    }

    const session = await ReviewSession.findById(sessionId);
    if (!session) {
      return res.status(404).json({ message: 'Review session not found' });
    }

    const comment = await Comment.create({
      session: sessionId,
      filePath,
      lineNumber,
      authorName,
      content,
      parentComment: parentComment || null,
    });

    getIO().to(sessionId).emit('comment-created', comment);

    res.status(201).json(comment);
  } catch (err) {
    next(err);
  }
}

async function getComments(req, res, next) {
  try {
    const { sessionId } = req.params;

    const comments = await Comment.find({ session: sessionId }).sort({ createdAt: 1 });

    res.status(200).json(comments);
  } catch (err) {
    next(err);
  }
}

module.exports = { createComment, getComments };