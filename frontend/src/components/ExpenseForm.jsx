import { useState, useRef, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useCreateExpense } from '../hooks/useExpenses';

const CATEGORIES = [
  'Food',
  'Transport',
  'Housing',
  'Healthcare',
  'Entertainment',
  'Shopping',
  'Education',
  'Utilities',
  'Other',
];

const STORAGE_KEY = 'expense_idempotency_key';

/** Get or create a stable UUID for the current (unsaved) form submission */
function getOrCreateKey() {
  let key = sessionStorage.getItem(STORAGE_KEY);
  if (!key) {
    key = uuidv4();
    sessionStorage.setItem(STORAGE_KEY, key);
  }
  return key;
}

function resetKey() {
  const newKey = uuidv4();
  sessionStorage.setItem(STORAGE_KEY, newKey);
  return newKey;
}

export default function ExpenseForm() {
  const [form, setForm] = useState({
    amount: '',
    category: '',
    description: '',
    date: new Date().toISOString().slice(0, 10),
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [successMsg, setSuccessMsg] = useState('');
  const idempotencyKeyRef = useRef(getOrCreateKey());

  const { mutate, isPending, error } = useCreateExpense();

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setFieldErrors((prev) => ({ ...prev, [name]: '' }));
    setSuccessMsg('');
  }, []);

  const validate = () => {
    const errors = {};
    const amt = parseFloat(form.amount);
    if (!form.amount) errors.amount = 'Amount is required';
    else if (isNaN(amt) || amt <= 0) errors.amount = 'Amount must be a positive number';
    if (!form.category) errors.category = 'Please select a category';
    if (!form.description.trim()) errors.description = 'Description is required';
    if (!form.date) errors.date = 'Date is required';
    return errors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errors = validate();
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    mutate(
      {
        body: {
          amount: parseFloat(form.amount).toFixed(2),
          category: form.category,
          description: form.description.trim(),
          date: form.date,
        },
        idempotencyKey: idempotencyKeyRef.current,
      },
      {
        onSuccess: () => {
          setForm({ amount: '', category: '', description: '', date: new Date().toISOString().slice(0, 10) });
          setFieldErrors({});
          setSuccessMsg('Expense added successfully!');
          // Rotate key for next fresh submission
          idempotencyKeyRef.current = resetKey();
          setTimeout(() => setSuccessMsg(''), 4000);
        },
      }
    );
  };

  const apiError = error?.response?.data?.details?.join(', ') || error?.message;

  return (
    <section className="form-card" aria-label="Add new expense">
      <h2 className="form-title">Add Expense</h2>

      {apiError && (
        <div className="alert alert-error" role="alert">
          {apiError}
        </div>
      )}
      {successMsg && (
        <div className="alert alert-success" role="status">
          {successMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        <div className="form-row">
          {/* Amount */}
          <div className="field">
            <label htmlFor="amount">Amount (₹)</label>
            <input
              id="amount"
              name="amount"
              type="number"
              min="0.01"
              step="0.01"
              placeholder="0.00"
              value={form.amount}
              onChange={handleChange}
              className={fieldErrors.amount ? 'input-error' : ''}
              aria-describedby={fieldErrors.amount ? 'amount-err' : undefined}
              disabled={isPending}
            />
            {fieldErrors.amount && <span id="amount-err" className="field-error">{fieldErrors.amount}</span>}
          </div>

          {/* Category */}
          <div className="field">
            <label htmlFor="category">Category</label>
            <select
              id="category"
              name="category"
              value={form.category}
              onChange={handleChange}
              className={fieldErrors.category ? 'input-error' : ''}
              disabled={isPending}
            >
              <option value="">Select category</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            {fieldErrors.category && <span className="field-error">{fieldErrors.category}</span>}
          </div>
        </div>

        <div className="form-row">
          {/* Description */}
          <div className="field field-wide">
            <label htmlFor="description">Description</label>
            <input
              id="description"
              name="description"
              type="text"
              placeholder="What was this expense for?"
              value={form.description}
              onChange={handleChange}
              className={fieldErrors.description ? 'input-error' : ''}
              disabled={isPending}
            />
            {fieldErrors.description && <span className="field-error">{fieldErrors.description}</span>}
          </div>

          {/* Date */}
          <div className="field">
            <label htmlFor="date">Date</label>
            <input
              id="date"
              name="date"
              type="date"
              value={form.date}
              onChange={handleChange}
              className={fieldErrors.date ? 'input-error' : ''}
              disabled={isPending}
            />
            {fieldErrors.date && <span className="field-error">{fieldErrors.date}</span>}
          </div>
        </div>

        <button type="submit" className="btn-primary" disabled={isPending} id="submit-expense">
          {isPending ? 'Saving…' : '+ Add Expense'}
        </button>
      </form>
    </section>
  );
}
