// In-memory storage (for demo - use MongoDB/PostgreSQL in production)
let waitlistEntries = [];

const addToWaitlist = (entry) => {
    const newEntry = {
        id: Date.now(),
        ...entry,
        submittedAt: new Date().toISOString(),
        status: 'pending'
    };
    waitlistEntries.push(newEntry);
    return newEntry;
};

const getAllEntries = () => {
    return waitlistEntries;
};

const getEntryByEmail = (email) => {
    return waitlistEntries.find(entry => entry.email === email);
};

module.exports = {
    addToWaitlist,
    getAllEntries,
    getEntryByEmail,
    waitlistEntries
};