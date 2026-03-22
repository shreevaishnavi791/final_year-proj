import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Login from "./pages/Login";
import Products from "./pages/Products";
import Users from "./pages/Users";
import Dashboard from "./pages/Dashboard";
import AdminLayout from "./layouts/AdminLayout";
import SpareParts from "./pages/SpareParts";
import Inventory from "./pages/Inventory";
import Distributors from "./pages/Distributors";
import SalesOrders from "./pages/SalesOrders";
import Invoices from "./pages/Invoices";
import Invoice from "./pages/Invoice";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import "./App.css";

import { AuthProvider, useAuth } from "./context/AuthContext";

const ProtectedRoute = ({ children }) => {
  const { user, userData, loading } = useAuth();

  // Allow local demo admin flag for quick testing without provisioning Firebase admin
  const localAdmin =
    typeof window !== "undefined" && localStorage.getItem("adminAuth") === "1";

  if (loading) return null;

  if (!user && !localAdmin) return <Navigate to="/login" replace />;

  if (localAdmin) return children;

  if (user && userData?.role !== "admin")
    return <Navigate to="/login" replace />;

  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Route */}
          <Route path="/login" element={<Login />} />

          {/* Admin Protected Routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="products" element={<Products />} />
            <Route path="users" element={<Users />} />
            <Route path="orders" element={<SalesOrders />} />
            <Route path="sales-orders" element={<SalesOrders />} />
            <Route path="spare-parts" element={<SpareParts />} />
            <Route path="inventory" element={<Inventory />} />
            <Route path="distributors" element={<Distributors />} />
            <Route path="invoices" element={<Invoices />} />
            <Route path="invoice/:orderId" element={<Invoice />} />
            <Route path="reports" element={<Reports />} />
            <Route path="settings" element={<Settings />} />
          </Route>

          {/* Fallback - Redirect to dashboard if logged in, otherwise login */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
