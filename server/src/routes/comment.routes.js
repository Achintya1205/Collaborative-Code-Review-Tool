const express = require('express');
const { createComment, getComments } = require('../controllers/comment.controller');

const router = express.Router({ mergeParams: true });

router.post('/', createComment);
router.get('/', getComments);

module.exports = router;
