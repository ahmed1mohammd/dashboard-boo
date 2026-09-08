import React from 'react';
import { Bell, Shield, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function AdminHeader({ title = 'Control Center' }) {
  const { admin } = useAuth();

  return (
    <header className="admin-header">
      <div className="admin-header-title">{title}</div>

      <div className="admin-header-right">
        {/* Admin User Info */}
        <div className="admin-user-pill">
          <div className="admin-avatar">
            {admin?.name?.charAt(0) || 'A'}
          </div>
          <div>
            <div style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--heading)', lineHeight: '1.2' }}>
              {admin?.name || 'Administrator'}
            </div>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>
              {admin?.role || 'Superadmin'}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
