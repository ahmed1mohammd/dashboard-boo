import React, { useState, useEffect } from 'react';
import { Mail, MessageSquare, Phone, Search, Filter, Trash2, Eye, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { adminApi } from '../api/adminApi';
import Modal from '../components/Common/Modal';
import ConfirmModal from '../components/Common/ConfirmModal';

export default function MessagesManager() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const [selectedMessage, setSelectedMessage] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editStatus, setEditStatus] = useState('unread');
  const [editAdminNotes, setEditAdminNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [messageToDelete, setMessageToDelete] = useState(null);

  const loadMessages = async () => {
    try {
      setLoading(true);
      const params = {};
      if (statusFilter) params.status = statusFilter;
      const res = await adminApi.getMessages(params);
      if (res.success) setMessages(res.data);
    } catch (err) {
      console.error('Failed to load contact messages', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMessages();
  }, [statusFilter]);

  const handleOpenMessage = async (msg) => {
    setSelectedMessage(msg);
    setEditStatus(msg.status === 'unread' ? 'read' : msg.status);
    setEditAdminNotes(msg.adminNotes || '');
    setModalOpen(true);

    // Auto mark as read if unread
    if (msg.status === 'unread') {
      try {
        await adminApi.updateMessage(msg._id, { status: 'read' });
        loadMessages();
      } catch (err) {
        console.error('Failed to mark message as read', err);
      }
    }
  };

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    if (!selectedMessage) return;
    try {
      setSubmitting(true);
      await adminApi.updateMessage(selectedMessage._id, {
        status: editStatus,
        adminNotes: editAdminNotes
      });
      setModalOpen(false);
      loadMessages();
    } catch (err) {
      console.error('Failed to update message status', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!messageToDelete) return;
    try {
      setSubmitting(true);
      await adminApi.deleteMessage(messageToDelete._id);
      setDeleteConfirmOpen(false);
      setMessageToDelete(null);
      loadMessages();
    } catch (err) {
      console.error('Failed to delete message', err);
    } finally {
      setSubmitting(false);
    }
  };

  const filteredMessages = messages.filter((m) => {
    const term = searchTerm.toLowerCase();
    return (
      m.name?.toLowerCase().includes(term) ||
      m.phone?.toLowerCase().includes(term) ||
      m.email?.toLowerCase().includes(term) ||
      m.subject?.toLowerCase().includes(term) ||
      m.message?.toLowerCase().includes(term)
    );
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'replied':
        return <span className="status-badge status-active">Replied</span>;
      case 'read':
        return <span className="status-badge" style={{ background: '#E1F3FA', color: '#00AEEF' }}>Read</span>;
      default:
        return <span className="status-badge" style={{ background: '#FEF3C7', color: '#B45309', fontWeight: 'bold' }}>● Unread</span>;
    }
  };

  return (
    <div className="module-container">
      {/* Top Header */}
      <div className="section-header">
        <div>
          <h2 className="section-title">Customer Inquiries & Messages</h2>
          <p className="section-subtitle">Manage direct contact form submissions, inquiries, and customer communication</p>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="filter-bar">
        <div className="search-box">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            placeholder="Search by sender, phone, subject, content..."
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
            <option value="">All Inquiries</option>
            <option value="unread">Unread Only</option>
            <option value="read">Read</option>
            <option value="replied">Replied</option>
          </select>
        </div>
      </div>

      {/* Messages Table */}
      <div className="data-card">
        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading customer inquiries...</p>
          </div>
        ) : filteredMessages.length === 0 ? (
          <div className="empty-state">
            <Mail size={48} />
            <h3>No Messages Found</h3>
            <p>Customer inquiries submitted via the website contact form will appear here.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Sender</th>
                  <th>Subject</th>
                  <th>Preview</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredMessages.map((msg) => (
                  <tr
                    key={msg._id}
                    style={{
                      background: msg.status === 'unread' ? 'rgba(0, 174, 239, 0.04)' : 'transparent',
                      fontWeight: msg.status === 'unread' ? '600' : 'normal'
                    }}
                  >
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span className="td-title">{msg.name}</span>
                        <span className="td-sub" style={{ fontSize: '11px' }}>{msg.phone}</span>
                      </div>
                    </td>
                    <td>
                      <span style={{ fontSize: '13px', color: 'var(--text-main)' }}>{msg.subject || 'General'}</span>
                    </td>
                    <td>
                      <span
                        style={{
                          fontSize: '12px',
                          color: '#64748B',
                          maxWidth: '280px',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          display: 'block'
                        }}
                      >
                        {msg.message}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: '12px', color: '#64748B' }}>
                        {new Date(msg.createdAt).toLocaleDateString()}
                      </span>
                    </td>
                    <td>{getStatusBadge(msg.status)}</td>
                    <td>
                      <div className="table-actions">
                        <a
                          href={`https://wa.me/${msg.phone.replace(/[^0-9]/g, '')}?text=Hello%20${encodeURIComponent(msg.name)},%20thank%20you%20for%20contacting%20BOO%20Automotive...`}
                          target="_blank"
                          rel="noreferrer"
                          className="action-btn"
                          title="Reply on WhatsApp"
                          style={{ color: '#25D366' }}
                        >
                          <MessageSquare size={16} />
                        </a>
                        <button
                          className="action-btn edit-btn"
                          title="Read Message"
                          onClick={() => handleOpenMessage(msg)}
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          className="action-btn delete-btn"
                          title="Delete Message"
                          onClick={() => {
                            setMessageToDelete(msg);
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

      {/* Message Reader Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={selectedMessage ? `Inquiry from ${selectedMessage.name}` : 'Customer Message'}
        maxWidth="650px"
      >
        {selectedMessage && (
          <form onSubmit={handleUpdateStatus} className="admin-form">
            <div style={{ background: 'var(--bg-sidebar)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border)', marginBottom: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '13px' }}>
                <div>
                  <span style={{ color: '#64748B', display: 'block' }}>Sender Name:</span>
                  <strong>{selectedMessage.name}</strong>
                </div>
                <div>
                  <span style={{ color: '#64748B', display: 'block' }}>Phone Number:</span>
                  <a href={`tel:${selectedMessage.phone}`} style={{ color: 'var(--primary)', fontWeight: 'bold' }}>
                    {selectedMessage.phone}
                  </a>
                </div>
                <div>
                  <span style={{ color: '#64748B', display: 'block' }}>Email:</span>
                  <span>{selectedMessage.email || 'None provided'}</span>
                </div>
                <div>
                  <span style={{ color: '#64748B', display: 'block' }}>Subject:</span>
                  <strong>{selectedMessage.subject}</strong>
                </div>
              </div>

              <div style={{ marginTop: '12px', borderTop: '1px dashed var(--border)', paddingTop: '10px' }}>
                <span style={{ color: '#64748B', fontSize: '12px', display: 'block', marginBottom: '4px' }}>Message Body:</span>
                <p style={{ margin: 0, fontSize: '14px', lineHeight: '1.6', color: 'var(--text-main)', background: '#FFFFFF', padding: '12px', borderRadius: '6px', border: '1px solid var(--border)' }}>
                  {selectedMessage.message}
                </p>
              </div>

              <div style={{ marginTop: '14px', display: 'flex', gap: '8px' }}>
                <a
                  href={`https://wa.me/${selectedMessage.phone.replace(/[^0-9]/g, '')}?text=Hello%20${encodeURIComponent(selectedMessage.name)},%20thank%20you%20for%20contacting%20BOO%20Automotive...`}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-secondary"
                  style={{ fontSize: '12px' }}
                >
                  <MessageSquare size={14} /> Open WhatsApp Chat
                </a>
                <a
                  href={`tel:${selectedMessage.phone}`}
                  className="btn btn-outline"
                  style={{ fontSize: '12px' }}
                >
                  <Phone size={14} /> Call Sender
                </a>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Inquiry Status</label>
              <select
                className="form-select"
                value={editStatus}
                onChange={(e) => setEditStatus(e.target.value)}
              >
                <option value="unread">Unread</option>
                <option value="read">Read / In Review</option>
                <option value="replied">Replied & Closed</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Admin Follow-up Log / Internal Notes</label>
              <textarea
                rows="3"
                placeholder="e.g. Contacted via WhatsApp at 2:30 PM. Sent quote for brake pads."
                className="form-textarea"
                value={editAdminNotes}
                onChange={(e) => setEditAdminNotes(e.target.value)}
              />
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setModalOpen(false)}
                disabled={submitting}
              >
                Close
              </button>
              <button type="submit" className="btn btn-primary" disabled={submitting}>
                {submitting ? 'Saving...' : 'Save Notes & Status'}
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
        title="Delete Customer Message"
        message={`Are you sure you want to permanently delete this message from ${messageToDelete?.name}?`}
        confirmText="Delete Message"
        isLoading={submitting}
      />
    </div>
  );
}
