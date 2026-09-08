import React, { useState, useEffect } from 'react';
import { Calendar, Phone, MessageSquare, Car, CheckCircle2, Clock, XCircle, AlertCircle, Trash2, Edit3, Search, Filter } from 'lucide-react';
import { adminApi } from '../api/adminApi';
import Modal from '../components/Common/Modal';
import ConfirmModal from '../components/Common/ConfirmModal';

export default function BookingsManager() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const [selectedBooking, setSelectedBooking] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editStatus, setEditStatus] = useState('pending');
  const [editAdminNotes, setEditAdminNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [bookingToDelete, setBookingToDelete] = useState(null);

  const loadBookings = async () => {
    try {
      setLoading(true);
      const params = {};
      if (statusFilter) params.status = statusFilter;
      const res = await adminApi.getBookings(params);
      if (res.success) setBookings(res.data);
    } catch (err) {
      console.error('Failed to load bookings', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, [statusFilter]);

  const handleOpenEdit = (booking) => {
    setSelectedBooking(booking);
    setEditStatus(booking.status);
    setEditAdminNotes(booking.adminNotes || '');
    setEditModalOpen(true);
  };

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    if (!selectedBooking) return;
    try {
      setSubmitting(true);
      await adminApi.updateBooking(selectedBooking._id, {
        status: editStatus,
        adminNotes: editAdminNotes
      });
      setEditModalOpen(false);
      loadBookings();
    } catch (err) {
      console.error('Failed to update booking status', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!bookingToDelete) return;
    try {
      setSubmitting(true);
      await adminApi.deleteBooking(bookingToDelete._id);
      setDeleteConfirmOpen(false);
      setBookingToDelete(null);
      loadBookings();
    } catch (err) {
      console.error('Failed to delete booking', err);
    } finally {
      setSubmitting(false);
    }
  };

  const filteredBookings = bookings.filter((b) => {
    const term = searchTerm.toLowerCase();
    return (
      b.bookingNumber?.toLowerCase().includes(term) ||
      b.customerName?.toLowerCase().includes(term) ||
      b.customerPhone?.toLowerCase().includes(term) ||
      b.carModel?.toLowerCase().includes(term) ||
      b.serviceName?.toLowerCase().includes(term)
    );
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'confirmed':
        return <span className="status-badge status-active">Confirmed</span>;
      case 'in_progress':
        return <span className="status-badge" style={{ background: '#E1F3FA', color: '#00AEEF' }}>In Workshop</span>;
      case 'completed':
        return <span className="status-badge" style={{ background: '#D1FAE5', color: '#047857' }}>Completed</span>;
      case 'cancelled':
        return <span className="status-badge status-inactive">Cancelled</span>;
      default:
        return <span className="status-badge" style={{ background: '#FEF3C7', color: '#B45309' }}>Pending Review</span>;
    }
  };

  return (
    <div className="module-container">
      {/* Top Action Bar */}
      <div className="section-header">
        <div>
          <h2 className="section-title">Workshop Bookings</h2>
          <p className="section-subtitle">Manage service reservations, customer vehicle drop-offs, and workshop pipeline</p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="filter-bar">
        <div className="search-box">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            placeholder="Search by customer, phone, car, booking #..."
            className="search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filter-group">
          <label className="filter-label">
            <Filter size={14} /> Status:
          </label>
          <select
            className="filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending Review</option>
            <option value="confirmed">Confirmed</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Bookings Table */}
      <div className="data-card">
        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading workshop bookings...</p>
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="empty-state">
            <Calendar size={48} />
            <h3>No Bookings Found</h3>
            <p>Customer appointment requests will appear here in real-time.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Booking #</th>
                  <th>Customer Info</th>
                  <th>Vehicle</th>
                  <th>Service Requested</th>
                  <th>Preferred Date</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBookings.map((b) => (
                  <tr key={b._id}>
                    <td>
                      <span className="badge badge-info" style={{ fontWeight: '600', fontFamily: 'monospace' }}>
                        {b.bookingNumber}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span className="td-title">{b.customerName}</span>
                        <a
                          href={`tel:${b.customerPhone}`}
                          className="td-sub"
                          style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: 'var(--primary)' }}
                        >
                          <Phone size={12} /> {b.customerPhone}
                        </a>
                      </div>
                    </td>
                    <td>
                      <span style={{ fontSize: '13px', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <Car size={14} color="var(--primary)" /> {b.carModel}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: '13px', color: 'var(--text-main)' }}>
                        {b.serviceName || b.service?.title || 'General Maintenance'}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: '12px', color: '#64748B' }}>
                        {b.preferredDate || new Date(b.createdAt).toLocaleDateString()}
                      </span>
                    </td>
                    <td>{getStatusBadge(b.status)}</td>
                    <td>
                      <div className="table-actions">
                        <a
                          href={`https://wa.me/${b.customerPhone.replace(/[^0-9]/g, '')}?text=Hello%20${encodeURIComponent(b.customerName)},%20regarding%20your%20BOO%20service%20booking%20${b.bookingNumber}...`}
                          target="_blank"
                          rel="noreferrer"
                          className="action-btn"
                          title="Contact via WhatsApp"
                          style={{ color: '#25D366' }}
                        >
                          <MessageSquare size={16} />
                        </a>
                        <button
                          className="action-btn edit-btn"
                          title="Update Status / Notes"
                          onClick={() => handleOpenEdit(b)}
                        >
                          <Edit3 size={16} />
                        </button>
                        <button
                          className="action-btn delete-btn"
                          title="Delete Booking"
                          onClick={() => {
                            setBookingToDelete(b);
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

      {/* Edit Booking Status Modal */}
      <Modal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title={selectedBooking ? `Manage Booking: ${selectedBooking.bookingNumber}` : 'Booking Details'}
        maxWidth="600px"
      >
        {selectedBooking && (
          <form onSubmit={handleUpdateStatus} className="admin-form">
            <div style={{ background: 'var(--bg-sidebar)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border)', marginBottom: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '13px' }}>
                <div>
                  <span style={{ color: '#64748B', display: 'block' }}>Customer Name:</span>
                  <strong>{selectedBooking.customerName}</strong>
                </div>
                <div>
                  <span style={{ color: '#64748B', display: 'block' }}>Phone Number:</span>
                  <strong>{selectedBooking.customerPhone}</strong>
                </div>
                <div>
                  <span style={{ color: '#64748B', display: 'block' }}>Vehicle Model:</span>
                  <strong>{selectedBooking.carModel}</strong>
                </div>
                <div>
                  <span style={{ color: '#64748B', display: 'block' }}>Requested Service:</span>
                  <strong>{selectedBooking.serviceName || selectedBooking.service?.title}</strong>
                </div>
              </div>
              {selectedBooking.notes && (
                <div style={{ marginTop: '12px', borderTop: '1px dashed var(--border)', paddingTop: '8px', fontSize: '13px' }}>
                  <span style={{ color: '#64748B', display: 'block' }}>Customer Problem Description:</span>
                  <p style={{ margin: '4px 0 0 0', color: 'var(--text-main)', fontStyle: 'italic' }}>
                    "{selectedBooking.notes}"
                  </p>
                </div>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Booking Status *</label>
              <select
                className="form-select"
                value={editStatus}
                onChange={(e) => setEditStatus(e.target.value)}
              >
                <option value="pending">Pending Review</option>
                <option value="confirmed">Confirmed (Scheduled)</option>
                <option value="in_progress">In Progress (Vehicle In Workshop)</option>
                <option value="completed">Completed & Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Internal Workshop Notes / Mechanic Log</label>
              <textarea
                rows="3"
                placeholder="e.g. Assigned to Bay 3. Parts ordered. Expected completion 4:00 PM."
                className="form-textarea"
                value={editAdminNotes}
                onChange={(e) => setEditAdminNotes(e.target.value)}
              />
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setEditModalOpen(false)}
                disabled={submitting}
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={submitting}>
                {submitting ? 'Saving...' : 'Update Status'}
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Booking Record"
        message={`Are you sure you want to permanently delete booking "${bookingToDelete?.bookingNumber}" for ${bookingToDelete?.customerName}?`}
        confirmText="Delete Booking"
        isLoading={submitting}
      />
    </div>
  );
}
