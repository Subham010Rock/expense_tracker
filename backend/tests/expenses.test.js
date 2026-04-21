'use strict';

const request = require('supertest');
const { pool, migrate } = require('../src/db');

process.env.DB_NAME = 'expense_tracker';

const app = require('../src/index');

// Ensure schema exists and clean up test data before tests
beforeAll(async () => {
  await migrate();
  await pool.query("DELETE FROM expenses WHERE idempotency_key LIKE 'test-%'");
});

afterAll(async () => {
  await pool.query("DELETE FROM expenses WHERE idempotency_key LIKE 'test-%'");
  await pool.end();
});

describe('Expenses API', () => {
  const idempotencyKey = `test-idem-${Date.now()}`;

  describe('POST /expenses', () => {
    it('201 – creates a new expense', async () => {
      const res = await request(app)
        .post('/expenses')
        .set('Idempotency-Key', idempotencyKey)
        .send({ amount: '150.50', category: 'Food', description: 'Lunch', date: '2024-04-15' });

      expect(res.status).toBe(201);
      expect(res.body.data).toMatchObject({
        amount: '150.50',
        category: 'Food',
        description: 'Lunch',
        date: '2024-04-15',
      });
      expect(res.body.idempotent).toBe(false);
    });

    it('200 – returns exact same record on retry (idempotency)', async () => {
      const res = await request(app)
        .post('/expenses')
        .set('Idempotency-Key', idempotencyKey) // same key
        .send({ amount: '999.99', category: 'Transport', description: 'Ignored', date: '2024-04-15' });

      expect(res.status).toBe(200);
      expect(res.body.idempotent).toBe(true);
      // Must return the ORIGINAL record
      expect(res.body.data.amount).toBe('150.50');
      expect(res.body.data.category).toBe('Food');
    });

    it('400 – rejects negative amount', async () => {
      const res = await request(app).post('/expenses')
        .send({ amount: '-10', category: 'Food', description: 'Bad', date: '2024-04-15' });
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Validation failed');
    });

    it('400 – rejects zero amount', async () => {
      const res = await request(app).post('/expenses')
        .send({ amount: '0', category: 'Food', description: 'Bad', date: '2024-04-15' });
      expect(res.status).toBe(400);
    });

    it('400 – rejects missing date', async () => {
      const res = await request(app).post('/expenses')
        .send({ amount: '100', category: 'Food', description: 'No date' });
      expect(res.status).toBe(400);
    });

    it('400 – rejects invalid date format', async () => {
      const res = await request(app).post('/expenses')
        .send({ amount: '100', category: 'Food', description: 'Bad date', date: '15-04-2024' });
      expect(res.status).toBe(400);
    });
  });

  describe('GET /expenses', () => {
    beforeAll(async () => {
      await request(app).post('/expenses')
        .set('Idempotency-Key', `test-seed-transport-${Date.now()}`)
        .send({ amount: '50.00', category: 'Transport', description: 'Bus', date: '2024-04-10' });

      await request(app).post('/expenses')
        .set('Idempotency-Key', `test-seed-food-${Date.now()}`)
        .send({ amount: '200.00', category: 'Food', description: 'Dinner', date: '2024-04-20' });
    });

    it('200 – returns list of expenses', async () => {
      const res = await request(app).get('/expenses');
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('200 – filters by category (case-insensitive)', async () => {
      const res = await request(app).get('/expenses?category=food');
      expect(res.status).toBe(200);
      res.body.data.forEach((e) => {
        expect(e.category.toLowerCase()).toBe('food');
      });
    });

    it('200 – sorts by date descending when sort=date_desc', async () => {
      const res = await request(app).get('/expenses?sort=date_desc');
      expect(res.status).toBe(200);
      const dates = res.body.data.map((e) => e.date);
      const sorted = [...dates].sort((a, b) => b.localeCompare(a));
      expect(dates).toEqual(sorted);
    });

    it('404 – unknown route', async () => {
      const res = await request(app).get('/unknown');
      expect(res.status).toBe(404);
    });
  });
});
