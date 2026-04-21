import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/expenses`
  : '/expenses';

const client = axios.create({ baseURL: API_BASE });

/**
 * Fetch expenses with optional filters.
 * @param {{ category?: string, sort?: string }} params
 */
export async function fetchExpenses({ category, sort } = {}) {
  const params = {};
  if (category) params.category = category;
  if (sort) params.sort = sort;
  const res = await client.get('', { params });
  return res.data.data;
}

/**
 * Create an expense.
 * @param {{ amount: string, category: string, description: string, date: string }} body
 * @param {string} idempotencyKey - UUID for idempotent submission
 */
export async function createExpense(body, idempotencyKey) {
  const res = await client.post('', body, {
    headers: { 'Idempotency-Key': idempotencyKey },
  });
  return res.data.data;
}
