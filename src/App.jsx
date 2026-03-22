import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useNavigate,
  useLocation,
} from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import ProductCategory from "./pages/ProductCategory";
import ProductDetails from "./pages/ProductDetails";
import Cart from "./pages/Cart";
import AboutUs from "./pages/AboutUs.jsx";
import Orders from "./pages/Orders";
import Profile from "./pages/Profile";
import MainLayout from "./layouts/MainLayout";
import SplashScreen from "./components/SplashScreen";
import { CartProvider } from "./context/CartContext";
import { AuthProvider, useAuth } from "./context/AuthContext";
import "./App.css";

const ProtectedRoute = ({ children }) => {
  const { user, userData, loading } = useAuth();

  if (loading) return null;

  if (!user || (userData?.role !== "user" && userData?.role !== "admin")) {
    return <Navigate to="/register" replace />;
  }

  return children;
};

function App() {
  const [showSplash, setShowSplash] = useState(true);

  const handleSplashComplete = () => {
    setShowSplash(false);
  };

  // No initial redirect component here — routing handles auth redirects.
  const PostSplashRedirect = ({ showSplash }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, loading } = useAuth();

    React.useEffect(() => {
      if (showSplash) return;
      if (loading) return;
      const path = location.pathname || "/";
      
      // If user is not logged in and at root, send to register (or login)
      if (!user && (path === "/" || path === "")) {
        navigate("/register", { replace: true });
      }
    }, [showSplash, loading, user, location.pathname, navigate]);

    return null;
  };

  return (
    <>
      <AuthProvider>
        <CartProvider>
          <Router>
            {/* Show splash while loading; SplashScreen calls onComplete to hide itself */}
            {showSplash && <SplashScreen onComplete={handleSplashComplete} />}
            <PostSplashRedirect showSplash={showSplash} />
            <Routes>
              <Route element={<MainLayout />}>
                {/* User Routes */}
                <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route
                  path="/products/:categoryId"
                  element={<ProtectedRoute><ProductCategory /></ProtectedRoute>}
                />
                <Route
                  path="/product/:productId"
                  element={<ProtectedRoute><ProductDetails /></ProtectedRoute>}
                />
                <Route path="/cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
                <Route path="/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
                <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                <Route path="/about" element={<AboutUs />} />
                
                {/* Auth Routes reachable with Navbar */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
              </Route>

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Router>
        </CartProvider>
      </AuthProvider>
    </>
  );
}

export default App;
