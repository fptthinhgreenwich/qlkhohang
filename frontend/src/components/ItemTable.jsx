import { motion } from 'motion/react';

const styles = {
  container: {
    background: 'var(--bg-surface)',
    borderRadius: 'var(--radius-xl)',
    boxShadow: 'var(--shadow-md)',
    overflow: 'hidden',
    border: '1px solid var(--border-light)',
  },
  tableWrapper: {
    overflowX: 'auto',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '0.95rem',
  },
  thead: {
    background: 'var(--bg-subtle)',
  },
  th: {
    padding: 'var(--space-4) var(--space-5)',
    textAlign: 'left',
    fontWeight: 600,
    color: 'var(--text-secondary)',
    fontSize: '0.8rem',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    borderBottom: '1px solid var(--border)',
    whiteSpace: 'nowrap',
  },
  td: {
    padding: 'var(--space-4) var(--space-5)',
    borderBottom: '1px solid var(--border-light)',
    verticalAlign: 'middle',
  },
  row: {
    transition: 'background var(--transition-fast)',
    background: 'var(--bg-surface)',
  },
  sku: {
    fontFamily: 'var(--font-data)',
    fontWeight: 600,
    color: 'var(--accent)',
    fontSize: '0.95rem',
  },
  name: {
    color: 'var(--text-primary)',
    fontWeight: 500,
    maxWidth: '220px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  category: {
    color: 'var(--text-secondary)',
  },
  quantity: {
    fontFamily: 'var(--font-data)',
    fontWeight: 600,
    color: 'var(--text-primary)',
  },
  quantityLow: {
    color: 'var(--error)',
  },
  price: {
    fontFamily: 'var(--font-data)',
    color: 'var(--text-primary)',
  },
  statusBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '5px 12px',
    borderRadius: 'var(--radius-md)',
    fontSize: '0.8rem',
    fontWeight: 500,
  },
  statusActive: {
    background: 'var(--success-subtle)',
    color: 'var(--success)',
  },
  statusInactive: {
    background: 'var(--bg-muted)',
    color: 'var(--text-muted)',
  },
  statusDot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    background: 'currentColor',
  },
  date: {
    color: 'var(--text-muted)',
    fontSize: '0.85rem',
  },
  actions: {
    display: 'flex',
    gap: 'var(--space-2)',
  },
  actionBtn: {
    width: '34px',
    height: '34px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'var(--bg-subtle)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-sm)',
    color: 'var(--text-muted)',
    cursor: 'pointer',
    transition: 'all var(--transition-fast)',
  },
  emptyState: {
    padding: 'var(--space-16)',
    textAlign: 'center',
    color: 'var(--text-muted)',
  },
  emptyIcon: {
    marginBottom: 'var(--space-4)',
    opacity: 0.4,
  },
  emptyText: {
    fontSize: '1rem',
    color: 'var(--text-secondary)',
  },
  emptySubtext: {
    fontSize: '0.9rem',
    color: 'var(--text-muted)',
    marginTop: 'var(--space-2)',
  },
  loadingOverlay: {
    position: 'absolute',
    inset: 0,
    background: 'rgba(248, 250, 252, 0.9)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    borderRadius: 'var(--radius-xl)',
  },
  spinner: {
    width: '36px',
    height: '36px',
    border: '3px solid var(--border)',
    borderTopColor: 'var(--accent)',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  },
  pagination: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 'var(--space-4) var(--space-5)',
    borderTop: '1px solid var(--border-light)',
    background: 'var(--bg-subtle)',
  },
  pageInfo: {
    fontSize: '0.9rem',
    color: 'var(--text-secondary)',
  },
  pageControls: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-2)',
  },
  pageBtn: {
    width: '36px',
    height: '36px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'var(--bg-surface)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-sm)',
    color: 'var(--text-secondary)',
    fontSize: '0.9rem',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'all var(--transition-fast)',
  },
  pageBtnActive: {
    background: 'var(--accent)',
    borderColor: 'var(--accent)',
    color: 'white',
  },
  pageBtnDisabled: {
    opacity: 0.4,
    cursor: 'not-allowed',
  },
};

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function formatPrice(price) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(price);
}

