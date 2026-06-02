import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { WishlistProvider } from "./context/WishlistContext";
import { CartProvider } from "./context/CartContext";

import CategoryProducts from "./pages/CategoryProducts";

import HomePage from "./pages/HomePage";
import WishlistPage from "./pages/WishlistPage";
import CartPage from "./pages/CartPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import Checkout from "./pages/Checkout";
import OrderSuccess from "./pages/OrderSuccess"; // ✅ Import Success Page
import AuthPage from "./pages/AuthPage";         // ✅ Import Login/Signup Page
import LandingPage from "./pages/LandingPage";   // ✅ Import Landing Page
import AdminDashboard from "./admin/AdminDashboard"; // ✅ Import Admin Dashboard
import AddCategory from "./admin/AddCategory";
import AddProduct from "./admin/AddProduct";
import RemoveProductPage from "./admin/RemoveProductPage";
import AdminOrdersPage from "./admin/AdminOrdersPage";
import AdminSupportPage from "./admin/AdminSupportPage"; // ✅ Import Admin Support
import EditProduct from "./admin/EditProduct"; // ✅ Import Edit Product
import OrdersPage from "./pages/OrdersPage"; // ✅ Import Orders Page
import CustomerService from "./pages/CustomerService"; // ✅ Import Customer Service Page
import Profile from "./pages/Profile";
function App() {
  return (
    <WishlistProvider>
      <CartProvider>
        <Router>
          <Routes>
            {/* Landing & Auth Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/auth" element={<AuthPage />} />

            {/* Shop Routes */}
            <Route path="/home" element={<HomePage />} />
            <Route path="/wishlist" element={<WishlistPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/orders" element={<OrdersPage />} /> {/* ✅ Orders Route */}
            <Route path="/order-success" element={<OrderSuccess />} /> {/* ✅ Success Page */}
            <Route path="/product/:id" element={<ProductDetailPage />} />
            <Route path="/customer-service" element={<CustomerService />} />

            {/* Admin Route (Optional if you have it) */}
            {/* Admin Route */}
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/add-category" element={<AddCategory />} />
            <Route path="/admin/add-product" element={<AddProduct />} />
            <Route path="/admin/edit-product/:id" element={<EditProduct />} />
            <Route path="/admin/remove-product" element={<RemoveProductPage />} />
            <Route path="/admin/orders" element={<AdminOrdersPage />} />
            <Route path="/admin/support" element={<AdminSupportPage />} />

            {/* Category Products Route */}
            <Route path="/category/:category" element={<CategoryProducts />} />

            <Route path="/profile" element={<Profile />} />

          </Routes>
        </Router>
      </CartProvider>
    </WishlistProvider>
  );
}

export default App;