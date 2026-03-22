import React, { useState, useEffect } from "react";
import { 
  FileText, 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  Search, 
  Filter, 
  Plus, 
  Eye, 
  Edit2, 
  Download, 
  Trash2, 
  Check, 
  Bell, 
  Calendar,
  ChevronLeft,
  ChevronRight,
  X,
  Printer
} from "lucide-react";
import "./Invoices.css";
import { db } from "../firebase";
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp } from "firebase/firestore";

const Invoices = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [distributorFilter, setDistributorFilter] = useState("All");
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newInvoiceData, setNewInvoiceData] = useState({
    customerName: "",
    items: [{ name: "", quantity: 1, price: 0 }],
    status: "Pending"
  });

  const handleCreateInvoice = async () => {
    if (!newInvoiceData.customerName || newInvoiceData.items.some(i => !i.name)) {
      alert("Please fill in customer name and at least one item.");
      return;
    }

    try {
      const total = newInvoiceData.items.reduce((sum, item) => sum + (cleanPrice(item.price) * item.quantity), 0);
      
      await addDoc(collection(db, "orders"), {
        customerName: newInvoiceData.customerName,
        items: newInvoiceData.items.map(i => ({
          name: i.name,
          quantity: parseInt(i.quantity) || 1,
          price: cleanPrice(i.price)
        })),
        totalAmount: total + 9, // Adding default freight as in template
        status: "Pending",
        createdAt: serverTimestamp(),
        // Matching industrial template metadata defaults
        poNumber: "N/A",
        fob: "Your desk",
        terms: "Net 30 days",
        salesperson: "Online"
      });

      setIsCreateModalOpen(false);
      setNewInvoiceData({
        customerName: "",
        items: [{ name: "", quantity: 1, price: 0 }],
        status: "Pending"
      });
      alert("Invoice generated and saved successfully!");
    } catch (error) {
      console.error("Error creating invoice:", error);
      alert("Failed to create invoice. Check console.");
    }
  };

  const cleanPrice = (price) => {
    if (!price) return 0;
    if (typeof price === "number") return price;
    return parseFloat(price.toString().replace(/[^0-9.]/g, "")) || 0;
  };

  useEffect(() => {
    // Invoices are derived from orders in this system
    const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const invoicesData = snapshot.docs.map((doc) => {
        const data = doc.data();
        
        // Robust date parsing (matching Orders.jsx logic)
        const rawDate = data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt || 0);
        const dateStr = rawDate && !isNaN(rawDate.getTime()) 
          ? rawDate.toISOString().split("T")[0] 
          : "N/A";
          
        const dueDate = new Date(rawDate.getTime() + 7 * 24 * 60 * 60 * 1000);
        const dueDateStr = !isNaN(dueDate.getTime()) 
          ? dueDate.toISOString().split("T")[0] 
          : "N/A";

        return {
          id: `INV-${doc.id.substring(0, 6).toUpperCase()}`,
          realId: doc.id,
          distributor: data.customerName || "Retail Customer",
          date: dateStr,
          due: dueDateStr,
          status:
            data.status === "received"
              ? "Paid"
              : data.status === "cancelled"
              ? "Overdue"
              : "Pending",
          amount: data.totalAmount || 0,
          ...data,
        };
      });
      setInvoices(invoicesData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const filteredInvoices = invoices.filter(inv => {
    const matchesSearch = inv.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         inv.distributor.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "All" || inv.status === statusFilter;
    const matchesDistributor = distributorFilter === "All" || inv.distributor === distributorFilter;
    return matchesSearch && matchesStatus && matchesDistributor;
  });

  const stats = {
    total: invoices.length,
    paid: invoices.filter(i => i.status === "Paid").length,
    pending: invoices.filter(i => i.status === "Pending").length,
    overdue: invoices.filter(i => i.status === "Overdue").length,
  };

  const pendingPayments = invoices.filter(i => i.status === "Pending" || i.status === "Overdue").slice(0, 3);
  
  const activities = invoices.slice(0, 4).map((inv, idx) => ({
    id: idx,
    action: `Invoice ${inv.id} ${inv.status === 'Paid' ? 'Payment Received' : 'Created'}`,
    time: inv.date
  }));

  if (loading) return <div className="p-8 text-center"><div className="animate-spin h-10 w-10 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto mb-4"></div>Loading Billing Data...</div>;

  return (
    <div className="invoices-page">
      {/* Industrial Corporate Invoice Modal - EXACT TEMPLATE MATCH */}
      {selectedInvoice && (
        <div className="industrial-invoice-overlay">
          <div className="industrial-invoice-paper">
            {/* Top Navigation */}
            <div className="invoice-action-bar no-print">
              <button className="action-link" onClick={() => setSelectedInvoice(null)}>
                <ChevronLeft size={14} /> Back
              </button>
              <button className="action-link" onClick={() => window.print()}>
                <Download size={14} /> Print
              </button>
            </div>

            <div className="invoice-canvas">
              {/* Header: Logo, Title, and Right Company Info */}
              <div className="industrial-header-row">
                <div className="brand-side">
                  <div className="corporate-logo">
                    <span className="logo-symbol-red">A</span>
                    <span className="logo-text-bold">Amirthaa</span>
                  </div>
                </div>

                <div className="center-title">
                  <h1>INVOICE</h1>
                  <p className="subtitle">Invoice for Sales and Billing</p>
                </div>

                <div className="company-details-side">
                  <h3 className="company-name-top">Amirthaa</h3>
                  <p className="company-legal">Minit Engineers India Pvt. Ltd.</p>
                  <p>138/5 Nasiyanur Road</p>
                  <p>Semampalayam, Villarasampatti</p>
                  <p>Erode - 638 107, Tamil Nadu, India</p>
                  <p>Phone: +91 42 2454 1900</p>
                  <p>Email: customercare@amirthaa.com</p>
                </div>
              </div>

              {/* Information Grid: Two Block Headers */}
              <div className="metadata-container">
                <div className="metadata-block">
                  <div className="meta-row blue-head">
                    <div className="label">P.O. NUMBER</div>
                    <div className="label">F.O.B.</div>
                    <div className="label">SALESPERSON</div>
                    <div className="label">ORDER NUMBER</div>
                  </div>
                  <div className="meta-row data-row">
                    <div className="val">N/A</div>
                    <div className="val">Your desk</div>
                    <div className="val">Online</div>
                    <div className="val">{selectedInvoice.realId || "XIEDAXKO"}</div>
                  </div>
                </div>

                <div className="metadata-block">
                  <div className="meta-row blue-head">
                    <div className="label">SHIP VIA</div>
                    <div className="label">TERMS</div>
                    <div className="label">ORDER DATE</div>
                    <div className="label">INVOICE NUMBER</div>
                  </div>
                  <div className="meta-row data-row">
                    <div className="val">N/A</div>
                    <div className="val">Net 30 days</div>
                    <div className="val">2/3/2026</div>
                    <div className="val">{selectedInvoice.id || "XIEDAXK0MENLKTCB65MHI"}</div>
                  </div>
                </div>
              </div>

              {/* Bill To & Location Labels */}
              <div className="bill-to-loc-labels">
                <div className="label-tab">BILL TO</div>
                <div className="label-tab">LOCATION</div>
              </div>

              <div className="address-container">
                <div className="addr-side">
                  <p className="name-bold">{selectedInvoice.distributor || "Arun Kumar"}</p>
                  <p>{selectedInvoice.address || "No. 42, West Street, Erode, 638001"}</p>
                  <p>Phone: {selectedInvoice.phone || "9840012345"}</p>
                  <p>{selectedInvoice.userEmail || "arun2kumar@example.com"}</p>
                </div>
                <div className="addr-side">
                  <p className="name-bold">{selectedInvoice.distributor || "Arun Kumar"}</p>
                  <p>{selectedInvoice.address || "No. 42, West Street, Erode, 638001"}</p>
                  <p>Phone: {selectedInvoice.phone || "9840012345"}</p>
                </div>
              </div>

              {/* Items Table with Header */}
              <div className="table-wrapper">
                <div className="table-title-bar">PARTS AND MATERIALS (ITEMS)</div>
                <table className="exact-invoice-table">
                  <thead>
                    <tr>
                      <th style={{ width: '15%' }}>ITEM NO</th>
                      <th style={{ width: '45%' }}>DESCRIPTION</th>
                      <th style={{ width: '10%' }}>QTY</th>
                      <th style={{ width: '15%' }}>UNIT PRICE</th>
                      <th style={{ width: '15%' }}>EXT PRICE</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(selectedInvoice.items || []).map((item, idx) => (
                      <tr key={idx}>
                        <td className="center">{idx + 1}</td>
                        <td>{item.name}</td>
                        <td className="center">{item.quantity}</td>
                        <td className="right">{cleanPrice(item.price).toFixed(2)}</td>
                        <td className="right">{(cleanPrice(item.price) * item.quantity).toFixed(2)}</td>
                      </tr>
                    ))}
                    {/* Filler Rows */}
                    {Array.from({ length: Math.max(0, 10 - (selectedInvoice.items?.length || 0)) }).map((_, i) => (
                      <tr key={`filler-${i}`}>
                        <td>&nbsp;</td>
                        <td>&nbsp;</td>
                        <td>&nbsp;</td>
                        <td>&nbsp;</td>
                        <td>&nbsp;</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Footer Summary */}
              <div className="invoice-footer-exact">
                <div className="footer-bottom-msg">
                  THANK YOU FOR YOUR BUSINESS!
                </div>
                <div className="summary-calc">
                  <div className="sum-line">
                    <span className="label">NET AMOUNT</span>
                    <span className="val">7752.00</span>
                  </div>
                  <div className="sum-line">
                    <span className="label">Discount</span>
                    <span className="val">0.00</span>
                  </div>
                  <div className="sum-line">
                    <span className="label">Freight</span>
                    <span className="val">9.00</span>
                  </div>
                  <div className="sum-line">
                    <span className="label">H.S.T. / TAX</span>
                    <span className="val">387.60</span>
                  </div>
                  <div className="sum-line grand-total">
                    <span className="total-label">TOTAL DUE {cleanPrice(selectedInvoice.amount).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Page Layout */}
      <header className="invoices-header">
        <div>
          <h1>Invoice Management</h1>
          <p className="text-secondary text-sm">Review and manage official corporate billing documents</p>
        </div>
      </header>

      {/* Create New Invoice Modal */}
      {isCreateModalOpen && (
        <div className="industrial-invoice-overlay">
          <div className="industrial-invoice-paper" style={{ maxWidth: '600px', minHeight: 'auto', padding: '30px' }}>
             <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">New Invoice</h2>
                <button onClick={() => setIsCreateModalOpen(false)}><X size={20} /></button>
             </div>
             
             <div className="space-y-4">
                <div>
                   <label className="block text-xs font-bold mb-1">CUSTOMER NAME</label>
                   <input 
                     type="text" 
                     className="filter-input w-full"
                     placeholder="e.g. Arun Kumar"
                     value={newInvoiceData.customerName}
                     onChange={(e) => setNewInvoiceData({...newInvoiceData, customerName: e.target.value})}
                   />
                </div>
                
                <div className="py-2 border-t">
                   <h3 className="text-xs font-bold mb-2">ITEMS</h3>
                   {newInvoiceData.items.map((item, idx) => (
                      <div key={idx} className="flex gap-2 mb-2">
                         <input 
                           placeholder="Item name" 
                           className="filter-input flex-1" 
                           value={item.name}
                           onChange={(e) => {
                             const items = [...newInvoiceData.items];
                             items[idx].name = e.target.value;
                             setNewInvoiceData({...newInvoiceData, items});
                           }}
                         />
                         <input 
                           placeholder="Qty" 
                           type="number" 
                           className="filter-input w-20" 
                           value={item.quantity}
                           onChange={(e) => {
                             const items = [...newInvoiceData.items];
                             items[idx].quantity = e.target.value;
                             setNewInvoiceData({...newInvoiceData, items});
                           }}
                         />
                         <input 
                           placeholder="Price" 
                           type="number" 
                           className="filter-input w-24" 
                           value={item.price}
                           onChange={(e) => {
                             const items = [...newInvoiceData.items];
                             items[idx].price = e.target.value;
                             setNewInvoiceData({...newInvoiceData, items});
                           }}
                         />
                      </div>
                   ))}
                   <button 
                     className="text-xs text-blue-600 font-bold"
                     onClick={() => setNewInvoiceData({...newInvoiceData, items: [...newInvoiceData.items, { name: "", quantity: 1, price: 0 }]})}
                   >
                     + Add Item
                   </button>
                </div>

                <div className="pt-4 border-t flex justify-end gap-3">
                   <button className="px-4 py-2 text-sm" onClick={() => setIsCreateModalOpen(false)}>Cancel</button>
                   <button 
                     className="px-6 py-2 bg-black text-white rounded text-sm font-bold"
                     onClick={handleCreateInvoice}
                   >
                     GENERATE INVOICE
                   </button>
                </div>
             </div>
          </div>
        </div>
      )}

      {/* Step 1: Summary Statistics Cards */}
      {/* <section className="summary-grid">
        <div className="invoice-stat-card brand-accent">
          <div className="stat-icon blue"><FileText size={24} /></div>
          <div className="stat-content">
            <span className="label">Total Invoices</span>
            <h2 className="value">{stats.total}</h2>
          </div>
        </div>
        <div className="invoice-stat-card green-brand">
          <div className="stat-icon green"><CheckCircle size={24} /></div>
          <div className="stat-content">
            <span className="label">Paid Invoices</span>
            <h2 className="value">{stats.paid}</h2>
          </div>
        </div>
        <div className="invoice-stat-card orange-brand">
          <div className="stat-icon pink"><Clock size={24} /></div>
          <div className="stat-content">
            <span className="label">Pending Invoices</span>
            <h2 className="value">{stats.pending}</h2>
          </div>
        </div>
        <div className="invoice-stat-card brand-accent">
          <div className="stat-icon brand">
            <AlertTriangle size={24} />
          </div>
          <div className="stat-content">
            <span className="label">Overdue Invoices</span>
            <h2 className="value text-danger">{stats.overdue}</h2>
          </div>
        </div>
      </section> */}

      {/* Step 2: Filter and Search Section */}
      <section className="filter-card">
        <div className="filter-grid">
          <div className="filter-group">
            <label>Search Invoice</label>
            <div className="relative">
              <input 
                type="text" 
                className="filter-input w-full" 
                placeholder="ID or Distributor..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="filter-group">
            <label>Distributor Name</label>
            <select 
              className="filter-select"
              value={distributorFilter}
              onChange={(e) => setDistributorFilter(e.target.value)}
            >
              <option value="All">All Distributors</option>
              {Array.from(new Set(invoices.map(i => i.distributor))).map(name => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>
          </div>
          <div className="filter-group">
            <label>Status</label>
            <select 
              className="filter-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="All">All Status</option>
              <option value="Paid">Paid</option>
              <option value="Pending">Pending</option>
              <option value="Overdue">Overdue</option>
            </select>
          </div>
          <div className="filter-group">
            <label>Date Range</label>
            <div className="relative">
              <input type="date" className="filter-input w-full" />
            </div>
          </div>
        </div>
      </section>

      <div className="invoices-layout">
        {/* Step 3: Main Invoices Management Table */}
        <div className="main-panel">
          <div className="table-container">
            <table className="invoice-table">
              <thead>
                <tr>
                  <th>Invoice ID</th>
                  <th>Distributor Name</th>
                  <th>Invoice Date</th>
                  <th>Due Date</th>
                  <th>Status</th>
                  <th>Total Amount</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredInvoices.map((inv) => (
                  <tr key={inv.realId}>
                    <td className="inv-id">{inv.id}</td>
                    <td>
                      <span className="dist-company">{inv.distributor}</span>
                      <span className="dist-person">Authorized Partner</span>
                    </td>
                    <td>{inv.date}</td>
                    <td>{inv.due}</td>
                    <td>
                      <span className={`status-tag ${inv.status.toLowerCase()}`}>
                        {inv.status}
                      </span>
                    </td>
                    <td className="font-bold">₹{cleanPrice(inv.amount).toLocaleString()}</td>
                    <td>
                      <div className="action-btns">
                        <button 
                          className="icon-action-btn" 
                          title="View"
                          onClick={() => setSelectedInvoice(inv)}
                        >
                          <Eye size={16} />
                        </button>
                        <button className="icon-action-btn" title="Edit"><Edit2 size={16} /></button>
                        <button className="icon-action-btn" title="Download"><Download size={16} /></button>
                        <button className="icon-action-btn" title="Mark as Paid"><Check size={16} /></button>
                        <button className="icon-action-btn" title="Delete"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredInvoices.length === 0 && (
                   <tr><td colSpan="7" className="p-8 text-center text-gray-500">No invoices found.</td></tr>
                )}
              </tbody>
            </table>
            
            {/* Step 6: Pagination */}
            <div className="pagination">
              <div className="page-info">
                Showing 1 to {filteredInvoices.length} of {filteredInvoices.length} entries
              </div>
              <div className="page-controls">
                <button className="page-btn"><ChevronLeft size={16} /></button>
                <button className="page-btn active">1</button>
                <button className="page-btn">2</button>
                <button className="page-btn"><ChevronRight size={16} /></button>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Panels */}
        {/* <aside className="invoice-sidebar">
          <div className="sidebar-panel">
            <h3><Clock size={18} className="text-warning" /> Pending Payments</h3>
            <div className="pending-list">
              {pendingPayments.map(p => (
                <div key={p.realId} className="pending-card">
                  <div className="top">
                    <span className="id">{p.id}</span>
                    <span className="amt">₹{p.amount.toLocaleString()}</span>
                  </div>
                  <span className="name">{p.distributor}</span>
                  <span className="due">Due: {p.due}</span>
                  <button className="reminder-btn">
                    <Bell size={14} className="inline mr-1" /> Send Reminder
                  </button>
                </div>
              ))}
              {pendingPayments.length === 0 && <p className="text-center text-sm text-gray-400">No pending payments.</p>}
            </div>
          </div>

          <div className="sidebar-panel">
            <h3><Calendar size={18} className="text-secondary" /> Recent Activity</h3>
            <div className="activity-feed">
              {activities.map(act => (
                <div key={act.id} className="activity-item">
                  <div className="activity-dot"></div>
                  <div className="activity-info">
                    <span className="text">{act.action}</span>
                    <span className="time">{act.time}</span>
                  </div>
                </div>
              ))}
              {activities.length === 0 && <p className="text-center text-sm text-gray-400">No recent activity.</p>}
            </div>
          </div>
        </aside> */}
      </div>
    </div>
  );
};

export default Invoices;