export default function ItemTable({ items, loading, meta, onEdit, onDelete, onPageChange }) {
  const totalPages = Math.ceil((meta?.total || 0) / (meta?.pageSize || 10));
  const currentPage = meta?.page || 1;

  const renderPagination = () => {
    if (!meta || meta.total <= meta.pageSize) return null;

    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return (
      <div style={styles.pagination}>
        <span style={styles.pageInfo}>
          Showing {((currentPage - 1) * meta.pageSize) + 1}-{Math.min(currentPage * meta.pageSize, meta.total)} of {meta.total} items
        </span>
        <div style={styles.pageControls}>
          <button
            style={{
              ...styles.pageBtn,
              ...(currentPage === 1 ? styles.pageBtnDisabled : {}),
            }}
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            onMouseEnter={(e) => {
              if (currentPage !== 1) {
                e.currentTarget.style.borderColor = 'var(--accent)';
                e.currentTarget.style.color = 'var(--accent)';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--border)';
              e.currentTarget.style.color = 'var(--text-secondary)';
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          {pages.map((page) => (
            <button
              key={page}
              style={{
                ...styles.pageBtn,
                ...(page === currentPage ? styles.pageBtnActive : {}),
              }}
              onClick={() => onPageChange(page)}
              onMouseEnter={(e) => {
                if (page !== currentPage) {
                  e.currentTarget.style.borderColor = 'var(--accent)';
                  e.currentTarget.style.color = 'var(--accent)';
                }
              }}
              onMouseLeave={(e) => {
                if (page !== currentPage) {
                  e.currentTarget.style.borderColor = 'var(--border)';
                  e.currentTarget.style.color = 'var(--text-secondary)';
                }
              }}
            >
              {page}
            </button>
          ))}

          <button
            style={{
              ...styles.pageBtn,
              ...(currentPage === totalPages ? styles.pageBtnDisabled : {}),
            }}
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            onMouseEnter={(e) => {
              if (currentPage !== totalPages) {
                e.currentTarget.style.borderColor = 'var(--accent)';
                e.currentTarget.style.color = 'var(--accent)';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--border)';
              e.currentTarget.style.color = 'var(--text-secondary)';
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </div>
    );
  };

  return (
    <div style={{ ...styles.container, position: 'relative' }}>
      {loading && (
        <div style={styles.loadingOverlay}>
          <div style={styles.spinner} />
        </div>
      )}

      <style>{`
        .table-row:hover {
          background: var(--bg-subtle) !important;
        }
      `}</style>

      <div style={styles.tableWrapper}>
        <table style={styles.table}>
          <thead style={styles.thead}>
            <tr>
              <th style={styles.th}>SKU</th>
              <th style={styles.th}>Name</th>
              <th style={styles.th}>Category</th>
              <th style={styles.th}>Qty</th>
              <th style={styles.th}>Unit Price</th>
              <th style={styles.th}>Status</th>
              <th style={styles.th}>Updated</th>
              <th style={{ ...styles.th, textAlign: 'center' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 && !loading ? (
              <tr>
                <td colSpan="8" style={styles.emptyState}>
                  <div style={styles.emptyIcon}>
                    <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1.5">
                      <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <p style={styles.emptyText}>No items found</p>
                  <p style={styles.emptySubtext}>Try adjusting your search or add a new item</p>
                </td>
              </tr>
            ) : (
              items.map((item, index) => (
                <motion.tr
                  key={item.id}
                  className="table-row"
                  style={styles.row}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03, duration: 0.2 }}
                >
                  <td style={{ ...styles.td, ...styles.sku }}>{item.sku}</td>
                  <td style={{ ...styles.td, ...styles.name }} title={item.name}>{item.name}</td>
                  <td style={{ ...styles.td, ...styles.category }}>{item.category || '—'}</td>
                  <td style={{
                    ...styles.td,
                    ...styles.quantity,
                    ...(item.quantity <= 5 ? styles.quantityLow : {}),
                  }}>
                    {item.quantity}
                  </td>
                  <td style={{ ...styles.td, ...styles.price }}>{formatPrice(item.unitPrice)}</td>
                  <td style={styles.td}>
                    <span style={{
                      ...styles.statusBadge,
                      ...(item.status === 'active' ? styles.statusActive : styles.statusInactive),
                    }}>
                      <span style={styles.statusDot} />
                      {item.status === 'active' ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td style={{ ...styles.td, ...styles.date }}>{formatDate(item.updatedAt)}</td>
                  <td style={{ ...styles.td, textAlign: 'center' }}>
                    <div style={styles.actions}>
                      <button
                        style={styles.actionBtn}
                        onClick={() => onEdit(item)}
                        title="Edit"
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = 'var(--accent)';
                          e.currentTarget.style.color = 'var(--accent)';
                          e.currentTarget.style.background = 'var(--accent-subtle)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = 'var(--border)';
                          e.currentTarget.style.color = 'var(--text-muted)';
                          e.currentTarget.style.background = 'var(--bg-subtle)';
                        }}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </button>
                      <button
                        style={styles.actionBtn}
                        onClick={() => onDelete(item)}
                        title="Delete"
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = 'var(--error)';
                          e.currentTarget.style.color = 'var(--error)';
                          e.currentTarget.style.background = 'var(--error-subtle)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = 'var(--border)';
                          e.currentTarget.style.color = 'var(--text-muted)';
                          e.currentTarget.style.background = 'var(--bg-subtle)';
                        }}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2M10 11v6M14 11v6" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {renderPagination()}
    </div>
  );
}
