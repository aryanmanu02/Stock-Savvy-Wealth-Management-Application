import React, { useState } from 'react';
import {
  TextField,
  Button,
  Box,
  Typography,
  Grid,
  IconButton,
  InputAdornment
} from '@mui/material';
import { Add as AddIcon, Clear as ClearIcon } from '@mui/icons-material';

export default function PortfolioForm({ onAddStock, onClear, loading }) {
  const [symbol, setSymbol] = useState('');
  const [shares, setShares] = useState('');
  const [buyPrice, setBuyPrice] = useState('');

  const handleSubmit = e => {
    e.preventDefault();
    if (!symbol || !shares || !buyPrice) return;
    onAddStock({
      symbol: symbol.trim().toUpperCase(),
      shares: Number(shares),
      buy_price: Number(buyPrice),
    });
    setSymbol('');
    setShares('');
    setBuyPrice('');
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Typography
        variant="h5"
        gutterBottom
        sx={{
          fontWeight: 600,
          mb: 3,
          color: '#ffffff'
        }}
      >
        Add Stock to Portfolio
      </Typography>

      <Grid container spacing={3} alignItems="flex-end" sx={{ mb: 3 }}>
        <Grid item xs={12} sm={4}>
          <TextField
            label="Stock Symbol"
            value={symbol}
            onChange={e => setSymbol(e.target.value)}
            required
            fullWidth
            placeholder="e.g., AAPL"
            sx={{
              '& .MuiOutlinedInput-root': {
                '& fieldset': {
                  borderColor: '#333333',
                },
                '&:hover fieldset': {
                  borderColor: '#666666',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#ffffff',
                },
              },
              '& .MuiInputLabel-root': {
                color: '#cccccc',
                '&.Mui-focused': {
                  color: '#ffffff',
                },
              },
              '& .MuiInputBase-input': {
                color: '#ffffff',
              },
            }}
          />
        </Grid>
        <Grid item xs={12} sm={3}>
          <TextField
            label="Number of Shares"
            type="number"
            value={shares}
            onChange={e => setShares(e.target.value)}
            required
            fullWidth
            placeholder="100"
            sx={{
              '& .MuiOutlinedInput-root': {
                '& fieldset': {
                  borderColor: '#333333',
                },
                '&:hover fieldset': {
                  borderColor: '#666666',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#ffffff',
                },
              },
              '& .MuiInputLabel-root': {
                color: '#cccccc',
                '&.Mui-focused': {
                  color: '#ffffff',
                },
              },
              '& .MuiInputBase-input': {
                color: '#ffffff',
              },
            }}
          />
        </Grid>
        <Grid item xs={12} sm={3}>
          <TextField
            label="Buy Price"
            type="number"
            value={buyPrice}
            onChange={e => setBuyPrice(e.target.value)}
            required
            fullWidth
            placeholder="150.00"
            InputProps={{
              startAdornment: <InputAdornment position="start">₹</InputAdornment>,
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                '& fieldset': {
                  borderColor: '#333333',
                },
                '&:hover fieldset': {
                  borderColor: '#666666',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#ffffff',
                },
              },
              '& .MuiInputLabel-root': {
                color: '#cccccc',
                '&.Mui-focused': {
                  color: '#ffffff',
                },
              },
              '& .MuiInputBase-input': {
                color: '#ffffff',
              },
              '& .MuiInputAdornment-root': {
                color: '#cccccc',
              },
            }}
          />
        </Grid>
        <Grid item xs={12} sm={2}>
          <Button
            type="submit"
            variant="contained"
            disabled={loading || !symbol || !shares || !buyPrice}
            fullWidth
            sx={{
              height: 56,
              background: 'linear-gradient(45deg, #ffffff 30%, #f0f0f0 90%)',
              color: '#000000',
              fontWeight: 600,
              '&:hover': {
                background: 'linear-gradient(45deg, #f0f0f0 30%, #e0e0e0 90%)',
              },
              '&:disabled': {
                background: '#333333',
                color: '#666666',
              },
            }}
          >
            <AddIcon sx={{ mr: 1 }} />
            Add
          </Button>
        </Grid>
      </Grid>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
          Enter stock details to add to your portfolio
        </Typography>
        <Button
          onClick={onClear}
          variant="outlined"
          disabled={loading}
          startIcon={<ClearIcon />}
          sx={{
            borderColor: '#666666',
            color: '#ffffff',
            '&:hover': {
              borderColor: '#ffffff',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
            },
          }}
        >
          Clear Portfolio
        </Button>
      </Box>
    </Box>
  );
} 