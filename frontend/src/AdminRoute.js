import { Navigate, Outlet } from "react-router-dom";

const AdminRoute = () => {
  const storedUser = JSON.parse(localStorage.getItem("user"));
  const user = storedUser?.user;

  return user?.role === "admin"
    ? <Outlet />
    : <Navigate to="/" />;
};

export default AdminRoute;