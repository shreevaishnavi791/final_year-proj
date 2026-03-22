import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Users, 
  Bell, 
  Settings as SettingsIcon, 
  Database, 
  Lock, 
  History, 
  Upload, 
  Mail, 
  Key, 
  Smartphone, 
  LogOut, 
  CheckCircle,
  Building,
  Save,
  Search,
  ChevronLeft,
  ChevronRight,
  UserPlus
} from 'lucide-react';
import './Settings.css';

const MOCK_AUDIT_LOGS = [
  { id: 1, name: "Admin (Nithin)", action: "Updated Product Price", module: "Inventory", time: "Feb 23, 2024, 11:20 AM" },
  { id: 2, name: "Admin (Sanjay)", action: "Approved Distributor Request", module: "Distributor", time: "Feb 23, 2024, 09:45 AM" },
  { id: 3, name: "Admin (Nithin)", action: "Generated Monthly Sales Report", module: "Reports", time: "Feb 22, 2024, 04:30 PM" },
  { id: 4, name: "System", action: "Automated Database Backup", module: "System", time: "Feb 22, 2024, 03:00 AM" },
  { id: 5, name: "Admin (Nithin)", action: "Updated User Permissions", module: "Admin Mgmt", time: "Feb 21, 2024, 01:15 PM" },
];

