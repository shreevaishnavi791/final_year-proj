import React, { useState, useEffect, useMemo } from "react";
import { 
  Package, 
  Plus, 
  Search, 
  Filter, 
  AlertTriangle, 
  ArrowUpRight, 
  ArrowDownLeft, 
  History, 
  Edit2, 
  Trash2, 
  MoreVertical,
  ChevronDown,
  X,
  PlusCircle,
  MinusCircle,
  BarChart2,
  PieChart as PieChartIcon,
  TrendingUp,
  Clock,
  ArrowRight
} from "lucide-react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts";
import { db } from "../firebase";
import { 
  collection, 
  addDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  orderBy, 
  onSnapshot,
  Timestamp,
  serverTimestamp
} from "firebase/firestore";
import "./Inventory.css";

const COLORS = ["#4f46e5", "#9333ea", "#db2777", "#10b981", "#6366f1"];

const Inventory = () => {
  const [inventory, setInventory] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showStockModal, setShowStockModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [stockActionItem, setStockActionItem] = useState(null);
  const [actionType, setActionType] = useState("in"); // "in" or "out"
  
  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [stockStatusFilter, setStockStatusFilter] = useState("All");

  // Form States
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    category: "Raw Material",
    quantity: 0,
    unit: "pieces",
    supplier: "",
    purchaseDate: new Date().toISOString().split('T')[0],
    costPrice: 0,
    minStock: 5
  });

  const [stockFormData, setStockFormData] = useState({
    quantity: 0,
    reason: ""
  });

  useEffect(() => {
    const q = query(collection(db, "inventory"), orderBy("name", "asc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setInventory(items);
      setLoading(false);
    });

    const hq = query(collection(db, "inventoryHistory"), orderBy("timestamp", "desc"));
    const hUnsubscribe = onSnapshot(hq, (snapshot) => {
      const logs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setHistory(logs);
    });

    return () => {
      unsubscribe();
      hUnsubscribe();
    };
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingItem) {
        const itemRef = doc(db, "inventory", editingItem.id);
        await updateDoc(itemRef, {
          ...formData,
          quantity: Number(formData.quantity),
          costPrice: Number(formData.costPrice),
          minStock: Number(formData.minStock),
          updatedAt: serverTimestamp()
        });
        
        await addDoc(collection(db, "inventoryHistory"), {
          itemId: editingItem.id,
          itemName: formData.name,
          action: "updated",
          details: "Item details updated",
          timestamp: serverTimestamp()
        });
      } else {
        const docRef = await addDoc(collection(db, "inventory"), {
          ...formData,
          quantity: Number(formData.quantity),
          costPrice: Number(formData.costPrice),
          minStock: Number(formData.minStock),
          createdAt: serverTimestamp()
        });

        await addDoc(collection(db, "inventoryHistory"), {
          itemId: docRef.id,
          itemName: formData.name,
          action: "added",
          change: Number(formData.quantity),
          details: "Initial stock added",
          timestamp: serverTimestamp()
        });
      }
      setShowModal(false);
      resetForm();
    } catch (error) {
      console.error("Error saving inventory item:", error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      code: "",
      category: "Raw Material",
      quantity: 0,
      unit: "pieces",
      supplier: "",
      purchaseDate: new Date().toISOString().split('T')[0],
      costPrice: 0,
      minStock: 5
    });
    setEditingItem(null);
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      ...item,
      purchaseDate: item.purchaseDate || new Date().toISOString().split('T')[0]
    });
    setShowModal(true);
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete ${name}?`)) {
      try {
        await deleteDoc(doc(db, "inventory", id));
        await addDoc(collection(db, "inventoryHistory"), {
          itemId: id,
          itemName: name,
          action: "removed",
          details: "Item deleted from inventory",
          timestamp: serverTimestamp()
        });
      } catch (error) {
        console.error("Error deleting item:", error);
      }
    }
  };

  const handleStockAction = async (e) => {
    e.preventDefault();
    const change = Number(stockFormData.quantity);
    const itemToUpdate = stockActionItem || (inventory.length > 0 ? inventory[0] : null);
    
    if (!itemToUpdate) return;

    const newQuantity = actionType === "in" 
      ? itemToUpdate.quantity + change 
      : itemToUpdate.quantity - change;

    if (newQuantity < 0) {
      alert("Error: Stock cannot be negative!");
      return;
    }

    try {
      const itemRef = doc(db, "inventory", itemToUpdate.id);
      await updateDoc(itemRef, {
        quantity: newQuantity,
        updatedAt: serverTimestamp()
      });

      await addDoc(collection(db, "inventoryHistory"), {
        itemId: itemToUpdate.id,
        itemName: itemToUpdate.name,
        action: actionType === "in" ? "stock_in" : "stock_out",
        change: actionType === "in" ? change : -change,
        details: stockFormData.reason || (actionType === "in" ? "Production/Purchase added" : "Used for production/sales"),
        timestamp: serverTimestamp()
      });

      setShowStockModal(false);
      setStockFormData({ quantity: 0, reason: "" });
      setStockActionItem(null);
    } catch (error) {
      console.error("Error updating stock:", error);
    }
  };

  // Stats Calculations
  const stats = useMemo(() => {
    const totalItems = inventory.length;
    const lowStock = inventory.filter(item => item.quantity <= item.minStock).length;
    const rawMaterials = inventory.filter(item => item.category === "Raw Material").length;
    const finishedProducts = inventory.filter(item => item.category === "Finished Product").length;
    const spareParts = inventory.filter(item => item.category === "Spare Part").length;

    return { totalItems, lowStock, rawMaterials, finishedProducts, spareParts };
  }, [inventory]);

  // Chart Data
  const distributionData = [
    { name: "Raw Materials", value: stats.rawMaterials },
    { name: "Finished Products", value: stats.finishedProducts },
    { name: "Spare Parts", value: stats.spareParts },
  ];

  const movementData = [
    { month: "Jan", in: 400, out: 240 },
    { month: "Feb", in: 300, out: 139 },
    { month: "Mar", in: 200, out: 980 },
    { month: "Apr", in: 278, out: 390 },
    { month: "May", in: 189, out: 480 },
    { month: "Jun", in: 239, out: 380 },
  ];

  // Filtered Data
  const filteredInventory = inventory.filter(item => {
    const searchLower = searchTerm.toLowerCase();
    const itemName = item.name ? item.name.toLowerCase() : "";
    const itemCode = item.code ? item.code.toLowerCase() : "";
    const itemSupplier = item.supplier ? item.supplier.toLowerCase() : "";
    const itemCategory = item.category ? item.category.toLowerCase() : "";
    
    const matchesSearch = itemName.includes(searchLower) || 
                         itemCode.includes(searchLower) || 
                         itemSupplier.includes(searchLower) ||
                         itemCategory.includes(searchLower);
    const matchesCategory = categoryFilter === "All" || item.category === categoryFilter;
    const matchesStatus = stockStatusFilter === "All" || 
                         (stockStatusFilter === "Low Stock" && item.quantity <= item.minStock) ||
                         (stockStatusFilter === "In Stock" && item.quantity > item.minStock);
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const lowStockItems = inventory.filter(item => item.quantity <= item.minStock).slice(0, 5);

  return (
    <div className="inventory-dashboard">
      <div className="dashboard-content">
        {/* Header Section */}
        <header className="inventory-header-new">
          <div className="header-info">
            <h1>Inventory Dashboard</h1>
            <p>Amirthaa • Minit Engineers India Private Limited (est. 1982)</p>
          </div>
          <div className="header-btns">
            <button className="btn-outline" onClick={() => setShowHistoryModal(true)}>
              <History size={18} /> Logs
            </button>
            <button className="btn-primary-new" onClick={() => { resetForm(); setShowModal(true); }}>
              <Plus size={18} /> New Item
            </button>
          </div>
        </header>

        {/* Summary Stats Cards */}
        <div className="summary-cards">
          <div className="summary-card">
            <div className="card-icon blue"><Package size={22} /></div>
            <div className="card-data">
              <span className="label">Total Items</span>
              <h3 className="value">{stats.totalItems}</h3>
            </div>
          </div>
          <div className="summary-card">
            <div className="card-icon red-accent"><TrendingUp size={22} /></div>
            <div className="card-data">
              <span className="label">Raw Materials</span>
              <h3 className="value">{stats.rawMaterials}</h3>
            </div>
          </div>
          <div className="summary-card">
            <div className="card-icon green"><ArrowUpRight size={22} /></div>
            <div className="card-data">
              <span className="label">Finished Goods</span>
              <h3 className="value">{stats.finishedProducts}</h3>
            </div>
          </div>
          <div className="summary-card">
            <div className="card-icon purple"><BarChart2 size={22} /></div>
            <div className="card-data">
              <span className="label">Spare Parts</span>
              <h3 className="value">{stats.spareParts}</h3>
            </div>
          </div>
          <div className="summary-card highlight-red">
            <div className="card-icon error"><AlertTriangle size={22} /></div>
            <div className="card-data">
              <span className="label">Low Stock</span>
              <h3 className="value text-error">{stats.lowStock}</h3>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="charts-grid">
          <div className="chart-container main-card">
            <div className="chart-header">
              <h3>Stock Movement</h3>
              <p>In vs Out flow for last 6 months</p>
            </div>
            <div className="chart-body" style={{ height: "300px" }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={movementData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                  <Tooltip 
                    contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}}
                    cursor={{fill: '#f1f5f9'}}
                  />
                  <Bar dataKey="in" fill="#4f46e5" radius={[4, 4, 0, 0]} name="Stock In" />
                  <Bar dataKey="out" fill="#db2777" radius={[4, 4, 0, 0]} name="Stock Out" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="chart-container main-card">
            <div className="chart-header">
              <h3>Inventory Distribution</h3>
              <p>Breakdown by category</p>
            </div>
            <div className="chart-body" style={{ height: "300px" }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={distributionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {distributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}} />
                  <Legend verticalAlign="bottom" height={36}/>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Table & Side Panels */}
        <div className="inventory-layout-grid">
          <div className="main-table-section">
            <div className="section-card">
              <div className="card-header-actions">
                <div className="search-and-filter">
                  <div className="search-bar-new">
                    <Search size={18} />
                    <input 
                      type="text" 
                      placeholder="Search items..." 
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <div className="filter-dropdowns">
                    <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
                      <option value="All">All Categories</option>
                      <option value="Raw Material">Raw Materials</option>
                      <option value="Spare Part">Spare Parts</option>
                      <option value="Finished Product">Finished Products</option>
                    </select>
                  </div>
                </div>
                <div className="quick-actions">
                  <button className="btn-stock-in" onClick={() => { setActionType("in"); setShowStockModal(true); }}>
                    <PlusCircle size={16} /> Stock In
                  </button>
                  <button className="btn-stock-out" onClick={() => { setActionType("out"); setShowStockModal(true); }}>
                    <MinusCircle size={16} /> Stock Out
                  </button>
                </div>
              </div>

              <div className="table-responsive">
                <table className="modern-table">
                  <thead>
                    <tr>
                      <th>Item Name</th>
                      <th>Category</th>
                      <th>Quantity</th>
                      <th>Min Stock</th>
                      <th>Supplier</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredInventory.map(item => (
                      <tr key={item.id}>
                        <td>
                          <div className="item-cell">
                            <span className="name">{item.name}</span>
                            <span className="code">{item.code}</span>
                          </div>
                        </td>
                        <td><span className={`tag ${item.category.toLowerCase().replace(/\s+/g, '-')}`}>{item.category}</span></td>
                        <td><span className="qty">{item.quantity} {item.unit}</span></td>
                        <td>{item.minStock}</td>
                        <td>{item.supplier}</td>
                        <td>
                          <span className={`status-badge ${item.quantity <= item.minStock ? 'low' : 'ok'}`}>
                            {item.quantity <= item.minStock ? 'Low Stock' : 'In Stock'}
                          </span>
                        </td>
                        <td>
                          <div className="action-btns">
                            <button className="icon-btn edit" onClick={() => handleEdit(item)}><Edit2 size={16} /></button>
                            <button className="icon-btn delete" onClick={() => handleDelete(item.id, item.name)}><Trash2 size={16} /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filteredInventory.length === 0 && (
                      <tr>
                        <td colSpan="7" className="empty-row">No items found matching your filters.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <aside className="side-dash-panels">
            {/* Low Stock Alert Panel */}
            <div className="side-panel warning-panel">
              <div className="panel-header">
                <h3>Low Stock Warning</h3>
                <AlertTriangle size={18} />
              </div>
              <div className="panel-content">
                {lowStockItems.length > 0 ? (
                  <div className="alert-items-list">
                    {lowStockItems.map(item => (
                      <div key={item.id} className="alert-item-mini">
                        <div className="item-meta">
                          <span className="name">{item.name}</span>
                          <span className="stock">{item.quantity} {item.unit} left</span>
                        </div>
                        <div className="item-progress">
                          <div className="progress-bar red" style={{ width: `${Math.min(100, (item.quantity / (item.minStock || 1)) * 50)}%` }}></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="empty-msg">Inventory levels are healthy.</p>
                )}
                <button className="panel-btn" onClick={() => setStockStatusFilter('Low Stock')}>
                  Manage Low Stock <ArrowRight size={14} />
                </button>
              </div>
            </div>

            {/* Recent Activity Panel */}
            <div className="side-panel activity-panel">
              <div className="panel-header">
                <h3>Recent Activity</h3>
                <Clock size={18} />
              </div>
              <div className="panel-content">
                <div className="activity-timeline">
                  {history.slice(0, 5).map(log => (
                    <div key={log.id} className="timeline-item">
                      <div className="timeline-icon">
                        {log.action === 'stock_in' ? <PlusCircle size={14} className="text-success" /> : 
                         log.action === 'stock_out' ? <MinusCircle size={14} className="text-danger" /> : 
                         <Clock size={14} />}
                      </div>
                      <div className="timeline-details">
                        <p className="msg"><strong>{log.itemName}</strong> {log.action.replace('_', ' ')}</p>
                        <span className="time">{log.timestamp?.toDate().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) || 'Just now'}</span>
                      </div>
                    </div>
                  ))}
                  {history.length === 0 && <p className="empty-msg">No recent activity.</p>}
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* Modals */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content-new">
            <div className="modal-header">
              <h2>{editingItem ? "Update Item" : "Create New Item"}</h2>
              <button className="close-x" onClick={() => setShowModal(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="modern-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Product Name</label>
                  <input type="text" name="name" value={formData.name} onChange={handleInputChange} required placeholder="e.g. Grinding Wheel" />
                </div>
                <div className="form-group">
                  <label>SKU / Code</label>
                  <input type="text" name="code" value={formData.code} onChange={handleInputChange} required placeholder="AM-101" />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Category</label>
                  <select name="category" value={formData.category} onChange={handleInputChange}>
                    <option value="Raw Material">Raw Material</option>
                    <option value="Spare Part">Spare Part</option>
                    <option value="Finished Product">Finished Product</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Unit</label>
                  <select name="unit" value={formData.unit} onChange={handleInputChange}>
                    <option value="pieces">Pieces</option>
                    <option value="kg">Kilograms</option>
                    <option value="liters">Liters</option>
                    <option value="meters">Meters</option>
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Quantity</label>
                  <input type="number" name="quantity" value={formData.quantity} onChange={handleInputChange} required min="0" />
                </div>
                <div className="form-group">
                  <label>Min Stock Alert Level</label>
                  <input type="number" name="minStock" value={formData.minStock} onChange={handleInputChange} required min="0" />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Cost Price (₹)</label>
                  <input type="number" name="costPrice" value={formData.costPrice} onChange={handleInputChange} required />
                </div>
                <div className="form-group">
                  <label>Primary Supplier</label>
                  <input type="text" name="supplier" value={formData.supplier} onChange={handleInputChange} required />
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn-submit">Save Product</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Stock In/Out Modal */}
      {showStockModal && (
        <div className="modal-overlay">
          <div className="modal-small-new">
            <div className="modal-header">
              <h2>Stock {actionType === "in" ? "In" : "Out"}</h2>
              <button className="close-x" onClick={() => setShowStockModal(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleStockAction}>
              <div className="form-group">
                <label>Select Item</label>
                <select 
                  onChange={(e) => setStockActionItem(inventory.find(i => i.id === e.target.value))}
                  value={stockActionItem?.id || ""}
                  required
                >
                  <option value="">Choose item...</option>
                  {inventory.map(i => <option key={i.id} value={i.id}>{i.name} ({i.code})</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Amount to {actionType === "in" ? "Add" : "Remove"}</label>
                <input 
                  type="number" 
                  value={stockFormData.quantity} 
                  onChange={(e) => setStockFormData({...stockFormData, quantity: e.target.value})} 
                  required 
                  min="1"
                />
              </div>
              <div className="form-group">
                <label>Reference / Note</label>
                <textarea 
                  value={stockFormData.reason} 
                  onChange={(e) => setStockFormData({...stockFormData, reason: e.target.value})}
                  placeholder="Invoice number or production batch..."
                ></textarea>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowStockModal(false)}>Cancel</button>
                <button type="submit" className={`btn-submit ${actionType === "in" ? "in" : "out"}`}>
                  Confirm {actionType === "in" ? "Stock In" : "Stock Out"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* History Modal */}
      {showHistoryModal && (
        <div className="modal-overlay">
          <div className="modal-large-new">
            <div className="modal-header">
              <h2>Inventory Activity Logs</h2>
              <button className="close-x" onClick={() => setShowHistoryModal(false)}><X size={20} /></button>
            </div>
            <div className="history-table-container">
               <table className="modern-table">
                 <thead>
                   <tr>
                     <th>Date & Time</th>
                     <th>Item</th>
                     <th>Action</th>
                     <th>Change</th>
                     <th>Details</th>
                   </tr>
                 </thead>
                 <tbody>
                   {history.map(log => (
                     <tr key={log.id}>
                       <td>{log.timestamp?.toDate().toLocaleString() || 'N/A'}</td>
                       <td><strong>{log.itemName}</strong></td>
                       <td><span className={`tag action-${log.action}`}>{log.action.replace('_', ' ')}</span></td>
                       <td className={log.change > 0 ? "text-success" : log.change < 0 ? "text-danger" : ""}>
                         {log.change > 0 ? `+${log.change}` : log.change || '-'}
                       </td>
                       <td>{log.details}</td>
                     </tr>
                   ))}
                 </tbody>
               </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;
