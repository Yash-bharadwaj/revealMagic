import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ProtectedRoute } from './ProtectedRoute';

interface AdminRouteProps {
  children: React.ReactNode;
}

export const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  const { user } = useAuth();

  return (
    <ProtectedRoute>
      {user?.role === 'admin' ? (
        <>{children}</>
      ) : user?.role === 'performer' && user?.performerId ? (
        <Navigate to={`/${user.performerId}`} replace />
      ) : (
        <Navigate to="/dashboard" replace />
      )}
    </ProtectedRoute>
  );
};
