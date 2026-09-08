import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, Edit2, Trash2, Car, Eye, Check, Star, AlertCircle } from 'lucide-react';
import { adminApi } from '../api/adminApi';
import Modal from '../components/Common/Modal';
import ConfirmModal from '../components/Common/ConfirmModal';
import ImageUploader from '../components/Common/ImageUploader';

export default function CarsManager() {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modal States
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCar, setEditingCar] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [carToDelete, setCarToDelete] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Form State
  const initialForm = {
    brand: '',
    model: '',
    year: new Date().getFullYear(),
    mileage: 'Zero km',
    price: '',
    bodyType: 'Sedan',
    fuel: 'Petrol',
    transmission: 'Automatic',
    engine: '',
    description: '',
    status: 'Available',
    featured: false,
    tags: 'Brand New, Full Option',
    specs: [{ key: 'Horsepower', value: '204 HP' }]
  };
  const [formData, setFormData] = useState(initialForm);
  const [newImageFiles, setNewImageFiles] = useState([]);

  const loadCars = async () => {
    try {
      setLoading(true);
      const res = await adminApi.getCars({ search: searchTerm, status: statusFilter !== 'all' ? statusFilter : undefined });
      if (res.success) setCars(res.data);
    } catch (err) {
      console.error('Failed to load cars', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCars();
  }, [searchTerm, statusFilter]);

  const handleOpenAdd = () => {
    setEditingCar(null);
    setFormData(initialForm);
    setNewImageFiles([]);
    setError(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (car) => {
    setEditingCar(car);
    setFormData({
      brand: car.brand,
      model: car.model,
      year: car.year,
      mileage: car.mileage,
      price: car.price,
      bodyType: car.bodyType,
      fuel: car.fuel,
      transmission: car.transmission,
      engine: car.engine || '',
      description: car.description || '',
      status: car.status,
      featured: car.featured,
      tags: car.tags ? car.tags.join(', ') : '',
      specs: car.specs && car.specs.length > 0 ? car.specs : [{ key: '', value: '' }]
    });
    setNewImageFiles([]);
    setError(null);
    setModalOpen(true);
  };

  const handleAddSpecRow = () => {
    setFormData({
      ...formData,
      specs: [...formData.specs, { key: '', value: '' }]
    });
  };

  const handleSpecChange = (index, field, val) => {
    const updated = [...formData.specs];
    updated[index][field] = val;
    setFormData({ ...formData, specs: updated });
  };

  const handleRemoveSpec = (index) => {
    setFormData({
      ...formData,
      specs: formData.specs.filter((_, i) => i !== index)
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const data = new FormData();
      data.append('brand', formData.brand);
      data.append('model', formData.model);
      data.append('year', formData.year);
      data.append('mileage', formData.mileage);
      data.append('price', formData.price);
      data.append('bodyType', formData.bodyType);
      data.append('fuel', formData.fuel);
      data.append('transmission', formData.transmission);
      data.append('engine', formData.engine);
      data.append('description', formData.description);
      data.append('status', formData.status);
      data.append('featured', formData.featured);

      const parsedTags = formData.tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);
      data.append('tags', JSON.stringify(parsedTags));

      const validSpecs = formData.specs.filter((s) => s.key && s.value);
      data.append('specs', JSON.stringify(validSpecs));

      newImageFiles.forEach((file) => {
        data.append('images', file);
      });

      if (editingCar) {
        await adminApi.updateCar(editingCar._id, data);
      } else {
        await adminApi.createCar(data);
      }

      setModalOpen(false);
      loadCars();
    } catch (err) {
      setError(err.message || 'Failed to save vehicle');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!carToDelete) return;
    try {
      setSubmitting(true);
      await adminApi.deleteCar(carToDelete._id);
      setDeleteConfirmOpen(false);
      setCarToDelete(null);
      loadCars();
    } catch (err) {
      console.error('Delete error', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="admin-cars-manager">
      <div className="admin-card">
        <div className="admin-card-header">
          <div>
            <h2 style={{ fontSize: '1.4rem', margin: 0 }}>Cars & Vehicles Management</h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>
              Add, edit, and organize showroom and import-ready vehicles
            </p>
          </div>

          <button type="button" className="btn btn-primary" onClick={handleOpenAdd}>
            <Plus size={16} />
            <span>Add New Vehicle</span>
          </button>
        </div>

        {/* Modern Filter Toolbar */}
        <div className="admin-filter-bar">
          <div className="filter-left-group">
            <div className="search-box">
              <Search size={16} className="search-icon" />
              <input
                type="text"
                placeholder="Search by brand, model, tag..."
                className="search-input"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="filter-group">
              <span className="filter-label">
                <Filter size={14} /> Status:
              </span>
              <select
                className="filter-select"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Statuses</option>
                <option value="Available">Available</option>
                <option value="Reserved">Reserved</option>
                <option value="Sold">Sold</option>
                <option value="Hidden">Hidden</option>
              </select>
            </div>
          </div>

          <div className="filter-right-group">
            <div className="quick-filter-tabs">
              <button
                type="button"
                className={`quick-filter-tab ${statusFilter === 'all' ? 'active' : ''}`}
                onClick={() => setStatusFilter('all')}
              >
                All
              </button>
              <button
                type="button"
                className={`quick-filter-tab ${statusFilter === 'Available' ? 'active' : ''}`}
                onClick={() => setStatusFilter('Available')}
              >
                Available
              </button>
              <button
                type="button"
                className={`quick-filter-tab ${statusFilter === 'Reserved' ? 'active' : ''}`}
                onClick={() => setStatusFilter('Reserved')}
              >
                Reserved
              </button>
              <button
                type="button"
                className={`quick-filter-tab ${statusFilter === 'Sold' ? 'active' : ''}`}
                onClick={() => setStatusFilter('Sold')}
              >
                Sold
              </button>
            </div>

            <span className="filter-results-badge">
              <strong>{cars.length}</strong> vehicles
            </span>
          </div>
        </div>

        {/* Vehicles Table */}
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Vehicle</th>
                <th>Body / Year</th>
                <th>Mileage</th>
                <th>Price</th>
                <th>Status</th>
                <th>Featured</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '2rem' }}>
                    Loading vehicles from database...
                  </td>
                </tr>
              ) : cars.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
                    No vehicles found matching criteria.
                  </td>
                </tr>
              ) : (
                cars.map((car) => {
                  const mainImg = car.images && car.images.length > 0 ? car.images[0].url : 'https://via.placeholder.com/100';
                  return (
                    <tr key={car._id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                          <img src={mainImg} alt={car.model} style={{ width: '56px', height: '42px', objectFit: 'cover', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border)' }} />
                          <div>
                            <div style={{ fontWeight: '700', color: 'var(--heading)' }}>{car.brand}</div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{car.model}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span style={{ fontWeight: '600' }}>{car.bodyType}</span>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{car.year}</div>
                      </td>
                      <td>{car.mileage}</td>
                      <td>
                        <strong style={{ fontFamily: 'var(--font-heading)', color: 'var(--heading)' }}>
                          {car.price?.toLocaleString()} EGP
                        </strong>
                      </td>
                      <td>
                        <span
                          className={`badge ${
                            car.status === 'Available'
                              ? 'badge-success'
                              : car.status === 'Reserved'
                              ? 'badge-warning'
                              : car.status === 'Sold'
                              ? 'badge-info'
                              : 'badge-neutral'
                          }`}
                        >
                          {car.status}
                        </span>
                      </td>
                      <td>
                        {car.featured ? (
                          <span style={{ color: 'var(--primary)', display: 'inline-flex', alignItems: 'center', gap: '0.2rem', fontWeight: '700', fontSize: '0.8rem' }}>
                            <Star size={14} fill="currentColor" /> Yes
                          </span>
                        ) : (
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>No</span>
                        )}
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.4rem' }}>
                          <button
                            type="button"
                            className="btn btn-outline btn-sm btn-icon"
                            onClick={() => handleOpenEdit(car)}
                            title="Edit Vehicle"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            type="button"
                            className="btn btn-danger btn-sm btn-icon"
                            onClick={() => {
                              setCarToDelete(car);
                              setDeleteConfirmOpen(true);
                            }}
                            title="Delete Vehicle"
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

      {/* Add / Edit Vehicle Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingCar ? `Edit ${editingCar.brand} ${editingCar.model}` : 'Add New Vehicle'}
      >
        {error && (
          <div style={{ backgroundColor: '#fee2e2', color: '#dc2626', padding: '0.65rem 1rem', borderRadius: '4px', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="grid-2">
            <div className="form-group">
              <label>Brand (Make) *</label>
              <input
                type="text"
                required
                className="form-input"
                placeholder="e.g. Mercedes-Benz, BMW, Porsche"
                value={formData.brand}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>Model Name *</label>
              <input
                type="text"
                required
                className="form-input"
                placeholder="e.g. C200 AMG Line"
                value={formData.model}
                onChange={(e) => setFormData({ ...formData, model: e.target.value })}
              />
            </div>
          </div>

          <div className="grid-3">
            <div className="form-group">
              <label>Year *</label>
              <input
                type="number"
                required
                min="1990"
                max="2030"
                className="form-input"
                value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>Mileage *</label>
              <input
                type="text"
                required
                className="form-input"
                placeholder="e.g. Zero km / 14,000 km"
                value={formData.mileage}
                onChange={(e) => setFormData({ ...formData, mileage: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>Price (EGP) *</label>
              <input
                type="number"
                required
                min="0"
                className="form-input"
                placeholder="e.g. 3850000"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              />
            </div>
          </div>

          <div className="grid-3">
            <div className="form-group">
              <label>Body Type</label>
              <select
                className="form-select"
                value={formData.bodyType}
                onChange={(e) => setFormData({ ...formData, bodyType: e.target.value })}
              >
                <option value="Sedan">Sedan</option>
                <option value="SUV">SUV</option>
                <option value="Coupé">Coupé</option>
                <option value="Hatchback">Hatchback</option>
                <option value="Convertible">Convertible</option>
              </select>
            </div>

            <div className="form-group">
              <label>Fuel Type</label>
              <select
                className="form-select"
                value={formData.fuel}
                onChange={(e) => setFormData({ ...formData, fuel: e.target.value })}
              >
                <option value="Petrol">Petrol</option>
                <option value="Mild Hybrid">Mild Hybrid</option>
                <option value="Hybrid">Hybrid</option>
                <option value="Electric">Electric</option>
                <option value="Diesel">Diesel</option>
              </select>
            </div>

            <div className="form-group">
              <label>Status</label>
              <select
                className="form-select"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="Available">Available</option>
                <option value="Reserved">Reserved</option>
                <option value="Sold">Sold</option>
                <option value="Hidden">Hidden</option>
              </select>
            </div>
          </div>

          {/* Engine & Transmission */}
          <div className="grid-2">
            <div className="form-group">
              <label>Engine Specs</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. 2.0L TwinPower Turbo 258 HP"
                value={formData.engine}
                onChange={(e) => setFormData({ ...formData, engine: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>Transmission</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. 9G-Tronic Automatic"
                value={formData.transmission}
                onChange={(e) => setFormData({ ...formData, transmission: e.target.value })}
              />
            </div>
          </div>

          {/* Image Uploader */}
          <ImageUploader
            multiple
            images={newImageFiles}
            onImagesChange={setNewImageFiles}
            existingImages={editingCar?.images || []}
          />

          {/* Tags */}
          <div className="form-group">
            <label>Tags (Comma-separated)</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Import Ready, Brand New, Full Option"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
            />
          </div>

          {/* Description */}
          <div className="form-group">
            <label>Vehicle Description</label>
            <textarea
              rows={3}
              className="form-textarea"
              placeholder="Full vehicle description, condition, history, options..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          {/* Featured Toggle */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', margin: '1rem 0' }}>
            <input
              type="checkbox"
              id="featuredCar"
              checked={formData.featured}
              onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
              style={{ width: '18px', height: '18px' }}
            />
            <label htmlFor="featuredCar" style={{ fontWeight: '600', fontSize: '0.9rem', cursor: 'pointer' }}>
              Feature on Homepage Showcase
            </label>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button type="button" className="btn btn-outline" onClick={() => setModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Saving to Cloudinary & DB...' : editingCar ? 'Update Vehicle' : 'Create Vehicle'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={handleDeleteConfirm}
        title={`Delete ${carToDelete?.brand} ${carToDelete?.model}`}
        message="Are you sure you want to delete this vehicle? All related Cloudinary images will also be removed."
        loading={submitting}
      />
    </div>
  );
}
