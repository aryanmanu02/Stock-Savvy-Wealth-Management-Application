import React, { useEffect, useState } from 'react';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  Grid, 
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
} from '@mui/material';
import { 
  Edit as EditIcon, 
  Delete as DeleteIcon, 
  Analytics as AnalyticsIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Download as DownloadIcon,
  Psychology as PsychologyIcon,
  Assessment as AssessmentIcon,
  Security as SecurityIcon,
  Timeline as TimelineIcon,
  Business as BusinessIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Info as InfoIcon,
  Star as StarIcon,
  AttachMoney as AttachMoneyIcon,
  TrendingFlat as TrendingFlatIcon
} from '@mui/icons-material';
import { getFileUrl } from '../api';

// AI Insights Display Component
function AIInsightsDisplay({ aiText }) {
  if (!aiText) return null;

  // Clean markdown and artifacts for production-ready display.
  const sanitizeAIText = (text) => {
    let t = text;
    t = t.replace(/\*\*(.*?)\*\*/g, '$1');
    t = t.replace(/__(.*?)__/g, '$1');
    t = t.replace(/\*(.*?)\*/g, '$1');
    t = t.replace(/_(.*?)_/g, '$1');
    t = t.replace(/^#{1,6}\s+/gm, '');
    t = t.replace(/^\s*[-*_]{3,}\s*$/gm, '');
    t = t.replace(/\[(\d+)\]/g, '');
    t = t.replace(/^\s*•\s*$/gm, '');
    t = t.replace(/^\s*•\s*/gm, '- ');
    t = t.replace(/[\t ]+$/gm, '');
    t = t.replace(/\n{3,}/g, '\n\n');
    return t.trim();
  };

  // Parse the AI text into separate numbered sections.
  const parseAIText = (text) => {
    const lines = text.split('\n');
    const sections = [];
    let currentSection = null;

    const pushSection = () => {
      if (currentSection) {
        sections.push({
          number: currentSection.number,
          title: currentSection.title.replace(/\s*:\s*$/, '').trim(),
          content: currentSection.content.join('\n').trim(),
        });
      }
      currentSection = null;
    };

    for (const rawLine of lines) {
      const line = rawLine.trimEnd();
      const numberedMatch = line.trim().match(/^(\d{1,2})\.\s+(.+)$/);

      if (numberedMatch) {
        pushSection();
        currentSection = {
          number: Number(numberedMatch[1]),
          title: numberedMatch[2].trim(),
          content: [],
        };
        continue;
      }

      if (currentSection) {
        currentSection.content.push(line);
      }
    }

    pushSection();

    if (sections.length > 0) {
      return sections.sort((a, b) => a.number - b.number);
    }

    // Fallback: split on all-caps header lines if numbered headings are missing.
    const fallbackSections = [];
    let fallback = null;
    for (const rawLine of lines) {
      const line = rawLine.trim();
      const isHeader = (
        line &&
        (line === line.toUpperCase() || line.match(/^[A-Z][A-Z\s&()/-]+:?$/)) &&
        !line.includes('₹') &&
        !line.includes('%') &&
        !line.startsWith('- ')
      );

      if (isHeader) {
        if (fallback) {
          fallbackSections.push({
            title: fallback.title.replace(/\s*:\s*$/, '').trim(),
            content: fallback.content.join('\n').trim(),
          });
        }
        fallback = { title: line, content: [] };
      } else if (fallback) {
        fallback.content.push(rawLine);
      }
    }

    if (fallback) {
      fallbackSections.push({
        title: fallback.title.replace(/\s*:\s*$/, '').trim(),
        content: fallback.content.join('\n').trim(),
      });
    }

    return fallbackSections.length > 0
      ? fallbackSections
      : [{ title: 'AI Insights', content: text }];
  };

  const cleaned = sanitizeAIText(aiText);
  const sections = parseAIText(cleaned);

  const getHeaderTheme = (index) => {
    const themes = [
      { border: '#4caf50', bg: 'rgba(76, 175, 80, 0.14)' },
      { border: '#2196f3', bg: 'rgba(33, 150, 243, 0.14)' },
      { border: '#ff9800', bg: 'rgba(255, 152, 0, 0.14)' },
      { border: '#9c27b0', bg: 'rgba(156, 39, 176, 0.14)' },
      { border: '#00bcd4', bg: 'rgba(0, 188, 212, 0.14)' },
      { border: '#f44336', bg: 'rgba(244, 67, 54, 0.14)' },
    ];
    return themes[index % themes.length];
  };

  const renderSectionContent = (content) => {
    if (!content) {
      return (
        <Typography sx={{ color: '#888888', fontStyle: 'italic' }}>
          No content available.
        </Typography>
      );
    }

    const lines = content.split('\n');
    const elements = [];

    const isTableLine = (line) => {
      const trimmed = (line || '').trim();
      return trimmed.startsWith('|') && trimmed.endsWith('|') && trimmed.includes('|');
    };

    const parseTableRows = (tableLines) => {
      return tableLines
        .map((line) => line.split('|').slice(1, -1).map((cell) => cell.trim()))
        .filter((row) => row.some((cell) => cell.length > 0));
    };

    let i = 0;
    while (i < lines.length) {
      const rawLine = lines[i];
      const trimmedLine = rawLine.trim();

      if (!trimmedLine) {
        elements.push(<Box key={`blank-${i}`} sx={{ height: 6 }} />);
        i += 1;
        continue;
      }

      if (isTableLine(rawLine)) {
        const tableLines = [];
        const startIndex = i;
        while (i < lines.length && isTableLine(lines[i])) {
          tableLines.push(lines[i].trim());
          i += 1;
        }

        const rows = parseTableRows(tableLines);
        if (rows.length >= 2) {
          const header = rows[0];
          let body = rows.slice(1);

          if (body.length > 0 && body[0].every((cell) => /^:?-{2,}:?$/.test(cell))) {
            body = body.slice(1);
          }

          elements.push(
            <TableContainer
              key={`table-${startIndex}`}
              component={Paper}
              sx={{
                backgroundColor: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: 1,
                mb: 1,
                overflowX: 'auto',
              }}
            >
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}>
                    {header.map((cell, idx) => (
                      <TableCell key={`h-${startIndex}-${idx}`} sx={{ color: '#ffffff', fontWeight: 700 }}>
                        {cell}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {body.map((row, rowIdx) => (
                    <TableRow key={`r-${startIndex}-${rowIdx}`}>
                      {header.map((_, colIdx) => (
                        <TableCell key={`c-${startIndex}-${rowIdx}-${colIdx}`} sx={{ color: '#cccccc' }}>
                          {row[colIdx] || ''}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          );
          continue;
        }

        for (let fallbackIdx = 0; fallbackIdx < tableLines.length; fallbackIdx += 1) {
          const line = tableLines[fallbackIdx];
          elements.push(
            <Typography key={`table-fallback-${startIndex}-${fallbackIdx}`} sx={{ color: '#cccccc', mb: 0.75, whiteSpace: 'pre-wrap' }}>
              {line}
            </Typography>
          );
        }
        continue;
      }

      if (trimmedLine.startsWith('- ')) {
        elements.push(
          <Box key={`bullet-${i}`} sx={{ display: 'flex', alignItems: 'flex-start', mb: 0.75 }}>
            <Typography sx={{ color: '#cccccc', mr: 1, mt: 0.5 }}>•</Typography>
            <Typography sx={{ color: '#cccccc', flex: 1 }}>
              {trimmedLine.substring(2)}
            </Typography>
          </Box>
        );
        i += 1;
        continue;
      }

      if (trimmedLine.match(/^\d+\./)) {
        elements.push(
          <Box key={`number-${i}`} sx={{ display: 'flex', alignItems: 'flex-start', mb: 0.75 }}>
            <Typography sx={{ color: '#cccccc', mr: 1, mt: 0.5, fontWeight: 600 }}>
              {trimmedLine.match(/^\d+/)[0]}.
            </Typography>
            <Typography sx={{ color: '#cccccc', flex: 1 }}>
              {trimmedLine.replace(/^\d+\.\s*/, '')}
            </Typography>
          </Box>
        );
        i += 1;
        continue;
      }

      elements.push(
        <Typography key={`text-${i}`} sx={{ color: '#cccccc', mb: 0.75, whiteSpace: 'pre-wrap' }}>
          {trimmedLine}
        </Typography>
      );
      i += 1;
    }

    return elements;
  };

  return (
    <Box sx={{ mt: 2 }}>
      <Grid container spacing={2}>
        {sections.map((section, index) => (
          <Grid item xs={12} key={`${section.number || index}-${section.title}`}>
            {(() => {
              const headerTheme = getHeaderTheme(index);
              return (
            <Card
              sx={{
                backgroundColor: 'rgba(17, 17, 17, 0.8)',
                border: `1px solid ${headerTheme.border}`,
                boxShadow: 'none',
              }}
            >
              <CardContent sx={{ p: 0 }}>
                <Box
                  sx={{
                    px: 2,
                    py: 1.25,
                    borderBottom: `1px solid ${headerTheme.border}`,
                    backgroundColor: headerTheme.bg,
                  }}
                >
                  <Typography variant="h6" sx={{ color: '#ffffff', fontWeight: 700 }}>
                    {section.number ? `${section.number}. ${section.title}` : section.title}
                  </Typography>
                </Box>

                <Box sx={{ color: '#cccccc', lineHeight: 1.6, p: 2.5 }}>
                  {renderSectionContent(section.content)}
                </Box>
              </CardContent>
            </Card>
              );
            })()}
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}

// Stock Edit Dialog Component
function StockEditDialog({ open, stock, onClose, onSave }) {
  const [symbol, setSymbol] = useState('');
  const [shares, setShares] = useState('');
  const [buyPrice, setBuyPrice] = useState('');

  useEffect(() => {
    if (stock) {
      setSymbol(stock.symbol || '');
      setShares(stock.shares || '');
      setBuyPrice(stock.buy_price || '');
    }
  }, [stock]);

  const handleSave = () => {
    onSave({
      symbol: symbol.trim().toUpperCase(),
      shares: Number(shares),
      buy_price: Number(buyPrice),
    });
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ color: '#ffffff', backgroundColor: '#111111' }}>
        Edit Stock
      </DialogTitle>
      <DialogContent sx={{ backgroundColor: '#111111', pt: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              label="Stock Symbol"
              value={symbol}
              onChange={(e) => setSymbol(e.target.value)}
              fullWidth
              sx={{
                '& .MuiOutlinedInput-root': {
                  '& fieldset': { borderColor: '#333333' },
                  '&:hover fieldset': { borderColor: '#666666' },
                  '&.Mui-focused fieldset': { borderColor: '#ffffff' },
                },
                '& .MuiInputLabel-root': {
                  color: '#cccccc',
                  '&.Mui-focused': { color: '#ffffff' },
                },
                '& .MuiInputBase-input': { color: '#ffffff' },
              }}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              label="Shares"
              type="number"
              value={shares}
              onChange={(e) => setShares(e.target.value)}
              fullWidth
              sx={{
                '& .MuiOutlinedInput-root': {
                  '& fieldset': { borderColor: '#333333' },
                  '&:hover fieldset': { borderColor: '#666666' },
                  '&.Mui-focused fieldset': { borderColor: '#ffffff' },
                },
                '& .MuiInputLabel-root': {
                  color: '#cccccc',
                  '&.Mui-focused': { color: '#ffffff' },
                },
                '& .MuiInputBase-input': { color: '#ffffff' },
              }}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              label="Buy Price"
              type="number"
              value={buyPrice}
              onChange={(e) => setBuyPrice(e.target.value)}
              fullWidth
              sx={{
                '& .MuiOutlinedInput-root': {
                  '& fieldset': { borderColor: '#333333' },
                  '&:hover fieldset': { borderColor: '#666666' },
                  '&.Mui-focused fieldset': { borderColor: '#ffffff' },
                },
                '& .MuiInputLabel-root': {
                  color: '#cccccc',
                  '&.Mui-focused': { color: '#ffffff' },
                },
                '& .MuiInputBase-input': { color: '#ffffff' },
              }}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ backgroundColor: '#111111', p: 2 }}>
        <Button onClick={onClose} sx={{ color: '#cccccc' }}>
          Cancel
        </Button>
        <Button 
          onClick={handleSave} 
          variant="contained"
          disabled={!symbol || !shares || !buyPrice}
          sx={{
            background: 'linear-gradient(45deg, #ffffff 30%, #f0f0f0 90%)',
            color: '#000000',
            '&:hover': {
              background: 'linear-gradient(45deg, #f0f0f0 30%, #e0e0e0 90%)',
            },
          }}
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default function Results({ stocks, metrics, results, onAnalyze, onUpdateStock, onDeleteStock, loading }) {
  const [aiText, setAiText] = useState('');
  const [editDialog, setEditDialog] = useState({ open: false, stock: null });

  useEffect(() => {
    if (results?.files?.ai) {
      fetch(getFileUrl('ai_portfolio_insights.txt'))
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

  const handleEditStock = (stock) => {
    setEditDialog({ open: true, stock });
  };

  const handleSaveStock = (updatedStock) => {
    onUpdateStock(editDialog.stock._id, updatedStock);
  };

  const handleDeleteStock = (stockId) => {
    if (window.confirm('Are you sure you want to delete this stock?')) {
      onDeleteStock(stockId);
    }
  };

  return (
    <Box sx={{ mt: 4 }}>
      {/* Portfolio Summary Card */}
      <Card sx={{ 
        mb: 4, 
        background: 'rgba(17, 17, 17, 0.8)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
      }}>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <AnalyticsIcon sx={{ mr: 2, color: '#ffffff', fontSize: 28 }} />
            <Typography variant="h5" sx={{ fontWeight: 600, color: '#ffffff' }}>
              Portfolio Summary
            </Typography>
          </Box>

          {stocks && stocks.length > 0 ? (
            <>
              {/* Portfolio Stats */}
              <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} md={3}>
                  <Box sx={{ textAlign: 'center', p: 2, border: '1px solid #333333', borderRadius: 2 }}>
                    <Typography variant="h6" color="text.secondary">Total Invested</Typography>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: '#ffffff' }}>
                      ₹{totalBuy.toLocaleString(undefined, {maximumFractionDigits: 2})}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Box sx={{ textAlign: 'center', p: 2, border: '1px solid #333333', borderRadius: 2 }}>
                    <Typography variant="h6" color="text.secondary">Current Value</Typography>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: '#ffffff' }}>
                      ₹{totalCurrent.toLocaleString(undefined, {maximumFractionDigits: 2})}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Box sx={{ textAlign: 'center', p: 2, border: '1px solid #333333', borderRadius: 2 }}>
                    <Typography variant="h6" color="text.secondary">P&L</Typography>
                    <Typography 
                      variant="h4" 
                      sx={{ 
                        fontWeight: 700, 
                        color: profitLoss >= 0 ? '#4caf50' : '#f44336',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 1
                      }}
                    >
                      {profitLoss >= 0 ? <TrendingUpIcon /> : <TrendingDownIcon />}
                      ₹{profitLoss.toLocaleString(undefined, {maximumFractionDigits: 2})}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Box sx={{ textAlign: 'center', p: 2, border: '1px solid #333333', borderRadius: 2 }}>
                    <Typography variant="h6" color="text.secondary">P&L %</Typography>
                    <Typography 
                      variant="h4" 
                      sx={{ 
                        fontWeight: 700, 
                        color: profitLossPct >= 0 ? '#4caf50' : '#f44336'
                      }}
                    >
                      {profitLossPct.toFixed(2)}%
                    </Typography>
                  </Box>
                </Grid>
              </Grid>

              {/* Stocks Table */}
              <TableContainer component={Paper} sx={{ 
                backgroundColor: 'transparent',
                border: '1px solid #333333',
                borderRadius: 2,
                overflow: 'hidden'
              }}>
                <Table>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}>
                      <TableCell sx={{ color: '#ffffff', fontWeight: 600 }}>Symbol</TableCell>
                      <TableCell sx={{ color: '#ffffff', fontWeight: 600 }}>Shares</TableCell>
                      <TableCell sx={{ color: '#ffffff', fontWeight: 600 }}>Buy Price</TableCell>
                      <TableCell sx={{ color: '#ffffff', fontWeight: 600 }}>Current Price</TableCell>
                      <TableCell sx={{ color: '#ffffff', fontWeight: 600 }}>Weight</TableCell>
                      <TableCell sx={{ color: '#ffffff', fontWeight: 600 }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {stocks.map((stock, index) => {
                      const currentPrice = currentPrices[index];
                      const weight = weights[index];
                      const stockProfitLoss = currentPrice ? (currentPrice - stock.buy_price) * stock.shares : 0;
                      const stockProfitLossPct = stock.buy_price > 0 ? ((currentPrice - stock.buy_price) / stock.buy_price) * 100 : 0;

                      return (
                        <TableRow key={stock._id} sx={{ '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.02)' } }}>
                          <TableCell sx={{ color: '#ffffff', fontWeight: 600 }}>
                            {stock.symbol}
                          </TableCell>
                          <TableCell sx={{ color: '#cccccc' }}>
                            {stock.shares.toLocaleString()}
                          </TableCell>
                          <TableCell sx={{ color: '#cccccc' }}>
                            ₹{stock.buy_price.toFixed(2)}
                          </TableCell>
                          <TableCell sx={{ color: '#cccccc' }}>
                            {currentPrice ? `₹${currentPrice.toFixed(2)}` : 'N/A'}
                          </TableCell>
                          <TableCell sx={{ color: '#cccccc' }}>
                            {weight ? `${(weight * 100).toFixed(2)}%` : 'N/A'}
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                              <IconButton
                                size="small"
                                onClick={() => handleEditStock(stock)}
                                sx={{ color: '#666666', '&:hover': { color: '#ffffff' } }}
                              >
                                <EditIcon />
                              </IconButton>
                              <IconButton
                                size="small"
                                onClick={() => handleDeleteStock(stock._id)}
                                sx={{ color: '#666666', '&:hover': { color: '#f44336' } }}
                              >
                                <DeleteIcon />
                              </IconButton>
                            </Box>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </>
          ) : (
            <Alert severity="info" sx={{ backgroundColor: 'rgba(33, 150, 243, 0.1)', border: '1px solid rgba(33, 150, 243, 0.3)' }}>
              No stocks in portfolio. Add some stocks to get started.
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Performance Metrics Card */}
      <Card sx={{ 
        mb: 4, 
        background: 'rgba(17, 17, 17, 0.8)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
      }}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h5" sx={{ fontWeight: 600, color: '#ffffff', mb: 3 }}>
            Performance Metrics
          </Typography>
          {metrics && Object.entries(metrics).length > 0 ? (
            <Grid container spacing={2}>
              {Object.entries(metrics).map(([key, value]) => (
                <Grid item xs={12} sm={6} md={4} key={key}>
                  <Box sx={{ 
                    p: 2, 
                    border: '1px solid #333333', 
                    borderRadius: 2,
                    backgroundColor: 'rgba(255, 255, 255, 0.02)'
                  }}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      {key.replace(/_/g, ' ').toUpperCase()}
                    </Typography>
                    <Typography variant="h6" sx={{ color: '#ffffff', fontWeight: 600 }}>
                      {(() => {
                        if (typeof value === 'number') {
                          return value.toFixed(4);
                        } else if (key === 'individual_returns' && typeof value === 'object') {
                          if (Array.isArray(value)) {
                            // Handle array format (backward compatibility)
                            return value.map((val, index) => `${metrics?.tickers?.[index]?.replace('.NS', '') || `Stock ${index + 1}`}: ${(val * 100).toFixed(2)}%`).join(', ');
                          } else {
                            // Handle dictionary format
                            return Object.entries(value)
                              .map(([ticker, val]) => `${ticker.replace('.NS', '')}: ${(val * 100).toFixed(2)}%`)
                              .join(', ');
                          }
                        } else if (key === 'individual_volatility' && typeof value === 'object') {
                          if (Array.isArray(value)) {
                            // Handle array format (backward compatibility)
                            return value.map((val, index) => `${metrics?.tickers?.[index]?.replace('.NS', '') || `Stock ${index + 1}`}: ${(val * 100).toFixed(2)}%`).join(', ');
                          } else {
                            // Handle dictionary format
                            return Object.entries(value)
                              .map(([ticker, val]) => `${ticker.replace('.NS', '')}: ${(val * 100).toFixed(2)}%`)
                              .join(', ');
                          }
                        } else if (key === 'weights' && Array.isArray(value)) {
                          return value.map((val, index) => `${metrics?.tickers?.[index]?.replace('.NS', '') || `Stock ${index + 1}`}: ${(val * 100).toFixed(2)}%`).join(', ');
                        } else if (key === 'tickers' && Array.isArray(value)) {
                          return value.map(ticker => ticker.replace('.NS', '')).join(', ');
                        } else if (key === 'sectors' && Array.isArray(value)) {
                          return value.join(', ');
                        } else {
                          return JSON.stringify(value);
                        }
                      })()}
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          ) : (
            <Alert severity="info" sx={{ backgroundColor: 'rgba(33, 150, 243, 0.1)', border: '1px solid rgba(33, 150, 243, 0.3)' }}>
              No metrics available. Add stocks and analyze your portfolio.
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Analyze Button */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
        <Button 
          onClick={onAnalyze} 
          variant="contained" 
          disabled={loading || stocks.length === 0}
          size="large"
          startIcon={<AnalyticsIcon />}
          sx={{
            background: 'linear-gradient(45deg, #ffffff 30%, #f0f0f0 90%)',
            color: '#000000',
            fontWeight: 600,
            px: 4,
            py: 1.5,
            fontSize: '1.1rem',
            '&:hover': {
              background: 'linear-gradient(45deg, #f0f0f0 30%, #e0e0e0 90%)',
            },
            '&:disabled': {
              background: '#333333',
              color: '#666666',
            },
          }}
        >
          {loading ? 'Analyzing...' : 'Analyze Portfolio'}
        </Button>
      </Box>

      {/* Results Section */}
      {results && results.files && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card sx={{ 
              background: 'rgba(17, 17, 17, 0.8)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}>
              <CardContent sx={{ p: 4 }}>
                <Typography variant="h6" sx={{ color: '#ffffff', mb: 2 }}>
                  Portfolio Chart
                </Typography>
                <img 
                  src={getFileUrl('portfolio_analysis.png')} 
                  alt="Portfolio Chart" 
                  style={{ 
                    width: '100%', 
                    maxWidth: 500,
                    borderRadius: 8,
                    border: '1px solid #333333'
                  }} 
                />
                <Button 
                  href={getFileUrl('portfolio_analysis.png')} 
                  target="_blank" 
                  startIcon={<DownloadIcon />}
                  sx={{ mt: 2, color: '#ffffff', borderColor: '#666666' }}
                  variant="outlined"
                >
                  Download Chart
                </Button>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12}>
            <Card sx={{ 
              background: 'rgba(17, 17, 17, 0.8)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}>
              <CardContent sx={{ p: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <PsychologyIcon sx={{ color: '#4caf50', fontSize: 32 }} />
                    <Typography variant="h5" sx={{ fontWeight: 600, color: '#ffffff' }}>
                      AI Portfolio Insights
                    </Typography>
                  </Box>
                  <Button 
                    href={getFileUrl('ai_portfolio_insights.txt')} 
                    target="_blank" 
                    startIcon={<DownloadIcon />}
                    sx={{ 
                      color: '#ffffff', 
                      borderColor: '#666666',
                      '&:hover': {
                        borderColor: '#ffffff',
                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      }
                    }}
                    variant="outlined"
                  >
                    Download Full Report
                  </Button>
                </Box>
                <AIInsightsDisplay aiText={aiText} />
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Download Full Report */}
      {results && results.files && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <Button 
            href={getFileUrl('comprehensive_portfolio_analysis.json')} 
            target="_blank" 
            variant="outlined" 
            startIcon={<DownloadIcon />}
            sx={{ 
              color: '#ffffff', 
              borderColor: '#666666',
              '&:hover': {
                borderColor: '#ffffff',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
              },
            }}
          >
            Download Full JSON Report
          </Button>
        </Box>
      )}

      {/* Stock Edit Dialog */}
      <StockEditDialog
        open={editDialog.open}
        stock={editDialog.stock}
        onClose={() => setEditDialog({ open: false, stock: null })}
        onSave={handleSaveStock}
      />
    </Box>
  );
} 