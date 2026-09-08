import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import AdminLayout from './components/Layout/AdminLayout';
import Login from './pages/Login';
import DashboardHome from './pages/DashboardHome';
import CarsManager from './pages/CarsManager';
import SparePartsManager from './pages/SparePartsManager';
import CategoriesManager from './pages/CategoriesManager';
import MaintenanceManager from './pages/MaintenanceManager';
import BookingsManager from './pages/BookingsManager';
import OrdersManager from './pages/OrdersManager';
import HeroManager from './pages/HeroManager';
import ContentManager from './pages/ContentManager';
import MessagesManager from './pages/MessagesManager';

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: 'var(--bg-main)' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default function App() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/" replace /> : <Login />}
      />

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardHome />} />
        <Route path="cars" element={<CarsManager />} />
        <Route path="spare-parts" element={<SparePartsManager />} />
        <Route path="categories" element={<CategoriesManager />} />
        <Route path="maintenance" element={<MaintenanceManager />} />
        <Route path="bookings" element={<BookingsManager />} />
        <Route path="orders" element={<OrdersManager />} />
        <Route path="hero" element={<HeroManager />} />
        <Route path="content" element={<ContentManager />} />
        <Route path="messages" element={<MessagesManager />} />
      </Route>

      {/* Catch-all redirect */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
