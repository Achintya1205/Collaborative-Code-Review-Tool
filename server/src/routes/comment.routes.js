const express = require('express');
const { createComment, getComments, resolveComment } = require('../controllers/comment.controller');

const router = express.Router({ mergeParams: true });

router.post('/', createComment);
router.get('/', getComments);
router.patch('/:commentId/resolve', resolveComment);

module.exports = router;