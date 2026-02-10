import { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'motion/react';
import ItemTable from '../components/ItemTable';
import ItemFormModal from '../components/ItemFormModal';
import ConfirmDialog from '../components/ConfirmDialog';
import Toast from '../components/Toast';
import { fetchItems, createItem, updateItem, deleteItem } from '../api/itemsApi';

const styles = {
  page: {
    minHeight: '100vh',
    padding: 'var(--space-6) var(--space-8)',
    maxWidth: '1440px',
    margin: '0 auto',
  },
  header: {
    marginBottom: 'var(--space-6)',
  },
  titleRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 'var(--space-6)',
    flexWrap: 'wrap',
    gap: 'var(--space-4)',
  },
  titleWrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-4)',
  },
  logo: {
    width: '46px',
    height: '46px',
    background: 'var(--accent)',
    borderRadius: 'var(--radius-lg)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: '1.5rem',
    fontWeight: 600,
    color: 'var(--text-primary)',
  },
  subtitle: {
    fontSize: '0.9rem',
    color: 'var(--text-muted)',
    marginTop: '2px',
  },
  addBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-2)',
    padding: 'var(--space-3) var(--space-5)',
    background: 'var(--accent)',
    border: 'none',
    borderRadius: 'var(--radius-md)',
    color: 'white',
    fontSize: '0.9rem',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'all var(--transition-fast)',
  },
  controlsRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 'var(--space-4)',
    flexWrap: 'wrap',
  },
  searchWrapper: {
    position: 'relative',
    flex: '1 1 300px',
    maxWidth: '400px',
  },
  searchIcon: {
    position: 'absolute',
    left: 'var(--space-3)',
    top: '50%',
    transform: 'translateY(-50%)',
    color: 'var(--text-muted)',
    pointerEvents: 'none',
  },
  searchInput: {
    width: '100%',
    padding: 'var(--space-3) var(--space-4)',
    paddingLeft: '40px',
    background: 'var(--bg-surface)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-md)',
    color: 'var(--text-primary)',
    fontSize: '0.9rem',
    outline: 'none',
    transition: 'all var(--transition-fast)',
  },
  rightControls: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-3)',
  },
  filterWrapper: {
    display: 'flex',
    alignItems: 'center',
    background: 'var(--bg-surface)',
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--border)',
    overflow: 'hidden',
  },
  filterBtn: {
    padding: 'var(--space-3) var(--space-4)',
    background: 'transparent',
    border: 'none',
    color: 'var(--text-secondary)',
    fontSize: '0.85rem',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'all var(--transition-fast)',
    borderRight: '1px solid var(--border)',
  },
  filterBtnLast: {
    borderRight: 'none',
  },
  filterBtnActive: {
    background: 'var(--accent-subtle)',
    color: 'var(--accent)',
  },
  statBadge: {
    padding: 'var(--space-2) var(--space-4)',
    background: 'var(--bg-surface)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-md)',
    fontSize: '0.85rem',
    color: 'var(--text-secondary)',
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-2)',
  },
  statValue: {
    fontWeight: 600,
    color: 'var(--text-primary)',
  },
};

