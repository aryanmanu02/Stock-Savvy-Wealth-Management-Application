import React, { useState } from 'react';
import { TextField, Button, Box, Typography, Grid } from '@mui/material';

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
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
      <Typography variant="h6" gutterBottom>Add Stock to Portfolio</Typography>
      <Grid container spacing={2} alignItems="center" sx={{ mb: 1 }}>
        <Grid item xs={4}>
          <TextField
            label="Symbol"
            value={symbol}
            onChange={e => setSymbol(e.target.value)}
            required
            fullWidth
          />
        </Grid>
        <Grid item xs={3}>
          <TextField
            label="Shares"
            type="number"
            value={shares}
            onChange={e => setShares(e.target.value)}
            required
            fullWidth
          />
        </Grid>
        <Grid item xs={3}>
          <TextField
            label="Buy Price"
            type="number"
            value={buyPrice}
            onChange={e => setBuyPrice(e.target.value)}
            required
            fullWidth
          />
        </Grid>
        <Grid item xs={2}>
          <Button type="submit" variant="contained" color="primary" disabled={loading}>
            Add
          </Button>
        </Grid>
      </Grid>
      <Button onClick={onClear} color="secondary" variant="outlined" sx={{ mt: 1 }}>
        Clear Portfolio
      </Button>
    </Box>
  );
} 