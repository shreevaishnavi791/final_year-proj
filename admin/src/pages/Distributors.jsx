import React, { useState, useEffect } from "react";
import { 
  Users, 
  Store, 
  Clock, 
  AlertCircle, 
  Search, 
  Filter, 
  Eye, 
  Edit2, 
  CheckCircle, 
  XCircle, 
  Trash2, 
  TrendingUp, 
  MapPin, 
  Phone, 
  Mail,
  MoreVertical,
  ChevronRight
} from "lucide-react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  LineChart, 
  Line,
  Legend
} from "recharts";
import "./Distributors.css";

// Dummy Data for Demonstration
const MOCK_DISTRIBUTORS = [
  { id: 1, name: "Rajesh Kumar", company: "RK Enterprises", contact: "Rajesh K.", phone: "9876543210", email: "rajesh@rkent.com", location: "Chennai, TN", status: "Active", regDate: "2023-10-15", sales: 154000 },
  { id: 2, name: "Anil Sharma", company: "Sharma Logistics", contact: "Anil S.", phone: "9123456780", email: "anil@sharmalog.com", location: "Mumbai, MH", status: "Active", regDate: "2023-11-02", sales: 210000 },
  { id: 3, name: "Priya Singh", company: "Priya Agency", contact: "Priya S.", phone: "9988776655", email: "priya@agency.in", location: "Bangalore, KA", status: "Pending", regDate: "2024-02-10", sales: 0 },
  { id: 4, name: "Vikram Reddy", company: "V-Trade Solutions", contact: "Vikram R.", phone: "8877665544", email: "vikram@vtrade.com", location: "Hyderabad, TS", status: "Inactive", regDate: "2023-05-20", sales: 45000 },
  { id: 5, name: "Suresh Gupta", company: "Gupta & Sons", contact: "Suresh G.", phone: "7766554433", email: "suresh@gupta.com", location: "Delhi, DL", status: "Active", regDate: "2023-12-12", sales: 320000 },
  { id: 6, name: "Meena Iyer", company: "Iyer Distributors", contact: "Meena I.", phone: "9445566778", email: "meena@iyerdist.com", location: "Coimbatore, TN", status: "Pending", regDate: "2024-01-25", sales: 0 },
];

const GROWTH_DATA = [
  { month: "Sep", count: 45 },
  { month: "Oct", count: 52 },
  { month: "Nov", count: 48 },
  { month: "Dec", count: 61 },
  { month: "Jan", count: 55 },
  { month: "Feb", count: 70 },
];

const STATUS_DATA = [
  { name: "Active", value: 65, color: "#10b981" },
  { name: "Pending", value: 20, color: "#9333ea" },
  { name: "Inactive", value: 15, color: "#db2777" },
];

