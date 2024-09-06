require('dotenv').config();
const express = require('express');
const axios = require('axios');
const path = require('path');

const app = express();
const port = 3000;
const alphaVantageApiKey = "TV1HJBHZZHVWC1IU";

// Serve static files (React build)
app.use(express.static(path.join(__dirname, 'client', 'build')));

// API route to fetch stock data
app.get('/api/stock/:symbol', async (req, res) => {
    const stockSymbol = req.params.symbol.toUpperCase();
    try {
        const response = await axios.get(`https://www.alphavantage.co/query`, {
            params: {
                function: 'TIME_SERIES_DAILY',
                symbol: stockSymbol,
                apikey: alphaVantageApiKey
            }
        });
        const data = response.data['Time Series (Daily)'];
        const stockData = Object.keys(data).map(date => ({
            date,
            close: data[date]['4. close']
        }));
        res.json(stockData);
    } catch (error) {
        res.status(500).send('Error fetching stock data');
    }
});

// Serve React frontend
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'build', 'index.html'));
});

// Start the server
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});