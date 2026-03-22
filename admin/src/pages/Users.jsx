import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, getDocs, query, orderBy, doc, deleteDoc, where, limit } from 'firebase/firestore';
import { Users as UsersIcon, Loader2, ShieldCheck, Trash2, AlertTriangle, X, Eye, FileText, Clock } from 'lucide-react';
import './Users.css';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteModal, setDeleteModal] = useState({ open: false, user: null });
  const [viewModal, setViewModal] = useState({ open: false, user: null });
  const [deleting, setDeleting] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: '' });

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: '' }), 3500);
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'users'));
      const querySnapshot = await getDocs(q);
      const usersData = [];
      
      for (const userDoc of querySnapshot.docs) {
        const userData = { id: userDoc.id, ...userDoc.data() };
        
        // Fetch latest order for this user to enable invoice preview
        try {
          const ordersRef = collection(db, 'orders');
          const orderQuery = query(
            ordersRef, 
            where('userEmail', '==', userData.email), 
            orderBy('createdAt', 'desc'), 
            limit(1)
          );
          const orderSnapshot = await getDocs(orderQuery);
          if (!orderSnapshot.empty) {
            userData.latestOrderId = orderSnapshot.docs[0].id;
          }
        } catch (orderErr) {
          console.error("Error fetching latest order for user:", userData.email, orderErr);
        }
        
        usersData.push(userData);
      }
      
      // Sort in memory by loginTime (desc) if available
      usersData.sort((a, b) => {
        const timeA = a.loginTime ? new Date(a.loginTime).getTime() : 0;
        const timeB = b.loginTime ? new Date(b.loginTime).getTime() : 0;
        return timeB - timeA;
      });

      setUsers(usersData);
    } catch (err) {
      console.error("Error fetching users:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const openDeleteModal = (user) => {
    setDeleteModal({ open: true, user });
  };

  const closeDeleteModal = () => {
    setDeleteModal({ open: false, user: null });
  };

  const handleDeleteUser = async () => {
    if (!deleteModal.user) return;
    setDeleting(true);
    try {
      await deleteDoc(doc(db, 'users', deleteModal.user.id));
      setUsers((prev) => prev.filter((u) => u.id !== deleteModal.user.id));
      showToast(`User "${deleteModal.user.email}" has been deleted successfully.`, 'success');
      closeDeleteModal();
    } catch (err) {
      console.error("Error deleting user:", err);
      showToast('Failed to delete user. Please try again.', 'error');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="users-page">
      {/* Toast Notification */}
      {toast.show && (
        <div className={`users-toast ${toast.type}`}>
          {toast.type === 'success' ? '✅' : '❌'} {toast.message}
        </div>
      )}

      <div className="users-page-header">
        <h1 className="users-title">Registered Users</h1>
        <p className="users-count">Total Customers: {users.length}</p>
      </div>

      {loading ? (
        <div className="loading-state">
          <Loader2 className="animate-spin" size={40} />
          <p>Loading users...</p>
        </div>
      ) : users.length === 0 ? (
        <div className="no-users">
          <UsersIcon size={48} strokeWidth={1.2} />
          <p>No registered users found.</p>
        </div>
      ) : (
        <div className="users-table-card">
          <table className="users-table">
            <thead>
              <tr>
                <th><div className="th-content"><UsersIcon size={16} /> ID</div></th>
                <th><div className="th-content"><FileText size={16} /> CUSTOMER DETAILS</div></th>
                <th><div className="th-content"><Clock size={16} /> REGISTERED ON</div></th>
                <th>ROLE</th>
                <th>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id} className="user-row">
                  <td className="user-id-cell">
                    <span className="id-badge">{user.id.substring(0, 8)}...</span>
                  </td>
                  <td className="user-details-cell">
                    <div className="user-info-wrapper">
                      <div className="user-main-info">
                        <span className="user-display-name">{user.displayName || user.name || 'Anonymous User'}</span>
                        <span className="user-email-text">{user.email}</span>
                      </div>
                      <div className="user-sub-info">
                        {user.phone && <span className="user-phone-text">📞 {user.phone}</span>}
                        {(user.city || user.district) && (
                          <span className="user-location-text">
                            📍 {user.city || user.district}{user.state ? `, ${user.state}` : ''}
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="user-date-cell">
                    <div className="registration-date">
                      {user.loginTime ? new Date(user.loginTime).toLocaleString('en-GB', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: true
                      }).replace(',', '').toLowerCase() : 'N/A'}
                    </div>
                  </td>
                  <td>
                    <span className={`role-pill ${user.role || 'user'}`}>
                      {user.role || 'user'}
                    </span>
                  </td>
                  <td>
                    <div className="action-group">
                      <button
                        className="btn-icon view"
                        onClick={() => setViewModal({ open: true, user })}
                        title="View Full Profile"
                      >
                        <Eye size={16} />
                      </button>
                      
                      {user.latestOrderId ? (
                        <a
                          href={`/invoice/${user.latestOrderId}`}
                          className="btn-icon invoice"
                          title="View Latest Invoice"
                        >
                          <FileText size={16} />
                        </a>
                      ) : (
                        <button
                          className="btn-icon invoice disabled"
                          title="No orders found"
                          disabled
                        >
                          <FileText size={16} />
                        </button>
                      )}

                      <button
                        className="btn-icon delete"
                        onClick={() => openDeleteModal(user)}
                        title="Delete User"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* View User Modal */}
      {viewModal.open && (
        <div className="modal-overlay" onClick={() => setViewModal({ open: false, user: null })}>
          <div className="view-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setViewModal({ open: false, user: null })}>
              <X size={18} />
            </button>
            <div className="modal-header-section">
              <div className="user-avatar-large">
                {viewModal.user?.displayName?.charAt(0) || viewModal.user?.email?.charAt(0) || 'U'}
              </div>
              <h2 className="modal-title">{viewModal.user?.displayName || 'User Details'}</h2>
              <span className={`role-pill ${viewModal.user?.role || 'user'}`}>
                {viewModal.user?.role || 'user'}
              </span>
            </div>

            <div className="modal-content-grid">
              <div className="info-section">
                <h3>Contact Information</h3>
                <div className="info-row">
                  <span className="info-label">Email:</span>
                  <span className="info-value">{viewModal.user?.email}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Phone:</span>
                  <span className="info-value">{viewModal.user?.phone || 'N/A'}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Address:</span>
                  <span className="info-value">{viewModal.user?.address || 'N/A'}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">City/Dist:</span>
                  <span className="info-value">{viewModal.user?.city || viewModal.user?.district || 'N/A'}</span>
                </div>
              </div>

              <div className="info-section">
                <h3>Personal Details</h3>
                <div className="info-row">
                  <span className="info-label">Gender:</span>
                  <span className="info-value">{viewModal.user?.gender || 'N/A'}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Birthday:</span>
                  <span className="info-value">
                    {viewModal.user?.birthDay} {viewModal.user?.birthMonth} {viewModal.user?.birthYear || ''}
                  </span>
                </div>
                <div className="info-row">
                  <span className="info-label">Qualification:</span>
                  <span className="info-value">{viewModal.user?.qualification || 'N/A'}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Status:</span>
                  <span className="info-value">{viewModal.user?.currentStatus || 'N/A'}</span>
                </div>
              </div>
            </div>

            {viewModal.user?.latestOrderId && (
              <div className="modal-footer-actions">
                <a href={`/invoice/${viewModal.user.latestOrderId}`} className="view-invoice-link">
                  <FileText size={16} /> View Latest Invoice
                </a>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModal.open && (
        <div className="modal-overlay" onClick={closeDeleteModal}>
          <div className="delete-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={closeDeleteModal}>
              <X size={18} />
            </button>

            <div className="modal-warning-icon">
              <AlertTriangle size={40} strokeWidth={1.5} />
            </div>

            <h2 className="modal-title">Delete User?</h2>
            <p className="modal-subtitle">
              You are about to permanently delete the following user from the system:
            </p>

            <div className="modal-user-info">
              <div className="modal-user-row">
                <span className="modal-label">Email:</span>
                <span className="modal-value">{deleteModal.user?.email}</span>
              </div>
              {deleteModal.user?.displayName && (
                <div className="modal-user-row">
                  <span className="modal-label">Name:</span>
                  <span className="modal-value">{deleteModal.user.displayName}</span>
                </div>
              )}
              {deleteModal.user?.phone && (
                <div className="modal-user-row">
                  <span className="modal-label">Phone:</span>
                  <span className="modal-value">{deleteModal.user.phone}</span>
                </div>
              )}
            </div>

            <p className="modal-warning-text">
              ⚠️ This action <strong>cannot be undone</strong>. The user's data will be permanently removed from Firestore.
            </p>

            <div className="modal-actions">
              <button className="modal-cancel-btn" onClick={closeDeleteModal} disabled={deleting}>
                Cancel
              </button>
              <button className="modal-delete-btn" onClick={handleDeleteUser} disabled={deleting}>
                {deleting ? (
                  <>
                    <Loader2 size={15} className="animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 size={15} />
                    Yes, Delete User
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;
