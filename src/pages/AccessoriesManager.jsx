import React, { useState, useEffect } from 'react';
import { Plus, Search, Layers, Edit2, Trash2, Package, AlertTriangle } from 'lucide-react';
import { adminApi } from '../api/adminApi';
import Modal from '../components/Common/Modal';
import ConfirmModal from '../components/Common/ConfirmModal';
import ImageUploader from '../components/Common/ImageUploader';

export default function AccessoriesManager() {
  const [accessories, setAccessories] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [lowStockFilter, setLowStockFilter] = useState(false);

  // Modal States
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const initialForm = {
    name: '',
    sku: '',
    category: '',
    categorySlug: 'accessories',
    brand: '',
    price: '',
    stock: 10,
    minimumStock: 3,
    shortDescription: '',
    description: '',
    compatibility: '',
    isActive: true,
    featured: false
  };
  const [formData, setFormData] = useState(initialForm);
  const [newImageFiles, setNewImageFiles] = useState([]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [accRes, catsRes] = await Promise.all([
        adminApi.getAccessories({
          search: searchTerm || undefined,
          category: categoryFilter !== 'all' ? categoryFilter : undefined,
          lowStock: lowStockFilter ? 'true' : undefined
        }),
        adminApi.getCategories()
      ]);

      if (accRes.success) setAccessories(accRes.data);
      if (catsRes.success) setCategories(catsRes.data);
    } catch (err) {
      console.error('Failed to load accessories', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [searchTerm, categoryFilter, lowStockFilter]);

  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormData(initialForm);
    setNewImageFiles([]);
    setError(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      sku: item.sku,
      category: item.category?._id || item.category || '',
      categorySlug: item.categorySlug || 'accessories',
      brand: item.brand,
      price: item.price,
      stock: item.stock,
      minimumStock: item.minimumStock || 3,
      shortDescription: item.shortDescription || '',
      description: item.description || '',
      compatibility: item.compatibility ? item.compatibility.join(', ') : '',
      isActive: item.isActive,
      featured: item.featured
    });
    setNewImageFiles([]);
    setError(null);
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const data = new FormData();
      data.append('name', formData.name);
      data.append('sku', formData.sku);
      data.append('categorySlug', formData.categorySlug);
      if (formData.category) data.append('category', formData.category);
      data.append('brand', formData.brand);
      data.append('price', formData.price);
      data.append('stock', formData.stock);
      data.append('minimumStock', formData.minimumStock);
      data.append('shortDescription', formData.shortDescription);
      data.append('description', formData.description);
      data.append('isActive', formData.isActive);
      data.append('featured', formData.featured);

      const parsedCompat = formData.compatibility
        .split(',')
        .map((c) => c.trim())
        .filter(Boolean);
      data.append('compatibility', JSON.stringify(parsedCompat));

      newImageFiles.forEach((file) => {
        data.append('images', file);
      });

      if (editingItem) {
        await adminApi.updateAccessory(editingItem._id, data);
      } else {
        await adminApi.createAccessory(data);
      }

      setModalOpen(false);
      loadData();
    } catch (err) {
      setError(err.message || 'Failed to save accessory');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!itemToDelete) return;
    try {
      setSubmitting(true);
      await adminApi.deleteAccessory(itemToDelete._id);
      setDeleteConfirmOpen(false);
      setItemToDelete(null);
      loadData();
    } catch (err) {
      console.error('Delete error', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="admin-spare-parts-manager">
      <div className="admin-card">
        <div className="admin-card-header">
          <div>
            <h2 style={{ fontSize: '1.4rem', margin: 0 }}>Car Accessories Management</h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>
              Control inventory, SKU codes, stock thresholds, pricing and compatibility
            </p>
          </div>

          <button type="button" className="btn btn-primary" onClick={handleOpenAdd}>
            <Plus size={16} />
            <span>Add New Accessory</span>
          </button>
        </div>

        {/* Filter Toolbar */}
        <div className="admin-filter-bar">
          <div className="filter-left-group">
            <div className="search-box">
              <Search size={16} className="search-icon" />
              <input
                type="text"
                placeholder="Search by name, SKU, brand..."
                className="search-input"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="filter-group">
              <span className="filter-label">
                <Layers size={14} /> Category:
              </span>
              <select
                className="filter-select"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <option value="all">All Categories</option>
                {categories.map((c) => (
                  <option key={c._id} value={c.slug}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="filter-right-group">
            <label
              className="filter-checkbox-pill"
              style={{
                borderColor: lowStockFilter ? '#FCA5A5' : 'var(--border)',
                backgroundColor: lowStockFilter ? '#FEF2F2' : '#FFFFFF'
              }}
            >
              <input
                type="checkbox"
                checked={lowStockFilter}
                onChange={(e) => setLowStockFilter(e.target.checked)}
              />
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: lowStockFilter ? '#DC2626' : 'inherit' }}>
                <AlertTriangle size={14} /> Low Stock Only
              </span>
            </label>

            <span className="filter-results-badge">
              <strong>{accessories.length}</strong> items
            </span>
          </div>
        </div>

        {/* Table */}
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Accessory / SKU</th>
                <th>Category</th>
                <th>Brand</th>
                <th>Price</th>
                <th>Stock Status</th>
                <th>Active</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '2rem' }}>
                    Loading accessories from database...
                  </td>
                </tr>
              ) : accessories.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
                    No accessories found.
                  </td>
                </tr>
              ) : (
                accessories.map((item) => {
                  const isLow = item.stock <= (item.minimumStock || 3);
                  const mainImg = item.images && item.images.length > 0
                    ? item.images[0].url
                    : 'https://via.placeholder.com/100';

                  return (
                    <tr key={item._id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                          <img
                            src={mainImg}
                            alt={item.name}
                            style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '4px', border: '1px solid var(--border)' }}
                          />
                          <div>
                            <div style={{ fontWeight: '700', color: 'var(--heading)' }}>{item.name}</div>
                            <span style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: 'var(--primary)', fontWeight: '700' }}>
                              SKU: {item.sku}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span style={{ textTransform: 'capitalize', fontWeight: '600' }}>
                          {item.category?.name || item.categorySlug}
                        </span>
                      </td>
                      <td>{item.brand}</td>
                      <td>
                        <strong style={{ fontFamily: 'var(--font-heading)', color: 'var(--heading)' }}>
                          {item.price?.toLocaleString()} EGP
                        </strong>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <span
                            className={`badge ${
                              item.stock === 0
                                ? 'badge-danger'
                                : isLow
                                ? 'badge-warning'
                                : 'badge-success'
                            }`}
                          >
                            {item.stock} in stock
                          </span>
                          {isLow && <AlertTriangle size={14} color="#d97706" title="Below minimum stock threshold" />}
                        </div>
                      </td>
                      <td>
                        {item.isActive ? (
                          <span style={{ color: 'var(--hover-green)', fontWeight: '700', fontSize: '0.8rem' }}>Active</span>
                        ) : (
                          <span style={{ color: '#dc2626', fontSize: '0.8rem' }}>Disabled</span>
                        )}
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.4rem' }}>
                          <button
                            type="button"
                            className="btn btn-outline btn-sm btn-icon"
                            onClick={() => handleOpenEdit(item)}
                            title="Edit Accessory"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            type="button"
                            className="btn btn-danger btn-sm btn-icon"
                            onClick={() => {
                              setItemToDelete(item);
                              setDeleteConfirmOpen(true);
                            }}
                            title="Delete Accessory"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingItem ? `Edit ${editingItem.name}` : 'Add Car Accessory'}
      >
        {error && (
          <div style={{ backgroundColor: '#fee2e2', color: '#dc2626', padding: '0.65rem 1rem', borderRadius: '4px', marginBottom: '1rem', fontSize: '0.85rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="grid-2">
            <div className="form-group">
              <label>Accessory Name *</label>
              <input
                type="text"
                required
                className="form-input"
                placeholder="e.g. Carbon Fiber Mirror Caps"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>SKU / Product Code *</label>
              <input
                type="text"
                required
                className="form-input"
                placeholder="e.g. ACC-001"
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value.toUpperCase() })}
              />
            </div>
          </div>

          <div className="grid-3">
            <div className="form-group">
              <label>Category</label>
              <select
                className="form-select"
                value={formData.categorySlug}
                onChange={(e) => setFormData({ ...formData, categorySlug: e.target.value })}
              >
                <option value="accessories">Accessories</option>
                {categories.map((c) => (
                  <option key={c._id} value={c.slug}>{c.name}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Brand *</label>
              <input
                type="text"
                required
                className="form-input"
                placeholder="e.g. BMW M Performance, Generic"
                value={formData.brand}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>Price (EGP) *</label>
              <input
                type="number"
                required
                min="0"
                className="form-input"
                placeholder="e.g. 3600"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              />
            </div>
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label>Current Stock *</label>
              <input
                type="number"
                required
                min="0"
                className="form-input"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>Minimum Stock (Alert Level)</label>
              <input
                type="number"
                required
                min="1"
                className="form-input"
                value={formData.minimumStock}
                onChange={(e) => setFormData({ ...formData, minimumStock: e.target.value })}
              />
            </div>
          </div>

          <ImageUploader
            multiple
            images={newImageFiles}
            onImagesChange={setNewImageFiles}
            existingImages={editingItem?.images || []}
          />

          <div className="form-group">
            <label>Compatible Vehicles (Comma-separated)</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. BMW G20 3-Series, BMW G22 4-Series"
              value={formData.compatibility}
              onChange={(e) => setFormData({ ...formData, compatibility: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label>Short Description</label>
            <input
              type="text"
              className="form-input"
              placeholder="Brief one-line product summary"
              value={formData.shortDescription}
              onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label>Full Description</label>
            <textarea
              rows={3}
              className="form-textarea"
              placeholder="Detailed product description, materials, installation notes..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div style={{ display: 'flex', gap: '2rem', margin: '1rem 0' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: '600', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              />
              <span>Active in Store</span>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: '600', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={formData.featured}
                onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
              />
              <span>Feature on Homepage</span>
            </label>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button type="button" className="btn btn-outline" onClick={() => setModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Saving...' : editingItem ? 'Update Accessory' : 'Create Accessory'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmModal
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={handleDeleteConfirm}
        title={`Delete ${itemToDelete?.name}`}
        message="Are you sure you want to delete this accessory? All images will be purged from Cloudinary."
        loading={submitting}
      />
    </div>
  );
}
