# Stock Savvy - Wealth Management Application

A comprehensive full-stack portfolio analysis application for Indian equities, featuring advanced financial algorithms, risk assessment, and AI-powered insights.

## 🚀 Features

- **Portfolio Management**: Add, edit, and manage Indian NSE stocks
- **Comprehensive Analytics**: Technical indicators, risk metrics, and performance analysis
- **Advanced Algorithms**: Monte Carlo simulation, correlation analysis, and diversification metrics
- **AI Insights**: Perplexity LLM-powered portfolio analysis and recommendations
- **Interactive Dashboard**: Modern React UI with Material-UI components
- **Risk Assessment**: VaR, CVaR, Sharpe ratio, and drawdown analysis
- **Visualization**: Multi-panel charts and performance dashboards
- **Real-time Data**: Live market data via yfinance integration

## 🏗️ Architecture Overview

```bash

┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React UI      │────│   FastAPI       │────│   Analysis      │
│   (Frontend)    │    │   (Backend)     │    │   Modules       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                              │                         │
                       ┌─────────────────┐    ┌─────────────────┐
                       │   MongoDB       │    │   yfinance      │
                       │   (Storage)     │    │   (Market Data) │
                       └─────────────────┘    └─────────────────┘

```

**Tech Stack:**
- **Frontend**: React 18, Material-UI v5, Axios
- **Backend**: FastAPI, Pydantic, Python 3.10+
- **Database**: MongoDB
- **Data Source**: yfinance (Yahoo Finance)
- **AI**: Perplexity LLM API
- **Analytics**: Pandas, NumPy, SciPy, Matplotlib, Seaborn

## 📁 Project Structure
```bash

├── backend/
│   └── main.py                 # FastAPI server and REST endpoints
├── frontend/
│   ├── src/
│   │   ├── App.js             # Main React application
│   │   ├── api.js             # API client functions
│   │   └── components/
│   │       ├── PortfolioForm.js    # Stock input form
│   │       └── Results.js          # Analysis dashboard
│   ├── public/
│   └── package.json
├── portfolio/
│   └── portfolio_analyzer.py  # Core analysis orchestration
├── analysis/
│   ├── technical.py           # Technical indicators
│   ├── fundamental.py         # Fundamental analysis
│   ├── risk.py               # Risk assessment
│   ├── diversification.py    # Portfolio diversification
│   ├── correlation.py        # Correlation analysis
│   ├── monte_carlo.py        # Monte Carlo simulation
│   ├── visualization.py      # Chart generation
│   ├── report.py            # Text reports
│   └── ai_insights.py       # AI-powered insights
├── requirements.txt
└── README.md

```


## 🔬 Algorithms & Analytics

### Technical Analysis
- **Moving Averages**: SMA (20, 50, 200 periods)
- **Momentum Indicators**: RSI (14), MACD (12,26,9)
- **Volatility**: Bollinger Bands (20, 2σ)

### Portfolio Metrics
- **Risk-Adjusted Returns**: Sharpe, Sortino, Information, Treynor ratios
- **Risk Measures**: VaR, CVaR, Maximum Drawdown, Beta analysis
- **Performance**: Annualized returns, volatility, correlation matrix

### Advanced Analytics
- **Diversification**: Herfindahl-Hirschman Index (HHI), sector concentration
- **Monte Carlo Simulation**: Portfolio value distribution modeling
- **Correlation Analysis**: Pairwise correlation detection
- **Fundamental Analysis**: P/E, P/B, ROE, debt ratios

### AI Integration
- **LLM Analysis**: Perplexity API for contextual insights
- **Fallback System**: Local analysis when API unavailable
- **Comprehensive Reporting**: JSON export with all metrics

## 🛠️ Setup & Installation

### Prerequisites
- Python 3.10+
- Node.js 16+
- MongoDB (local installation)
- Git


## 🚀 How to Run the Frontend

**1. Install dependencies  **
   ```bash
   cd frontend
   npm install
```

**2.Start the React app**

```bash
npm start
```

The app will be available at:
http://localhost:3000

**3. Make sure your FastAPI backend is running at:**
http://127.0.0.1:8000


## ⚙️ How to Run the FastAPI Backend

**1. Install FastAPI and Uvicorn**

```bash
pip install fastapi uvicorn
```

**2. Start the Backend Server**

```bash
uvicorn backend.main:app --reload
```

**3. The API will be available at:**
http://127.0.0.1:8000

**4. OpenAPI (Swagger) docs available at:**
http://127.0.0.1:8000/docs



## 📊 Usage

### Adding Stocks
1. Enter NSE stock symbol (e.g., RELIANCE, TCS, INFY)
2. Specify number of shares
3. Enter purchase price
4. Click "Add Stock"

### Running Analysis
1. Add multiple stocks to build your portfolio
2. Click "Analyze Portfolio"
3. Wait for data retrieval and computation
4. View comprehensive dashboard with:
   - Portfolio metrics and performance
   - Risk analysis and recommendations
   - Interactive charts and visualizations
   - AI-powered insights (if configured)

### Downloading Reports
- **JSON Report**: Complete analysis data
- **Visualization**: Portfolio dashboard image
- **AI Insights**: Text-based recommendations

## 🔌 API Endpoints
- ### Stock Management
  - **POST** `/stocks` → Add new stock
  - **GET** `/stocks` → Retrieve all stocks
  - **PUT** `/stocks/{id}` → Update stock
  - **DELETE** `/stocks/{id}` → Delete stock
  - **DELETE** `/stocks` → Clear all stocks

- ### Analysis
  - **POST** `/analyze` → Run portfolio analysis
  - **GET** `/files/{filename}` → Download generated files

- ### File Endpoints
  - `/files/comprehensive_portfolio_analysis.json`
  - `/files/portfolio_analysis.png`
  - `/files/ai_portfolio_insights.txt`

- 🤝 **Contributing**
  - Fork the repository
  - Create a feature branch:
    ```bash
    git checkout -b feature/amazing-feature
    ```
  - Commit your changes:
    ```bash
    git commit -m 'Add amazing feature'
    ```
  - Push to the branch:
    ```bash
    git push origin feature/amazing-feature
    ```
  - Open a Pull Request

- 📞 **Support**
  - For support and questions:
    - Create an issue on GitHub
    - Check existing documentation
    - Review the analysis modules for customization

- Built with ❤️ for Indian equity market analysis
