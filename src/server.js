require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const userRoutes = require('./routes/userRoutes');
const tournamentRoutes = require('./routes/tournamentRoutes');
const superAdminRoutes = require('./routes/superAdminRoutes');
const adminRoutes = require('./routes/adminRoutes');
const teamRoutes = require('./routes/teamRoutes');
const matchRoutes=require('./routes/matchRoutes')
const playerRoutes=require('./routes/playerRoutes')
const { log } = require('./utils/logger');
const cloudinary = require('cloudinary').v2;


const app = express();

cloudinary.config({
    cloud_name: process.env.CLOUDNAME,
    api_key: process.env.APIKEY,
    api_secret: process.env.APISECRET
  });


// Add this before your routes
app.set('trust proxy', true);  // Important for secure cookies/headers

// Update CORS configuration
app.use(cors({
    origin: [
        'https://athletracks.com',
        'https://www.athletracks.com',
        // 'http://localhost:5173',
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true  // If using authentication
}));


// Middleware
app.use("/public", express.static(path.join(__dirname, "public")));
app.use(express.static(path.join(__dirname, 'dist')));
app.use(express.json());

// // Redirect HTTP to HTTPS
app.use((req, res, next) => {
    if (!req.secure && req.get('X-Forwarded-Proto') !== 'https') {
        return res.redirect(`https://${req.get('Host')}${req.url}`);
    }
    next();
});

// Database connection
const connectDB = async () => {
    try {
        log(`Connecting to MongoDB with URI: ${process.env.MONGO_URI}`);
        if (!process.env.MONGO_URI) {
            throw new Error('MONGO_URI is not defined');
        }
        await mongoose.connect(process.env.MONGO_URI);
        log('MongoDB connected successfully');
    } catch (error) {
        log(`Error: ${error.message}`);
        process.exit(1);
    }
};

connectDB();

// Routes
app.use('/api/users', userRoutes);
app.use('/api/tournaments', tournamentRoutes);
app.use('/api/superadmin', superAdminRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/team', teamRoutes);
app.use('/api/match',matchRoutes)
app.use('/api/player', playerRoutes);

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  });

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    log(`Server is running on port ${PORT}`);
});