const Settings = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredLogs = MOCK_AUDIT_LOGS.filter(log => 
    log.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.module.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="settings-container">
      <header className="settings-header">
        <h1>System Settings</h1>
        <p>Manage your enterprise configurations, security policies, and organizational details.</p>
      </header>

      {/* Step 1: Settings Management Cards Grid */}
      <section className="settings-grid">
        <div className="settings-card">
          <div className="settings-card-header">
            <div className="settings-icon"><Users size={20} /></div>
            <h3>Admin Management</h3>
          </div>
          <p>Add, remove or update administrative accounts and system access.</p>
          <button className="btn-settings-action">Manage Admins</button>
        </div>

        <div className="settings-card">
          <div className="settings-card-header">
            <div className="settings-icon"><ShieldCheck size={20} /></div>
            <h3>Roles & Permissions</h3>
          </div>
          <p>Define access levels and functional permissions for various modules.</p>
          <button className="btn-settings-action">Configure Roles</button>
        </div>

        <div className="settings-card">
          <div className="settings-card-header">
            <div className="settings-icon"><Bell size={20} /></div>
            <h3>Email Notifications</h3>
          </div>
          <p>Configure SMTP settings and customize system-triggered email templates.</p>
          <button className="btn-settings-action">Configure Emails</button>
        </div>

        <div className="settings-card">
          <div className="settings-card-header">
            <div className="settings-icon"><Building size={20} /></div>
            <h3>Company Settings</h3>
          </div>
          <p>Update legal business information, GST details, and corporate branding.</p>
          <button className="btn-settings-action">Update Profile</button>
        </div>

        <div className="settings-card">
          <div className="settings-card-header">
            <div className="settings-icon"><Database size={20} /></div>
            <h3>System Backup</h3>
          </div>
          <p>Schedule automated backups and manage manual restore points.</p>
          <button className="btn-settings-action">Access Backup</button>
        </div>

        <div className="settings-card">
          <div className="settings-card-header">
            <div className="settings-icon"><Lock size={20} /></div>
            <h3>Account Security</h3>
          </div>
          <p>Enforce global password policies and multi-factor authentication.</p>
          <button className="btn-settings-action">Update Security</button>
        </div>
      </section>

      <div className="settings-main-layout">
        <div className="main-panel">
          {/* Step 2: Account Security Section */}
          <section className="section-panel mb-8">
            <h2><Lock size={22} className="text-secondary" /> Account Security</h2>
            <div className="security-list">
              <div className="security-item">
                <div className="security-info">
                  <span className="security-label">Change Password</span>
                  <span className="security-desc">Last updated 15 days ago. We recommend a regular rotation.</span>
                </div>
                <button className="btn-settings-action">Update Password</button>
              </div>

              <div className="security-item">
                <div className="security-info">
                  <span className="security-label">Two-Factor Authentication</span>
                  <span className="security-desc">Add an extra layer of security to your administrative account.</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="status-indicator status-active"><CheckCircle size={14} /> Enabled</span>
                  <button className="btn-settings-action" style={{borderColor: '#64748b', color: '#64748b'}}>Setup SMS</button>
                </div>
              </div>

              <div className="security-item">
                <div className="security-info">
                  <span className="security-label">Login Activity Monitoring</span>
                  <span className="security-desc">Track active logins and recognize unauthorized access attempts.</span>
                </div>
                <button className="btn-settings-action">View Logs</button>
              </div>

              <div className="security-item">
                <div className="security-info">
                  <span className="security-label">Session Management</span>
                  <span className="security-desc">Currently 3 active sessions from verified devices.</span>
                </div>
                <button className="btn-settings-action" style={{color: '#ef4444', borderColor: '#ef4444'}}>Logout All Devices</button>
              </div>
            </div>
          </section>

          {/* Step 5: System Configuration (Company info) */}
          <section className="section-panel">
            <h2><SettingsIcon size={22} className="text-secondary" /> System Configuration</h2>
            <form className="config-form">
              <div className="form-group">
                <label>Company Display Name</label>
                <input type="text" className="form-input" defaultValue="Amirthaa (Minit Engineers India Pvt Ltd)" />
              </div>
              <div className="form-group">
                <label>GST Number</label>
                <input type="text" className="form-input" defaultValue="33AAACM1234F1Z1" />
              </div>
              <div className="form-group full-width">
                <label>Registered Address</label>
                <textarea className="form-input" rows="3" defaultValue="12/4, Industrial Estate Road, Coimbatore, Tamil Nadu 641001"></textarea>
              </div>
              <div className="form-group">
                <label>Primary Contact Email</label>
                <input type="email" className="form-input" defaultValue="contact@amirthaa.com" />
              </div>
              <div className="form-group">
                <label>System Phone Number</label>
                <input type="text" className="form-input" defaultValue="+91 422 2456789" />
              </div>
              <div className="form-group">
                <label>Corporate Logo</label>
                <div className="logo-upload-box">
                  <Upload size={20} className="mx-auto text-muted" />
                  <p>Click to upload or drag & drop</p>
                </div>
              </div>
              <div className="form-group">
                <label>Dashboard Theme</label>
                <select className="form-input">
                  <option>Corporate Light (Default)</option>
                  <option>Industrial Dark</option>
                  <option>High Contrast</option>
                </select>
              </div>
              <div className="full-width text-right">
                <button type="submit" className="btn-save flex items-center gap-2 ml-auto">
                  <Save size={18} /> Save Configurations
                </button>
              </div>
            </form>
          </section>
        </div>

        <aside className="settings-sidebar">
          {/* Step 4: Notification Preferences Panel */}
          <div className="section-panel mb-6">
            <h3><Bell size={18} className="text-secondary" /> Notifications</h3>
            <div className="notification-panel">
              <div className="notification-toggle">
                <div className="toggle-info">
                  <span className="toggle-label">Distributor Registration</span>
                  <span className="toggle-sub">Alert when new partner joins</span>
                </div>
                <label className="switch">
                  <input type="checkbox" defaultChecked />
                  <span className="slider"></span>
                </label>
              </div>
              <div className="notification-toggle">
                <div className="toggle-info">
                  <span className="toggle-label">Low Stock Alerts</span>
                  <span className="toggle-sub">Notify on critical levels</span>
                </div>
                <label className="switch">
                  <input type="checkbox" defaultChecked />
                  <span className="slider"></span>
                </label>
              </div>
              <div className="notification-toggle">
                <div className="toggle-info">
                  <span className="toggle-label">Pending Payments</span>
                  <span className="toggle-sub">Daily overdue invoice summary</span>
                </div>
                <label className="switch">
                  <input type="checkbox" defaultChecked />
                  <span className="slider"></span>
                </label>
              </div>
              <div className="notification-toggle">
                <div className="toggle-info">
                  <span className="toggle-label">System Errors</span>
                  <span className="toggle-sub">Critical server & API alerts</span>
                </div>
                <label className="switch">
                  <input type="checkbox" defaultChecked />
                  <span className="slider"></span>
                </label>
              </div>
            </div>
            <button className="btn-settings-action w-full mt-4">Save Preferences</button>
          </div>

          <div className="section-panel">
            <h3><Users size={18} /> Quick Links</h3>
            <div className="flex flex-col gap-2">
              <button className="btn-export w-full flex items-center gap-2 p-2 rounded hover:bg-slate-50 border border-slate-100"><UserPlus size={16} /> Invite New Admin</button>
              <button className="btn-export w-full flex items-center gap-2 p-2 rounded hover:bg-slate-50 border border-slate-100"><History size={16} /> View All Activity</button>
              <button className="btn-export w-full flex items-center gap-2 p-2 rounded hover:bg-slate-50 border border-slate-100"><LogOut size={16} /> Force Sync DB</button>
            </div>
          </div>
        </aside>
      </div>

      {/* Step 3: Audit Log Table */}
      <section className="audit-log-card">
        <div className="audit-header">
          <h2><History size={22} className="text-secondary mr-2 inline" /> System Audit Log</h2>
          <div className="audit-filters flex gap-4">
            <div className="search-field">
              <Search size={16} className="search-icon" />
              <input 
                type="text" 
                placeholder="Search audit trail..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button className="btn-settings-action">Export Log</button>
          </div>
        </div>
        <div className="audit-table-container">
          <table className="audit-table">
            <thead>
              <tr>
                <th>Admin Name</th>
                <th>Action Performed</th>
                <th>Module</th>
                <th>Timestamp</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map(log => (
                <tr key={log.id}>
                  <td className="font-semibold">{log.name}</td>
                  <td>{log.action}</td>
                  <td><span className="module-tag">{log.module}</span></td>
                  <td>{log.time}</td>
                  <td>
                    <span className="action-view-btn">View Details</span>
                  </td>
                </tr>
              ))}
              {filteredLogs.length === 0 && (
                <tr>
                  <td colSpan="5" className="text-center py-8 text-gray-400">No logs found for your search.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="pagination-area">
          <div className="entries-info">
            Showing 1 to {filteredLogs.length} of {filteredLogs.length} entries
          </div>
          <div className="page-nav">
            <button className="nav-btn"><ChevronLeft size={16} /></button>
            <button className="nav-btn active">1</button>
            <button className="nav-btn">2</button>
            <button className="nav-btn"><ChevronRight size={16} /></button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Settings;
