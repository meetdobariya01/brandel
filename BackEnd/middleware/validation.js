// middleware/validation.js
const validateWaitlistForm = (req, res, next) => {
    const { brandName, yourName, email, mobile, category } = req.body;
    const errors = [];

    // Validate brand name
    if (!brandName || brandName.trim().length === 0) {
        errors.push('Brand Name is required');
    }

    // Validate your name
    if (!yourName || yourName.trim().length === 0) {
        errors.push('Your Name is required');
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
        errors.push('Valid Email Address is required');
    }

    // Validate mobile
    const phoneRegex = /^(\+?\d{1,3}[- ]?)?\d{8,14}$/;
    if (!mobile || !phoneRegex.test(mobile.replace(/\s+/g, ''))) {
        errors.push('Valid Mobile Number is required (e.g. +1234567890)');
    }

    // Validate category
    const validCategories = ['Handmade & Crafts', 'Organic & Wellness', 'Artisanal Foods', 'Sustainable Fashion', 'Home & Living', 'Other'];
    if (!category || !validCategories.includes(category)) {
        errors.push('Please select a valid brand category');
    }

    // If there are errors, return them
    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            errors: errors
        });
    }

    next();
};

module.exports = { validateWaitlistForm };