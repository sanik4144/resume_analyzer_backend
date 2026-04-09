require('dotenv').config();
const express = require('express');
const cors = require('cors');
const analyzerHandler = require('./routeHandlers/analyzerHandler');


const app = express();
app.use(cors({
    origin: '*', // Allow all for debugging, we can narrow it down once it works
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Request logger
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/', analyzerHandler);

app.get('/', (req, res) => {
    res.status(200).send('Resume AI Backend is Running');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log('Server running');
});