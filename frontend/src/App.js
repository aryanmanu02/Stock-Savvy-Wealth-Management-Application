import React, { useState, useEffect } from 'react';
import { Container, Typography, Paper, CircularProgress, Alert } from '@mui/material';
import PortfolioForm from './components/PortfolioForm';
import Results from './components/Results';
import { addStock, getStocks, clearStocks, analyzePortfolio } from './api';

function App() {
  const [stocks, setStocks] = useState([]);
  const [metrics, setMetrics] = useState({});
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch stocks on load
  useEffect(() => {
    fetchStocks();
  }, []);

  const fetchStocks = async () => {
    try {
      const stocks = await getStocks();
      setStocks(stocks);
      setError(null);
      setResults(null);
      setMetrics({});
    } catch (err) {
      setError('Failed to fetch stocks.');
    }
  };

  const handleAddStock = async (stock) => {
    setLoading(true);
    setError(null);
    try {
      await addStock(stock);
      await fetchStocks();
    } catch (err) {
      setError('Failed to add stock.');
    } finally {
      setLoading(false);
    }
  };

  const handleClear = async () => {
    setLoading(true);
    setError(null);
    try {
      await clearStocks();
      await fetchStocks();
    } catch (err) {
      setError('Failed to clear stocks.');
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyze = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await analyzePortfolio();
      setResults(res);
      setMetrics(res.metrics);
    } catch (err) {
      setError(err.response?.data?.detail || 'An error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Paper sx={{ p: 4, mb: 4 }}>
        <Typography variant="h4" gutterBottom>Portfolio Analyzer</Typography>
        <PortfolioForm onAddStock={handleAddStock} onClear={handleClear} loading={loading} />
        {loading && <CircularProgress sx={{ mt: 2 }} />}
        {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
      </Paper>
      <Results
        stocks={stocks}
        metrics={metrics}
        results={results}
        onAnalyze={handleAnalyze}
        loading={loading}
      />
    </Container>
  );
}

export default App; 