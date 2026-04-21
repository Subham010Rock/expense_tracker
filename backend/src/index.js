'use strict';

const express = require('express');
const cors = require('cors');
const { migrate } = require('./db');
const { errorHandler } = require('./middleware/errorHandler');
const expensesRouter = require('./routes/expenses');

const app = express();

app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (_req, res) => res.json({ status: 'ok' }));

// Routes
app.use('/expenses', expensesRouter);

// 404 fallback
app.use((_req, res) => res.status(404).json({ error: 'Not found' }));

// Centralized error handler (must be last)
app.use(errorHandler);

const PORT = process.env.PORT || 3001;

// Run migrations then start server
async function start() {
  await migrate();
  app.listen(PORT, () => {
    console.log(`Expense Tracker API running on port ${PORT}`);
  });
}

// Export app for testing (tests call migrate() themselves)
if (require.main === module) start();

module.exports = app;
