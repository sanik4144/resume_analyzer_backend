require('dotenv').config();
const express = require('express');
const cors = require('cors');
const analyzerHandler = require('./routeHandlers/analyzerHandler');


const app = express();
app.use(cors()); // In production, consider narrowing this to your Vercel URL
app.use(express.json());

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