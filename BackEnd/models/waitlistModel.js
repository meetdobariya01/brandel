// models/waitlistModel.js - In-memory storage version
let waitlistEntries = [];
let idCounter = 1;

// In-memory CRUD operations
const addToWaitlist = (entry) => {
    const newEntry = {
        id: idCounter++,
        ...entry,
        submittedAt: new Date().toISOString(),
        status: 'pending',
        adminNotes: '',
        followupNotes: '',
        lastFollowupDate: null,
        assignee: ''
    };
    waitlistEntries.push(newEntry);
    console.log(`📝 Added entry: ${newEntry.brandName} (ID: ${newEntry.id})`);
    return newEntry;
};

const getAllEntries = () => {
    return waitlistEntries;
};

const getEntryByEmail = (email) => {
    return waitlistEntries.find(entry => entry.email === email);
};

const getEntryById = (id) => {
    return waitlistEntries.find(entry => entry.id === parseInt(id));
};

const updateEntry = (id, updates) => {
    const index = waitlistEntries.findIndex(entry => entry.id === parseInt(id));
    if (index === -1) return null;
    
    waitlistEntries[index] = {
        ...waitlistEntries[index],
        ...updates,
        updatedAt: new Date().toISOString()
    };
    return waitlistEntries[index];
};

const getEntriesWithFilters = (filters = {}) => {
    let filtered = [...waitlistEntries];
    
    // Apply date filters
    if (filters.startDate) {
        const start = new Date(filters.startDate);
        filtered = filtered.filter(entry => new Date(entry.submittedAt) >= start);
    }
    
    if (filters.endDate) {
        const end = new Date(filters.endDate);
        end.setHours(23, 59, 59, 999);
        filtered = filtered.filter(entry => new Date(entry.submittedAt) <= end);
    }
    
    // Apply status filter
    if (filters.status && filters.status !== 'all') {
        filtered = filtered.filter(entry => entry.status === filters.status);
    }
    
    // Apply category filter
    if (filters.category && filters.category !== 'all') {
        filtered = filtered.filter(entry => entry.category === filters.category);
    }
    
    // Apply search filter
    if (filters.search) {
        const search = filters.search.toLowerCase();
        filtered = filtered.filter(entry => 
            entry.brandName?.toLowerCase().includes(search) ||
            entry.yourName?.toLowerCase().includes(search) ||
            entry.email?.toLowerCase().includes(search) ||
            entry.mobile?.includes(search)
        );
    }
    
    // Sort by submittedAt descending (newest first)
    filtered.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
    
    return filtered;
};

const getStats = () => {
    const total = waitlistEntries.length;
    const pending = waitlistEntries.filter(e => e.status === 'pending').length;
    const under_review = waitlistEntries.filter(e => e.status === 'under_review').length;
    const shortlisted = waitlistEntries.filter(e => e.status === 'shortlisted').length;
    const invited = waitlistEntries.filter(e => e.status === 'invited').length;
    const rejected = waitlistEntries.filter(e => e.status === 'rejected').length;
    
    return { total, pending, under_review, shortlisted, invited, rejected };
};

// Clear all entries (for testing)
const clearEntries = () => {
    waitlistEntries = [];
    idCounter = 1;
    console.log('🗑️ All entries cleared');
};

module.exports = {
    addToWaitlist,
    getAllEntries,
    getEntryByEmail,
    getEntryById,
    updateEntry,
    getEntriesWithFilters,
    getStats,
    clearEntries,
    waitlistEntries // Export for debugging
};