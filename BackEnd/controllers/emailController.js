// controllers/emailController.js
const transporter = require('../config/emailConfig');
const waitlistModel = require('../models/waitlistModel');

// Send admin notification
const sendAdminNotification = async (formData) => {
    const adminEmail = 'care@brandel.shop';
    const adminHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f8f9fa; border-radius: 10px;">
            <div style="background: linear-gradient(135deg, #1a1a2e, #16213e); padding: 20px; border-radius: 10px 10px 0 0; text-align: center;">
                <h1 style="color: #ffd700; margin: 0;">📋 New Waitlist Application</h1>
            </div>
            
            <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                <div style="border-bottom: 2px solid #ffd700; padding-bottom: 20px; margin-bottom: 20px;">
                    <p style="color: #666; margin: 0;">A new brand has applied for the Brandel waitlist.</p>
                </div>

                <div style="margin: 20px 0;">
                    <h3 style="color: #1a1a2e; margin-bottom: 15px;">📊 Application Details</h3>
                    
                    <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin-bottom: 10px;">
                        <p style="margin: 5px 0;"><strong>🏷️ Brand Name:</strong> ${formData.brandName}</p>
                        <p style="margin: 5px 0;"><strong>👤 Applicant:</strong> ${formData.yourName}</p>
                        <p style="margin: 5px 0;"><strong>📧 Email:</strong> ${formData.email}</p>
                        <p style="margin: 5px 0;"><strong>📱 Mobile:</strong> ${formData.mobile}</p>
                        ${formData.website ? `<p style="margin: 5px 0;"><strong>🌐 Website:</strong> ${formData.website}</p>` : ''}
                        <p style="margin: 5px 0;"><strong>📂 Category:</strong> ${formData.category}</p>
                        ${formData.aboutBrand ? `<p style="margin: 5px 0;"><strong>📝 About:</strong> ${formData.aboutBrand}</p>` : ''}
                    </div>
                </div>
            </div>
        </div>
    `;

    const mailOptions = {
        from: `"Brandel Admin" <${process.env.EMAIL_USER}>`,
        to: adminEmail,
        subject: `🆕 New Waitlist Application: ${formData.brandName}`,
        html: adminHtml,
        replyTo: formData.email
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log(`✅ Admin notification sent to ${adminEmail}`);
        console.log(`📨 Message ID: ${info.messageId}`);
        return info;
    } catch (error) {
        console.error('❌ Failed to send admin notification:', error);
        throw error;
    }
};

// Send user confirmation email
const sendUserConfirmation = async (formData) => {
    const userHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f8f9fa; border-radius: 10px;">
            <div style="background: linear-gradient(135deg, #1a1a2e, #16213e); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
                <h1 style="color: #ffd700; margin: 0;">✨ Welcome to Brandel!</h1>
                <p style="color: #fff; margin-top: 10px;">Your waitlist application has been received</p>
            </div>
            
            <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                <p style="color: #333; font-size: 16px;">Dear <strong>${formData.yourName}</strong>,</p>

                <div style="background: #e8f5e9; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #4caf50;">
                    <p style="margin: 0; color: #2e7d32;">
                        ✅ Your application for <strong>${formData.brandName}</strong> has been successfully submitted to the Brandel waitlist!
                    </p>
                </div>

                <div style="margin: 25px 0;">
                    <h3 style="color: #1a1a2e;">📋 Application Summary</h3>
                    <div style="background: #f8f9fa; padding: 15px; border-radius: 8px;">
                        <p style="margin: 5px 0;"><strong>Brand:</strong> ${formData.brandName}</p>
                        <p style="margin: 5px 0;"><strong>Category:</strong> ${formData.category}</p>
                        <p style="margin: 5px 0;"><strong>Submitted:</strong> ${new Date().toLocaleString()}</p>
                    </div>
                </div>

                <div style="background: #fff3cd; padding: 15px; border-radius: 8px; border-left: 4px solid #ffc107; margin: 20px 0;">
                    <h4 style="color: #856404; margin: 0 0 10px 0;">🔍 What Happens Next?</h4>
                    <ul style="color: #856404; margin: 0; padding-left: 20px;">
                        <li>Our team will review your application within 2-3 business days</li>
                        <li>You'll receive a confirmation email if your brand is selected</li>
                        <li>Selected brands will get exclusive founding benefits</li>
                    </ul>
                </div>

                <div style="background: #e3f2fd; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #2196f3;">
                    <p style="margin: 0; color: #0d47a1;">
                        <strong>💡 Pro Tip:</strong> Make sure to check your spam folder for our emails.
                    </p>
                </div>

                <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
                    <p style="color: #666; font-size: 14px;">
                        Questions? Contact us at <a href="mailto:care@brandel.shop" style="color: #1a1a2e; font-weight: bold;">care@brandel.shop</a>
                    </p>
                    <div style="margin-top: 15px;">
                        <span style="display: inline-block; background: #ffd700; color: #1a1a2e; padding: 5px 15px; border-radius: 15px; font-size: 12px; font-weight: bold;">
                            🏆 Founding Member Benefits
                        </span>
                    </div>
                </div>
            </div>
        </div>
    `;

    const mailOptions = {
        from: `"Brandel" <${process.env.EMAIL_USER}>`,
        to: formData.email,
        subject: `✅ Brandel Waitlist Application Received: ${formData.brandName}`,
        html: userHtml,
        replyTo: process.env.EMAIL_USER
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log(`✅ User confirmation sent to ${formData.email}`);
        console.log(`📨 Message ID: ${info.messageId}`);
        return info;
    } catch (error) {
        console.error(`❌ Failed to send user confirmation to ${formData.email}:`, error);
        return null;
    }
};

