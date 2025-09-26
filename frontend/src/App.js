import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Paper, 
  CircularProgress, 
  Alert, 
  Box,
  CssBaseline,
  ThemeProvider,
  createTheme
} from '@mui/material';
import PortfolioForm from './components/PortfolioForm';
import Results from './components/Results';
import { addStock, getStocks, clearStocks, analyzePortfolio, updateStock, deleteStock } from './api';

// Create a modern black and white theme
const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#ffffff',
      contrastText: '#000000',
    },
    secondary: {
      main: '#666666',
      contrastText: '#ffffff',
    },
    background: {
      default: '#000000',
      paper: '#111111',
    },
    text: {
      primary: '#ffffff',
      secondary: '#cccccc',
    },
    divider: '#333333',
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 700,
      letterSpacing: '-0.02em',
    },
    h5: {
      fontWeight: 600,
      letterSpacing: '-0.01em',
    },
    h6: {
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          border: '1px solid #333333',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          borderRadius: 8,
          padding: '10px 24px',
        },
        contained: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(255, 255, 255, 0.15)',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
          },
        },
      },
    },
  },
});

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

  const handleUpdateStock = async (stockId, updatedStock) => {
    setLoading(true);
    setError(null);
    try {
      await updateStock(stockId, updatedStock);
      await fetchStocks();
    } catch (err) {
      setError('Failed to update stock.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteStock = async (stockId) => {
    setLoading(true);
    setError(null);
    try {
      await deleteStock(stockId);
      await fetchStocks();
    } catch (err) {
      setError('Failed to delete stock.');
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
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #000000 0%, #111111 100%)',
          py: 4,
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ mb: 6, textAlign: 'center' }}>
            <Typography 
              variant="h3" 
              sx={{ 
                fontWeight: 800, 
                background: 'linear-gradient(45deg, #ffffff 30%, #cccccc 90%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 1
              }}
            >
              Stock Savvy Wealth Management
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 400 }}>
              Advanced Portfolio Analysis & AI Insights
            </Typography>
          </Box>

          <Paper 
            sx={{ 
              p: 4, 
              mb: 4,
              background: 'rgba(17, 17, 17, 0.8)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            <PortfolioForm 
              onAddStock={handleAddStock} 
              onClear={handleClear} 
              loading={loading} 
            />
            {loading && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                <CircularProgress sx={{ color: '#ffffff' }} />
              </Box>
            )}
            {error && (
              <Alert 
                severity="error" 
                sx={{ 
                  mt: 2,
                  backgroundColor: 'rgba(244, 67, 54, 0.1)',
                  border: '1px solid rgba(244, 67, 54, 0.3)',
                  color: '#ff6b6b'
                }}
              >
                {error}
              </Alert>
            )}
          </Paper>

          <Results
            stocks={stocks}
            metrics={metrics}
            results={results}
            onAnalyze={handleAnalyze}
            onUpdateStock={handleUpdateStock}
            onDeleteStock={handleDeleteStock}
            loading={loading}
          />
        </Container>
      </Box>
    </ThemeProvider>
  );
}

export default App; 