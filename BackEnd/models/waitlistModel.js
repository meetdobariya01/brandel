// models/waitlistModel.js
const { v4: uuidv4 } = require('uuid');

// In-memory storage
let waitlistData = [];

// Add entry to waitlist
const addToWaitlist = (formData) => {
    const newEntry = {
        id: uuidv4(),
        brandName: formData.brandName,
        yourName: formData.yourName,
        email: formData.email,
        mobile: formData.mobile,
        website: formData.website || '',
        category: formData.category,
        aboutBrand: formData.aboutBrand || '',
        status: 'pending',
        submittedAt: new Date().toISOString(),
        adminNotes: '',
        followupNotes: '',
        lastFollowupDate: null,
        assignee: '',
        updatedAt: new Date().toISOString()
    };
    
    waitlistData.push(newEntry);
    return newEntry;
};

// Get entry by email
const getEntryByEmail = (email) => {
    return waitlistData.find(entry => entry.email === email);
};

// Get entry by ID
const getEntryById = (id) => {
    return waitlistData.find(entry => entry.id === id);
};

// Get entries with filters
const getEntriesWithFilters = (filters) => {
    let filtered = [...waitlistData];
    
    if (filters.startDate) {
        filtered = filtered.filter(entry => 
            new Date(entry.submittedAt) >= new Date(filters.startDate)
        );
    }
    
    if (filters.endDate) {
        filtered = filtered.filter(entry => 
            new Date(entry.submittedAt) <= new Date(filters.endDate + 'T23:59:59')
        );
    }
    
    if (filters.status && filters.status !== 'all') {
        filtered = filtered.filter(entry => entry.status === filters.status);
    }
    
    if (filters.category && filters.category !== 'all') {
        filtered = filtered.filter(entry => entry.category === filters.category);
    }
    
    if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        filtered = filtered.filter(entry =>
            entry.brandName.toLowerCase().includes(searchLower) ||
            entry.yourName.toLowerCase().includes(searchLower) ||
            entry.email.toLowerCase().includes(searchLower)
        );
    }
    
    // Sort by submittedAt descending (newest first)
    filtered.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
    
    return filtered;
};

// Get stats
const getStats = () => {
    const stats = {
        total: waitlistData.length,
        pending: waitlistData.filter(e => e.status === 'pending').length,
        under_review: waitlistData.filter(e => e.status === 'under_review').length,
        shortlisted: waitlistData.filter(e => e.status === 'shortlisted').length,
        invited: waitlistData.filter(e => e.status === 'invited').length,
        rejected: waitlistData.filter(e => e.status === 'rejected').length
    };
    return stats;
};

// Update entry
const updateEntry = (id, updates) => {
    const index = waitlistData.findIndex(item => item.id === id);
    if (index === -1) return null;
    
    waitlistData[index] = {
        ...waitlistData[index],
        ...updates,
        updatedAt: new Date().toISOString()
    };
    
    return waitlistData[index];
};

// 🗑️ DELETE - Delete entry by ID
const deleteEntry = (id) => {
    const index = waitlistData.findIndex(item => item.id === id);
    if (index === -1) return null;
    
    const deleted = waitlistData.splice(index, 1)[0];
    return deleted;
};

module.exports = {
    addToWaitlist,
    getEntryByEmail,
    getEntryById,
    getEntriesWithFilters,
    getStats,
    updateEntry,
    deleteEntry  // NEW
};