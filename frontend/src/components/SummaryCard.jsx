function fmt(amount) {
  return `₹${parseFloat(amount).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export default function SummaryCard({ expenses }) {
  // Total of visible (filtered) expenses
  const total = expenses.reduce((sum, e) => sum + parseFloat(e.amount), 0);

  // Per-category breakdown
  const byCategory = expenses.reduce((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + parseFloat(e.amount);
    return acc;
  }, {});

  const categories = Object.entries(byCategory).sort((a, b) => b[1] - a[1]);

  return (
    <div className="summary-card" aria-label="Expense summary">
      <div className="summary-total">
        <span className="summary-label">Total</span>
        <span className="summary-amount" data-testid="total-amount">{fmt(total)}</span>
      </div>

      {categories.length > 1 && (
        <div className="summary-breakdown">
          {categories.map(([cat, amt]) => (
            <div key={cat} className="summary-row">
              <span className={`badge badge-${cat.toLowerCase()}`}>{cat}</span>
              <span className="summary-cat-amount">{fmt(amt)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
