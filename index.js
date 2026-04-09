require('dotenv').config();
const express = require('express');
const cors = require('cors');
const analyzerHandler = require('./routeHandlers/analyzerHandler');


const app = express();
app.use(cors());
app.use(express.json());

app.use('/', analyzerHandler);

app.get('/', (req, res) => {
    res.redirect('/apply');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log('Server running');
});