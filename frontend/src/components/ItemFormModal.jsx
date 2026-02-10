import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { validateItem, validateField } from '../utils/validators';

const styles = {
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(45, 52, 54, 0.4)',
    backdropFilter: 'blur(8px)',
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'center',
    zIndex: 100,
    padding: 'var(--space-8)',
    overflowY: 'auto',
  },
  modal: {
    background: 'var(--bg-surface)',
    borderRadius: 'var(--radius-xl)',
    boxShadow: 'var(--shadow-xl)',
    width: '100%',
    maxWidth: '580px',
    marginTop: '20px',
    marginBottom: '20px',
    overflow: 'hidden',
  },
  header: {
    padding: 'var(--space-6)',
    borderBottom: '1px solid var(--border-light)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  titleWrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-4)',
  },
  titleIcon: {
    width: '44px',
    height: '44px',
    borderRadius: 'var(--radius-md)',
    background: 'var(--accent-subtle)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: '1.25rem',
    fontWeight: 600,
    color: 'var(--text-primary)',
  },
  subtitle: {
    fontSize: '0.85rem',
    color: 'var(--text-muted)',
    marginTop: '2px',
  },
  closeBtn: {
    width: '36px',
    height: '36px',
    borderRadius: 'var(--radius-sm)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'var(--text-muted)',
    transition: 'all var(--transition-fast)',
    cursor: 'pointer',
    background: 'transparent',
    border: 'none',
  },
  body: {
    padding: 'var(--space-6)',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--space-5)',
  },
  row: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 'var(--space-5)',
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--space-2)',
  },
  fieldFull: {
    gridColumn: '1 / -1',
  },
  label: {
    fontSize: '0.9rem',
    fontWeight: 500,
    color: 'var(--text-primary)',
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-1)',
  },
  required: {
    color: 'var(--accent)',
  },
  input: {
    padding: 'var(--space-3) var(--space-4)',
    background: 'var(--bg-subtle)',
    border: '1.5px solid var(--border)',
    borderRadius: 'var(--radius-md)',
    color: 'var(--text-primary)',
    fontSize: '0.95rem',
    transition: 'all var(--transition-fast)',
    outline: 'none',
  },
  inputError: {
    borderColor: 'var(--error)',
    background: 'var(--error-subtle)',
  },
  select: {
    padding: 'var(--space-3) var(--space-4)',
    background: 'var(--bg-subtle)',
    border: '1.5px solid var(--border)',
    borderRadius: 'var(--radius-md)',
    color: 'var(--text-primary)',
    fontSize: '0.95rem',
    cursor: 'pointer',
    outline: 'none',
  },
  textarea: {
    padding: 'var(--space-3) var(--space-4)',
    background: 'var(--bg-subtle)',
    border: '1.5px solid var(--border)',
    borderRadius: 'var(--radius-md)',
    color: 'var(--text-primary)',
    fontSize: '0.95rem',
    resize: 'vertical',
    minHeight: '90px',
    outline: 'none',
    fontFamily: 'inherit',
  },
  error: {
    fontSize: '0.8rem',
    color: 'var(--error)',
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-1)',
  },
  footer: {
    padding: 'var(--space-5) var(--space-6)',
    background: 'var(--bg-subtle)',
    display: 'flex',
    gap: 'var(--space-3)',
    justifyContent: 'flex-end',
  },
  button: {
    padding: 'var(--space-3) var(--space-6)',
    borderRadius: 'var(--radius-md)',
    fontSize: '0.95rem',
    fontWeight: 500,
    transition: 'all var(--transition-fast)',
    cursor: 'pointer',
  },
  cancelBtn: {
    background: 'var(--bg-surface)',
    border: '1px solid var(--border)',
    color: 'var(--text-secondary)',
  },
  submitBtn: {
    background: 'var(--accent)',
    border: '1px solid var(--accent)',
    color: 'white',
  },
};

const emptyForm = {
  sku: '',
  name: '',
  category: '',
  quantity: '',
  unitPrice: '',
  supplier: '',
  status: 'active',
  note: '',
};

