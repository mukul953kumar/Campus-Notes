import React from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Loader from '../common/Loader';
import EmptyState from '../common/EmptyState';
import { ShieldAlert } from 'lucide-react';

export default function AdminRoute({ children }) {
  const { isAuthenticated, isAdmin, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <Loader fullScreen message="Verifying administrative privileges..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!isAdmin) {
    return (
      <div className="py-12">
        <EmptyState
          icon={ShieldAlert}
          title="Access Restricted"
          description="Administrative privileges are required to view this moderation portal."
          actionLabel="Return to Library"
          onAction={() => (window.location.href = '/')}
        />
      </div>
    );
  }

  return children || <Outlet />;
}
