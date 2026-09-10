function getPageNumbers(current, totalPages) {
  const delta = 1
  const pages = []
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= current - delta && i <= current + delta)) {
      pages.push(i)
    } else if (pages[pages.length - 1] !== '…') {
      pages.push('…')
    }
  }
  return pages
}

export function Pagination({
  page,
  pageSize,
  total,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 25, 50, 100],
  showPageSize = true,
  showPageNumbers = true,
}) {
  const totalPages = pageSize === -1 ? 1 : Math.max(1, Math.ceil(total / pageSize))
  const clampedPage = Math.min(page, totalPages)
  const rangeStart = total === 0 ? 0 : (clampedPage - 1) * pageSize + 1
  const rangeEnd = pageSize === -1 ? total : Math.min(clampedPage * pageSize, total)

  return (
    <div className="table-pagination">
      <div className="table-pagination-info">
        {total === 0 ? 'No results' : `${rangeStart}–${rangeEnd} of ${total}`}
      </div>

      {showPageSize && (
        <label className="table-pagination-size">
          Rows per page
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
          >
            {pageSizeOptions.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
            <option value={-1}>All</option>
          </select>
        </label>
      )}

      <div className="table-pagination-controls">
        <button
          type="button"
          className="table-pagination-btn"
          onClick={() => onPageChange(1)}
          disabled={clampedPage <= 1}
          aria-label="First page"
        >
          «
        </button>
        <button
          type="button"
          className="table-pagination-btn"
          onClick={() => onPageChange(clampedPage - 1)}
          disabled={clampedPage <= 1}
          aria-label="Previous page"
        >
          ‹
        </button>

        {showPageNumbers &&
          getPageNumbers(clampedPage, totalPages).map((p, idx) =>
            p === '…' ? (
              <span key={`ellipsis-${idx}`} className="table-pagination-ellipsis">
                …
              </span>
            ) : (
              <button
                type="button"
                key={p}
                className={`table-pagination-btn${p === clampedPage ? ' table-pagination-btn--active' : ''}`}
                onClick={() => onPageChange(p)}
                aria-current={p === clampedPage ? 'page' : undefined}
              >
                {p}
              </button>
            ),
          )}

        <button
          type="button"
          className="table-pagination-btn"
          onClick={() => onPageChange(clampedPage + 1)}
          disabled={clampedPage >= totalPages}
          aria-label="Next page"
        >
          ›
        </button>
        <button
          type="button"
          className="table-pagination-btn"
          onClick={() => onPageChange(totalPages)}
          disabled={clampedPage >= totalPages}
          aria-label="Last page"
        >
          »
        </button>
      </div>
    </div>
  )
}