export default function ItemFormModal({ isOpen, onClose, onSubmit, item, isLoading }) {
  const [formData, setFormData] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const firstInputRef = useRef(null);

  const isEdit = Boolean(item);

  useEffect(() => {
    if (isOpen) {
      if (item) {
        setFormData({
          sku: item.sku || '',
          name: item.name || '',
          category: item.category || '',
          quantity: item.quantity?.toString() || '',
          unitPrice: item.unitPrice?.toString() || '',
          supplier: item.supplier || '',
          status: item.status || 'active',
          note: item.note || '',
        });
      } else {
        setFormData(emptyForm);
      }
      setErrors({});
      setTouched({});
      setTimeout(() => firstInputRef.current?.focus(), 100);
    }
  }, [isOpen, item]);

  useEffect(() => {
    if (isOpen) {
      const handleEsc = (e) => {
        if (e.key === 'Escape' && !isLoading) onClose();
      };
      document.addEventListener('keydown', handleEsc);
      return () => document.removeEventListener('keydown', handleEsc);
    }
  }, [isOpen, isLoading, onClose]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (touched[name]) {
      const error = validateField(name, value, formData);
      setErrors((prev) => ({ ...prev, [name]: error }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    const error = validateField(name, value, formData);
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const validation = validateItem(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      setTouched(Object.keys(formData).reduce((acc, key) => ({ ...acc, [key]: true }), {}));
      return;
    }

    onSubmit({
      ...formData,
      quantity: parseInt(formData.quantity, 10),
      unitPrice: parseFloat(formData.unitPrice),
    });
  };

  const getInputStyle = (fieldName) => ({
    ...styles.input,
    ...(errors[fieldName] && touched[fieldName] ? styles.inputError : {}),
  });

  const handleFocus = (e) => {
    e.currentTarget.style.borderColor = 'var(--accent)';
    e.currentTarget.style.background = 'var(--bg-surface)';
  };

  const handleBlurStyle = (e, fieldName) => {
    e.currentTarget.style.borderColor = errors[fieldName] ? 'var(--error)' : 'var(--border)';
    e.currentTarget.style.background = errors[fieldName] ? 'var(--error-subtle)' : 'var(--bg-subtle)';
  };

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
            style={styles.modal}
            initial={{ opacity: 0, y: 30, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.98 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
          >
            <div style={styles.header}>
              <div style={styles.titleWrapper}>
                <div style={styles.titleIcon}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2">
                    {isEdit ? (
                      <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" strokeLinecap="round" strokeLinejoin="round" />
                    ) : (
                      <path d="M12 5v14m-7-7h14" strokeLinecap="round" strokeLinejoin="round" />
                    )}
                  </svg>
                </div>
                <div>
                  <h2 id="modal-title" style={styles.title}>
                    {isEdit ? 'Edit Item' : 'New Item'}
                  </h2>
                  <p style={styles.subtitle}>
                    {isEdit ? 'Update inventory details' : 'Add a new item to inventory'}
                  </p>
                </div>
              </div>
              <button
                style={styles.closeBtn}
                onClick={onClose}
                disabled={isLoading}
                aria-label="Close"
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'var(--bg-subtle)';
                  e.currentTarget.style.color = 'var(--text-primary)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = 'var(--text-muted)';
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div style={styles.body}>
                <div style={styles.form}>
                  <div style={styles.row}>
                    <div style={styles.field}>
                      <label style={styles.label}>
                        SKU <span style={styles.required}>*</span>
                      </label>
                      <input
                        ref={firstInputRef}
                        type="text"
                        name="sku"
                        value={formData.sku}
                        onChange={handleChange}
                        onBlur={(e) => { handleBlur(e); handleBlurStyle(e, 'sku'); }}
                        onFocus={handleFocus}
                        style={getInputStyle('sku')}
                        placeholder="e.g. SKU-0001"
                      />
                      {errors.sku && touched.sku && (
                        <span style={styles.error}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
                          </svg>
                          {errors.sku}
                        </span>
                      )}
                    </div>

                    <div style={styles.field}>
                      <label style={styles.label}>
                        Name <span style={styles.required}>*</span>
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        onBlur={(e) => { handleBlur(e); handleBlurStyle(e, 'name'); }}
                        onFocus={handleFocus}
                        style={getInputStyle('name')}
                        placeholder="Product name"
                      />
                      {errors.name && touched.name && (
                        <span style={styles.error}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
                          </svg>
                          {errors.name}
                        </span>
                      )}
                    </div>
                  </div>

                  <div style={styles.row}>
                    <div style={styles.field}>
                      <label style={styles.label}>Category</label>
                      <input
                        type="text"
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        onBlur={(e) => { handleBlur(e); handleBlurStyle(e, 'category'); }}
                        onFocus={handleFocus}
                        style={getInputStyle('category')}
                        placeholder="e.g. Electronics"
                      />
                      {errors.category && touched.category && (
                        <span style={styles.error}>{errors.category}</span>
                      )}
                    </div>

                    <div style={styles.field}>
                      <label style={styles.label}>Supplier</label>
                      <input
                        type="text"
                        name="supplier"
                        value={formData.supplier}
                        onChange={handleChange}
                        onBlur={(e) => { handleBlur(e); handleBlurStyle(e, 'supplier'); }}
                        onFocus={handleFocus}
                        style={getInputStyle('supplier')}
                        placeholder="Supplier name"
                      />
                      {errors.supplier && touched.supplier && (
                        <span style={styles.error}>{errors.supplier}</span>
                      )}
                    </div>
                  </div>

                  <div style={styles.row}>
                    <div style={styles.field}>
                      <label style={styles.label}>
                        Quantity <span style={styles.required}>*</span>
                      </label>
                      <input
                        type="number"
                        name="quantity"
                        value={formData.quantity}
                        onChange={handleChange}
                        onBlur={(e) => { handleBlur(e); handleBlurStyle(e, 'quantity'); }}
                        onFocus={handleFocus}
                        style={getInputStyle('quantity')}
                        placeholder="0"
                        min="0"
                        step="1"
                      />
                      {errors.quantity && touched.quantity && (
                        <span style={styles.error}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
                          </svg>
                          {errors.quantity}
                        </span>
                      )}
                    </div>

                    <div style={styles.field}>
                      <label style={styles.label}>
                        Unit Price <span style={styles.required}>*</span>
                      </label>
                      <input
                        type="number"
                        name="unitPrice"
                        value={formData.unitPrice}
                        onChange={handleChange}
                        onBlur={(e) => { handleBlur(e); handleBlurStyle(e, 'unitPrice'); }}
                        onFocus={handleFocus}
                        style={getInputStyle('unitPrice')}
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                      />
                      {errors.unitPrice && touched.unitPrice && (
                        <span style={styles.error}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
                          </svg>
                          {errors.unitPrice}
                        </span>
                      )}
                    </div>
                  </div>

                  <div style={styles.row}>
                    <div style={styles.field}>
                      <label style={styles.label}>
                        Status <span style={styles.required}>*</span>
                      </label>
                      <select
                        name="status"
                        value={formData.status}
                        onChange={handleChange}
                        onBlur={(e) => { handleBlur(e); handleBlurStyle(e, 'status'); }}
                        onFocus={handleFocus}
                        style={{
                          ...styles.select,
                          ...(errors.status && touched.status ? styles.inputError : {}),
                        }}
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                      </select>
                      {errors.status && touched.status && (
                        <span style={styles.error}>{errors.status}</span>
                      )}
                    </div>
                    <div style={styles.field} />
                  </div>

                  <div style={{ ...styles.field, ...styles.fieldFull }}>
                    <label style={styles.label}>Note</label>
                    <textarea
                      name="note"
                      value={formData.note}
                      onChange={handleChange}
                      onBlur={(e) => { handleBlur(e); handleBlurStyle(e, 'note'); }}
                      onFocus={handleFocus}
                      style={{
                        ...styles.textarea,
                        ...(errors.note && touched.note ? styles.inputError : {}),
                      }}
                      placeholder="Additional notes..."
                    />
                    {errors.note && touched.note && (
                      <span style={styles.error}>{errors.note}</span>
                    )}
                  </div>
                </div>
              </div>

              <div style={styles.footer}>
                <button
                  type="button"
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
                  type="submit"
                  style={{
                    ...styles.button,
                    ...styles.submitBtn,
                    opacity: isLoading ? 0.7 : 1,
                    cursor: isLoading ? 'not-allowed' : 'pointer',
                  }}
                  disabled={isLoading}
                  onMouseEnter={(e) => {
                    if (!isLoading) {
                      e.currentTarget.style.background = 'var(--accent-hover)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'var(--accent)';
                  }}
                >
                  {isLoading ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Item'}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
