const ReviewSession = require('../models/ReviewSession.model');
const { parseDiff } = require('../services/diffParser.service');

async function createSession(req, res, next) {
  try {
    const { title, rawDiff, reviewers } = req.body;

    if (!title || !rawDiff) {
      return res.status(400).json({ message: 'title and rawDiff are required' });
    }

    const parsedDiff = parseDiff(rawDiff);

    const session = await ReviewSession.create({
      title,
      rawDiff,
      parsedDiff,
      reviewers: reviewers || [],
    });

    res.status(201).json(session);
  } catch (err) {
    next(err);
  }
}

async function getSession(req, res, next) {
  try {
    const session = await ReviewSession.findById(req.params.id);

    if (!session) {
      return res.status(404).json({ message: 'Review session not found' });
    }

    res.status(200).json(session);
  } catch (err) {
    next(err);
  }
}

module.exports = { createSession, getSession };