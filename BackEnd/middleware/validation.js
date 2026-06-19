const validateWaitlistForm = (req, res, next) => {
    const { brandName, yourName, email, mobile, category } = req.body;
    const errors = [];

    if (!brandName || brandName.trim().length < 2) {
        errors.push('Brand Name is required and must be at least 2 characters');
    }

    if (!yourName || yourName.trim().length < 2) {
        errors.push('Your Name is required and must be at least 2 characters');
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
        errors.push('Valid email address is required');
    }

    const phoneRegex = /^(\+?\d{1,3}[- ]?)?\d{8,14}$/;
    if (!mobile || !phoneRegex.test(mobile.replace(/\s+/g, ''))) {
        errors.push('Valid mobile number is required');
    }

    if (!category) {
        errors.push('Category is required');
    }

    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            errors: errors
        });
    }

    next();
};

module.exports = { validateWaitlistForm };