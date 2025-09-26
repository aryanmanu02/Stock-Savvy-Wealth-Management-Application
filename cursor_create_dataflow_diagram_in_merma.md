

### Project overview
- **Goal**: End-to-end portfolio analysis app with technical, fundamental, risk, diversification, correlation, Monte Carlo, visualization, and AI insights.
- **Flow**: React frontend → FastAPI backend → MongoDB for stocks → `PortfolioAnalyzer` orchestrates analysis using `yfinance` and analysis modules → files generated and served back to frontend.

### Tech stack
- **Frontend**: React + MUI (`frontend/src/*`)
- **Backend**: FastAPI (`backend/main.py`)
- **DB**: MongoDB (`portfolio_db.stocks`)
- **Data/ML**: `yfinance`, `numpy`, `pandas`, `matplotlib`, `seaborn`
- **AI**: Gemini API for text insights
- **Artifacts**: `comprehensive_portfolio_analysis.json`, `portfolio_analysis.png`, `ai_portfolio_insights.txt`

### Frontend modules
- `frontend/src/api.js`
  - HTTP client to backend: `addStock`, `getStocks`, `updateStock`, `deleteStock`, `clearStocks`, `analyzePortfolio`, `getFileUrl`.
- `frontend/src/components/PortfolioForm.js`
  - Form to add a stock with `symbol`, `shares`, `buy_price`; clear portfolio.
- `frontend/src/components/Results.js`
  - Renders portfolio summary (totals, P/L), stocks table (editable, deletable), metrics grid, Analyze button.
  - Shows chart (`portfolio_analysis.png`) and AI insights (inline and downloadable).
  - Provides download for `comprehensive_portfolio_analysis.json`.
- `frontend/src/App.js`
  - App state and wiring: loads stocks, handles add/update/delete/clear, triggers analyze, passes data to `Results`.
  - Dark theme and layout.

### Backend modules
- `backend/main.py`
  - CORS-enabled FastAPI app.
  - Data models: `StockModel {symbol, shares, buy_price}`, `StockUpdateModel`.
  - Endpoints:
    - `POST /stocks`: add stock to MongoDB (`portfolio_db.stocks`)
    - `GET /stocks`: list stocks (ObjectId → string)
    - `PUT /stocks/{stock_id}`: update stock
    - `DELETE /stocks/{stock_id}`: delete stock
    - `DELETE /stocks`: clear all stocks
    - `POST /analyze`: orchestrates full analysis via `PortfolioAnalyzer` and returns:
      - `portfolio_summary` (symbols, shares, buy_prices, current_prices, weights)
      - `metrics` (risk/return, beta, VaR/CVaR, etc.)
      - `files` URLs for JSON/PNG/TXT
    - `GET /files/{filename}`: serves generated artifacts with correct media type.

### Orchestration
- `portfolio/portfolio_analyzer.py` (core orchestrator)
  - Key responsibilities:
    - Fetch market/financial data: `get_tickers_data()` using `yfinance` for `.NS` tickers.
    - Technical indicators: `calculate_technical_indicators()` delegates to `analysis/technical.py`.
    - Handle missing betas: `get_industry_avg_beta()` and `fill_missing_betas()`.
    - Portfolio metrics: `calculate_portfolio_metrics()` computes returns, volatility, Sharpe/Sortino, drawdown, VaR/CVaR, beta, Treynor, Information ratio; also individual metrics, sectors, weights.
    - Fundamentals: `calculate_fundamental_metrics()` via `analysis/fundamental.py`.
    - Diversification: `check_diversification()` via `analysis/diversification.py`.
    - Valuation: `advanced_valuation_analysis()` via `analysis/fundamental.py`.
    - Risk narrative: `risk_analysis()` via `analysis/risk.py`.
    - Correlation: `correlation_analysis()` via `analysis/correlation.py`.
    - Monte Carlo: `monte_carlo_simulation()` via `analysis/monte_carlo.py`.
    - Visuals: `create_visualizations()` via `analysis/visualization.py` → saves `portfolio_analysis.png`.
    - Report text: `generate_comprehensive_report()` via `analysis/report.py`.
    - Bundle/save: `save_comprehensive_data()` writes `comprehensive_portfolio_analysis.json` with portfolio, technical, fundamental, risk, diversification, valuation, correlation, recommendations.
    - AI insights: `get_llm_insights()` via `analysis/ai_insights.py` (Gemini) → saves `ai_portfolio_insights.txt`.

