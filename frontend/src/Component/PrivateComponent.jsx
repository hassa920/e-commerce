import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';

const PrivateComponent = () => {
  const user = localStorage.getItem("user");
  const token = localStorage.getItem("token");

  let parsedUser = null;
  try {
    parsedUser = user ? JSON.parse(user) : null;
  } catch (err) {
    parsedUser = null;
  }

  return parsedUser && token ? <Outlet /> : <Navigate to="/login" />;
};

export default PrivateComponent;