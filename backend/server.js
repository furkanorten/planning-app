const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const cookieParser = require('cookie-parser');

dotenv.config();
const app = express();

app.use(cors({
    origin: ['http://localhost:4200', 'http://192.168.1.102:19000', 'http://192.168.1.103:19000'],
    credentials: true
}));
app.use(express.json());
app.use(cookieParser());

app.use('/api/auth', require('./src/routes/auth.routes'));

app.get('/', (req, res) => {
    res.send('Mobile App API is running ✅');
});

app.get('/api/health', (req, res) => {
    res.status(200).json({
        status: 'success',
        message: 'API is healthy',
        timestamp: new Date().toISOString()
    });
});

app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: `Route ${req.method} ${req.originalUrl} not found`
    });
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: 'Something went wrong!',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log('✅ Connected to MongoDB');
        app.listen(process.env.PORT || 5000, '0.0.0.0', () => {
            console.log(`🚀 Server is running on port ${process.env.PORT || 5000}`);
            console.log(`📍 API Base URL: http://localhost:${process.env.PORT || 5000}/api`);
        });
    })
    .catch((err) => console.error('❌ MongoDB connection error:', err));
