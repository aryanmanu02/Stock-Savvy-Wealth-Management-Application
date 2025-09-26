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
  Chip,
  Divider,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Badge
} from '@mui/material';
import { 
  Edit as EditIcon, 
  Delete as DeleteIcon, 
  Analytics as AnalyticsIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Download as DownloadIcon,
  ExpandMore as ExpandMoreIcon,
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

  // Clean markdown and artifacts for production-ready display
  const sanitizeAIText = (text) => {
    let t = text;
    // Remove bold/italic markdown **__ and * _ wrappers
    t = t.replace(/\*\*(.*?)\*\*/g, '$1');
    t = t.replace(/__(.*?)__/g, '$1');
    t = t.replace(/\*(.*?)\*/g, '$1');
    t = t.replace(/_(.*?)_/g, '$1');
    // Remove markdown headers like ##, ###
    t = t.replace(/^#{1,6}\s+/gm, '');
    // Remove horizontal rules --- *** ___
    t = t.replace(/^\s*[-*_]{3,}\s*$/gm, '');
    // Remove footnote markers like [1], [2]
    t = t.replace(/\[(\d+)\]/g, '');
    // Normalize bullet lines: remove standalone bullets and convert bullets to dashes
    t = t.replace(/^\s*•\s*$/gm, '');
    t = t.replace(/^\s*•\s*/gm, '- ');
    // Trim excessive whitespace at line ends
    t = t.replace(/[\t ]+$/gm, '');
    // Collapse multiple blank lines
    t = t.replace(/\n{3,}/g, '\n\n');
    return t.trim();
  };

  // Parse the AI text into sections
  const parseAIText = (text) => {
    const lines = text.split('\n');

    // Prefer numbered sections (e.g., 1. Executive Summary ... up to 11.)
    const numberedSections = [];
    let currentTitle = null;
    let buffer = [];

    const flushNumbered = () => {
      if (currentTitle) {
        numberedSections.push({
          title: currentTitle.replace(/\s*:\s*$/, ''),
          content: buffer.join('\n').trim()
        });
      }
      currentTitle = null;
      buffer = [];
    };

    for (const raw of lines) {
      const m = raw.match(/^(\s*)(\d{1,2})\.\s+(.+)/);
      if (m) {
        flushNumbered();
        currentTitle = m[3].trim();
      } else if (currentTitle) {
        buffer.push(raw);
      }
    }
    flushNumbered();
    if (numberedSections.length >= 5) return numberedSections;

    // Fallback A: detect emoji/title headers that end with ':'
    const colonSections = [];
    let colonTitle = null;
    let colonBuf = [];
    const flushColon = () => {
      if (colonTitle) {
        colonSections.push({ title: colonTitle.replace(/\s*:\s*$/, ''), content: colonBuf.join('\n').trim() });
      }
      colonTitle = null;
      colonBuf = [];
    };
    for (const raw of lines) {
      const t = raw.trim();
      const isColonHeader = (
        t.endsWith(':') &&
        !t.match(/^\d+\./) &&
        !t.startsWith('- ') &&
        t.length <= 120
      );
      if (isColonHeader) {
        flushColon();
        colonTitle = t;
      } else if (colonTitle) {
        colonBuf.push(raw);
      }
    }
    flushColon();
    if (colonSections.length >= 2) return colonSections;

    // Fallback B: header detection (uppercase or title-case lines without punctuation)
    const sections = [];
    let currentSection = null;
    let currentContent = [];
    for (const line of lines) {
      const trimmedLine = line.trim();
      const isHeader = (
        trimmedLine &&
        (trimmedLine === trimmedLine.toUpperCase() || trimmedLine.match(/^[A-Z][A-Z\s&]+$/)) &&
        !trimmedLine.includes(':') &&
        !trimmedLine.includes('-') &&
        !trimmedLine.includes('₹') &&
        !trimmedLine.includes('%')
      );
      if (isHeader) {
        if (currentSection) {
          sections.push({ title: currentSection, content: currentContent.join('\n').trim() });
        }
        currentSection = trimmedLine;
        currentContent = [];
      } else if (trimmedLine) {
        currentContent.push(line);
      }
    }
    if (currentSection) {
      sections.push({ title: currentSection, content: currentContent.join('\n').trim() });
    }
    if (sections.length > 0) return sections;

    // Fallback C: single block
    return [{ title: 'AI Insights', content: text }];
  };

  const cleaned = sanitizeAIText(aiText);
  const sections = parseAIText(cleaned);

  // Controlled expand/collapse state
  const [expanded, setExpanded] = React.useState({});
  useEffect(() => {
    const init = {};
    sections.slice(0, 3).forEach((_, i) => { init[i] = true; });
    setExpanded(init);
  }, [aiText]);

  const expandAll = () => {
    const all = {};
    sections.forEach((_, i) => { all[i] = true; });
    setExpanded(all);
  };
  const collapseAll = () => setExpanded({});
  const expandKey = () => {
    const keys = ['executive', 'summary', 'risk', 'recommendation', 'actionable'];
    const next = {};
    sections.forEach((s, i) => {
      const lt = (s.title || '').toLowerCase();
      if (keys.some(k => lt.includes(k))) next[i] = true;
    });
    setExpanded(next);
  };

  const getSectionIcon = (title) => {
    const lowerTitle = title.toLowerCase();
    if (lowerTitle.includes('executive') || lowerTitle.includes('summary')) return <StarIcon />;
    if (lowerTitle.includes('market') || lowerTitle.includes('trends')) return <TrendingUpIcon />;
    if (lowerTitle.includes('health') || lowerTitle.includes('assessment')) return <AssessmentIcon />;
    if (lowerTitle.includes('stock') || lowerTitle.includes('analysis')) return <BusinessIcon />;
    if (lowerTitle.includes('sector') || lowerTitle.includes('allocation')) return <TimelineIcon />;
    if (lowerTitle.includes('risk') || lowerTitle.includes('management')) return <SecurityIcon />;
    if (lowerTitle.includes('timing') || lowerTitle.includes('opportunities')) return <TrendingFlatIcon />;
    if (lowerTitle.includes('alternative') || lowerTitle.includes('investments')) return <AttachMoneyIcon />;
    if (lowerTitle.includes('rebalancing') || lowerTitle.includes('strategy')) return <AnalyticsIcon />;
    if (lowerTitle.includes('outlook') || lowerTitle.includes('strategy')) return <TimelineIcon />;
    if (lowerTitle.includes('actionable') || lowerTitle.includes('steps')) return <CheckCircleIcon />;
    if (lowerTitle.includes('events') || lowerTitle.includes('impact')) return <InfoIcon />;
    if (lowerTitle.includes('disclaimers')) return <WarningIcon />;
    return <PsychologyIcon />;
  };

  const getSectionColor = (title) => {
    const lowerTitle = title.toLowerCase();
    if (lowerTitle.includes('executive') || lowerTitle.includes('summary')) return '#4caf50';
    if (lowerTitle.includes('market') || lowerTitle.includes('trends')) return '#2196f3';
    if (lowerTitle.includes('health') || lowerTitle.includes('assessment')) return '#ff9800';
    if (lowerTitle.includes('stock') || lowerTitle.includes('analysis')) return '#9c27b0';
    if (lowerTitle.includes('sector') || lowerTitle.includes('allocation')) return '#00bcd4';
    if (lowerTitle.includes('risk') || lowerTitle.includes('management')) return '#f44336';
    if (lowerTitle.includes('timing') || lowerTitle.includes('opportunities')) return '#795548';
    if (lowerTitle.includes('alternative') || lowerTitle.includes('investments')) return '#607d8b';
    if (lowerTitle.includes('rebalancing') || lowerTitle.includes('strategy')) return '#3f51b5';
    if (lowerTitle.includes('outlook') || lowerTitle.includes('strategy')) return '#009688';
    if (lowerTitle.includes('actionable') || lowerTitle.includes('steps')) return '#4caf50';
    if (lowerTitle.includes('events') || lowerTitle.includes('impact')) return '#ff5722';
    if (lowerTitle.includes('disclaimers')) return '#ffc107';
    return '#666666';
  };

  return (
    <Box sx={{ mt: 2 }}>
      <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
        <Button size="small" variant="outlined" onClick={expandAll} sx={{ color: '#ffffff', borderColor: '#666666' }}>Expand All</Button>
        <Button size="small" variant="outlined" onClick={collapseAll} sx={{ color: '#ffffff', borderColor: '#666666' }}>Collapse All</Button>
        <Button size="small" variant="outlined" onClick={expandKey} sx={{ color: '#ffffff', borderColor: '#666666' }}>Expand Key Sections</Button>
      </Box>
      {sections.map((section, index) => (
        <Accordion 
          key={index}
          expanded={!!expanded[index]}
          onChange={(event, isExpanded) => setExpanded(prev => ({ ...prev, [index]: isExpanded }))}
          sx={{ 
            backgroundColor: 'rgba(17, 17, 17, 0.8)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            '&:before': { display: 'none' },
            mb: 1
          }}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon sx={{ color: '#ffffff' }} />}
            sx={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.08)' }
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ color: getSectionColor(section.title) }}>
                {getSectionIcon(section.title)}
              </Box>
              <Typography 
                variant="h6" 
                sx={{ 
                  color: '#ffffff', 
                  fontWeight: 600,
                  fontSize: '1.1rem'
                }}
              >
                {section.title}
              </Typography>
              <Chip label={`#${index + 1}`} size="small" sx={{ ml: 1, color: '#ffffff', borderColor: '#444', backgroundColor: 'transparent', border: '1px solid #444' }} />
            </Box>
          </AccordionSummary>
          <AccordionDetails sx={{ backgroundColor: 'rgba(0, 0, 0, 0.3)' }}>
            <Box sx={{ 
              color: '#cccccc',
              lineHeight: 1.6,
              '& p': { marginBottom: 2 },
              '& ul': { paddingLeft: 3 },
              '& li': { marginBottom: 1 },
              '& strong': { color: '#ffffff' },
              '& em': { color: '#ffeb3b' }
            }}>
              {section.content.split('\n').map((line, lineIndex) => {
                const trimmedLine = line.trim();
                if (!trimmedLine) return <br key={lineIndex} />;
                
                // Handle bullet points
                if (trimmedLine.startsWith('- ')) {
                  return (
                    <Box key={lineIndex} sx={{ display: 'flex', alignItems: 'flex-start', mb: 1 }}>
                      <Typography sx={{ color: '#4caf50', mr: 1, mt: 0.5 }}>•</Typography>
                      <Typography sx={{ color: '#cccccc', flex: 1 }}>
                        {trimmedLine.substring(2)}
                      </Typography>
                    </Box>
                  );
                }
                
                // Handle numbered lists
                if (trimmedLine.match(/^\d+\./)) {
                  return (
                    <Box key={lineIndex} sx={{ display: 'flex', alignItems: 'flex-start', mb: 1 }}>
                      <Typography sx={{ color: '#2196f3', mr: 1, mt: 0.5, fontWeight: 600 }}>
                        {trimmedLine.match(/^\d+/)[0]}.
                      </Typography>
                      <Typography sx={{ color: '#cccccc', flex: 1 }}>
                        {trimmedLine.replace(/^\d+\.\s*/, '')}
                      </Typography>
                    </Box>
                  );
                }
                
                // Handle stock symbols and prices
                if (trimmedLine.includes('₹') || trimmedLine.includes('Current Market Price') || trimmedLine.includes('Target Price')) {
                  return (
                    <Typography key={lineIndex} sx={{ 
                      color: '#ffffff', 
                      fontWeight: 600, 
                      mb: 1,
                      backgroundColor: 'rgba(76, 175, 80, 0.1)',
                      padding: 1,
                      borderRadius: 1,
                      border: '1px solid rgba(76, 175, 80, 0.3)'
                    }}>
                      {trimmedLine}
                    </Typography>
                  );
                }
                
                // Handle recommendations
                if (trimmedLine.includes('Recommendation:') || trimmedLine.includes('Action Plan:')) {
                  return (
                    <Typography key={lineIndex} sx={{ 
                      color: '#ffeb3b', 
                      fontWeight: 600, 
                      mb: 1,
                      backgroundColor: 'rgba(255, 235, 59, 0.1)',
                      padding: 1,
                      borderRadius: 1,
                      border: '1px solid rgba(255, 235, 59, 0.3)'
                    }}>
                      {trimmedLine}
                    </Typography>
                  );
                }
                
                // Regular text
                return (
                  <Typography key={lineIndex} sx={{ color: '#cccccc', mb: 1 }}>
                    {trimmedLine}
                  </Typography>
                );
              })}
            </Box>
          </AccordionDetails>
        </Accordion>
      ))}
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