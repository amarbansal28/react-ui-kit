import { useTableContext } from './TableContext'
import { Pagination } from './Pagination'

export function TableFooter() {
  const {
    pagination,
    page,
    pageSize,
    total,
    goToPage,
    updatePageSize,
    mode,
    lazyLoadMore,
    hasMore,
    loadingMore,
  } = useTableContext()

  if (mode === 'lazy') {
    if (!pagination?.visible) return null
    return (
      <tfoot className="table-footer">
        <tr>
          <td colSpan={999}>
            <div className="table-lazy-footer">
              {hasMore ? (
                <button
                  type="button"
                  className="table-lazy-load-btn"
                  onClick={lazyLoadMore}
                  disabled={loadingMore}
                >
                  {loadingMore ? 'Loading…' : 'Load more'}
                </button>
              ) : (
                <span className="table-lazy-end">All rows loaded</span>
              )}
            </div>
          </td>
        </tr>
      </tfoot>
    )
  }

  if (!pagination.visible) return null

  return (
    <tfoot className="table-footer">
      <tr>
        <td colSpan={999}>
          <Pagination
            page={page}
            pageSize={pageSize}
            total={total}
            onPageChange={goToPage}
            onPageSizeChange={updatePageSize}
            pageSizeOptions={pagination.pageSizeOptions}
            showPageSize={pagination.showPageSize}
            showPageNumbers={pagination.showPageNumbers}
          />
        </td>
      </tr>
    </tfoot>
  )
}
