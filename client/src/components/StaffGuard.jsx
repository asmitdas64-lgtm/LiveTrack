import React from 'react';
import { Navigate } from 'react-router-dom';

export default function StaffGuard({ children }) {
    const isAuthenticated = sessionStorage.getItem('staff-auth') === 'true';

    if (!isAuthenticated) {
        return <Navigate to="/" replace />;
    }

    return children;
}
