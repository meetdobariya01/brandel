import React, { useState, useEffect, useCallback } from 'react';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [inquiries, setInquiries] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    status: 'all',
    category: 'all',
    search: ''
  });
  const [selectedIds, setSelectedIds] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportOptions, setExportOptions] = useState({
    format: 'csv',
    fields: []
  });
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteMode, setDeleteMode] = useState('single'); // 'single' or 'bulk'

  // API URL from environment or default
  const API_URL = "https://api.brandel.shop";

  const availableFields = [
    'Inquiry ID',
    'Brand Name',
    'Your Name',
    'Email',
    'Mobile',
    'Website/Instagram',
    'Category',
    'About Brand',
    'Status',
    'Date Submitted',
    'Admin Notes',
    'Follow-up Notes',
    'Last Follow-up',
    'Assignee'
  ];

  // Fetch inquiries
  const fetchInquiries = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams();
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      if (filters.status && filters.status !== 'all') params.append('status', filters.status);
      if (filters.category && filters.category !== 'all') params.append('category', filters.category);
      if (filters.search) params.append('search', filters.search);

      const response = await fetch(`${API_URL}/api/waitlist/all?${params}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch inquiries');
      }

      const data = await response.json();
      setInquiries(data.data || []);
      setStats(data.stats || {});
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [filters, API_URL]);

  useEffect(() => {
    fetchInquiries();
  }, [fetchInquiries]);

  // Handle filter changes
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  // Handle status update
  const handleStatusUpdate = async (inquiryId, newStatus) => {
    try {
      const response = await fetch(`${API_URL}/api/waitlist/${inquiryId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) {
        throw new Error('Failed to update status');
      }

      const data = await response.json();
      setInquiries(prev => 
        prev.map(item => 
          item.id === inquiryId ? data.data : item
        )
      );
      // Refresh stats
      const statsResponse = await fetch(`${API_URL}/api/waitlist/all`);
      const statsData = await statsResponse.json();
      setStats(statsData.stats || {});
    } catch (err) {
      alert('Failed to update status: ' + err.message);
    }
  };

  // 🗑️ DELETE - Single inquiry
  const handleDeleteSingle = (inquiryId) => {
    setDeleteTarget(inquiryId);
    setDeleteMode('single');
    setShowDeleteConfirm(true);
  };

  // 🗑️ DELETE - Confirm deletion
  const confirmDelete = async () => {
    try {
      let response;
      
      if (deleteMode === 'single') {
        // Delete single entry
        response = await fetch(`${API_URL}/api/waitlist/${deleteTarget}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json'
          }
        });
      } else {
        // Bulk delete
        response = await fetch(`${API_URL}/api/waitlist/bulk-delete`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ ids: selectedIds })
        });
      }

      if (!response.ok) {
        throw new Error('Failed to delete');
      }

      const data = await response.json();
      
      // Update local state
      if (deleteMode === 'single') {
        setInquiries(prev => prev.filter(item => item.id !== deleteTarget));
        setSelectedIds(prev => prev.filter(id => id !== deleteTarget));
      } else {
        setInquiries(prev => prev.filter(item => !selectedIds.includes(item.id)));
        setSelectedIds([]);
        setSelectAll(false);
      }
      
      // Refresh stats
      const statsResponse = await fetch(`${API_URL}/api/waitlist/all`);
      const statsData = await statsResponse.json();
      setStats(statsData.stats || {});
      
      setShowDeleteConfirm(false);
      setDeleteTarget(null);
      
      alert(data.message || 'Deleted successfully');
    } catch (err) {
      alert('Failed to delete: ' + err.message);
      setShowDeleteConfirm(false);
    }
  };

  // 🗑️ DELETE - Bulk delete
  const handleBulkDelete = () => {
    if (selectedIds.length === 0) {
      alert('Please select at least one inquiry to delete');
      return;
    }
    setDeleteMode('bulk');
    setShowDeleteConfirm(true);
  };

  // 📥 Handle download report
  const handleDownloadReport = async () => {
    try {
      const params = new URLSearchParams();
      
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      if (filters.status && filters.status !== 'all') params.append('status', filters.status);
      if (filters.category && filters.category !== 'all') params.append('category', filters.category);
      if (filters.search) params.append('search', filters.search);
      
      params.append('format', exportOptions.format);
      
      if (exportOptions.fields.length > 0) {
        exportOptions.fields.forEach(field => {
          params.append('fields', field);
        });
      }

      const response = await fetch(`${API_URL}/api/waitlist/download/report?${params}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to download report');
      }

      if (exportOptions.format === 'csv') {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
        a.download = `brandel-inquiries-${timestamp}.csv`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
      } else {
        const data = await response.json();
        const jsonString = JSON.stringify(data, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
        a.download = `brandel-inquiries-${timestamp}.json`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
      }

      setShowExportModal(false);
    } catch (err) {
      alert('Failed to download report: ' + err.message);
    }
  };

  // Handle bulk status update
  const handleBulkStatusUpdate = async (newStatus) => {
    if (selectedIds.length === 0) {
      alert('Please select at least one inquiry');
      return;
    }

    if (!window.confirm(`Update ${selectedIds.length} inquiries to "${newStatus}"?`)) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/waitlist/bulk-update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ ids: selectedIds, status: newStatus })
      });

      if (!response.ok) {
        throw new Error('Failed to update statuses');
      }

      setSelectedIds([]);
      setSelectAll(false);
      fetchInquiries();
    } catch (err) {
      alert('Failed to update statuses: ' + err.message);
    }
  };

  // Status badge component
  const StatusBadge = ({ status }) => {
    const statusMap = {
      pending: { class: 'badge-pending', label: 'Pending' },
      under_review: { class: 'badge-review', label: 'Under Review' },
      shortlisted: { class: 'badge-shortlisted', label: 'Shortlisted' },
      invited: { class: 'badge-invited', label: 'Invited' },
      rejected: { class: 'badge-rejected', label: 'Rejected' }
    };

    const statusInfo = statusMap[status] || statusMap.pending;
    return <span className={`status-badge ${statusInfo.class}`}>{statusInfo.label}</span>;
  };

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="loader"></div>
        <p>Loading inquiries...</p>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <header className="admin-header">
        <h1>📋 Inquiry Management Dashboard</h1>
        <div className="admin-actions">
          <button 
            className="btn-export"
            onClick={() => setShowExportModal(true)}
          >
            📥 Export Report
          </button>
          <button className="btn-refresh" onClick={fetchInquiries}>
            🔄 Refresh
          </button>
        </div>
      </header>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon total">📊</div>
          <div className="stat-content">
            <h3>Total Inquiries</h3>
            <p className="stat-number">{stats.total || 0}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon pending">⏳</div>
          <div className="stat-content">
            <h3>Pending</h3>
            <p className="stat-number">{stats.pending || 0}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon review">🔍</div>
          <div className="stat-content">
            <h3>Under Review</h3>
            <p className="stat-number">{stats.under_review || 0}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon shortlisted">⭐</div>
          <div className="stat-content">
            <h3>Shortlisted</h3>
            <p className="stat-number">{stats.shortlisted || 0}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon invited">🎉</div>
          <div className="stat-content">
            <h3>Invited</h3>
            <p className="stat-number">{stats.invited || 0}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon rejected">❌</div>
          <div className="stat-content">
            <h3>Rejected</h3>
            <p className="stat-number">{stats.rejected || 0}</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <div className="filter-row">
          <div className="filter-group">
            <label>Date From</label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => handleFilterChange('startDate', e.target.value)}
            />
          </div>
          <div className="filter-group">
            <label>Date To</label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => handleFilterChange('endDate', e.target.value)}
            />
          </div>
          <div className="filter-group">
            <label>Status</label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="under_review">Under Review</option>
              <option value="shortlisted">Shortlisted</option>
              <option value="invited">Invited</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
          <div className="filter-group">
            <label>Category</label>
            <select
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
            >
              <option value="all">All Categories</option>
              <option value="Handmade & Crafts">Handmade & Crafts</option>
              <option value="Organic & Wellness">Organic & Wellness</option>
              <option value="Artisanal Foods">Artisanal Foods</option>
              <option value="Sustainable Fashion">Sustainable Fashion</option>
              <option value="Home & Living">Home & Living</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div className="filter-group">
            <label>Search</label>
            <input
              type="text"
              placeholder="Search by name, brand, email..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="search-input"
            />
          </div>
        </div>
      </div>

      {/* Bulk Actions */}
      <div className="bulk-actions">
        <span className="selected-count">
          {selectedIds.length} selected
        </span>
        {selectedIds.length > 0 && (
          <div className="bulk-buttons">
            <button 
              className="btn-bulk"
              onClick={() => handleBulkStatusUpdate('under_review')}
            >
              Mark as Review
            </button>
            <button 
              className="btn-bulk"
              onClick={() => handleBulkStatusUpdate('shortlisted')}
            >
              Shortlist
            </button>
            <button 
              className="btn-bulk"
              onClick={() => handleBulkStatusUpdate('invited')}
            >
              Invite
            </button>
            <button 
              className="btn-bulk"
              onClick={() => handleBulkStatusUpdate('rejected')}
            >
              Reject
            </button>
            <button 
              className="btn-bulk btn-delete"
              onClick={handleBulkDelete}
            >
              🗑️ Delete Selected
            </button>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="table-container">
        <table className="inquiries-table">
          <thead>
            <tr>
              <th style={{ width: '40px' }}>
                <input
                  type="checkbox"
                  checked={selectAll}
                  onChange={() => {
                    setSelectAll(!selectAll);
                    setSelectedIds(selectAll ? [] : inquiries.map(item => item.id));
                  }}
                />
              </th>
              <th>Brand Name</th>
              <th>Contact</th>
              <th>Category</th>
              <th>Status</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {inquiries.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
                  No inquiries found
                </td>
              </tr>
            ) : (
              inquiries.map((inquiry) => (
                <tr key={inquiry.id}>
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(inquiry.id)}
                      onChange={() => {
                        setSelectedIds(prev => 
                          prev.includes(inquiry.id) 
                            ? prev.filter(id => id !== inquiry.id)
                            : [...prev, inquiry.id]
                        );
                      }}
                    />
                  </td>
                  <td>
                    <div className="brand-cell">
                      <strong>{inquiry.brandName}</strong>
                      <small>{inquiry.yourName}</small>
                    </div>
                  </td>
                  <td>
                    <div className="contact-cell">
                      <div>{inquiry.email}</div>
                      <small>{inquiry.mobile}</small>
                    </div>
                  </td>
                  <td>{inquiry.category}</td>
                  <td>
                    <StatusBadge status={inquiry.status} />
                    <select
                      className="status-select"
                      value={inquiry.status}
                      onChange={(e) => handleStatusUpdate(inquiry.id, e.target.value)}
                    >
                      <option value="pending">Pending</option>
                      <option value="under_review">Under Review</option>
                      <option value="shortlisted">Shortlisted</option>
                      <option value="invited">Invited</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </td>
                  <td>
                    <div className="date-cell">
                      <div>{new Date(inquiry.submittedAt).toLocaleDateString()}</div>
                      <small>{new Date(inquiry.submittedAt).toLocaleTimeString()}</small>
                    </div>
                  </td>
                  <td>
                    <button 
                      className="btn-view"
                      onClick={() => {
                        setSelectedInquiry(inquiry);
                        setShowDetailModal(true);
                      }}
                    >
                      View
                    </button>
                    <button 
                      className="btn-delete"
                      onClick={() => handleDeleteSingle(inquiry.id)}
                      title="Delete inquiry"
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="modal-overlay" onClick={() => setShowDeleteConfirm(false)}>
          <div className="modal-content delete-confirm" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowDeleteConfirm(false)}>×</button>
            <div className="delete-icon">🗑️</div>
            <h2>Confirm Delete</h2>
            <p>
              {deleteMode === 'single' 
                ? 'Are you sure you want to delete this inquiry? This action cannot be undone.'
                : `Are you sure you want to delete ${selectedIds.length} inquiries? This action cannot be undone.`
              }
            </p>
            <div className="delete-actions">
              <button 
                className="btn-cancel"
                onClick={() => setShowDeleteConfirm(false)}
              >
                Cancel
              </button>
              <button 
                className="btn-confirm-delete"
                onClick={confirmDelete}
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Export Modal */}
      {showExportModal && (
        <div className="modal-overlay" onClick={() => setShowExportModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowExportModal(false)}>×</button>
            <h2>📥 Export Inquiry Report</h2>
            
            <div className="export-options">
              <div className="export-group">
                <label>Export Format</label>
                <select
                  value={exportOptions.format}
                  onChange={(e) => setExportOptions(prev => ({ 
                    ...prev, 
                    format: e.target.value 
                  }))}
                >
                  <option value="csv">CSV (Excel Compatible)</option>
                  <option value="json">JSON</option>
                </select>
              </div>

              <div className="export-group">
                <label>Select Fields to Export</label>
                <div className="field-checkboxes">
                  {availableFields.map(field => (
                    <label key={field} className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={exportOptions.fields.includes(field)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setExportOptions(prev => ({
                              ...prev,
                              fields: [...prev.fields, field]
                            }));
                          } else {
                            setExportOptions(prev => ({
                              ...prev,
                              fields: prev.fields.filter(f => f !== field)
                            }));
                          }
                        }}
                      />
                      {field}
                    </label>
                  ))}
                </div>
              </div>

              <div className="export-summary">
                <p>
                  <strong>Exporting:</strong> {inquiries.length} inquiries 
                  {filters.status !== 'all' && ` (${filters.status})`}
                  {filters.startDate && ` from ${filters.startDate}`}
                  {filters.endDate && ` to ${filters.endDate}`}
                </p>
              </div>

              <div className="export-actions">
                <button className="btn-cancel" onClick={() => setShowExportModal(false)}>
                  Cancel
                </button>
                <button className="btn-download" onClick={handleDownloadReport}>
                  📥 Download Report
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedInquiry && (
        <div className="modal-overlay" onClick={() => setShowDetailModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowDetailModal(false)}>×</button>
            <h2>Inquiry Details</h2>
            <div className="detail-grid">
              <div className="detail-item">
                <label>Brand Name</label>
                <p>{selectedInquiry.brandName}</p>
              </div>
              <div className="detail-item">
                <label>Your Name</label>
                <p>{selectedInquiry.yourName}</p>
              </div>
              <div className="detail-item">
                <label>Email</label>
                <p>{selectedInquiry.email}</p>
              </div>
              <div className="detail-item">
                <label>Mobile</label>
                <p>{selectedInquiry.mobile}</p>
              </div>
              <div className="detail-item">
                <label>Website/Instagram</label>
                <p>{selectedInquiry.website || 'N/A'}</p>
              </div>
              <div className="detail-item">
                <label>Category</label>
                <p>{selectedInquiry.category}</p>
              </div>
              <div className="detail-item full-width">
                <label>About Brand</label>
                <p>{selectedInquiry.aboutBrand || 'N/A'}</p>
              </div>
              <div className="detail-item">
                <label>Status</label>
                <p><StatusBadge status={selectedInquiry.status} /></p>
              </div>
              <div className="detail-item">
                <label>Date Submitted</label>
                <p>{new Date(selectedInquiry.submittedAt).toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;