'use strict';

const { Pool, types } = require('pg');
require('dotenv').config();

// Return DATE columns as raw YYYY-MM-DD strings (no timezone conversion)
types.setTypeParser(1082, (val) => val);

const dbConfig = process.env.DATABASE_URL
  ? {
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
    }
  : {
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432', 10),
      database: process.env.DB_NAME || 'expense_tracker',
      user: process.env.DB_USER || process.env.USER || '',
      // pg requires password to be a string — never undefined/null
      password: String(process.env.DB_PASSWORD || ''),
      ssl: false,
    };

const pool = new Pool(dbConfig);

/**
 * Run schema migrations on startup.
 * Using NUMERIC(12,2) for amount to ensure exact decimal arithmetic.
 */
async function migrate() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS expenses (
      id               SERIAL PRIMARY KEY,
      amount           NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
      category         TEXT NOT NULL,
      description      TEXT NOT NULL,
      date             DATE NOT NULL,
      created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      idempotency_key  TEXT UNIQUE
    );

    CREATE INDEX IF NOT EXISTS idx_expenses_category   ON expenses (LOWER(category));
    CREATE INDEX IF NOT EXISTS idx_expenses_date_desc  ON expenses (date DESC, created_at DESC);
  `);
}

module.exports = { pool, migrate };
