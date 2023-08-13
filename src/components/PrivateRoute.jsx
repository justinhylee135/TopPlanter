import React from 'react';
import { useAuth } from '../AuthContext.jsx'; // Make sure to provide the correct path
import { Navigate } from 'react-router-dom';

function PrivateRoute({ children }) {
  const { currentUser } = useAuth();

  if (!currentUser) {
    return <Navigate to="/login" />;
  }

  return children;
}

export default PrivateRoute;
