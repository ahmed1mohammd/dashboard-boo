import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Image as ImageIcon, ArrowRight, Eye, AlertCircle } from 'lucide-react';
import { adminApi } from '../api/adminApi';
import Modal from '../components/Common/Modal';
import ConfirmModal from '../components/Common/ConfirmModal';
import ImageUploader from '../components/Common/ImageUploader';

export default function HeroManager() {
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingSlide, setEditingSlide] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [slideToDelete, setSlideToDelete] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const initialForm = {
    title: '',
    badge: 'BOO Integrated Solutions',
    description: '',
    ctaText: 'Explore Now',
    ctaLink: '/cars',
    secondaryCtaText: 'Spare Parts Store',
    secondaryCtaLink: '/parts',
    order: 0,
    isActive: true,
    image: { url: '', publicId: '' }
  };
  const [formData, setFormData] = useState(initialForm);

  const loadSlides = async () => {
    try {
      setLoading(true);
      const res = await adminApi.getSlides();
      if (res.success) setSlides(res.data);
    } catch (err) {
      console.error('Failed to load slides', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSlides();
  }, []);

  const handleOpenAdd = () => {
    setEditingSlide(null);
    setFormData(initialForm);
    setError(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (slide) => {
    setEditingSlide(slide);
    setFormData({
      title: slide.title,
      badge: slide.badge || '',
      description: slide.description || '',
      ctaText: slide.ctaText || 'Explore Now',
      ctaLink: slide.ctaLink || '/cars',
      secondaryCtaText: slide.secondaryCtaText || '',
      secondaryCtaLink: slide.secondaryCtaLink || '',
      order: slide.order || 0,
      isActive: slide.isActive !== undefined ? slide.isActive : true,
      image: slide.image || { url: '', publicId: '' }
    });
    setError(null);
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.image?.url) {
      setError('A slide background image is required.');
      return;
    }

    setError(null);
    setSubmitting(true);

    try {
      if (editingSlide) {
        await adminApi.updateSlide(editingSlide._id, formData);
      } else {
        await adminApi.createSlide(formData);
      }
      setModalOpen(false);
      loadSlides();
    } catch (err) {
      setError(err.message || 'Failed to save hero slide');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!slideToDelete) return;
    try {
      setSubmitting(true);
      await adminApi.deleteSlide(slideToDelete._id);
      setDeleteConfirmOpen(false);
      setSlideToDelete(null);
      loadSlides();
    } catch (err) {
      console.error('Failed to delete slide', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="module-container">
      {/* Top Header */}
      <div className="section-header">
        <div>
          <h2 className="section-title">Homepage Hero Carousel</h2>
          <p className="section-subtitle">Manage promotional slides, hero banners, and primary calls-to-action</p>
        </div>
        <button className="btn btn-primary" onClick={handleOpenAdd}>
          <Plus size={18} />
          <span>Add New Slide</span>
        </button>
      </div>

      {/* Slides Grid / Table */}
      <div className="data-card">
        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading hero slides...</p>
          </div>
        ) : slides.length === 0 ? (
          <div className="empty-state">
            <ImageIcon size={48} />
            <h3>No Hero Slides</h3>
            <p>Create your first carousel slide for the homepage hero section.</p>
            <button className="btn btn-primary" onClick={handleOpenAdd}>
              <Plus size={18} />
              <span>Add Slide</span>
            </button>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Slide Preview & Title</th>
                  <th>Badge</th>
                  <th>Primary CTA</th>
                  <th>Secondary CTA</th>
                  <th>Order</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {slides.map((slide) => (
                  <tr key={slide._id}>
                    <td>
                      <div className="td-primary">
                        {slide.image?.url ? (
                          <img
                            src={slide.image.url}
                            alt={slide.title}
                            className="table-thumb"
                            style={{ width: '80px', height: '48px', objectFit: 'cover' }}
                          />
                        ) : (
                          <div className="table-thumb-placeholder" style={{ width: '80px', height: '48px' }}>
                            <ImageIcon size={20} />
                          </div>
                        )}
                        <div>
                          <span className="td-title">{slide.title}</span>
                          <span className="td-sub" style={{ maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {slide.description}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="badge badge-info">{slide.badge || 'N/A'}</span>
                    </td>
                    <td>
                      <span style={{ fontSize: '13px', fontWeight: '500', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        {slide.ctaText} <ArrowRight size={12} />
                      </span>
                      <span style={{ display: 'block', fontSize: '11px', color: '#64748B' }}>{slide.ctaLink}</span>
                    </td>
                    <td>
                      {slide.secondaryCtaText ? (
                        <>
                          <span style={{ fontSize: '13px' }}>{slide.secondaryCtaText}</span>
                          <span style={{ display: 'block', fontSize: '11px', color: '#64748B' }}>{slide.secondaryCtaLink}</span>
                        </>
                      ) : (
                        <span style={{ color: '#94A3B8', fontSize: '12px' }}>None</span>
                      )}
                    </td>
                    <td>{slide.order || 0}</td>
                    <td>
                      <span className={`status-badge ${slide.isActive ? 'status-active' : 'status-inactive'}`}>
                        {slide.isActive ? 'Active' : 'Disabled'}
                      </span>
                    </td>
                    <td>
                      <div className="table-actions">
                        <button
                          className="action-btn edit-btn"
                          title="Edit Slide"
                          onClick={() => handleOpenEdit(slide)}
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          className="action-btn delete-btn"
                          title="Delete Slide"
                          onClick={() => {
                            setSlideToDelete(slide);
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

      {/* Create / Edit Slide Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingSlide ? 'Edit Hero Slide' : 'Create Hero Slide'}
        maxWidth="750px"
      >
        <form onSubmit={handleSubmit} className="admin-form">
          {error && (
            <div className="form-error-banner">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          <div className="form-grid" style={{ gridTemplateColumns: '2fr 1fr' }}>
            <div className="form-group">
              <label className="form-label">Slide Headline Title *</label>
              <input
                type="text"
                required
                placeholder="e.g. Drive with Confidence. Experience BOO."
                className="form-input"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Top Badge Tag</label>
              <input
                type="text"
                placeholder="e.g. Official Automotive Partner"
                className="form-input"
                value={formData.badge}
                onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Slide Subtitle / Description *</label>
            <textarea
              rows="3"
              required
              placeholder="Highlight the key offer or message for this slide..."
              className="form-textarea"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
            <div className="form-group">
              <label className="form-label">Primary Button Text</label>
              <input
                type="text"
                placeholder="e.g. Explore Cars"
                className="form-input"
                value={formData.ctaText}
                onChange={(e) => setFormData({ ...formData, ctaText: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Primary Button Link</label>
              <input
                type="text"
                placeholder="/cars or https://..."
                className="form-input"
                value={formData.ctaLink}
                onChange={(e) => setFormData({ ...formData, ctaLink: e.target.value })}
              />
            </div>
          </div>

          <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
            <div className="form-group">
              <label className="form-label">Secondary Button Text</label>
              <input
                type="text"
                placeholder="e.g. Spare Parts Store"
                className="form-input"
                value={formData.secondaryCtaText}
                onChange={(e) => setFormData({ ...formData, secondaryCtaText: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Secondary Button Link</label>
              <input
                type="text"
                placeholder="/parts"
                className="form-input"
                value={formData.secondaryCtaLink}
                onChange={(e) => setFormData({ ...formData, secondaryCtaLink: e.target.value })}
              />
            </div>
          </div>

          <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
            <div className="form-group">
              <label className="form-label">Display Order</label>
              <input
                type="number"
                className="form-input"
                value={formData.order}
                onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
              />
            </div>
            <div className="form-group" style={{ display: 'flex', alignItems: 'center', paddingTop: '28px' }}>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                />
                <span>Slide is Active in Carousel</span>
              </label>
            </div>
          </div>

          {/* Slide Background Image */}
          <div className="form-group">
            <label className="form-label">Slide Background Image * (Cloudinary)</label>
            <ImageUploader
              images={formData.image?.url ? [formData.image] : []}
              onChange={(imgs) => setFormData({ ...formData, image: imgs[0] || { url: '', publicId: '' } })}
              folder="boo/hero"
              maxImages={1}
            />
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
              {submitting ? 'Saving...' : editingSlide ? 'Update Slide' : 'Create Slide'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Hero Slide"
        message={`Are you sure you want to delete "${slideToDelete?.title}"?`}
        confirmText="Delete Slide"
        isLoading={submitting}
      />
    </div>
  );
}
