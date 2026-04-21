export default function FilterBar({ categories, filters, onChange }) {
  return (
    <div className="filter-bar" role="search" aria-label="Filter and sort expenses">
      <div className="filter-group">
        <label htmlFor="filter-category">Category</label>
        <select
          id="filter-category"
          value={filters.category}
          onChange={(e) => onChange({ ...filters, category: e.target.value })}
        >
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      <div className="filter-group">
        <label htmlFor="filter-sort">Sort</label>
        <select
          id="filter-sort"
          value={filters.sort}
          onChange={(e) => onChange({ ...filters, sort: e.target.value })}
        >
          <option value="">Default (newest added)</option>
          <option value="date_desc">Date (newest first)</option>
        </select>
      </div>

      {(filters.category || filters.sort) && (
        <button
          className="btn-ghost"
          onClick={() => onChange({ category: '', sort: '' })}
          id="clear-filters"
        >
          Clear filters
        </button>
      )}
    </div>
  );
}
