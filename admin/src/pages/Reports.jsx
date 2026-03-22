import React, { useState } from 'react';
import { 
  FileText, 
  BarChart3, 
  Package, 
  Users, 
  Download, 
  Eye, 
  Search, 
  Filter, 
  Calendar, 
  ChevronLeft, 
  ChevronRight,
  FileSpreadsheet,
  FileBox,
  TrendingUp,
  ArrowRight
} from 'lucide-react';
import './Reports.css';

const MOCK_ACTIVITY = [
  { id: 1, name: "Q4 Sales Detailed Analysis", user: "Admin", date: "2024-02-24", period: "Oct - Dec 2023", type: "Sales" },
  { id: 2, name: "Current Inventory Valuation", user: "Admin", date: "2024-02-23", period: "Dynamic", type: "Inventory" },
  { id: 3, name: "Distributor Performance 2023", user: "Admin", date: "2024-02-22", period: "Annual 2023", type: "Distributor" },
  { id: 4, name: "Monthly Revenue Breakdown", user: "Admin", date: "2024-02-20", period: "Jan 2024", type: "Revenue" },
  { id: 5, name: "Pending Orders Overdue List", user: "Admin", date: "2024-02-18", period: "Current Month", type: "Sales" },
];

const TEMPLATES = [
  { id: 1, name: "Monthly Sales Report", period: "Last 30 Days" },
  { id: 2, name: "Quarterly Inventory Status", period: "Current Quarter" },
  { id: 3, name: "Annual Revenue Analysis", period: "Fiscal Year" },
];

const Reports = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [reportType, setReportType] = useState('All');

  const filteredActivity = MOCK_ACTIVITY.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = reportType === 'All' || item.type === reportType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="reports-container">
      <header className="reports-header">
        <h1>Management Reports</h1>
        <p>Analyze performance, inventory, and distributor metrics across your enterprise.</p>
      </header>

      {/* Step 1: Horizontal Report Cards */}
      <section className="report-grid">
        <div className="report-card">
          <div className="report-card-header">
            <div className="report-card-icon"><TrendingUp size={20} /></div>
            <h3>Sales Report</h3>
          </div>
          <p>Detailed breakdown of orders, turnover, and product popularity for any period.</p>
          <button className="btn-generate">
             <BarChart3 size={16} /> Generate Sales Report
          </button>
        </div>

        <div className="report-card">
          <div className="report-card-header">
            <div className="report-card-icon"><Package size={20} /></div>
            <h3>Inventory Report</h3>
          </div>
          <p>Evaluate stock levels, movements, and valuations across various categories.</p>
          <button className="btn-generate">
             <BarChart3 size={16} /> Generate Stock Report
          </button>
        </div>

        <div className="report-card">
          <div className="report-card-header">
            <div className="report-card-icon"><Users size={20} /></div>
            <h3>Distributor Report</h3>
          </div>
          <p>Monitor distributor efficiency, order volumes, and regional performance.</p>
          <button className="btn-generate">
             <BarChart3 size={16} /> Generate Dist. Report
          </button>
        </div>

        <div className="report-card">
          <div className="report-card-header">
            <div className="report-card-icon"><FileSpreadsheet size={20} /></div>
            <h3>Revenue Report</h3>
          </div>
          <p>Analyze gross margins, net profit, and financial trends for the corporation.</p>
          <button className="btn-generate">
             <BarChart3 size={16} /> Generate revenue Report
          </button>
        </div>
      </section>

      <div className="reports-main-layout">
        <div className="main-panel">
          {/* Step 2 & 5: Activity Section & Filters */}
          <div className="activity-card">
            <div className="activity-header">
              <h2>Recent Report Activity</h2>
              <div className="filter-controls">
                <div className="search-field">
                  <Search size={18} className="search-icon" />
                  <input 
                    type="text" 
                    placeholder="Search recent reports..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <select 
                  value={reportType} 
                  onChange={(e) => setReportType(e.target.value)}
                >
                  <option value="All">All Types</option>
                  <option value="Sales">Sales</option>
                  <option value="Inventory">Inventory</option>
                  <option value="Distributor">Distributor</option>
                  <option value="Revenue">Revenue</option>
                </select>
                <input type="date" />
              </div>
            </div>

            <div className="activity-table-wrapper">
              <table className="activity-table">
                <thead>
                  <tr>
                    <th>Report Name</th>
                    <th>Generated By</th>
                    <th>Date</th>
                    <th>Report Period</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredActivity.map(item => (
                    <tr key={item.id}>
                      <td className="font-semibold">{item.name}</td>
                      <td>{item.user}</td>
                      <td>{item.date}</td>
                      <td>{item.period}</td>
                      <td>
                        <div className="action-links">
                          <span className="action-link"><Eye size={14} /> View</span>
                          <span className="action-link download"><Download size={14} /> Download</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredActivity.length === 0 && (
                    <tr>
                      <td colSpan="5" className="text-center py-8 text-gray-400">No recent reports found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Step 6: Pagination */}
            <div className="pagination-area">
              <div className="entries-info">
                Showing 1 to {filteredActivity.length} of {filteredActivity.length} entries
              </div>
              <div className="page-nav">
                <button className="nav-btn"><ChevronLeft size={16} /></button>
                <button className="nav-btn active">1</button>
                <button className="nav-btn">2</button>
                <button className="nav-btn"><ChevronRight size={16} /></button>
              </div>
            </div>
          </div>
        </div>

        <aside className="reports-sidebar">
          {/* Step 3: Export Reports Panel */}
          <div className="side-panel">
            <h3><Download size={18} /> Export Reports</h3>
            <p className="text-xs text-secondary mb-4 italic">Download current system snapshot</p>
            <div className="export-group">
              <button className="btn-export">
                <FileText size={16} /> PDF
              </button>
              <button className="btn-export">
                <FileSpreadsheet size={16} /> Excel
              </button>
            </div>
          </div>

          {/* Step 4: Saved Templates Section */}
          <div className="side-panel">
            <h3><FileBox size={18} /> Report Templates</h3>
            <div className="templates-list">
              {TEMPLATES.map(temp => (
                <div key={temp.id} className="template-item">
                  <span className="template-name">{temp.name}</span>
                  <span className="template-period">Standard Period: {temp.period}</span>
                  <div className="template-actions">
                    <button className="btn-template view">View</button>
                    <button className="btn-template gen">Generate</button>
                  </div>
                </div>
              ))}
            </div>
            <button className="btn-generate mt-4" style={{ backgroundColor: 'transparent', color: 'var(--color-secondary)', border: '1px dashed var(--color-secondary)' }}>
               + Save New Template
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Reports;
