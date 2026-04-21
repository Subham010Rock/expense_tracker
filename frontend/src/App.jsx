import { useState, useMemo } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ExpenseForm from './components/ExpenseForm';
import FilterBar from './components/FilterBar';
import ExpenseTable from './components/ExpenseTable';
import SummaryCard from './components/SummaryCard';
import { useExpenses } from './hooks/useExpenses';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: true,
    },
  },
});

function ExpenseApp() {
  const [filters, setFilters] = useState({ category: '', sort: 'date_desc' });

  const { data: expenses = [], isLoading, isError } = useExpenses({
    category: filters.category,
    sort: filters.sort,
  });

  // Derive unique categories from the full (unfiltered) list for the filter dropdown
  const { data: allExpenses = [] } = useExpenses({});
  const categories = useMemo(
    () => [...new Set(allExpenses.map((e) => e.category))].sort(),
    [allExpenses]
  );

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-inner">
          <div className="header-logo">
            <span className="logo-icon">₹</span>
            <h1>Expense Tracker</h1>
          </div>
          <p className="header-subtitle">Track where your money goes</p>
        </div>
      </header>

      <main className="app-main">
        <ExpenseForm />

        <section className="list-section" aria-label="Expense history">
          <div className="list-header">
            <h2>Expense History</h2>
            {!isLoading && !isError && (
              <span className="expense-count">
                {expenses.length} {expenses.length === 1 ? 'entry' : 'entries'}
              </span>
            )}
          </div>

          <FilterBar
            categories={categories}
            filters={filters}
            onChange={setFilters}
          />

          {!isLoading && !isError && expenses.length > 0 && (
            <SummaryCard expenses={expenses} />
          )}

          <ExpenseTable
            expenses={expenses}
            isLoading={isLoading}
            isError={isError}
          />
        </section>
      </main>

      <footer className="app-footer">
        <p>Fenmo SDE Assessment · Built with React + Express + SQLite</p>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ExpenseApp />
    </QueryClientProvider>
  );
}
