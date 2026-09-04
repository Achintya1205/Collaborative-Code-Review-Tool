const express = require('express');
const cors = require('cors');
const healthRoutes = require('./routes/health.routes');
const sessionRoutes = require('./routes/session.routes');
const commentRoutes = require('./routes/comment.routes');
const errorHandler = require('./middleware/errorHandler');

const app = express();

app.use(cors({ origin: 'http://localhost:4200' }));
app.use(express.json());

app.use('/api/health', healthRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/sessions/:sessionId/comments', commentRoutes);

app.use(errorHandler);

module.exports = app;