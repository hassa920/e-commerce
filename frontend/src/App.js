import './App.css';
import Nav from './Component/Nav/Nav';
import Footer from './Component/Footer/Footer';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import UpdateProduct from './Component/UpdateProduct/UpdateProduct';
import PrivateComponent from './Component/PrivateComponent';
import AddProduct from './Component/AddProduct/AddProduct';
import ProductList from './Component/ProductsList/ProductList';
import Login from './Component/Login/Login';
import SignUp from './Component/SignUp/SignUp';
import Cart from './Component/Cart/Cart';
import AdminOrders from './Component/AdminOrder/AdminOrder';
import PaymentPage from './Component/PaymentPage/PaymentPage.jsx';
import AdminDashboard from './Component/AdminDashboard/AdminDashboard.jsx';
import OrderHistory from './Component/OrderHistory/OrderHistory.jsx';
import ProductDetail from './Component/ProductDetail/ProductDetail.jsx';
import Profile from './Component/Profile/Profile.jsx';
import axios from 'axios';
import AdminRoute from './AdminRoute';
import Notifications from './Component/Notifications/Notifications.jsx';
import WhatsAppButton from './Component/WhatsAppButton/WhatsAppButton.jsx';
import { ToastProvider } from './Component/Toast/Toast.jsx';
import HomePage from './Component/HomePage/HomePage.jsx';

function App() {

  // ✅ FIX: always sync token on reload
  const storedUser = JSON.parse(localStorage.getItem("user"));
  const token = storedUser?.token;

  if (token) {
    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  }

  return (
    <ToastProvider>
      <div className="app-container">
        <WhatsAppButton />
        <BrowserRouter>
          <Nav />

          <div className="main-content">
            <Routes>

              {/* PUBLIC */}
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<SignUp />} />

              {/* PRIVATE USER ROUTES */}
              <Route element={<PrivateComponent />}>
                <Route path="/products" element={<ProductList />} />
                <Route path="/product/:id" element={<ProductDetail />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/orders" element={<OrderHistory />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/payment/:id" element={<PaymentPage />} />
                <Route path="/notifications" element={<Notifications />} />
              </Route>

              {/* ADMIN ROUTES */}
              <Route element={<AdminRoute />}>
                <Route path="/add" element={<AddProduct />} />
                <Route path="/update/:id" element={<UpdateProduct />} />
                <Route path="/admin/orders" element={<AdminOrders />} />
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
              </Route>

              <Route path="*" element={<Navigate to="/" />} />

            </Routes>
          </div>

          <Footer />
        </BrowserRouter>
      </div>
    </ToastProvider>
  );
}

export default App;