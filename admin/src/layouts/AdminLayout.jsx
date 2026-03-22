import React, { useState, useEffect } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Store,
  Menu,
  Bell,
  Users,
  BarChart2,
  Box,
  FileText,
  Settings,
} from "lucide-react";
import "./AdminLayout.css";

const AdminLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  // Global Scroll Reveal Observer
  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('anim-visible');
        }
      });
    }, observerOptions);

    const elements = document.querySelectorAll('.anim-on-scroll');
    elements.forEach(el => observer.observe(el));

    return () => observer.disconnect();
  }, [location.pathname]);

  // Scroll to Top on route change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [location.pathname]);

  const sidebarItems = [
    { name: "Dashboard", path: "/dashboard", icon: <LayoutDashboard size={20} /> },
    { name: "Products", path: "/products", icon: <Package size={20} /> },
    { name: "Inventory", path: "/inventory", icon: <Box size={20} /> },
    { name: "User Details", path: "/users", icon: <Users size={20} /> },
    { name: "Orders", path: "/sales-orders", icon: <ShoppingCart size={20} /> },
    { name: "Invoice", path: "/invoices", icon: <FileText size={20} /> },
   
  ];

  const getPageTitle = () => {
    const item = sidebarItems.find(i => i.path === location.pathname);
    return item ? item.name : "Admin Panel";
  };

  return (
    <div className="admin-container">
      {/* Sidebar */}
      <aside className={`admin-sidebar ${isSidebarOpen ? "open" : "closed"}`}>
        <div className="sidebar-header">
          <h1 className="sidebar-brand">Amirthaa Admin</h1>
        </div>

        <nav className="sidebar-nav">
          {sidebarItems.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              className={`sidebar-link ${isActive(item.path) ? "active" : ""}`}
            >
              <span className="link-icon">{item.icon}</span>
              <span className="link-text">{item.name}</span>
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="admin-main">
        <header className="admin-header">
          <div className="header-left">
            <button
              className="sidebar-toggle-btn"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            >
              <Menu size={22} />
            </button>
            <h2 className="header-title">{getPageTitle()}</h2>
          </div>

          <div className="header-right">
            <button className="notification-btn">
              <Bell size={20} />
            </button>
            <div className="admin-profile-pill">
              <div className="profile-avatar">A</div>
              <span className="profile-name">Admin</span>
            </div>
          </div>
        </header>

        <div className="admin-content-wrapper">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
