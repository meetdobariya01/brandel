// config/database.js
const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        // Mongoose 6+ doesn't need useNewUrlParser or useUnifiedTopology
        const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/brandel';
        
        console.log(`🔗 Connecting to MongoDB: ${mongoURI.replace(/\/\/.*@/, '//<credentials>@')}`);
        
        const conn = await mongoose.connect(mongoURI);
        
        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
        console.log(`📁 Database Name: ${conn.connection.name}`);
        console.log(`🔌 Connection State: ${conn.connection.readyState === 1 ? 'Connected' : 'Disconnected'}`);
        
        // Handle connection events
        mongoose.connection.on('error', (err) => {
            console.error('❌ MongoDB connection error:', err);
        });
        
        mongoose.connection.on('disconnected', () => {
            console.warn('⚠️ MongoDB disconnected');
        });
        
        mongoose.connection.on('reconnected', () => {
            console.log('✅ MongoDB reconnected');
        });
        
        return conn;
    } catch (error) {
        console.error(`❌ MongoDB Connection Error: ${error.message}`);
        console.log('⚠️ Server will run with in-memory data only');
        console.log('💡 To use MongoDB:');
        console.log('   1. Install MongoDB locally from https://www.mongodb.com/try/download/community');
        console.log('   2. Or use MongoDB Atlas for cloud database');
        console.log('   3. Update MONGODB_URI in .env file');
        return null;
    }
};

module.exports = connectDB;