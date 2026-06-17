import React from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import ProductList from "./pages/ProductLists.jsx";
import Navbar from "./components/Navbar.jsx";
import "@fortawesome/fontawesome-free/css/all.min.css";
import LanguageSetting from "./pages/LanguageSetting.jsx";
import Login from "./pages/Login.jsx";
import Home from "./pages/Home.jsx";
import Cart from "./pages/Cart.jsx";
import ProductDetail from "./pages/ProductDetail.jsx";
import Profile from "./pages/profile.jsx";
import BrowsingHistory from "./pages/BrowsingHistory.jsx";
import Checkout from "./pages/Checkout.jsx";
import OrderPlaced from "./pages/OrderPlaced.jsx";
import MyOrders from "./pages/MyOrders.jsx";
import AiAssistant from "./components/AiAssistant.jsx";

function App() {
  const location = useLocation();

  const excludedPaths = [
    "/browsing-history",
    "/languagesetting",
    "/login",
    "/profile"
  ];

  const hideAssistant = excludedPaths.includes(location.pathname.toLowerCase());

  return (
    <>
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/products/:categoryName" element={<ProductList />} />
          <Route path="/languageSetting" element={<LanguageSetting />} />
          <Route path="/login" element={<Login />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/product/:productId" element={<ProductDetail />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/browsing-history" element={<BrowsingHistory />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/order-placed/:orderId" element={<OrderPlaced />} />
          <Route path="/my-orders" element={<MyOrders />} />
        </Routes>
      </main>
      {!hideAssistant && <AiAssistant />}
    </>
  );
}

export default App;