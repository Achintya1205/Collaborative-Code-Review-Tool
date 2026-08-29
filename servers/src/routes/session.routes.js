const express = require('express');
const { createSession, getSession } = require('../controllers/session.controller');

const router = express.Router();

router.post('/', createSession);
router.get('/:id', getSession);

module.exports = router;
