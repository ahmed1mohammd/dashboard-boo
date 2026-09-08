import React, { useState, useEffect } from 'react';
import { ShoppingBag, Search, Filter, Phone, MessageSquare, MapPin, Eye, CheckCircle, Clock, Truck, Package, XCircle, AlertCircle } from 'lucide-react';
import { adminApi } from '../api/adminApi';
import Modal from '../components/Common/Modal';

export default function OrdersManager() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('');

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [updating, setUpdating] = useState(false);

  // Status edit state for open order modal
  const [newOrderStatus, setNewOrderStatus] = useState('pending');
  const [newPaymentStatus, setNewPaymentStatus] = useState('unpaid');
  const [trackingNumber, setTrackingNumber] = useState('');

  const loadOrders = async () => {
    try {
      setLoading(true);
      const params = {};
      if (orderStatusFilter) params.orderStatus = orderStatusFilter;
      if (paymentStatusFilter) params.paymentStatus = paymentStatusFilter;
      const res = await adminApi.getOrders(params);
      if (res.success) setOrders(res.data);
    } catch (err) {
      console.error('Failed to load orders', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [orderStatusFilter, paymentStatusFilter]);

  const handleOpenDetails = (order) => {
    setSelectedOrder(order);
    setNewOrderStatus(order.orderStatus);
    setNewPaymentStatus(order.paymentStatus);
    setTrackingNumber(order.trackingNumber || '');
    setDetailsModalOpen(true);
  };

  const handleUpdateOrder = async (e) => {
    e.preventDefault();
    if (!selectedOrder) return;
    try {
      setUpdating(true);
      const res = await adminApi.updateOrder(selectedOrder._id, {
        orderStatus: newOrderStatus,
        paymentStatus: newPaymentStatus,
        trackingNumber: trackingNumber
      });
      if (res.success) {
        setSelectedOrder(res.data);
        loadOrders();
      }
    } catch (err) {
      console.error('Failed to update order', err);
    } finally {
      setUpdating(false);
    }
  };

  const filteredOrders = orders.filter((o) => {
    const term = searchTerm.toLowerCase();
    return (
      o.orderNumber?.toLowerCase().includes(term) ||
      o.customer?.name?.toLowerCase().includes(term) ||
      o.customer?.phone?.toLowerCase().includes(term) ||
      o.customer?.email?.toLowerCase().includes(term) ||
      o.shippingAddress?.city?.toLowerCase().includes(term)
    );
  });

  const getOrderStatusBadge = (status) => {
    switch (status) {
      case 'preparing':
        return <span className="status-badge" style={{ background: '#FEF3C7', color: '#B45309' }}>Preparing</span>;
      case 'shipped':
        return <span className="status-badge" style={{ background: '#E1F3FA', color: '#00AEEF' }}>Shipped</span>;
      case 'delivered':
        return <span className="status-badge status-active">Delivered</span>;
      case 'cancelled':
        return <span className="status-badge status-inactive">Cancelled</span>;
      default:
        return <span className="status-badge" style={{ background: '#F1F5F9', color: '#475569' }}>Pending</span>;
    }
  };

  const getPaymentStatusBadge = (status) => {
    switch (status) {
      case 'paid':
        return <span className="badge badge-success">PAID</span>;
      case 'failed':
        return <span className="badge badge-danger">FAILED</span>;
      case 'refunded':
        return <span className="badge badge-warning">REFUNDED</span>;
      default:
        return <span className="badge badge-neutral">UNPAID</span>;
    }
  };

  return (
    <div className="module-container">
      {/* Top Header */}
      <div className="section-header">
        <div>
          <h2 className="section-title">Spare Parts Orders</h2>
          <p className="section-subtitle">Track e-commerce checkout transactions, payment gateways, and fulfillment status</p>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="filter-bar">
        <div className="search-box">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            placeholder="Search by order #, customer, phone, city..."
            className="search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filter-group">
          <label className="filter-label">
            <Filter size={14} /> Fulfillment:
          </label>
          <select
            className="filter-select"
            value={orderStatusFilter}
            onChange={(e) => setOrderStatusFilter(e.target.value)}
          >
            <option value="">All Fulfillment</option>
            <option value="pending">Pending</option>
            <option value="preparing">Preparing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        <div className="filter-group">
          <label className="filter-label">Payment:</label>
          <select
            className="filter-select"
            value={paymentStatusFilter}
            onChange={(e) => setPaymentStatusFilter(e.target.value)}
          >
            <option value="">All Payments</option>
            <option value="paid">Paid</option>
            <option value="unpaid">Unpaid</option>
            <option value="failed">Failed</option>
            <option value="refunded">Refunded</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="data-card">
        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading e-commerce orders...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="empty-state">
            <ShoppingBag size={48} />
            <h3>No Orders Found</h3>
            <p>Customer purchases from the spare parts store will show here.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Order #</th>
                  <th>Date</th>
                  <th>Customer</th>
                  <th>Items</th>
                  <th>Total Amount</th>
                  <th>Payment</th>
                  <th>Fulfillment</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((ord) => (
                  <tr key={ord._id}>
                    <td>
                      <span className="badge badge-info" style={{ fontWeight: '600', fontFamily: 'monospace' }}>
                        {ord.orderNumber}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: '12px', color: '#64748B' }}>
                        {new Date(ord.createdAt).toLocaleDateString()}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span className="td-title">{ord.customer?.name}</span>
                        <span className="td-sub">{ord.customer?.phone}</span>
                      </div>
                    </td>
                    <td>
                      <span className="badge badge-neutral">
                        {ord.items?.reduce((sum, item) => sum + item.quantity, 0) || ord.items?.length || 0} items
                      </span>
                    </td>
                    <td>
                      <strong style={{ color: 'var(--text-main)', fontSize: '15px' }}>
                        {ord.pricing?.total?.toLocaleString()} {ord.pricing?.currency || 'EGP'}
                      </strong>
                    </td>
                    <td>{getPaymentStatusBadge(ord.paymentStatus)}</td>
                    <td>{getOrderStatusBadge(ord.orderStatus)}</td>
                    <td>
                      <div className="table-actions">
                        <button
                          className="action-btn edit-btn"
                          title="View Invoice & Manage"
                          onClick={() => handleOpenDetails(ord)}
                        >
                          <Eye size={16} />
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

      {/* Order Details & Invoice Modal */}
      <Modal
        isOpen={detailsModalOpen}
        onClose={() => setDetailsModalOpen(false)}
        title={selectedOrder ? `Invoice: ${selectedOrder.orderNumber}` : 'Order Details'}
        maxWidth="850px"
      >
        {selectedOrder && (
          <div className="order-details-wrapper" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Header info bar */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', background: 'var(--bg-sidebar)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border)' }}>
              <div>
                <h4 style={{ margin: '0 0 8px 0', fontSize: '14px', color: 'var(--text-main)' }}>Customer Information</h4>
                <p style={{ margin: '2px 0', fontSize: '13px' }}><strong>Name:</strong> {selectedOrder.customer?.name}</p>
                <p style={{ margin: '2px 0', fontSize: '13px' }}>
                  <strong>Phone:</strong>{' '}
                  <a href={`tel:${selectedOrder.customer?.phone}`} style={{ color: 'var(--primary)' }}>
                    {selectedOrder.customer?.phone}
                  </a>
                </p>
                {selectedOrder.customer?.email && (
                  <p style={{ margin: '2px 0', fontSize: '13px' }}><strong>Email:</strong> {selectedOrder.customer?.email}</p>
                )}
                <div style={{ marginTop: '8px', display: 'flex', gap: '8px' }}>
                  <a
                    href={`https://wa.me/${selectedOrder.customer?.phone?.replace(/[^0-9]/g, '')}?text=Hello%20${encodeURIComponent(selectedOrder.customer?.name)},%20regarding%20your%20BOO%20order%20${selectedOrder.orderNumber}...`}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-secondary"
                    style={{ fontSize: '12px', padding: '4px 10px' }}
                  >
                    <MessageSquare size={13} /> WhatsApp
                  </a>
                  <a
                    href={`tel:${selectedOrder.customer?.phone}`}
                    className="btn btn-outline"
                    style={{ fontSize: '12px', padding: '4px 10px' }}
                  >
                    <Phone size={13} /> Call
                  </a>
                </div>
              </div>

              <div>
                <h4 style={{ margin: '0 0 8px 0', fontSize: '14px', color: 'var(--text-main)' }}>Shipping Destination</h4>
                <p style={{ margin: '2px 0', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <MapPin size={14} color="var(--primary)" />
                  <strong>{selectedOrder.shippingAddress?.governorate}, {selectedOrder.shippingAddress?.city}</strong>
                </p>
                <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#475569' }}>
                  {selectedOrder.shippingAddress?.address}
                </p>
                {selectedOrder.fawaterkInvoiceId && (
                  <p style={{ margin: '8px 0 0 0', fontSize: '12px', color: '#64748B' }}>
                    <strong>Fawaterk Invoice:</strong> #{selectedOrder.fawaterkInvoiceId}
                  </p>
                )}
              </div>
            </div>

            {/* Order Items Table */}
            <div>
              <h4 style={{ margin: '0 0 10px 0', fontSize: '15px' }}>Ordered Items</h4>
              <div className="table-responsive" style={{ border: '1px solid var(--border)', borderRadius: '6px' }}>
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>SKU</th>
                      <th>Unit Price</th>
                      <th>Qty</th>
                      <th style={{ textAlign: 'right' }}>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedOrder.items?.map((item, idx) => (
                      <tr key={idx}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            {item.image ? (
                              <img
                                src={item.image}
                                alt={item.name}
                                style={{ width: '40px', height: '40px', borderRadius: '4px', objectFit: 'cover' }}
                              />
                            ) : (
                              <div className="table-thumb-placeholder" style={{ width: '40px', height: '40px' }}>
                                <Package size={18} />
                              </div>
                            )}
                            <div>
                              <strong style={{ fontSize: '13px', display: 'block' }}>{item.name}</strong>
                              <span style={{ fontSize: '11px', color: '#64748B' }}>{item.brand}</span>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span style={{ fontFamily: 'monospace', fontSize: '12px' }}>{item.sku}</span>
                        </td>
                        <td>{item.unitPrice?.toLocaleString()} EGP</td>
                        <td><strong>x{item.quantity}</strong></td>
                        <td style={{ textAlign: 'right', fontWeight: '600' }}>
                          {item.totalPrice?.toLocaleString()} EGP
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pricing Summary */}
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <div style={{ width: '280px', background: 'var(--bg-sidebar)', padding: '14px', borderRadius: '8px', border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}>
                  <span>Subtotal:</span>
                  <span>{selectedOrder.pricing?.subtotal?.toLocaleString()} EGP</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '8px' }}>
                  <span>Shipping:</span>
                  <span>{selectedOrder.pricing?.shipping?.toLocaleString()} EGP</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '16px', fontWeight: '700', color: 'var(--text-main)', borderTop: '1px solid var(--border)', paddingTop: '8px' }}>
                  <span>Grand Total:</span>
                  <span style={{ color: 'var(--primary)' }}>{selectedOrder.pricing?.total?.toLocaleString()} EGP</span>
                </div>
              </div>
            </div>

            {/* Fulfillment Status Management Form */}
            <form onSubmit={handleUpdateOrder} style={{ borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
              <h4 style={{ margin: '0 0 12px 0', fontSize: '15px' }}>Update Order & Payment Status</h4>
              <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr 1fr' }}>
                <div className="form-group">
                  <label className="form-label">Fulfillment Status</label>
                  <select
                    className="form-select"
                    value={newOrderStatus}
                    onChange={(e) => setNewOrderStatus(e.target.value)}
                  >
                    <option value="pending">Pending</option>
                    <option value="preparing">Preparing Order</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Payment Status</label>
                  <select
                    className="form-select"
                    value={newPaymentStatus}
                    onChange={(e) => setNewPaymentStatus(e.target.value)}
                  >
                    <option value="unpaid">Unpaid</option>
                    <option value="paid">Paid (Fawaterk Confirmed)</option>
                    <option value="failed">Payment Failed</option>
                    <option value="refunded">Refunded</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Courier Tracking #</label>
                  <input
                    type="text"
                    placeholder="e.g. BOO-SHIP-88219"
                    className="form-input"
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '14px' }}>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setDetailsModalOpen(false)}
                >
                  Close
                </button>
                <button type="submit" className="btn btn-primary" disabled={updating}>
                  {updating ? 'Updating...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        )}
      </Modal>
    </div>
  );
}
