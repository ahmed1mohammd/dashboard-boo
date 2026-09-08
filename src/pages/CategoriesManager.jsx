import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Layers, Check, X, AlertCircle } from 'lucide-react';
import { adminApi } from '../api/adminApi';
import Modal from '../components/Common/Modal';
import ConfirmModal from '../components/Common/ConfirmModal';

export default function CategoriesManager() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const initialForm = {
    name: '',
    slug: '',
    icon: 'Cpu',
    description: '',
    order: 0,
    isActive: true
  };
  const [formData, setFormData] = useState(initialForm);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const res = await adminApi.getCategories();
      if (res.success) setCategories(res.data);
    } catch (err) {
      console.error('Failed to load categories', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleOpenAdd = () => {
    setEditingCategory(null);
    setFormData(initialForm);
    setError(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (cat) => {
    setEditingCategory(cat);
    setFormData({
      name: cat.name,
      slug: cat.slug,
      icon: cat.icon || 'Cpu',
      description: cat.description || '',
      order: cat.order || 0,
      isActive: cat.isActive
    });
    setError(null);
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      if (editingCategory) {
        await adminApi.updateCategory(editingCategory._id, formData);
      } else {
        await adminApi.createCategory(formData);
      }
      setModalOpen(false);
      loadCategories();
    } catch (err) {
      setError(err.message || 'Failed to save category');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!categoryToDelete) return;
    try {
      setSubmitting(true);
      await adminApi.deleteCategory(categoryToDelete._id);
      setDeleteConfirmOpen(false);
      setCategoryToDelete(null);
      loadCategories();
    } catch (err) {
      console.error('Delete error', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="admin-categories-manager">
      <div className="admin-card">
        <div className="admin-card-header">
          <div>
            <h2 style={{ fontSize: '1.4rem', margin: 0 }}>Spare Part Categories</h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>
              Organize parts catalog taxonomy and navigation filters
            </p>
          </div>

          <button type="button" className="btn btn-primary" onClick={handleOpenAdd}>
            <Plus size={16} />
            <span>Add Category</span>
          </button>
        </div>

        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Category Name</th>
                <th>Slug</th>
                <th>Icon</th>
                <th>Display Order</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '2rem' }}>
                    Loading categories...
                  </td>
                </tr>
              ) : categories.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    No categories created yet.
                  </td>
                </tr>
              ) : (
                categories.map((cat) => (
                  <tr key={cat._id}>
                    <td>
                      <strong style={{ color: 'var(--heading)' }}>{cat.name}</strong>
                    </td>
                    <td>
                      <span style={{ fontFamily: 'monospace', color: 'var(--primary)' }}>{cat.slug}</span>
                    </td>
                    <td>{cat.icon}</td>
                    <td>{cat.order}</td>
                    <td>
                      {cat.isActive ? (
                        <span className="badge badge-success">Active</span>
                      ) : (
                        <span className="badge badge-danger">Disabled</span>
                      )}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                        <button
                          type="button"
                          className="btn btn-outline btn-sm btn-icon"
                          onClick={() => handleOpenEdit(cat)}
                          title="Edit Category"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          type="button"
                          className="btn btn-danger btn-sm btn-icon"
                          onClick={() => {
                            setCategoryToDelete(cat);
                            setDeleteConfirmOpen(true);
                          }}
                          title="Delete Category"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingCategory ? `Edit Category: ${editingCategory.name}` : 'Add New Category'}
        maxWidth="520px"
      >
        {error && (
          <div style={{ backgroundColor: '#fee2e2', color: '#dc2626', padding: '0.65rem 1rem', borderRadius: '4px', marginBottom: '1rem', fontSize: '0.85rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Category Name *</label>
            <input
              type="text"
              required
              className="form-input"
              placeholder="e.g. Engine Parts"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label>Slug (URL identifier)</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. engine-parts (auto-generated if empty)"
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
            />
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label>Icon Identifier</label>
              <select
                className="form-select"
                value={formData.icon}
                onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
              >
                <option value="Cpu">Cpu (Engine)</option>
                <option value="Disc">Disc (Brake)</option>
                <option value="Sliders">Sliders (Suspension)</option>
                <option value="Zap">Zap (Electrical)</option>
                <option value="Filter">Filter (Filters)</option>
                <option value="Sparkles">Sparkles (Accessories)</option>
              </select>
            </div>

            <div className="form-group">
              <label>Display Order</label>
              <input
                type="number"
                className="form-input"
                value={formData.order}
                onChange={(e) => setFormData({ ...formData, order: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Description (Optional)</label>
            <textarea
              rows={2}
              className="form-textarea"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div style={{ margin: '1rem 0' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: '600', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              />
              <span>Active in Navigation</span>
            </label>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button type="button" className="btn btn-outline" onClick={() => setModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Saving...' : editingCategory ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmModal
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={handleDeleteConfirm}
        title={`Delete ${categoryToDelete?.name}`}
        message="Are you sure you want to delete this category?"
        loading={submitting}
      />
    </div>
  );
}
