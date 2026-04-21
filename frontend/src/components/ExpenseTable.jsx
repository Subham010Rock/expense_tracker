/** Format integer amount string ("150.50") to "₹150.50" */
function fmt(amount) {
  return `₹${parseFloat(amount).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

/** Format ISO date string "2024-04-15" to "15 Apr 2024" */
function fmtDate(dateStr) {
  const [year, month, day] = dateStr.split('-');
  const d = new Date(Date.UTC(+year, +month - 1, +day));
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC' });
}

function SkeletonRow() {
  return (
    <tr className="skeleton-row">
      {[...Array(5)].map((_, i) => (
        <td key={i}><div className="skeleton" /></td>
      ))}
    </tr>
  );
}

export default function ExpenseTable({ expenses, isLoading, isError }) {
  if (isError) {
    return (
      <div className="alert alert-error" role="alert">
        Failed to load expenses. Please refresh the page.
      </div>
    );
  }

  return (
    <div className="table-wrapper">
      <table className="expense-table" aria-label="Expense list">
        <thead>
          <tr>
            <th scope="col">Date</th>
            <th scope="col">Category</th>
            <th scope="col">Description</th>
            <th scope="col" className="text-right">Amount</th>
          </tr>
        </thead>
        <tbody>
          {isLoading && [...Array(4)].map((_, i) => <SkeletonRow key={i} />)}
          {!isLoading && expenses.length === 0 && (
            <tr>
              <td colSpan={4} className="empty-state">
                No expenses found. Add one above!
              </td>
            </tr>
          )}
          {!isLoading && expenses.map((expense) => (
            <tr key={expense.id}>
              <td className="col-date">{fmtDate(expense.date)}</td>
              <td>
                <span className={`badge badge-${expense.category.toLowerCase()}`}>
                  {expense.category}
                </span>
              </td>
              <td className="col-description">{expense.description}</td>
              <td className="col-amount text-right">{fmt(expense.amount)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
