'use strict';

const express = require('express');
const { pool } = require('../db');
const { validateExpense } = require('../middleware/validate');

const router = express.Router();

// ─── POST /expenses ──────────────────────────────────────────────────────────

router.post('/', validateExpense, async (req, res, next) => {
  try {
    const { amount, category, description, date } = req.body;
    const idempotencyKey = req.headers['idempotency-key'] || null;

    // If idempotency key provided, check for an existing record first
    if (idempotencyKey) {
      const existing = await pool.query(
        'SELECT * FROM expenses WHERE idempotency_key = $1',
        [idempotencyKey]
      );
      if (existing.rows.length > 0) {
        return res.status(200).json({
          data: serialize(existing.rows[0]),
          idempotent: true,
        });
      }
    }

    const result = await pool.query(
      `INSERT INTO expenses (amount, category, description, date, idempotency_key)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [
        parseFloat(amount).toFixed(2),
        category.trim(),
        description.trim(),
        date,
        idempotencyKey,
      ]
    );

    return res.status(201).json({ data: serialize(result.rows[0]), idempotent: false });
  } catch (err) {
    // PostgreSQL unique violation error code
    if (err.code === '23505' && req.headers['idempotency-key']) {
      const existing = await pool.query(
        'SELECT * FROM expenses WHERE idempotency_key = $1',
        [req.headers['idempotency-key']]
      );
      return res.status(200).json({ data: serialize(existing.rows[0]), idempotent: true });
    }
    next(err);
  }
});

// ─── GET /expenses ─────────────────────────────────────────────────────────

router.get('/', async (req, res, next) => {
  try {
    const { category, sort } = req.query;
    const params = [];
    let where = '';

    if (category && category.trim()) {
      params.push(category.trim());
      where = `WHERE LOWER(category) = LOWER($${params.length})`;
    }

    const orderBy = sort === 'date_desc'
      ? 'ORDER BY date DESC, created_at DESC'
      : 'ORDER BY created_at DESC';

    const result = await pool.query(
      `SELECT * FROM expenses ${where} ${orderBy}`,
      params
    );

    return res.status(200).json({ data: result.rows.map(serialize) });
  } catch (err) {
    next(err);
  }
});

/** Shape a DB row for the API response */
function serialize(row) {
  let dateStr;
  if (row.date instanceof Date) {
    // pg returns DATE as a JS Date at midnight UTC.
    // Use UTC getters to prevent local timezone shifting the date.
    const y = row.date.getUTCFullYear();
    const m = String(row.date.getUTCMonth() + 1).padStart(2, '0');
    const d = String(row.date.getUTCDate()).padStart(2, '0');
    dateStr = `${y}-${m}-${d}`;
  } else {
    dateStr = String(row.date).slice(0, 10);
  }

  return {
    id: row.id,
    // pg returns NUMERIC as string; normalize to 2dp
    amount: parseFloat(row.amount).toFixed(2),
    category: row.category,
    description: row.description,
    date: dateStr,
    created_at: row.created_at instanceof Date
      ? row.created_at.toISOString()
      : row.created_at,
  };
}

module.exports = router;
