import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../firebase";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  updateDoc,
  doc,
  arrayUnion,
  serverTimestamp,
} from "firebase/firestore";
import {
  Eye,
  Clock,
  Truck,
  CheckCircle,
  XCircle,
  FileText,
  Search,
  Trash2,
  Package,
  ClipboardList,
  X
} from "lucide-react";
import { deleteDoc } from "firebase/firestore";
import { getCloudinaryUrl } from "../utils/cloudinary";
import "./SalesOrders.css";

const SalesOrders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");

  useEffect(() => {
    const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const ordersData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setOrders(ordersData);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching orders:", error);
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, []);

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      const orderRef = doc(db, "orders", orderId);
      // append history entry and set status + lastUpdatedAt
      const historyEntry = {
        status: newStatus,
        updatedBy: "admin",
        timestamp: new Date(),
      };

      const updates = {
        status: newStatus,
        lastUpdatedAt: serverTimestamp(),
        history: arrayUnion(historyEntry),
      };

      if (newStatus === "received") {
        updates.deliveredAt = serverTimestamp();
      }

      await updateDoc(orderRef, updates);
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Failed to update order status.");
    }
  };

  const handleDeleteOrder = async (orderId) => {
    if (window.confirm("Are you sure you want to delete this order?")) {
      try {
        await deleteDoc(doc(db, "orders", orderId));
      } catch (error) {
        console.error("Error deleting order:", error);
        alert("Failed to delete order.");
      }
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    // support Firestore Timestamp and ISO/string
    const date =
      dateString && dateString.toDate
        ? dateString.toDate()
        : new Date(dateString);
    return date.toLocaleString();
  };

  // Define the ordered status flow
  const STATUS_FLOW = [
    "ordered",
    "placed",
    "packed",
    "dispatched",
    "received",
    "cancelled",
  ];

  const getStatusOptions = (currentStatus) => {
    // Return all statuses so the admin can change it freely to any valid status
    return STATUS_FLOW;
  };

  if (loading) {
    return <div className="p-6">Loading orders...</div>;
  }

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      searchQuery === "" ||
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.userEmail?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "All Status" ||
      order.status?.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  const TIMELINE_STEPS = [
    { key: "ordered", label: "Ordered", icon: ClipboardList },
    { key: "placed", label: "Placed", icon: CheckCircle },
    { key: "packed", label: "Packed", icon: Package },
    { key: "dispatched", label: "Dispatched", icon: Truck },
    { key: "received", label: "Received", icon: CheckCircle },
  ];

  const getTimelineProgress = (status) => {
    if (status === "cancelled") return -1;
    const idx = TIMELINE_STEPS.findIndex((s) => s.key === status);
    return idx;
  };

  return (
    <div className="orders-container">
      <div className="orders-summary-banner">
        <div className="banner-left">
          <h2>Customer Orders</h2>
          <p className="banner-subtitle">
            <span className="cart-icon">🛒</span> Managing {orders.length}{" "}
            active transactions
          </p>
        </div>
        <div className="banner-right">
          <select
            className="filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="All Status">All Status</option>
            <option value="ordered">Ordered</option>
            <option value="placed">Placed</option>
            <option value="packed">Packed</option>
            <option value="dispatched">Dispatched</option>
            <option value="received">Received</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <div className="search-box">
            <Search className="search-icon" size={18} />
            <input
              type="text"
              placeholder="Search by name, email or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="orders-table-wrapper">
        <table className="orders-table">
          <thead>
            <tr>
              <th>ORDER ID</th>
              <th>CUSTOMER</th>
              <th>DATE</th>
              <th>AMOUNT</th>
              <th>STATUS</th>
              <th>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.length > 0 ? (
              filteredOrders.map((order) => (
                <tr key={order.id}>
                  <td>
                    <span 
                      className="order-id-col"
                      onClick={() => navigate(`/invoice/${order.id}`)}
                      title="View Invoice"
                      style={{ cursor: 'pointer' }}
                    >
                      #{order.id.substring(0, 8).toUpperCase()}
                    </span>
                  </td>
                  <td>
                    <div 
                      className="customer-info" 
                      onClick={() => navigate('/users')}
                      title="View All Users"
                      style={{ cursor: 'pointer' }}
                    >
                      <span className="customer-name">{order.customerName}</span>
                      <span className="customer-email">{order.userEmail}</span>
                    </div>
                  </td>
                  <td>
                    <span className="date-col">
                      {formatDate(order.createdAt)}
                    </span>
                  </td>
                  <td>
                    <strong className="amount-col">₹{order.totalAmount}</strong>
                  </td>
                  <td>
                    <span
                      className={`order-badge status-${order.status || "ordered"}`}
                    >
                      {(order.status || "ordered").toUpperCase()}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="action-icon-btn view-btn"
                        onClick={() => setSelectedOrder(order)}
                        title="View Details"
                      >
                        <Eye size={18} />
                      </button>
                      <select
                        className="action-select-status"
                        value={order.status || "ordered"}
                        onChange={(e) =>
                          handleStatusUpdate(order.id, e.target.value)
                        }
                      >
                        {getStatusOptions(order.status).map((s) => (
                          <option key={s} value={s}>
                            Order {s.charAt(0).toUpperCase() + s.slice(1)}
                          </option>
                        ))}
                      </select>
                      <button
                        className="action-icon-btn delete-btn"
                        onClick={() => handleDeleteOrder(order.id)}
                        title="Delete Order"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="no-orders-msg">
                  No orders found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="modal-overlay">
          <div className="modal-content large-modal">
            <button
              className="close-modal-icon"
              onClick={() => setSelectedOrder(null)}
            >
              <X size={20} />
            </button>
            <div className="modal-top">
              <h3 className="modal-title">Order Details</h3>
              <p className="modal-subtitle">
                #{selectedOrder.id.toUpperCase()}
              </p>
            </div>

            {selectedOrder.status !== "cancelled" ? (
              <div className="timeline-wrapper">
                <div className="timeline-line"></div>
                {TIMELINE_STEPS.map((step, idx) => {
                  const currentIdx = getTimelineProgress(
                    selectedOrder.status || "ordered",
                  );
                  const isCompleted = idx <= currentIdx;
                  const Icon = step.icon;
                  return (
                    <div
                      key={step.key}
                      className={`timeline-step-item ${
                        isCompleted ? "completed" : ""
                      }`}
                    >
                      <div className="step-icon">
                        <Icon size={20} />
                      </div>
                      <span className="step-label">{step.label}</span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="cancelled-notice">
                This order was cancelled.
              </div>
            )}

            <div className="modal-cards-grid">
              <div className="info-card">
                <h4>
                  <Truck size={18} /> Shipping Information
                </h4>
                <div className="card-content">
                  <p>
                    <span className="label">📍 Address:</span>{" "}
                    {selectedOrder.address || "N/A"}
                  </p>
                  <p>
                    <span className="label">📞 Phone:</span>{" "}
                    {selectedOrder.phone || "N/A"}
                  </p>
                  <p>
                    <span className="label">✉️ Email:</span>{" "}
                    {selectedOrder.userEmail || "N/A"}
                  </p>
                  {selectedOrder.status === "received" &&
                    selectedOrder.deliveredAt && (
                      <p className="mt-2 text-green-600">
                        Received on{" "}
                        {formatDate(selectedOrder.deliveredAt)}
                      </p>
                    )}
                </div>
              </div>

              <div className="info-card">
                <h4>
                  <FileText size={18} /> Price Breakdown
                </h4>
                <div className="card-content price-details">
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
                        <div className="price-row">
                          <span>Original Price ({selectedOrder.items?.length} items)</span>
                          <span>₹{originalSum}</span>
                        </div>
                        <div className="price-row" style={{ color: '#388e3c' }}>
                          <span>Discount (20% Off)</span>
                          <span>- ₹{discount}</span>
                        </div>
                        <div className="price-row">
                          <span>Platform Fee</span>
                          <span>₹9</span>
                        </div>
                        <div className="price-row grand-total-row">
                          <span>Total Paid</span>
                          <span>₹{selectedOrder.totalAmount}</span>
                        </div>
                      </>
                    );
                  })()}
                </div>
              </div>
            </div>

            <div className="order-items-section">
              <h4>
                <Package size={18} /> Order Items ({selectedOrder.items?.length || 0})
              </h4>
              <div className="items-list-scroll">
                {selectedOrder.items?.map((item, index) => (
                  <div key={index} className="order-item-detail">
                    <div className="item-main">
                      <div className="item-img-bg">
                         <img
                          src={getCloudinaryUrl(item.image)}
                          alt={item.name}
                          className="item-thumb"
                        />
                      </div>
                      <div>
                        <div className="item-name-bold">{item.name}</div>
                        <small className="text-muted">
                          Qty: {item.quantity}
                        </small>
                      </div>
                    </div>
                    <div className="item-price">
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

            <div className="modal-footer">
              <button
                className="close-details-btn"
                onClick={() => setSelectedOrder(null)}
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SalesOrders;
