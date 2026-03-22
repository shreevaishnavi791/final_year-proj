import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { db } from "../firebase";
import {
  collection,
  query,
  where,
  onSnapshot,
} from "firebase/firestore";
import { useAuth } from "../context/AuthContext";
import { getCloudinaryUrl } from "../utils/cloudinary";
import {
  Package,
  Loader2,
  ArrowLeft,
  Eye,
  Truck,
  CheckCircle,
  FileText,
  MapPin,
  Search,
  X,
  Phone
} from "lucide-react";
import "./Orders.css";

const Orders = ({ standalone = true }) => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "orders"),
      where("userId", "==", user.uid)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const ordersData = [];
        snapshot.forEach((doc) => {
          ordersData.push({ id: doc.id, ...doc.data() });
        });
        
        ordersData.sort((a, b) => {
          const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt || 0);
          const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt || 0);
          return dateB - dateA;
        });

        setOrders(ordersData);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching orders:", error);
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, [user]);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = dateString && dateString.toDate 
      ? dateString.toDate() 
      : new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const TIMELINE_STEPS = [
    { key: "placed", label: "Placed", icon: CheckCircle },
    { key: "packed", label: "Packed", icon: Package },
    { key: "dispatched", label: "Dispatched", icon: Truck },
    { key: "received", label: "Received", icon: CheckCircle },
  ];

  const getTimelineProgress = (status) => {
    if (status === "cancelled") return -1;
    if (status === "pending" || status === "ordered") return 0;
    const idx = TIMELINE_STEPS.findIndex((s) => s.key === (status === "pending" ? "placed" : status));
    return idx;
  };

  const getDisplayStatus = (status) => {
    if (status === "pending" || status === "ordered") return "PLACED";
    return (status || "PLACED").toUpperCase();
  };

  const filteredOrders = orders.filter(order => 
    order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (order.status || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="orders-page loading-state container">
        <Loader2 className="animate-spin" size={40} />
        <p>Fetching your order history...</p>
      </div>
    );
  }

  return (
    <div className={`orders-page ${!standalone ? 'embedded' : ''}`}>
      <div className={standalone ? "container" : ""}>
        {standalone && (
          <div className="orders-header">
            <Link to="/" className="back-link">
              <ArrowLeft size={18} /> Back to Home
            </Link>
            <div className="header-flex">
              <div>
                <h1 className="page-title">Personal Order History</h1>
                <p className="page-subtitle">
                  Watch the status of your product as it moves to your doorstep
                </p>
              </div>
              <div className="order-stats">
                <div className="stat-card">
                  <span className="stat-value">{orders.length}</span>
                  <span className="stat-label">Your Orders</span>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="orders-controls">
          <div className="search-box">
            <Search size={18} />
            <input 
              type="text" 
              placeholder="Search by Order ID or Status..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {orders.length === 0 ? (
          <div className="empty-orders">
            <Package size={60} color="#ccc" />
            <h2>No Orders Found</h2>
            <p>You haven't placed any orders yet.</p>
            <Link to="/" className="shop-now-btn">Start Shopping</Link>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="empty-orders search-empty">
            <Search size={60} color="#ccc" />
            <h2>No Match Found</h2>
            <p>We couldn't find any orders matching "<strong>{searchTerm}</strong>".</p>
            <button className="clear-search-btn" onClick={() => setSearchTerm("")}>Clear Search</button>
          </div>
        ) : (
          <div className="orders-table-container">
            <table className="user-orders-table">
              <thead>
                <tr>
                  <th>ORDER ID</th>
                  <th>CUSTOMER</th>
                  <th>DATE</th>
                  <th>ITEMS</th>
                  <th>TOTAL</th>
                  <th>TRACKING STATUS</th>
                  <th>TRACK</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => {
                  const displayId = order.id.slice(0, 8).toUpperCase();
                  const displayStatus = getDisplayStatus(order.status);
                  return (
                    <tr key={order.id} className="order-row">
                      <td><span className="id-badge">#{displayId}</span></td>
                      <td>
                        <div className="customer-info">
                          <span className="customer-name">{order.customerName}</span>
                          <span className="customer-email">{order.userEmail}</span>
                        </div>
                      </td>
                      <td>{formatDate(order.createdAt)}</td>
                      <td>{order.items?.reduce((acc, item) => acc + item.quantity, 0) || 0} items</td>
                      <td><strong className="order-amount">₹{order.totalAmount}</strong></td>
                      <td><span className={`status-pill ${order.status === "pending" || order.status === "ordered" ? "placed" : order.status}`}>{displayStatus}</span></td>
                      <td>
                        <button className="btn-action-eye" onClick={() => setSelectedOrder(order)}><Eye size={20} /></button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {selectedOrder && (
          <div className="user-modal-overlay">
            <div className="user-modal-content">
              <div className="modal-header">
                <div>
                  <h2 className="modal-title">Order Details</h2>
                  <p className="modal-order-id">#{selectedOrder.id.toUpperCase()}</p>
                </div>
                <button className="close-modal-top" onClick={() => setSelectedOrder(null)}><X size={24} /></button>
              </div>

              <div className="modal-body-scroll">
                <div className="timeline-container">
                  <div className="timeline-track-main"></div>
                  {TIMELINE_STEPS.map((step, idx) => {
                    const currentProgress = getTimelineProgress(selectedOrder.status);
                    const isDone = idx <= currentProgress;
                    const Icon = step.icon;
                    return (
                      <div key={step.key} className={`timeline-node-item ${isDone ? 'active' : ''}`}>
                        <div className="node-circle"><Icon size={18} /></div>
                        <span className="node-text">{step.label}</span>
                      </div>
                    )
                  })}
                </div>

                <div className="modal-info-grid">
                  <div className="info-section-card">
                    <div className="info-card-header"><Truck size={18} /> <span>Shipping Information</span></div>
                    <div className="info-card-body">
                      <div className="info-line"><MapPin size={16} /><p><strong>Address:</strong> {selectedOrder.address}</p></div>
                      <div className="info-line"><Phone size={16} /><p><strong>Phone:</strong> {selectedOrder.phone}</p></div>
                    </div>
                  </div>

                  <div className="info-section-card">
                    <div className="info-card-header"><FileText size={18} /> <span>Price Breakdown</span></div>
                    <div className="info-card-body prices-table">
                      {(() => {
                        const originalSum = selectedOrder.items?.reduce((acc, item) => {
                          const price = typeof item.price === 'string' 
                            ? parseFloat(item.price.replace(/[^0-9.]/g, '')) 
                            : parseFloat(item.price || 0);
                          return acc + (price * (item.quantity || 1));
                        }, 0) || 0;
                        const discount = Math.round(originalSum * 0.2);
                        return (
                          <>
                            <div className="price-item"><span>Price ({selectedOrder.items?.length} items)</span><span>₹{originalSum}</span></div>
                            <div className="price-item text-green" style={{color: '#388e3c'}}><span>Discount (20% Off)</span><span>- ₹{discount}</span></div>
                            <div className="price-item"><span>Platform Fee</span><span>₹9</span></div>
                            <div className="price-item"><span className="text-green" style={{color: '#388e3c'}}>Delivery</span><span>FREE</span></div>
                            <div className="price-total-row"><span>Total Paid</span><span className="total-value">₹{selectedOrder.totalAmount}</span></div>
                          </>
                        );
                      })()}
                    </div>
                  </div>
                </div>

                <div className="items-section-container">
                  <div className="items-header"><Package size={18} /> <span>Order Items ({selectedOrder.items?.length || 0})</span></div>
                  <div className="items-list-wrapper">
                    {selectedOrder.items?.map((item, idx) => (
                      <div key={idx} className="item-row-detail">
                        <img src={getCloudinaryUrl(item.image)} alt={item.name} className="item-thumbnail" />
                        <div className="item-main-info"><h5>{item.name}</h5><p>Qty: {item.quantity}</p></div>
                        <div className="item-price-final">
                          {(() => {
                            const price = typeof item.price === 'string' 
                              ? parseFloat(item.price.replace(/[^0-9.]/g, '')) 
                              : parseFloat(item.price || 0);
                            return `₹${price * (item.quantity || 1)}`;
                          })()}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="modal-footer-action">
                <button className="btn-details-footer" onClick={() => setSelectedOrder(null)}>Close Details</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;
