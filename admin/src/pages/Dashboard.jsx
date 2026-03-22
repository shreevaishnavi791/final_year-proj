import React, { useState, useEffect } from "react";
import { 
  Plus, 
  FileText, 
  Package, 
  Truck, 
  TrendingUp, 
  Users, 
  ShoppingCart, 
  AlertCircle 
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { db } from "../firebase";
import { collection, query, getDocs, limit, orderBy } from "firebase/firestore";
import "./Dashboard.css";

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    sales: "₹0",
    stock: "0",
    performance: "+0%",
    orders: "0"
  });

  const [recentOrders, setRecentOrders] = useState([]);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const ordersRef = collection(db, "orders");
        const ordersSnapshot = await getDocs(ordersRef);
        
        const totalOrders = ordersSnapshot.size;
        let totalRevenue = 0;
        
        const ordersData = ordersSnapshot.docs.map(doc => {
          const data = doc.data();
          totalRevenue += data.totalAmount || 0;
          return {
            id: doc.id,
            title: data.items && data.items.length > 0 ? data.items[0].name : "New Order",
            client: data.customerName,
            price: `₹${data.totalAmount}`,
            status: data.status || "Pending",
            location: data.address || "N/A",
            createdAt: data.createdAt
          };
        });

        // Sort by date and take last 5 for recent activities
        const sortedRecent = [...ordersData]
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 5);

        // Fetch products count for stock stat
        const productsSnapshot = await getDocs(collection(db, "products"));
        
        setStats({
          sales: `₹${(totalRevenue / 1000).toFixed(1)}k`,
          stock: productsSnapshot.size.toString(),
          performance: "+5.2%",
          orders: totalOrders.toString()
        });

        setRecentOrders(sortedRecent);
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
      }
    };

    fetchDashboardStats();
  }, []);

  return (
    <div className="dashboard-container">
      {/* Welcome Header */}
      <header className="dashboard-welcome">
        <div className="welcome-text">
          <h1>Welcome back, Admin! 👋</h1>
          <p>Here's a quick overview of today's business activities.</p>
        </div>
        <div className="current-date">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </header>

      {/* Dashboard Actions */}
      <section className="dashboard-actions">
        <button className="action-card orange" onClick={() => navigate('/sales-orders')}>
          <div className="action-icon"><Plus size={24} /></div>
          <div className="action-info">
            <h3>New Order</h3>
            <p>Create sales order</p>
          </div>
        </button>
        <button className="action-card blue" onClick={() => navigate('/invoices')}>
          <div className="action-icon"><FileText size={24} /></div>
          <div className="action-info">
            <h3>Invoices</h3>
            <p>View billing history</p>
          </div>
        </button>
        <button className="action-card green" onClick={() => navigate('/products')}>
          <div className="action-icon"><Package size={24} /></div>
          <div className="action-info">
            <h3>Add Product</h3>
            <p>Assemble new item</p>
          </div>
        </button>
        <button className="action-card dark" onClick={() => navigate('/sales-orders')}>
          <div className="action-icon"><ShoppingCart size={24} /></div>
          <div className="action-info">
            <h3>Track Order</h3>
            <p>Monitor order status</p>
          </div>
        </button>
      </section>

      {/* Summary Stats */}
      <section className="stats-container">
        <div className="stat-tile sales">
          <div className="stat-header">
            <span className="stat-label">Total Sales</span>
            <TrendingUp size={20} className="stat-trend icon-green" />
          </div>
          <div className="stat-value">{stats.sales}</div>
          <div className="stat-footer">
            <span className="trend-pos">+12% from last month</span>
          </div>
        </div>
        <div className="stat-tile stock">
          <div className="stat-header">
            <span className="stat-label">Inventory Stock</span>
            <Package size={20} className="stat-trend icon-blue" />
          </div>
          <div className="stat-value">{stats.stock}</div>
          <div className="stat-footer">
            <span className="trend-neutral">4 categories active</span>
          </div>
        </div>
        <div className="stat-tile performance">
          <div className="stat-header">
            <span className="stat-label">Market Performance</span>
            <TrendingUp size={20} className="stat-trend icon-purple" />
          </div>
          <div className="stat-value">{stats.performance}</div>
          <div className="stat-footer">
            <span className="trend-pos">Exceeding targets</span>
          </div>
        </div>
        <div className="stat-tile orders">
          <div className="stat-header">
            <span className="stat-label">Pending Orders</span>
            <ShoppingCart size={20} className="stat-trend icon-pink" />
          </div>
          <div className="stat-value">{stats.orders}</div>
          <div className="stat-footer">
            <span className="trend-neg">Requires attention</span>
          </div>
        </div>
      </section>

      {/* Detailed Overview Tables/Lists */}
      <div className="dashboard-grid">
        <section className="grid-section main-card">
          <div className="section-header">
            <h2>Recent Activities</h2>
            <button className="view-all">View All</button>
          </div>
          <div className="activity-list">
            {recentOrders.map(order => (
              <div key={order.id} className="activity-item">
                <div className="activity-icon">
                  <ShoppingCart size={18} />
                </div>
                <div className="activity-details">
                  <div className="activity-title">{order.title}</div>
                  <div className="activity-meta">{order.client} • {order.location} • {order.price}</div>
                </div>
                <div className={`activity-status ${order.status.toLowerCase()}`}>
                  {order.status}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="grid-section side-card">
          <div className="section-header">
            <h2>Stock Alerts</h2>
            <AlertCircle size={20} className="icon-pink" />
          </div>
          <div className="alerts-list">
            <div className="alert-item high">
              <div className="alert-dot"></div>
              <span>Motor Assembly - <strong>Low Stock</strong></span>
            </div>
            <div className="alert-item high">
              <div className="alert-dot"></div>
              <span>Grinding Stones - <strong>Out of Stock</strong></span>
            </div>
            <div className="alert-item">
              <div className="alert-dot grey"></div>
              <span>Switch Units - Order Pending</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Dashboard;
