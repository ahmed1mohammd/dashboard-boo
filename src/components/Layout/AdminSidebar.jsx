import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  Cog,
  Layers,
  Wrench,
  CalendarCheck,
  ShoppingBag,
  Sliders,
  FileText,
  Mail,
  LogOut,
  ExternalLink
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function AdminSidebar() {
  const { logout, admin } = useAuth();

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Accessories', path: '/accessories', icon: Package },
    { name: 'Spare Parts', path: '/spare-parts', icon: Cog },
    { name: 'Categories', path: '/categories', icon: Layers },
    { name: 'Maintenance Services', path: '/maintenance', icon: Wrench },
    { name: 'Service Bookings', path: '/bookings', icon: CalendarCheck },
    { name: 'Orders & Payments', path: '/orders', icon: ShoppingBag },
    { name: 'Hero Carousel', path: '/hero', icon: Sliders },
    { name: 'Website Content', path: '/content', icon: FileText },
    { name: 'Contact Messages', path: '/messages', icon: Mail }
  ];

  return (
    <aside className="admin-sidebar">
      {/* Brand Header */}
      <div className="admin-sidebar-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <img
            src="https://i.ibb.co/JjhvXRfD/IMG-20260906-WA0161.jpg"
            alt="BOO Automotive"
            style={{ height: '38px', borderRadius: '4px', objectFit: 'contain' }}
          />
          <div>
            <div style={{ fontWeight: '800', color: '#ffffff', fontSize: '1.05rem', lineHeight: '1.1' }}>
              BOO ADMIN
            </div>
            <span style={{ fontSize: '0.7rem', color: 'var(--primary)', letterSpacing: '0.04em' }}>
              Automotive Platform
            </span>
          </div>
        </div>
      </div>

      {/* Navigation List */}
      <ul className="admin-nav-list">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <li key={item.path} className="admin-nav-item">
              <NavLink
                to={item.path}
                className={({ isActive }) => (isActive ? 'active' : '')}
                end={item.path === '/'}
              >
                <Icon size={18} />
                <span>{item.name}</span>
              </NavLink>
            </li>
          );
        })}
      </ul>

      {/* Sidebar Footer */}
      <div className="admin-sidebar-footer">
        <a
          href="http://localhost:3000"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0.65rem 0.85rem',
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            color: '#c4d7e8',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.825rem',
            fontWeight: '600',
            marginBottom: '0.75rem'
          }}
        >
          <span>View Live Store</span>
          <ExternalLink size={14} />
        </a>

        <button type="button" className="admin-logout-btn" onClick={logout}>
          <LogOut size={16} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