### Analysis modules (what each does)
- `analysis/technical.py`
  - Adds SMA-20/50/200, RSI, Bollinger Bands, MACD to historical price series per ticker.
  - Input: `data[ticker]['history']` price OHLCV.
  - Output: Augmented `history` DataFrame.

- `analysis/fundamental.py`
  - `calculate_fundamental_metrics()`: extracts PE, PB, PS, PEG, ROE/ROA, margins, leverage/liquidity, growth, dividend from `yfinance.info`.
  - `advanced_valuation_analysis()`: simple flags vs benchmark PE and thresholds (undervalued/overvalued, debt flags, etc.).
  - Output: per-symbol fundamentals and a valuation text summary.

- `analysis/risk.py`
  - `risk_analysis()`: human-readable risk summary: annual volatility, max drawdown, beta, VaR(95%), per-stock vols, with qualitative risk bands.

- `analysis/diversification.py`
  - `check_diversification()`: sector weights aggregation, HHI, diversification ratio, concentration warnings, recommendation if sectors < 5.

- `analysis/correlation.py`
  - Builds returns correlation matrix across holdings, average pairwise correlation, highlights highly correlated pairs.

- `analysis/monte_carlo.py`
  - Simulates portfolio end value over a horizon using normal returns (mean/std from historical portfolio returns). Reports expected value, percentiles, loss probability. Returns simulation array.

- `analysis/visualization.py`
  - Generates a 3x3 dashboard figure:
    - Portfolio composition pie
    - Risk-return scatter with portfolio dot
    - Sector allocation bars
    - Portfolio value over time
    - Normalized stock performance
    - Correlation matrix heatmap
    - Risk metrics bars
    - Per-stock P&L %
    - Portfolio technicals (SMA 20/50)
  - Saves to `portfolio_analysis.png`.

- `analysis/report.py`
  - `generate_comprehensive_report()`: formatted text report with summary and key metrics.
  - `generate_recommendations()`: rule-based suggestions from metrics, sector concentration, and beta.

- `analysis/ai_insights.py`
  - Consumes `comprehensive_portfolio_analysis.json`, calls Gemini using API key to produce narrative insights, saved to `ai_portfolio_insights.txt`.

### Data model and store
- MongoDB collection: `portfolio_db.stocks`
  - Document fields: `symbol` (string), `shares` (float), `buy_price` (float)
- Data path:
  - Frontend adds/edits/deletes → backend persists in MongoDB
  - `POST /analyze` reads all docs (no `_id`), computes analysis, creates artifacts, responds with metrics and file URLs.

### External services
- **Market/financial data**: Yahoo Finance via `yfinance` (historic prices + `info` + financials/balance sheet/cashflow).
- **AI**: Gemini API (API key in `PortfolioAnalyzer`), used to generate `ai_portfolio_insights.txt`.

### Outputs returned to frontend
- `portfolio_summary`: `symbols`, `shares`, `buy_prices`, `current_prices`, `weights`
- `metrics`: all quantitative portfolio metrics
- `files`: URLs for `comprehensive_portfolio_analysis.json`, `portfolio_analysis.png`, `ai_portfolio_insights.txt`
- Frontend renders summary cards, stocks table, metrics grid, chart preview, and AI insights, with download links.

- Implemented a clear, structured walkthrough of the project. 
- Covered each module’s role, inputs/outputs, backend endpoints, data flow, external services, and generated artifacts.