// Main controller function - Handle waitlist submission
const handleWaitlistSubmission = async (req, res) => {
    try {
        const formData = req.body;

        console.log(`📝 Processing application for: ${formData.brandName}`);
        console.log(`👤 Applicant: ${formData.yourName} (${formData.email})`);

        // Save to database/model
        const savedEntry = waitlistModel.addToWaitlist(formData);
        console.log(`💾 Application saved with ID: ${savedEntry.id}`);

        // Send admin notification (required)
        await sendAdminNotification(formData);

        // Send user confirmation (try, but don't fail if it doesn't work)
        let userEmailSent = false;
        try {
            const userResult = await sendUserConfirmation(formData);
            if (userResult) {
                userEmailSent = true;
                console.log(`✅ User confirmation email sent successfully`);
            }
        } catch (userEmailError) {
            console.warn('⚠️ User confirmation email failed, but application was saved:', userEmailError.message);
        }

        res.status(200).json({
            success: true,
            message: 'Application submitted successfully',
            data: savedEntry,
            email_status: {
                admin_sent: true,
                user_sent: userEmailSent
            }
        });

    } catch (error) {
        console.error('❌ Error in waitlist submission:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to submit application',
            error: error.message
        });
    }
};

// Get all entries with filters
const getAllWaitlistEntries = (req, res) => {
    try {
        const { startDate, endDate, status, category, search } = req.query;
        
        const filters = { startDate, endDate, status, category, search };
        const entries = waitlistModel.getEntriesWithFilters(filters);
        const stats = waitlistModel.getStats();
        
        console.log(`📊 Retrieved ${entries.length} waitlist entries`);
        res.status(200).json({
            success: true,
            count: entries.length,
            data: entries,
            stats: stats
        });
    } catch (error) {
        console.error('❌ Failed to retrieve entries:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve entries',
            error: error.message
        });
    }
};

// Get single entry by ID
const getEntryById = (req, res) => {
    try {
        const { id } = req.params;
        const entry = waitlistModel.getEntryById(id);
        
        if (!entry) {
            return res.status(404).json({
                success: false,
                message: 'Entry not found'
            });
        }
        
        res.status(200).json({
            success: true,
            data: entry
        });
    } catch (error) {
        console.error('❌ Failed to retrieve entry:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve entry',
            error: error.message
        });
    }
};

// Update entry status
const updateEntryStatus = (req, res) => {
    try {
        const { id } = req.params;
        const { status, adminNotes, assignee, followupNotes } = req.body;
        
        const updated = waitlistModel.updateEntry(id, {
            status,
            adminNotes,
            assignee,
            followupNotes,
            lastFollowupDate: followupNotes ? new Date().toISOString() : undefined
        });
        
        if (!updated) {
            return res.status(404).json({
                success: false,
                message: 'Entry not found'
            });
        }
        
        res.status(200).json({
            success: true,
            data: updated,
            message: 'Entry updated successfully'
        });
    } catch (error) {
        console.error('❌ Failed to update entry:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update entry',
            error: error.message
        });
    }
};

