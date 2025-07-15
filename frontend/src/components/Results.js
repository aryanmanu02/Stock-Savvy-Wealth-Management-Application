import React, { useEffect, useState } from 'react';
import { Box, Typography, Card, CardContent, Grid, Button } from '@mui/material';
import { getFileUrl } from '../api';

export default function Results({ stocks, metrics, results, onAnalyze, loading }) {
  const [aiText, setAiText] = useState('');

  useEffect(() => {
    if (results?.files?.ai) {
      fetch(results.files.ai)
        .then(r => r.text())
        .then(setAiText)
        .catch(() => setAiText('Open the file to view insights.'));
    } else {
      setAiText('');
    }
  }, [results]);

  // Get portfolio summary from results if available
  const portfolioSummary = results?.portfolio_summary;
  const weights = portfolioSummary?.weights || [];
  const currentPrices = portfolioSummary?.current_prices || [];
  const buyPrices = portfolioSummary?.buy_prices || [];
  const shares = portfolioSummary?.shares || [];

  // Calculate totals and P/L
  let totalBuy = 0, totalCurrent = 0, profitLoss = 0, profitLossPct = 0;
  if (shares.length && buyPrices.length && currentPrices.length) {
    totalBuy = shares.reduce((sum, q, i) => sum + q * buyPrices[i], 0);
    totalCurrent = shares.reduce((sum, q, i) => sum + q * currentPrices[i], 0);
    profitLoss = totalCurrent - totalBuy;
    profitLossPct = totalBuy > 0 ? (profitLoss / totalBuy) * 100 : 0;
  }

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h5" gutterBottom>Portfolio Summary</Typography>
      <Card sx={{ mb: 2 }}>
        <CardContent>
          {stocks && stocks.length > 0 ? (
            <>
              <div><b>Stocks:</b></div>
              <ul>
                {stocks.map((s, i) => (
                  <li key={i}>
                    {s.symbol} — Shares: {s.shares}, Buy Price: {s.buy_price}
                    {typeof weights[i] !== 'undefined' && (
                      <>,&nbsp;Weight: {(weights[i] * 100).toFixed(2)}%</>
                    )}
                    {typeof currentPrices[i] !== 'undefined' && (
                      <>,&nbsp;Current Price: {currentPrices[i]}</>
                    )}
                  </li>
                ))}
              </ul>
              <div><b>Portfolio Total Buy Price:</b> ₹{totalBuy.toLocaleString(undefined, {maximumFractionDigits: 2})}</div>
              <div><b>Portfolio Total Current Price:</b> ₹{totalCurrent.toLocaleString(undefined, {maximumFractionDigits: 2})}</div>
              <div><b>Portfolio Profit/Loss:</b> ₹{profitLoss.toLocaleString(undefined, {maximumFractionDigits: 2})} ({profitLossPct.toFixed(2)}%)</div>
            </>
          ) : (
            <Typography>No stocks in portfolio.</Typography>
          )}
        </CardContent>
      </Card>
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="h6">Performance Metrics</Typography>
          {metrics && Object.entries(metrics).length > 0 ? (
            Object.entries(metrics).map(([k, v]) => (
              <div key={k}><b>{k}:</b> {typeof v === 'number' ? v.toFixed(4) : JSON.stringify(v)}</div>
            ))
          ) : (
            <Typography>No metrics available. Add stocks and analyze.</Typography>
          )}
        </CardContent>
      </Card>
      <Button onClick={onAnalyze} variant="contained" color="primary" disabled={loading} sx={{ mb: 3 }}>
        {loading ? 'Analyzing...' : 'Analyze Portfolio'}
      </Button>
      {results && results.files && (
        <>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Card sx={{ mb: 2 }}>
                <CardContent>
                  <Typography variant="h6">Portfolio Chart</Typography>
                  <img src={getFileUrl('portfolio_analysis.png')} alt="Portfolio Chart" style={{ width: '100%', maxWidth: 500 }} />
                  <Button href={getFileUrl('portfolio_analysis.png')} target="_blank" sx={{ mt: 1 }}>Download Chart</Button>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card sx={{ mb: 2 }}>
                <CardContent>
                  <Typography variant="h6">AI Insights</Typography>
                  <Button href={getFileUrl('ai_portfolio_insights.txt')} target="_blank" sx={{ mb: 1 }}>Download AI Insights</Button>
                  <pre style={{ maxHeight: 300, overflow: 'auto', background: '#f5f5f5', padding: 10 }}>
                    {aiText}
                  </pre>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
          <Button href={getFileUrl('comprehensive_portfolio_analysis.json')} target="_blank" variant="outlined" sx={{ mt: 2 }}>
            Download Full JSON Report
          </Button>
        </>
      )}
    </Box>
  );
} 