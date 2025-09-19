// src/hooks/useRoleRedirect.js
import { useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';

export function useRoleRedirect() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleRedirect = useCallback(() => {
    if (!user) return;

    // Only redirect if they are on the landing page
    if (location.pathname === '/' || location.pathname === '/login') {
      switch (user.role) {
        case 'admin':
          navigate('/admin-dashboard');
          break;
        case 'teacher':
          navigate('/teacher-dashboard');
          break;
        case 'student':
          navigate('/student-dashboard');
          break;
        default:
          // Stay on the current page if role is unknown
          break;
      }
    }
  }, [user, navigate, location.pathname]);

  useEffect(() => {
    handleRedirect();
  }, [user, handleRedirect]);
}