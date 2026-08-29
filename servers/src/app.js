const express = require('express');
const healthRoutes = require('./routes/health.routes');
const sessionRoutes = require('./routes/session.routes');
const errorHandler = require('./middleware/errorHandler');

const app = express();

app.use(express.json());

app.use('/api/health', healthRoutes);
app.use('/api/sessions', sessionRoutes);

app.use(errorHandler);

module.exports = app;