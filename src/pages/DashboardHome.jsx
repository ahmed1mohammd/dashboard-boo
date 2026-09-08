import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  DollarSign,
  ShoppingBag,
  Car,
  Cog,
  CalendarCheck,
  Mail,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  Clock
} from 'lucide-react';
import { adminApi } from '../api/adminApi';

export default function DashboardHome() {
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    recentOrders: [],
    lowStockParts: []
  });
  const [counts, setCounts] = useState({
    cars: 0,
    parts: 0,
    bookings: 0,
    messages: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadOverview = async () => {
      try {
        setLoading(true);
        const [statsRes, carsRes, partsRes, bookingsRes, messagesRes] = await Promise.all([
          adminApi.getStats(),
          adminApi.getCars({ limit: 1 }),
          adminApi.getSpareParts({ limit: 1 }),
          adminApi.getBookings({ limit: 1 }),
          adminApi.getMessages({ limit: 1 })
        ]);

        if (statsRes.success) setStats(statsRes.data);
        setCounts({
          cars: carsRes.pagination?.total || 0,
          parts: partsRes.pagination?.total || 0,
          bookings: bookingsRes.pagination?.total || 0,
          messages: messagesRes.pagination?.unreadCount || 0
        });
      } catch (err) {
        console.error('Failed to load dashboard overview', err);
      } finally {
        setLoading(false);
      }
    };

    loadOverview();
  }, []);

  return (
    <div className="admin-dashboard-home">
      {/* KPI Cards Grid */}
      <div className="admin-kpi-grid">
        {/* Total Revenue */}
        <div className="admin-kpi-card">
          <div>
            <span className="kpi-title">Verified Revenue</span>
            <div className="kpi-value">{stats.totalRevenue?.toLocaleString()} EGP</div>
            <span style={{ fontSize: '0.75rem', color: 'var(--hover-green)', fontWeight: '700' }}>
              ✓ Via Fawaterk Gateway
            </span>
          </div>
          <div className="kpi-icon-box" style={{ backgroundColor: 'var(--secondary-light)', color: 'var(--hover-green)' }}>
            <DollarSign size={26} />
          </div>
        </div>

        {/* Total Orders */}
        <div className="admin-kpi-card">
          <div>
            <span className="kpi-title">Total Orders</span>
            <div className="kpi-value">{stats.totalOrders}</div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              {stats.pendingOrders} pending fulfillment
            </span>
          </div>
          <div className="kpi-icon-box" style={{ backgroundColor: 'var(--primary-light)', color: 'var(--primary)' }}>
            <ShoppingBag size={26} />
          </div>
        </div>

        {/* Active Vehicles */}
        <div className="admin-kpi-card">
          <div>
            <span className="kpi-title">Showroom Vehicles</span>
            <div className="kpi-value">{counts.cars}</div>
            <Link to="/cars" style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: '700' }}>
              Manage Inventory &rarr;
            </Link>
          </div>
          <div className="kpi-icon-box" style={{ backgroundColor: 'var(--bg-alt)', color: 'var(--text-main)' }}>
            <Car size={26} />
          </div>
        </div>

        {/* Service Bookings */}
        <div className="admin-kpi-card">
          <div>
            <span className="kpi-title">Service Bookings</span>
            <div className="kpi-value">{counts.bookings}</div>
            <Link to="/bookings" style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: '700' }}>
              View Appointments &rarr;
            </Link>
          </div>
          <div className="kpi-icon-box" style={{ backgroundColor: '#fef3c7', color: '#d97706' }}>
            <CalendarCheck size={26} />
          </div>
        </div>
      </div>

      {/* Low Stock Warning Alert Banner */}
      {stats.lowStockParts && stats.lowStockParts.length > 0 && (
        <div
          style={{
            backgroundColor: '#fffbeb',
            border: '1px solid #fde68a',
            borderRadius: 'var(--radius-md)',
            padding: '1.25rem 1.5rem',
            marginBottom: '2rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <AlertTriangle size={24} color="#d97706" />
            <div>
              <strong style={{ color: '#92400e', fontSize: '0.95rem' }}>
                Inventory Alert: {stats.lowStockParts.length} Spare Part(s) Low in Stock!
              </strong>
              <div style={{ fontSize: '0.825rem', color: '#b45309' }}>
                Items below minimum threshold: {stats.lowStockParts.map((p) => `${p.name} (${p.stock} left)`).join(', ')}
              </div>
            </div>
          </div>
          <Link to="/spare-parts" className="btn btn-warning btn-sm" style={{ backgroundColor: '#d97706', color: '#ffffff' }}>
            <span>Update Stock</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      )}

      {/* Two Column Layout: Recent Orders & Quick Shortcuts */}
      <div className="grid-2" style={{ alignItems: 'start' }}>
        {/* Recent Orders Card */}
        <div className="admin-card">
          <div className="admin-card-header">
            <h3>Recent Orders</h3>
            <Link to="/orders" className="btn btn-outline btn-sm">
              <span>View All</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Order #</th>
                  <th>Customer</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentOrders && stats.recentOrders.length > 0 ? (
                  stats.recentOrders.map((order) => (
                    <tr key={order._id}>
                      <td>
                        <strong>{order.orderNumber}</strong>
                      </td>
                      <td>{order.customer?.name}</td>
                      <td>{order.pricing?.total?.toLocaleString()} EGP</td>
                      <td>
                        <span
                          className={`badge ${
                            order.paymentStatus === 'paid' ? 'badge-success' : 'badge-warning'
                          }`}
                        >
                          {order.paymentStatus}
                        </span>
                      </td>
                      <td>
                        <Link to={`/orders?view=${order._id}`} className="btn btn-outline btn-sm">
                          Details
                        </Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                      No orders recorded yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Management Center */}
        <div className="admin-card">
          <div className="admin-card-header">
            <h3>Platform Modules</h3>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
            <Link
              to="/cars"
              style={{
                padding: '1.25rem',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--bg-sidebar)',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.35rem'
              }}
            >
              <Car size={22} color="var(--primary)" />
              <strong style={{ color: 'var(--heading)' }}>Cars Inventory</strong>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Add/edit showroom cars</span>
            </Link>

            <Link
              to="/spare-parts"
              style={{
                padding: '1.25rem',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--bg-sidebar)',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.35rem'
              }}
            >
              <Cog size={22} color="var(--secondary)" />
              <strong style={{ color: 'var(--heading)' }}>Spare Parts Store</strong>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Stock, SKUs & Pricing</span>
            </Link>

            <Link
              to="/content"
              style={{
                padding: '1.25rem',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--bg-sidebar)',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.35rem'
              }}
            >
              <TrendingUp size={22} color="var(--primary)" />
              <strong style={{ color: 'var(--heading)' }}>Site Content</strong>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Edit About, Why BOO, Contacts</span>
            </Link>

            <Link
              to="/messages"
              style={{
                padding: '1.25rem',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--bg-sidebar)',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.35rem'
              }}
            >
              <Mail size={22} color="#d97706" />
              <strong style={{ color: 'var(--heading)' }}>Inquiries Inbox</strong>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{counts.messages} unread messages</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
