import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import Orders from "./Orders";
import Cart from "./Cart";
import { 
  User, 
  Package, 
  ShoppingCart, 
  Settings, 
  LogOut,
  Mail,
  Phone,
  MapPin,
  Calendar,
  ChevronRight,
  Shield,
  Bell,
  CreditCard
} from "lucide-react";
import "./Profile.css";

const Profile = () => {
  const { userData, logout } = useAuth();
  const { cartCount } = useCart();
  const [activeTab, setActiveTab] = useState("profile");

  const tabs = [
    { id: "profile", label: "Profile Info", icon: <User size={20} /> },
    { id: "orders", label: "Order History", icon: <Package size={20} /> },
    { id: "cart", label: "My Cart", icon: <ShoppingCart size={20} />, badge: cartCount },
    { id: "settings", label: "Settings", icon: <Settings size={20} /> },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case "profile":
        return (
          <div className="profile-details-section fade-in">
            <div className="section-header">
              <h3>Account Information</h3>
              <p>Manage your personal details and contact information</p>
            </div>
            
            <div className="info-grid">
              <div className="info-card">
                <div className="info-icon"><User /></div>
                <div className="info-content">
                  <label>Full Name</label>
                  <p>{userData?.name || "Not set"}</p>
                </div>
              </div>
              
              <div className="info-card">
                <div className="info-icon"><Mail /></div>
                <div className="info-content">
                  <label>Email Address</label>
                  <p>{userData?.email || "Not set"}</p>
                </div>
              </div>
              
              <div className="info-card">
                <div className="info-icon"><Phone /></div>
                <div className="info-content">
                  <label>Phone Number</label>
                  <p>{userData?.phone || "Not set"}</p>
                </div>
              </div>
              
              <div className="info-card">
                <div className="info-icon"><MapPin /></div>
                <div className="info-content">
                  <label>Address</label>
                  <p>{userData?.address || "No address added yet"}</p>
                </div>
              </div>
            </div>

            <div className="additional-info">
              <div className="info-row">
                <Calendar size={18} />
                <span>Member since: {userData?.loginTime ? new Date(userData.loginTime).toLocaleDateString() : "N/A"}</span>
              </div>
              <div className="info-row">
                <Shield size={18} />
                <span>Account Status: Active</span>
              </div>
            </div>
          </div>
        );
      case "orders":
        return <div className="tab-container fade-in"><Orders standalone={false} /></div>;
      case "cart":
        return <div className="tab-container fade-in"><Cart standalone={false} /></div>;
      case "settings":
        return (
          <div className="settings-section fade-in">
            <div className="section-header">
              <h3>Settings</h3>
              <p>Configure your account preferences</p>
            </div>
            
            <div className="settings-list">
              <div className="settings-item">
                <div className="settings-info">
                  <Bell size={20} />
                  <div>
                    <h4>Notifications</h4>
                    <p>Manage your email alerts and updates</p>
                  </div>
                </div>
                <label className="switch">
                  <input type="checkbox" defaultChecked />
                  <span className="slider round"></span>
                </label>
              </div>
              
              <div className="settings-item">
                <div className="settings-info">
                  <Shield size={20} />
                  <div>
                    <h4>Privacy & Security</h4>
                    <p>Password and two-factor authentication</p>
                  </div>
                </div>
                <ChevronRight />
              </div>

              <div className="settings-item">
                <div className="settings-info">
                  <CreditCard size={20} />
                  <div>
                    <h4>Payment Methods</h4>
                    <p>Manage your saved cards and UPI IDs</p>
                  </div>
                </div>
                <ChevronRight />
              </div>
            </div>

            <button className="delete-account-btn">Delete Account</button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="profile-page container">
      <div className="profile-header">
        <div className="user-profile-avatar">
          {userData?.name ? userData.name.charAt(0).toUpperCase() : "U"}
        </div>
        <div className="user-profile-intro">
          <h1>{userData?.name || "User Profile"}</h1>
          <p>{userData?.email}</p>
        </div>
      </div>

      <div className="profile-content-wrapper">
        <aside className="profile-sidebar">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`sidebar-tab ${activeTab === tab.id ? "active" : ""}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className="tab-icon-wrapper">
                {tab.icon}
                {tab.badge > 0 && <span className="tab-badge">{tab.badge}</span>}
              </span>
              <span className="tab-label">{tab.label}</span>
              <ChevronRight className="tab-arrow" size={16} />
            </button>
          ))}
          <button className="sidebar-tab logout-tab" onClick={logout}>
            <span className="tab-icon-wrapper"><LogOut size={20} /></span>
            <span className="tab-label">Logout</span>
          </button>
        </aside>

        <main className="profile-main-content">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default Profile;