// 📥 DOWNLOAD INQUIRY REPORT - CSV/JSON
const downloadInquiryReport = (req, res) => {
    try {
        const { 
            startDate, 
            endDate, 
            status, 
            category, 
            search,
            format = 'csv',
            fields = []
        } = req.query;

        // Get filtered entries
        const filters = { startDate, endDate, status, category, search };
        const entries = waitlistModel.getEntriesWithFilters(filters);

        if (entries.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No data found for the selected filters'
            });
        }

        // Prepare data for export
        const exportData = entries.map(entry => ({
            'Inquiry ID': entry.id,
            'Brand Name': entry.brandName || '',
            'Your Name': entry.yourName || '',
            'Email': entry.email || '',
            'Mobile': entry.mobile || '',
            'Website/Instagram': entry.website || 'N/A',
            'Category': entry.category || '',
            'About Brand': entry.aboutBrand || 'N/A',
            'Status': entry.status ? entry.status.charAt(0).toUpperCase() + entry.status.slice(1).replace('_', ' ') : 'Pending',
            'Date Submitted': new Date(entry.submittedAt).toLocaleString('en-US', {
                month: '2-digit',
                day: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            }),
            'Admin Notes': entry.adminNotes || 'N/A',
            'Follow-up Notes': entry.followupNotes || 'N/A',
            'Last Follow-up': entry.lastFollowupDate ? 
                new Date(entry.lastFollowupDate).toLocaleDateString('en-US') : 
                'N/A',
            'Assignee': entry.assignee || 'Unassigned'
        }));

        // Filter fields if specified
        let finalData = exportData;
        if (fields && fields.length > 0) {
            const fieldSet = new Set(fields);
            finalData = exportData.map(row => {
                const filteredRow = {};
                fieldSet.forEach(field => {
                    if (row[field] !== undefined) {
                        filteredRow[field] = row[field];
                    }
                });
                return filteredRow;
            });
        }

        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
        const filename = `brandel-inquiries-${timestamp}`;

        // JSON export
        if (format === 'json') {
            return res.status(200).json({
                success: true,
                data: finalData,
                metadata: {
                    total: finalData.length,
                    generatedAt: new Date().toISOString(),
                    filters: { startDate, endDate, status, category, search }
                }
            });
        }

        // CSV export (default)
        if (finalData.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No data to export'
            });
        }

        // Generate CSV manually
        const headers = Object.keys(finalData[0]);
        let csvRows = [];
        
        // Add headers
        csvRows.push(headers.join(','));
        
        // Add rows
        for (const row of finalData) {
            const values = headers.map(header => {
                const value = row[header] || '';
                const escaped = String(value).replace(/"/g, '""');
                return `"${escaped}"`;
            });
            csvRows.push(values.join(','));
        }

        const csv = csvRows.join('\n');

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename=${filename}.csv`);
        res.setHeader('Cache-Control', 'no-cache');
        res.status(200).send(csv);

    } catch (error) {
        console.error('❌ Error generating report:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to generate report',
            error: error.message
        });
    }
};

// Bulk update status
const bulkUpdateStatus = (req, res) => {
    try {
        const { ids, status } = req.body;
        
        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No IDs provided for bulk update'
            });
        }

        let updatedCount = 0;
        ids.forEach(id => {
            const updated = waitlistModel.updateEntry(id, { 
                status,
                updatedAt: new Date().toISOString()
            });
            if (updated) updatedCount++;
        });

        res.status(200).json({
            success: true,
            message: `${updatedCount} entries updated successfully`,
            updatedCount
        });
    } catch (error) {
        console.error('❌ Failed bulk update:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update entries',
            error: error.message
        });
    }
};

module.exports = {
    handleWaitlistSubmission,
    getAllWaitlistEntries,
    getEntryById,
    updateEntryStatus,
    downloadInquiryReport,
    bulkUpdateStatus
};