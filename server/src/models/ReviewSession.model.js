const mongoose = require('mongoose');

const reviewSessionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    rawDiff: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['open', 'closed'],
      default: 'open',
    },
    parsedDiff: {
      type: mongoose.Schema.Types.Mixed,
      default: [],
    },
    reviewers: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('ReviewSession', reviewSessionSchema);