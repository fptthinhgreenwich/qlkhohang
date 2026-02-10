import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';

const styles = {
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(45, 52, 54, 0.4)',
    backdropFilter: 'blur(8px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
    padding: 'var(--space-6)',
  },
  dialog: {
    background: 'var(--bg-surface)',
    borderRadius: 'var(--radius-xl)',
    boxShadow: 'var(--shadow-xl)',
    width: '100%',
    maxWidth: '400px',
    overflow: 'hidden',
  },
  header: {
    padding: 'var(--space-6)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    borderBottom: '1px solid var(--border-light)',
  },
  iconWrapper: {
    width: '64px',
    height: '64px',
    borderRadius: '50%',
    background: 'var(--error-subtle)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 'var(--space-4)',
  },
  title: {
    fontSize: '1.2rem',
    fontWeight: 600,
    color: 'var(--text-primary)',
    marginBottom: 'var(--space-2)',
  },
  body: {
    padding: 'var(--space-5) var(--space-6)',
  },
  message: {
    color: 'var(--text-secondary)',
    lineHeight: 1.6,
    textAlign: 'center',
  },
  itemName: {
    color: 'var(--text-primary)',
    fontWeight: 600,
    fontFamily: 'var(--font-data)',
  },
  footer: {
    padding: 'var(--space-4) var(--space-6)',
    background: 'var(--bg-subtle)',
    display: 'flex',
    gap: 'var(--space-3)',
    justifyContent: 'center',
  },
  button: {
    padding: 'var(--space-3) var(--space-6)',
    borderRadius: 'var(--radius-md)',
    fontSize: '0.95rem',
    fontWeight: 500,
    transition: 'all var(--transition-fast)',
    cursor: 'pointer',
    minWidth: '120px',
  },
  cancelBtn: {
    background: 'var(--bg-surface)',
    border: '1px solid var(--border)',
    color: 'var(--text-secondary)',
  },
  deleteBtn: {
    background: 'var(--error)',
    border: '1px solid var(--error)',
    color: 'white',
  },
};

export default function ConfirmDialog({ isOpen, onClose, onConfirm, title, message, itemName, isLoading }) {
  const confirmBtnRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      confirmBtnRef.current?.focus();
      const handleEsc = (e) => {
        if (e.key === 'Escape' && !isLoading) onClose();
      };
      document.addEventListener('keydown', handleEsc);
      return () => document.removeEventListener('keydown', handleEsc);
    }
  }, [isOpen, isLoading, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          style={styles.overlay}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={(e) => {
            if (e.target === e.currentTarget && !isLoading) onClose();
          }}
        >
          <motion.div
            style={styles.dialog}
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="confirm-title"
          >
            <div style={styles.header}>
              <div style={styles.iconWrapper}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--error)" strokeWidth="2">
                  <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M10 11v6M14 11v6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <h2 id="confirm-title" style={styles.title}>{title || 'Delete Item'}</h2>
            </div>

            <div style={styles.body}>
              <p style={styles.message}>
                {message || 'Are you sure you want to delete'}{' '}
                {itemName && <span style={styles.itemName}>"{itemName}"</span>}
                {itemName ? '?' : ''}<br />
                <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>This action cannot be undone.</span>
              </p>
            </div>

            <div style={styles.footer}>
              <button
                style={{ ...styles.button, ...styles.cancelBtn }}
                onClick={onClose}
                disabled={isLoading}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--text-muted)';
                  e.currentTarget.style.color = 'var(--text-primary)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border)';
                  e.currentTarget.style.color = 'var(--text-secondary)';
                }}
              >
                Cancel
              </button>
              <button
                ref={confirmBtnRef}
                style={{
                  ...styles.button,
                  ...styles.deleteBtn,
                  opacity: isLoading ? 0.7 : 1,
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                }}
                onClick={onConfirm}
                disabled={isLoading}
                onMouseEnter={(e) => {
                  if (!isLoading) {
                    e.currentTarget.style.background = '#d65a5a';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'var(--error)';
                }}
              >
                {isLoading ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
