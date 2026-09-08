import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Wrench, Clock, DollarSign, Check, X, AlertCircle } from 'lucide-react';
import { adminApi } from '../api/adminApi';
import Modal from '../components/Common/Modal';
import ConfirmModal from '../components/Common/ConfirmModal';
import ImageUploader from '../components/Common/ImageUploader';

export default function MaintenanceManager() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const initialForm = {
    title: '',
    slug: '',
    description: '',
    price: 0,
    duration: '1 - 2 Hours',
    icon: 'Wrench',
    order: 0,
    isActive: true,
    checklist: ['Comprehensive computer diagnostic scan', 'Safety inspection checklist', 'Service guarantee certificate'],
    images: []
  };
  const [formData, setFormData] = useState(initialForm);
  const [checklistInput, setChecklistInput] = useState('');

  const loadServices = async () => {
    try {
      setLoading(true);
      const res = await adminApi.getServices();
      if (res.success) setServices(res.data);
    } catch (err) {
      console.error('Failed to load services', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadServices();
  }, []);

  const handleOpenAdd = () => {
    setEditingService(null);
    setFormData(initialForm);
    setChecklistInput('');
    setError(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (svc) => {
    setEditingService(svc);
    setFormData({
      title: svc.title,
      slug: svc.slug,
      description: svc.description || '',
      price: svc.price || 0,
      duration: svc.duration || '1 - 2 Hours',
      icon: svc.icon || 'Wrench',
      order: svc.order || 0,
      isActive: svc.isActive !== undefined ? svc.isActive : true,
      checklist: svc.checklist && svc.checklist.length > 0 ? svc.checklist : [],
      images: svc.images || []
    });
    setChecklistInput('');
    setError(null);
    setModalOpen(true);
  };

  const handleAddChecklistItem = () => {
    if (!checklistInput.trim()) return;
    setFormData((prev) => ({
      ...prev,
      checklist: [...prev.checklist, checklistInput.trim()]
    }));
    setChecklistInput('');
  };

  const handleRemoveChecklistItem = (idx) => {
    setFormData((prev) => ({
      ...prev,
      checklist: prev.checklist.filter((_, i) => i !== idx)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      if (editingService) {
        await adminApi.updateService(editingService._id, formData);
      } else {
        await adminApi.createService(formData);
      }
      setModalOpen(false);
      loadServices();
    } catch (err) {
      setError(err.message || 'Failed to save maintenance service');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!serviceToDelete) return;
    try {
      setSubmitting(true);
      await adminApi.deleteService(serviceToDelete._id);
      setDeleteConfirmOpen(false);
      setServiceToDelete(null);
      loadServices();
    } catch (err) {
      console.error('Delete error', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="module-container">
      {/* Top Action Bar */}
      <div className="section-header">
        <div>
          <h2 className="section-title">Maintenance Services</h2>
          <p className="section-subtitle">Manage automotive repair, periodic checkups, and workshop service catalog</p>
        </div>
        <button className="btn btn-primary" onClick={handleOpenAdd}>
          <Plus size={18} />
          <span>Add New Service</span>
        </button>
      </div>

      {/* Services Table */}
      <div className="data-card">
        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading maintenance services...</p>
          </div>
        ) : services.length === 0 ? (
          <div className="empty-state">
            <Wrench size={48} />
            <h3>No Services Listed</h3>
            <p>Add your first workshop or maintenance service package.</p>
            <button className="btn btn-primary" onClick={handleOpenAdd}>
              <Plus size={18} />
              <span>Add Service</span>
            </button>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Service Title</th>
                  <th>Duration</th>
                  <th>Starting Price</th>
                  <th>Checklist Items</th>
                  <th>Display Order</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {services.map((svc) => (
                  <tr key={svc._id}>
                    <td>
                      <div className="td-primary">
                        <div className="table-thumb-placeholder">
                          <Wrench size={20} color="var(--primary)" />
                        </div>
                        <div>
                          <span className="td-title">{svc.title}</span>
                          <span className="td-sub">/{svc.slug}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="badge badge-neutral" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <Clock size={12} /> {svc.duration}
                      </span>
                    </td>
                    <td>
                      <strong style={{ color: 'var(--text-main)', fontSize: '15px' }}>
                        {svc.price > 0 ? `$${svc.price.toLocaleString()}` : 'Custom Quote'}
                      </strong>
                    </td>
                    <td>
                      <span className="badge badge-info">{svc.checklist?.length || 0} checks</span>
                    </td>
                    <td>{svc.order || 0}</td>
                    <td>
                      <span className={`status-badge ${svc.isActive ? 'status-active' : 'status-inactive'}`}>
                        {svc.isActive ? 'Active' : 'Disabled'}
                      </span>
                    </td>
                    <td>
                      <div className="table-actions">
                        <button
                          className="action-btn edit-btn"
                          title="Edit Service"
                          onClick={() => handleOpenEdit(svc)}
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          className="action-btn delete-btn"
                          title="Delete Service"
                          onClick={() => {
                            setServiceToDelete(svc);
                            setDeleteConfirmOpen(true);
                          }}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create / Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingService ? `Edit Service: ${editingService.title}` : 'Add Maintenance Service'}
        maxWidth="750px"
      >
        <form onSubmit={handleSubmit} className="admin-form">
          {error && (
            <div className="form-error-banner">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          <div className="form-grid" style={{ gridTemplateColumns: '1.5fr 1fr' }}>
            <div className="form-group">
              <label className="form-label">Service Title *</label>
              <input
                type="text"
                required
                placeholder="e.g. Engine Oil & Filter Service"
                className="form-input"
                value={formData.title}
                onChange={(e) => {
                  const title = e.target.value;
                  setFormData((prev) => ({
                    ...prev,
                    title,
                    slug: !editingService ? title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') : prev.slug
                  }));
                }}
              />
            </div>
            <div className="form-group">
              <label className="form-label">URL Slug *</label>
              <input
                type="text"
                required
                placeholder="engine-oil-service"
                className="form-input"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              />
            </div>
          </div>

          <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr 1fr' }}>
            <div className="form-group">
              <label className="form-label">Starting Price ($)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                placeholder="0 = Custom Quote"
                className="form-input"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Estimated Duration</label>
              <input
                type="text"
                placeholder="e.g. 1 - 2 Hours"
                className="form-input"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Display Order</label>
              <input
                type="number"
                className="form-input"
                value={formData.order}
                onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Description & Overview *</label>
            <textarea
              rows="3"
              required
              placeholder="Explain the scope of this maintenance service..."
              className="form-textarea"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          {/* Checklist Builder */}
          <div className="form-group">
            <label className="form-label">What's Included (Checklist Points)</label>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
              <input
                type="text"
                placeholder="Add inspection or service item..."
                className="form-input"
                value={checklistInput}
                onChange={(e) => setChecklistInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddChecklistItem();
                  }
                }}
              />
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleAddChecklistItem}
              >
                Add Point
              </button>
            </div>

            <div className="tags-container" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {formData.checklist.map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    background: 'var(--bg-sidebar)',
                    borderRadius: '6px',
                    border: '1px solid var(--border)'
                  }}
                >
                  <span style={{ fontSize: '13px', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Check size={14} color="var(--secondary)" /> {item}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveChecklistItem(idx)}
                    style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer', display: 'flex', padding: 2 }}
                  >
                    <X size={15} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Service Images */}
          <div className="form-group">
            <label className="form-label">Service Banner / Workshop Images</label>
            <ImageUploader
              images={formData.images}
              onChange={(images) => setFormData({ ...formData, images })}
              folder="boo/services"
              maxImages={4}
            />
          </div>

          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              />
              <span>Service is Active and Visible to Customers</span>
            </label>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => setModalOpen(false)}
              disabled={submitting}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Saving...' : editingService ? 'Update Service' : 'Create Service'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Maintenance Service"
        message={`Are you sure you want to delete "${serviceToDelete?.title}"? Any pending appointments booked for this service will remain in history.`}
        confirmText="Delete Service"
        isLoading={submitting}
      />
    </div>
  );
}