export default function InventoryPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [meta, setMeta] = useState({ page: 1, pageSize: 10, total: 0 });
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [saving, setSaving] = useState(false);
  const [toasts, setToasts] = useState([]);
  const searchTimeoutRef = useRef(null);

  const addToast = useCallback((toast) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { ...toast, id }]);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const loadItems = useCallback(async (params = {}) => {
    setLoading(true);
    try {
      const result = await fetchItems({
        search,
        status: statusFilter,
        page: meta.page,
        pageSize: meta.pageSize,
        ...params,
      });
      setItems(result.data);
      setMeta(result.meta);
    } catch (error) {
      addToast({ type: 'error', title: 'Error', message: 'Failed to load items' });
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, meta.page, meta.pageSize, addToast]);

  useEffect(() => {
    loadItems();
  }, []);

  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    searchTimeoutRef.current = setTimeout(() => {
      loadItems({ page: 1 });
    }, 300);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [search, statusFilter]);

  const handlePageChange = (page) => {
    setMeta((prev) => ({ ...prev, page }));
    loadItems({ page });
  };

  const handleAddClick = () => {
    setSelectedItem(null);
    setModalOpen(true);
  };

  const handleEdit = (item) => {
    setSelectedItem(item);
    setModalOpen(true);
  };

  const handleDelete = (item) => {
    setItemToDelete(item);
    setConfirmOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setSelectedItem(null);
  };

  const handleConfirmClose = () => {
    setConfirmOpen(false);
    setItemToDelete(null);
  };

  const handleSubmit = async (data) => {
    setSaving(true);
    try {
      if (selectedItem) {
        await updateItem(selectedItem.id, data);
        addToast({ type: 'success', title: 'Updated', message: `${data.name} has been updated` });
      } else {
        await createItem(data);
        addToast({ type: 'success', title: 'Created', message: `${data.name} has been added` });
      }
      handleModalClose();
      loadItems();
    } catch (error) {
      if (error.errors) {
        addToast({
          type: 'error',
          title: 'Validation Error',
          message: Object.values(error.errors).join(', '),
        });
      } else {
        addToast({ type: 'error', title: 'Error', message: error.message });
      }
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;
    setSaving(true);
    try {
      await deleteItem(itemToDelete.id);
      addToast({ type: 'success', title: 'Deleted', message: `${itemToDelete.name} has been removed` });
      handleConfirmClose();
      loadItems();
    } catch (error) {
      addToast({ type: 'error', title: 'Error', message: error.message });
    } finally {
      setSaving(false);
    }
  };

  const filterOptions = [
    { value: '', label: 'All' },
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
  ];

  return (
    <motion.div
      style={styles.page}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <header style={styles.header}>
        <div style={styles.titleRow}>
          <motion.div
            style={styles.titleWrapper}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div style={styles.logo}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div>
              <h1 style={styles.title}>Inventory</h1>
              <p style={styles.subtitle}>Manage stock and products</p>
            </div>
          </motion.div>

          <motion.button
            style={styles.addBtn}
            onClick={handleAddClick}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            whileHover={{ background: 'var(--accent-hover)' }}
            whileTap={{ scale: 0.98 }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 5v14m-7-7h14" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Add Item
          </motion.button>
        </div>

        <motion.div
          style={styles.controlsRow}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div style={styles.searchWrapper}>
            <div style={styles.searchIcon}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.35-4.35" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search items..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={styles.searchInput}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = 'var(--accent)';
                e.currentTarget.style.boxShadow = '0 0 0 3px var(--accent-light)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = 'var(--border)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            />
          </div>

          <div style={styles.rightControls}>
            <div style={styles.statBadge}>
              <span>Total:</span>
              <span style={styles.statValue}>{meta.total}</span>
            </div>

            <div style={styles.filterWrapper}>
              {filterOptions.map((option, idx) => (
                <button
                  key={option.value}
                  style={{
                    ...styles.filterBtn,
                    ...(idx === filterOptions.length - 1 ? styles.filterBtnLast : {}),
                    ...(statusFilter === option.value ? styles.filterBtnActive : {}),
                  }}
                  onClick={() => setStatusFilter(option.value)}
                  onMouseEnter={(e) => {
                    if (statusFilter !== option.value) {
                      e.currentTarget.style.background = 'var(--bg-subtle)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (statusFilter !== option.value) {
                      e.currentTarget.style.background = 'transparent';
                    }
                  }}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      </header>

      <motion.main
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
      >
        <ItemTable
          items={items}
          loading={loading}
          meta={meta}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onPageChange={handlePageChange}
        />
      </motion.main>

      <ItemFormModal
        isOpen={modalOpen}
        onClose={handleModalClose}
        onSubmit={handleSubmit}
        item={selectedItem}
        isLoading={saving}
      />

      <ConfirmDialog
        isOpen={confirmOpen}
        onClose={handleConfirmClose}
        onConfirm={handleConfirmDelete}
        title="Delete Item"
        message="Are you sure you want to delete"
        itemName={itemToDelete?.name}
        isLoading={saving}
      />

      <Toast toasts={toasts} onRemove={removeToast} />
    </motion.div>
  );
}
