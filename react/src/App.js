import './App.css';
import 'chartjs-adapter-date-fns';
import React, { useState, useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';
import axios from 'axios';

function App() {
    const [stocks, setStocks] = useState([]);
    const [symbol, setSymbol] = useState('');
    const [chartsData, setChartsData] = useState([]);
    const chartRef = useRef(null); // Ref for the single chart instance

    // Function to add stock symbol
    const addStock = async (e) => {
        e.preventDefault();
        const upperSymbol = symbol.toUpperCase();
        if (upperSymbol && !stocks.includes(upperSymbol)) {
            const newStocks = [...stocks, upperSymbol];
            setStocks(newStocks);
            setSymbol('');
            await fetchStockData(upperSymbol);
        }
    };

    // Function to remove stock symbol
    const removeStock = (stockSymbol) => {
        const updatedStocks = stocks.filter(s => s !== stockSymbol);
        setStocks(updatedStocks);
        const updatedChartsData = chartsData.filter(data => data.label !== stockSymbol);
        setChartsData(updatedChartsData);

        // Update chart with the remaining stocks
        if (chartRef.current) {
            chartRef.current.data.datasets = updatedChartsData;
            chartRef.current.update();
        }
    };

    // Fetch stock data from the backend
    const fetchStockData = async (stockSymbol) => {
        try {
            const response = await axios.get(`/api/stock/${stockSymbol}`);
            const stockData = response.data;
            const labels = stockData.map(point => point.date);
            const data = stockData.map(point => point.close);

            // Add new dataset to the chart
            const newDataset = {
                label: stockSymbol,
                data: data.map((value, index) => ({ x: labels[index], y: value })),
                borderColor: getRandomColor(),
                borderWidth: 2,
                fill: false
            };

            setChartsData(prevData => [...prevData, newDataset]);

        } catch (error) {
            console.error('Error fetching stock data:', error);
        }
    };

    // Utility to generate random colors for each stock line
    const getRandomColor = () => {
        const letters = '0123456789ABCDEF';
        let color = '#';
        for (let i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    };

    // Effect to render or update the chart
    useEffect(() => {
        const ctx = document.getElementById('stock-chart').getContext('2d');

        if (chartRef.current) {
            // Update existing chart with new data
            chartRef.current.data.datasets = chartsData;
            chartRef.current.update();
        } else {
            // Create a new chart
            chartRef.current = new Chart(ctx, {
                type: 'line',
                data: {
                    datasets: chartsData
                },
                options: {
                    scales: {
                        x: {
                            type: 'time',
                            time: {
                                unit: 'day'
                            }
                        },
                        y: {
                            beginAtZero: false
                        }
                    }
                }
            });
        }
    }, [chartsData]);

    return (
        <div className="App">
            <h1>Stock Market Chart</h1>
            <form onSubmit={addStock}>
                <input
                    type="text"
                    value={symbol}
                    onChange={(e) => setSymbol(e.target.value)}
                    placeholder="Enter stock symbol"
                    required
                />
                <button type="submit">Add Stock</button>
            </form>
            <canvas id="stock-chart" width="800" height="400"></canvas>
            <div style={{ marginTop: '20px' }}>
                {stocks.map(stock => (
                    <div key={stock}>
                        <button onClick={() => removeStock(stock)}>Remove {stock}</button>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default App;
