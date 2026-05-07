import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';

const PrivateComponent = () => {
  const storedUser = JSON.parse(localStorage.getItem("user"));

  return storedUser?.token
    ? <Outlet />
    : <Navigate to="/login" />;
};

export default PrivateComponent;