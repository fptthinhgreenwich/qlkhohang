import { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

const styles = {
  container: {
    position: 'fixed',
    bottom: 'var(--space-6)',
    right: 'var(--space-6)',
    zIndex: 200,
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--space-3)',
  },
  toast: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-4)',
    padding: 'var(--space-4) var(--space-5)',
    background: 'var(--bg-surface)',
    borderRadius: 'var(--radius-lg)',
    boxShadow: 'var(--shadow-lg)',
    minWidth: '320px',
    maxWidth: '420px',
    border: '1px solid var(--border-light)',
  },
  iconWrapper: {
    width: '36px',
    height: '36px',
    borderRadius: 'var(--radius-md)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  iconSuccess: {
    background: 'var(--success-subtle)',
    color: 'var(--success)',
  },
  iconError: {
    background: 'var(--error-subtle)',
    color: 'var(--error)',
  },
  iconInfo: {
    background: 'var(--accent-subtle)',
    color: 'var(--accent)',
  },
  content: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    fontSize: '0.95rem',
    fontWeight: 600,
    color: 'var(--text-primary)',
    marginBottom: '2px',
  },
  message: {
    fontSize: '0.85rem',
    color: 'var(--text-secondary)',
    lineHeight: 1.4,
  },
  closeBtn: {
    width: '28px',
    height: '28px',
    borderRadius: 'var(--radius-sm)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'transparent',
    border: 'none',
    color: 'var(--text-muted)',
    cursor: 'pointer',
    transition: 'all var(--transition-fast)',
    flexShrink: 0,
  },
};

function ToastItem({ toast, onRemove }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onRemove(toast.id);
    }, toast.duration || 4000);

    return () => clearTimeout(timer);
  }, [toast, onRemove]);

  const isSuccess = toast.type === 'success';
  const isError = toast.type === 'error';

  return (
    <motion.div
      style={styles.toast}
      initial={{ opacity: 0, x: 50, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 50, scale: 0.95 }}
      transition={{ type: 'spring', damping: 20, stiffness: 300 }}
    >
      <div style={{
        ...styles.iconWrapper,
        ...(isSuccess ? styles.iconSuccess : isError ? styles.iconError : styles.iconInfo),
      }}>
        {isSuccess ? (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        ) : isError ? (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <circle cx="12" cy="12" r="10" strokeWidth="2" />
            <path d="M15 9l-6 6M9 9l6 6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        ) : (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <circle cx="12" cy="12" r="10" strokeWidth="2" />
            <path d="M12 16v-4M12 8h.01" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </div>
      <div style={styles.content}>
        <div style={styles.title}>{toast.title}</div>
        {toast.message && <div style={styles.message}>{toast.message}</div>}
      </div>
      <button
        style={styles.closeBtn}
        onClick={() => onRemove(toast.id)}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'var(--bg-subtle)';
          e.currentTarget.style.color = 'var(--text-secondary)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'transparent';
          e.currentTarget.style.color = 'var(--text-muted)';
        }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    </motion.div>
  );
}

export default function Toast({ toasts, onRemove }) {
  return (
    <div style={styles.container}>
      <AnimatePresence>
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
        ))}
      </AnimatePresence>
    </div>
  );
}
