'use strict';

/**
 * Validate expense input fields.
 * amount must be a positive number with at most 2 decimal places.
 */
function validateExpense(req, res, next) {
  const { amount, category, description, date } = req.body;
  const errors = [];

  // amount
  if (amount === undefined || amount === null || amount === '') {
    errors.push('amount is required');
  } else {
    const parsed = Number(amount);
    if (isNaN(parsed) || parsed <= 0) {
      errors.push('amount must be a positive number');
    }
    // Max 2 decimal places
    if (!/^\d+(\.\d{1,2})?$/.test(String(amount))) {
      errors.push('amount must have at most 2 decimal places');
    }
  }

  // category
  if (!category || typeof category !== 'string' || !category.trim()) {
    errors.push('category is required');
  }

  // description
  if (!description || typeof description !== 'string' || !description.trim()) {
    errors.push('description is required');
  }

  // date – must be a valid ISO date string YYYY-MM-DD
  if (!date) {
    errors.push('date is required');
  } else if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || isNaN(Date.parse(date))) {
    errors.push('date must be a valid date in YYYY-MM-DD format');
  }

  if (errors.length > 0) {
    return res.status(400).json({ error: 'Validation failed', details: errors });
  }

  next();
}

module.exports = { validateExpense };