const Distributors = () => {
  const [distributors, setDistributors] = useState(MOCK_DISTRIBUTORS);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterLocation, setFilterLocation] = useState("All");

  // Filter Logic
  const filteredDistributors = distributors.filter(dist => {
    const matchesSearch = 
      dist.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dist.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dist.location.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === "All" || dist.status === filterStatus;
    const matchesLocation = filterLocation === "All" || dist.location.includes(filterLocation);

    return matchesSearch && matchesStatus && matchesLocation;
  });

  const pendingRequests = distributors.filter(d => d.status === "Pending");
  const topPerformers = [...distributors].sort((a, b) => b.sales - a.sales).slice(0, 5);

  const stats = {
    total: distributors.length,
    active: distributors.filter(d => d.status === "Active").length,
    pending: distributors.filter(d => d.status === "Pending").length,
    inactive: distributors.filter(d => d.status === "Inactive").length,
  };

  return (
    <div className="distributor-dashboard">
      <header className="distributor-header">
        <div>
          <h1>Distributor Management</h1>
          <p>Monitor and manage your nationwide distribution network</p>
        </div>
        <div className="current-date">
          {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
        </div>
      </header>

      {/* Step 1: Summary Statistics Cards */}
      <section className="summary-cards">
        <div className="stat-card brand-accent">
          <div className="card-icon blue"><Users size={24} /></div>
          <div className="card-info">
            <span className="label">Total Distributors</span>
            <h2 className="value">{stats.total}</h2>
          </div>
        </div>
        <div className="stat-card brand-accent">
          <div className="card-icon green"><CheckCircle size={24} /></div>
          <div className="card-info">
            <span className="label">Active Distributors</span>
            <h2 className="value">{stats.active}</h2>
          </div>
        </div>
        <div className="stat-card brand-accent">
          <div className="card-icon pink"><Clock size={24} /></div>
          <div className="card-info">
            <span className="label">Pending Requests</span>
            <h2 className="value text-pink">{stats.pending}</h2>
          </div>
        </div>
        <div className="stat-card brand-accent">
          <div className="card-icon brand"><XCircle size={24} /></div>
          <div className="card-info">
            <span className="label">Inactive</span>
            <h2 className="value text-pink">{stats.inactive}</h2>
          </div>
        </div>
      </section>

      {/* Step 2: Charts Section */}
      <section className="charts-section">
        <div className="chart-card">
          <h3>Distributor Growth (Last 6 Months)</h3>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <BarChart data={GROWTH_DATA}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <RechartsTooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="count" fill="#9333ea" radius={[4, 4, 0, 0]} name="New Registrations" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="chart-card">
          <h3>Distributor Status</h3>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={STATUS_DATA}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {STATUS_DATA.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip />
                <Legend verticalAlign="bottom" height={36}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      <div className="management-layout">
        <div className="main-content-area">
          {/* Step 4: Pending Approval Requests Section */}
          {pendingRequests.length > 0 && (
            <section className="pending-section">
              <div className="pending-header">
                <h3><AlertCircle size={20} className="text-warning" /> Pending Approval Requests <span className="badge-count">{pendingRequests.length}</span></h3>
              </div>
              <div className="pending-requests-list">
                {pendingRequests.map(req => (
                  <div key={req.id} className="pending-item">
                    <div className="pending-info">
                      <h4>{req.company}</h4>
                      <p>{req.name} • {req.location} • Applied on {req.regDate}</p>
                    </div>
                    <div className="pending-actions">
                      <button className="btn-approve">Approve</button>
                      <button className="btn-reject">Reject</button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Step 3 & 6: Distributor Management Table & Search/Filters */}
          <section className="table-card">
            <div className="card-header">
              <h2>Distributor List</h2>
              <div className="header-actions">
                <div className="search-box">
                  <Search size={18} className="search-icon" />
                  <input 
                    type="text" 
                    placeholder="Search by name, company..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <select 
                  className="filter-select"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <option value="All">All Status</option>
                  <option value="Active">Active</option>
                  <option value="Pending">Pending</option>
                  <option value="Inactive">Inactive</option>
                </select>
                <select 
                  className="filter-select"
                  value={filterLocation}
                  onChange={(e) => setFilterLocation(e.target.value)}
                >
                  <option value="All">All Locations</option>
                  <option value="TN">Tamil Nadu</option>
                  <option value="MH">Maharashtra</option>
                  <option value="KA">Karnataka</option>
                  <option value="TS">Telangana</option>
                  <option value="DL">Delhi</option>
                </select>
              </div>
            </div>

            <div className="table-responsive">
              <table className="distributor-table">
                <thead>
                  <tr>
                    <th>Company & Name</th>
                    <th>Contact Person</th>
                    <th>Contact Info</th>
                    <th>Location</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDistributors.map(dist => (
                    <tr key={dist.id}>
                      <td>
                        <div className="name-cell">
                          <span className="company-name">{dist.company}</span>
                          <span className="dist-name">{dist.name}</span>
                        </div>
                      </td>
                      <td>{dist.contact}</td>
                      <td>
                        <div className="contact-cell">
                          <div className="flex items-center gap-2"><Phone size={14} className="text-muted" /> {dist.phone}</div>
                          <div className="flex items-center gap-2"><Mail size={14} className="text-muted" /> {dist.email}</div>
                        </div>
                      </td>
                      <td>
                        <div className="flex items-center gap-2"><MapPin size={14} className="text-muted" /> {dist.location}</div>
                      </td>
                      <td>
                        <span className={`status-badge ${dist.status.toLowerCase()}`}>
                          {dist.status}
                        </span>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button className="action-btn view" title="View Details"><Eye size={16} /></button>
                          <button className="action-btn edit" title="Edit"><Edit2 size={16} /></button>
                          {dist.status === "Pending" && <button className="action-btn approve" title="Approve"><CheckCircle size={16} /></button>}
                          {dist.status === "Active" && <button className="action-btn deactivate" title="Deactivate"><XCircle size={16} /></button>}
                          <button className="action-btn delete" title="Delete"><Trash2 size={16} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredDistributors.length === 0 && (
                    <tr>
                      <td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                        No distributors found matching your criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        {/* Step 5: Top Performing Distributors Panel */}
        <aside className="side-panels">
          <div className="side-panel">
            <h3>Top Performing <TrendingUp size={16} className="text-secondary inline ml-1" /></h3>
            <div className="top-performers-list">
              {topPerformers.map((performer, index) => (
                <div key={performer.id} className="performer-item">
                  <div className="performer-img">
                    {performer.company.charAt(0)}
                  </div>
                  <div className="performer-details">
                    <span className="performer-name">{performer.company}</span>
                    <span className="performer-sales">Sales: <span className="sales-val">₹{(performer.sales / 1000).toFixed(1)}k</span></span>
                  </div>
                  <ChevronRight size={16} className="text-muted" />
                </div>
              ))}
            </div>
          </div>

          <div className="side-panel">
            <h3>Quick Actions</h3>
            <div className="flex flex-col gap-2">
              <button className="btn-approve w-full" style={{ textAlign: 'center' }}>+ Add New Distributor</button>
              <button className="btn-reject w-full" style={{ textAlign: 'center', borderColor: '#64748b', color: '#64748b' }}>Export Report</button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Distributors;
