// app.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/database');
const emailRoutes = require('./routes/emailRoutes');

const app = express();

// Connect to MongoDB with error handling
const startServer = async () => {
    try {
        await connectDB();
        
        // Middleware
        app.use(cors({
            origin: process.env.FRONTEND_URL || 'http://localhost:3000',
            credentials: true
        }));
        app.use(express.json());
        app.use(express.urlencoded({ extended: true }));

        // Routes
        app.use('/api', emailRoutes);

        // Health check endpoint
        app.get('/api/health', (req, res) => {
            res.json({ 
                status: 'OK', 
                message: 'Server is running',
                timestamp: new Date().toISOString()
            });
        });

        // Error handling middleware
        app.use((err, req, res, next) => {
            console.error('Error:', err.stack);
            res.status(500).json({
                success: false,
                message: 'Something went wrong!',
                error: process.env.NODE_ENV === 'development' ? err.message : undefined
            });
        });

        const PORT = process.env.PORT || 5175;
        app.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT}`);
            console.log(`📊 Admin Dashboard: ${process.env.FRONTEND_URL || 'http://localhost:3000'}/admin`);
        });
    } catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
};

startServer();