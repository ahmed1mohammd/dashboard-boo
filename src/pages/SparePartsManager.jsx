import React, { useState, useEffect } from 'react';
import { Plus, Search, Layers, Edit2, Trash2, Cog, AlertTriangle, Check, X, ShieldCheck } from 'lucide-react';
import { adminApi } from '../api/adminApi';
import Modal from '../components/Common/Modal';
import ConfirmModal from '../components/Common/ConfirmModal';
import ImageUploader from '../components/Common/ImageUploader';

export default function SparePartsManager() {
  const [parts, setParts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [lowStockFilter, setLowStockFilter] = useState(false);

  // Modal States
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPart, setEditingPart] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [partToDelete, setPartToDelete] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const initialForm = {
    name: '',
    sku: '',
    category: '',
    categorySlug: 'engine',
    brand: '',
    model: '',
    price: '',
    stock: 10,
    minimumStock: 3,
    shortDescription: '',
    description: '',
    compatibility: 'Toyota Corolla 2018-2023, Toyota Camry',
    specs: [{ key: 'Material', value: 'OEM Grade Ceramic' }],
    isActive: true,
    featured: false
  };
  const [formData, setFormData] = useState(initialForm);
  const [newImageFiles, setNewImageFiles] = useState([]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [partsRes, catsRes] = await Promise.all([
        adminApi.getSpareParts({
          search: searchTerm,
          category: categoryFilter !== 'all' ? categoryFilter : undefined,
          lowStock: lowStockFilter ? 'true' : undefined
        }),
        adminApi.getCategories()
      ]);

      if (partsRes.success) setParts(partsRes.data);
      if (catsRes.success) setCategories(catsRes.data);
    } catch (err) {
      console.error('Failed to load spare parts', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [searchTerm, categoryFilter, lowStockFilter]);

  const handleOpenAdd = () => {
    setEditingPart(null);
    setFormData(initialForm);
    setNewImageFiles([]);
    setError(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (part) => {
    setEditingPart(part);
    setFormData({
      name: part.name,
      sku: part.sku,
      category: part.category?._id || part.category || '',
      categorySlug: part.categorySlug || 'engine',
      brand: part.brand,
      model: part.model || '',
      price: part.price,
      stock: part.stock,
      minimumStock: part.minimumStock || 3,
      shortDescription: part.shortDescription || '',
      description: part.description || '',
      compatibility: part.compatibility ? part.compatibility.join(', ') : '',
      specs: part.specs && part.specs.length > 0 ? part.specs : [{ key: '', value: '' }],
      isActive: part.isActive,
      featured: part.featured
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
      data.append('model', formData.model);
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

      const validSpecs = formData.specs.filter((s) => s.key && s.value);
      data.append('specs', JSON.stringify(validSpecs));

      newImageFiles.forEach((file) => {
        data.append('images', file);
      });

      if (editingPart) {
        await adminApi.updateSparePart(editingPart._id, data);
      } else {
        await adminApi.createSparePart(data);
      }

      setModalOpen(false);
      loadData();
    } catch (err) {
      setError(err.message || 'Failed to save spare part');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!partToDelete) return;
    try {
      setSubmitting(true);
      await adminApi.deleteSparePart(partToDelete._id);
      setDeleteConfirmOpen(false);
      setPartToDelete(null);
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
            <h2 style={{ fontSize: '1.4rem', margin: 0 }}>Spare Parts Store Management</h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>
              Control inventory, SKU codes, stock thresholds, pricing and compatibility
            </p>
          </div>

          <button type="button" className="btn btn-primary" onClick={handleOpenAdd}>
            <Plus size={16} />
            <span>Add New Part</span>
          </button>
        </div>

        {/* Modern Filter Toolbar */}
        <div className="admin-filter-bar">
          <div className="filter-left-group">
            <div className="search-box">
              <Search size={16} className="search-icon" />
              <input
                type="text"
                placeholder="Search by part name, SKU, brand..."
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
            <label className="filter-checkbox-pill" style={{ borderColor: lowStockFilter ? '#FCA5A5' : 'var(--border)', backgroundColor: lowStockFilter ? '#FEF2F2' : '#FFFFFF' }}>
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
              <strong>{parts.length}</strong> items
            </span>
          </div>
        </div>

        {/* Table */}
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Product / SKU</th>
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
                    Loading catalog from database...
                  </td>
                </tr>
              ) : parts.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
                    No spare parts found.
                  </td>
                </tr>
              ) : (
                parts.map((part) => {
                  const isLow = part.stock <= (part.minimumStock || 3);
                  const mainImg = part.images && part.images.length > 0 ? part.images[0].url : 'https://via.placeholder.com/100';

                  return (
                    <tr key={part._id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                          <img src={mainImg} alt={part.name} style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '4px', border: '1px solid var(--border)' }} />
                          <div>
                            <div style={{ fontWeight: '700', color: 'var(--heading)' }}>{part.name}</div>
                            <span style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: 'var(--primary)', fontWeight: '700' }}>
                              SKU: {part.sku}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span style={{ textTransform: 'capitalize', fontWeight: '600' }}>
                          {part.category?.name || part.categorySlug}
                        </span>
                      </td>
                      <td>{part.brand}</td>
                      <td>
                        <strong style={{ fontFamily: 'var(--font-heading)', color: 'var(--heading)' }}>
                          {part.price?.toLocaleString()} EGP
                        </strong>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <span
                            className={`badge ${
                              part.stock === 0
                                ? 'badge-danger'
                                : isLow
                                ? 'badge-warning'
                                : 'badge-success'
                            }`}
                          >
                            {part.stock} in stock
                          </span>
                          {isLow && <AlertTriangle size={14} color="#d97706" title="Below minimum stock threshold" />}
                        </div>
                      </td>
                      <td>
                        {part.isActive ? (
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
                            onClick={() => handleOpenEdit(part)}
                            title="Edit Spare Part"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            type="button"
                            className="btn btn-danger btn-sm btn-icon"
                            onClick={() => {
                              setPartToDelete(part);
                              setDeleteConfirmOpen(true);
                            }}
                            title="Delete Spare Part"
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
        title={editingPart ? `Edit ${editingPart.name}` : 'Add Spare Part'}
      >
        {error && (
          <div style={{ backgroundColor: '#fee2e2', color: '#dc2626', padding: '0.65rem 1rem', borderRadius: '4px', marginBottom: '1rem', fontSize: '0.85rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="grid-2">
            <div className="form-group">
              <label>Part Name *</label>
              <input
                type="text"
                required
                className="form-input"
                placeholder="e.g. Front Ceramic Brake Pad Set"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>SKU / Part Number *</label>
              <input
                type="text"
                required
                className="form-input"
                placeholder="e.g. BP-TC-001"
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
                {categories.map((c) => (
                  <option key={c._id} value={c.slug}>{c.name}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Brand / Manufacturer *</label>
              <input
                type="text"
                required
                className="form-input"
                placeholder="e.g. Toyota OEM, Brembo, Bosch"
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
                placeholder="e.g. 1500"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              />
            </div>
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label>Current Stock Count *</label>
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
              <label>Minimum Stock Threshold (Alert level)</label>
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
            existingImages={editingPart?.images || []}
          />

          <div className="form-group">
            <label>Compatible Vehicles (Comma-separated)</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Toyota Corolla (2018–2024), Toyota Camry 2.5L"
              value={formData.compatibility}
              onChange={(e) => setFormData({ ...formData, compatibility: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              rows={3}
              className="form-textarea"
              placeholder="Technical details, material specifications, warranty..."
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
              {submitting ? 'Saving...' : editingPart ? 'Update Part' : 'Create Part'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmModal
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={handleDeleteConfirm}
        title={`Delete ${partToDelete?.name}`}
        message="Are you sure you want to delete this spare part? All images will be purged from Cloudinary."
        loading={submitting}
      />
    </div>
  );
}
