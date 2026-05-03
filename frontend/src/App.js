import './App.css';
import Nav from './Component/Nav/Nav';
import Footer from './Component/Footer/Footer';
import { BrowserRouter, Routes, Route ,Navigate} from 'react-router-dom';
import UpdateProduct from './Component/UpdateProduct/UpdateProduct';
import PrivateComponent from './Component/PrivateComponent';
import AddProduct from './Component/AddProduct/AddProduct';
import ProductList from './Component/ProductsList/ProductList';
import Login from './Component/Login/Login';
import SignUp from './Component/SignUp/SignUp';
import Cart from './Component/Cart/Cart';
import AdminOrders from './Component/AdminOrder/AdminOrder';
import PaymentPage from "./Component/PaymentPage/PaymentPage.jsx";
import axios from "axios";
import AdminRoute from './AdminRoute';
import Notifications from './Component/Notifications/Notifications.jsx';
import WhatsAppButton from './Component/WhatsAppButton/WhatsAppButton.jsx';
// ===============================
// ✅ AUTO ATTACH TOKEN
// ===============================
const token = localStorage.getItem("token");

if (token) {
  axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
}

function App() {

  return (
    <div className="app-container">
      <WhatsAppButton />
      <BrowserRouter>

        <Nav />

        <div className="main-content">

          <Routes>

            {/* 🔐 USER PROTECTED ROUTES */}
            <Route element={<PrivateComponent />}>


              <Route path="/" element={<ProductList />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/profile" element={<h1>Profile</h1>} />

              {/* 💳 PAYMENT ROUTE */}
              <Route path="/payment/:id" element={<PaymentPage />} />

              {/* 🔔 NOTIFICATIONS ROUTE (FIXED LOCATION) */}
              <Route path="/notifications" element={<Notifications />} />

              {/* 👑 ADMIN ONLY ROUTES */}
              <Route element={<AdminRoute />}>

                <Route path="/add" element={<AddProduct />} />
                <Route path="/update/:id" element={<UpdateProduct />} />
                <Route path="/admin/orders" element={<AdminOrders />} />

              </Route>

            </Route>

            {/* 👤 PUBLIC ROUTES */}
            <Route path="/signup" element={<SignUp />} />
            <Route path="/login" element={<Login />} />
            <Route path="*" element={<Navigate to="/" />} />

          </Routes>

        </div>

        <Footer />

      </BrowserRouter>

    </div>
  );
}

export default App;