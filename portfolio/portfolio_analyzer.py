import yfinance as yf
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
import json
import requests
from datetime import datetime, timedelta
import warnings
warnings.filterwarnings('ignore')

from analysis import technical, fundamental, risk, diversification, correlation, monte_carlo, visualization, report, ai_insights

# Configuration
API_KEY = "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"  # Perplexity AI API key
RISK_FREE_RATE = 0.06  # 6% annual risk-free rate
BENCHMARK_PE = 25  # NSE benchmark P/E ratio

class PortfolioAnalyzer:
    def __init__(self):
        self.data = {}
        self.symbols = []
        self.shares = []
        self.buy_prices = []
        self.current_prices = []
        self.weights = []
        self.metrics = {}
        
    def get_tickers_data(self, tickers, period="2y"):
        """Fetch comprehensive stock data including financials"""
        tickers = [t.upper().strip() + ".NS" for t in tickers]
        self.data = {}
        
        for t in tickers:
            print(f"Fetching data for {t}...")
            try:
                ticker = yf.Ticker(t)
                info = ticker.info
                history = ticker.history(period=period)
                
                # Get additional financial data
                financials = ticker.financials
                balance_sheet = ticker.balance_sheet
                cashflow = ticker.cashflow
                
                self.data[t] = {
                    'info': info,
                    'history': history,
                    'financials': financials,
                    'balance_sheet': balance_sheet,
                    'cashflow': cashflow
                }
                print(f"✓ Successfully fetched data for {t}")
            except Exception as e:
                print(f"✗ Error fetching data for {t}: {e}")
    
    def calculate_technical_indicators(self):
        """Calculate technical indicators for each stock"""
        self.data = technical.calculate_technical_indicators(self.data)
    
    def get_industry_avg_beta(self):
        """Calculate average beta for each industry"""
        industry_betas = {}
        industry_counts = {}

        for t in self.data:
            info = self.data[t]['info']
            beta = info.get('beta', np.nan)
            industry = info.get('industry', None)
            if industry and not np.isnan(beta):
                industry_betas[industry] = industry_betas.get(industry, 0) + beta
                industry_counts[industry] = industry_counts.get(industry, 0) + 1

        avg_beta = {ind: industry_betas[ind] / industry_counts[ind] for ind in industry_betas}
        return avg_beta

    def fill_missing_betas(self, industry_avg_beta):
        """Replace missing beta values with industry average"""
        for t in self.data:
            info = self.data[t]['info']
            beta = info.get('beta', np.nan)
            if beta is None or np.isnan(beta):
                industry = info.get('industry', None)
                if industry in industry_avg_beta:
                    self.data[t]['info']['beta'] = industry_avg_beta[industry]
                else:
                    self.data[t]['info']['beta'] = 1.0  # Market beta as default

    def calculate_portfolio_metrics(self):
        """Calculate comprehensive portfolio metrics"""
        price_df = pd.DataFrame({t: self.data[t]['history']['Close'] for t in self.data})
        price_df = price_df.dropna()

        returns = price_df.pct_change().dropna()
        portfolio_returns = returns.dot(self.weights)

        trading_days = 252
        
        # Basic metrics
        annual_return = portfolio_returns.mean() * trading_days
        annual_volatility = portfolio_returns.std() * np.sqrt(trading_days)
        sharpe_ratio = (annual_return - RISK_FREE_RATE) / annual_volatility if annual_volatility != 0 else np.nan
        
        # Drawdown analysis
        cumulative = (1 + portfolio_returns).cumprod()
        peak = cumulative.cummax()
        drawdown = (cumulative - peak) / peak
        max_drawdown = drawdown.min()
        
        # Value at Risk (VaR)
        var_95 = np.percentile(portfolio_returns, 5)
        var_99 = np.percentile(portfolio_returns, 1)
        
        # Expected Shortfall (Conditional VaR)
        cvar_95 = portfolio_returns[portfolio_returns <= var_95].mean()
        cvar_99 = portfolio_returns[portfolio_returns <= var_99].mean()
        
        # Sortino Ratio
        downside_returns = portfolio_returns[portfolio_returns < 0]
        downside_deviation = downside_returns.std() * np.sqrt(trading_days)
        sortino_ratio = (annual_return - RISK_FREE_RATE) / downside_deviation if downside_deviation != 0 else np.nan
        
        # Portfolio beta
        betas = []
        for t in self.data:
            beta = self.data[t]['info'].get('beta', 1.0)
            betas.append(beta)
        betas = np.array(betas)
        portfolio_beta = np.sum(betas * self.weights)
        
        # Information Ratio (assuming benchmark return of 12%)
        benchmark_return = 0.12
        tracking_error = annual_volatility
        information_ratio = (annual_return - benchmark_return) / tracking_error if tracking_error != 0 else np.nan
        
        # Treynor Ratio
        treynor_ratio = (annual_return - RISK_FREE_RATE) / portfolio_beta if portfolio_beta != 0 else np.nan
        
        sectors = [self.data[t]['info'].get('sector', 'Unknown') for t in self.data]

        self.metrics = {
            'annual_return': annual_return,
            'annual_volatility': annual_volatility,
            'sharpe_ratio': sharpe_ratio,
            'sortino_ratio': sortino_ratio,
            'max_drawdown': max_drawdown,
            'var_95': var_95 * np.sqrt(trading_days),
            'var_99': var_99 * np.sqrt(trading_days),
            'cvar_95': cvar_95 * np.sqrt(trading_days),
            'cvar_99': cvar_99 * np.sqrt(trading_days),
            'portfolio_beta': portfolio_beta,
            'information_ratio': information_ratio,
            'treynor_ratio': treynor_ratio,
            'individual_returns': (returns.mean() * trading_days).to_dict(),
            'individual_volatility': (returns.std() * np.sqrt(trading_days)).to_dict(),
            'weights': self.weights,
            'tickers': list(self.data.keys()),
            'sectors': sectors
        }
        
        return self.metrics

    def calculate_fundamental_metrics(self):
        """Calculate fundamental analysis metrics"""
        return fundamental.calculate_fundamental_metrics(self.data)

    def check_diversification(self):
        """Comprehensive diversification analysis"""
        return diversification.check_diversification(self.metrics, self.weights)

    def advanced_valuation_analysis(self):
        """Enhanced valuation analysis with multiple metrics"""
        return fundamental.advanced_valuation_analysis(self.data, self.symbols, BENCHMARK_PE)

    def risk_analysis(self):
        """Comprehensive risk analysis"""
        return risk.risk_analysis(self.metrics)

    def correlation_analysis(self):
        """Analyze correlations between stocks"""
        return correlation.correlation_analysis(self.data)

    def generate_comprehensive_report(self):
        """Generate a comprehensive portfolio analysis report"""
        return report.generate_comprehensive_report(self.symbols, self.shares, self.buy_prices, self.current_prices, self.metrics)

    def create_visualizations(self):
        """Create comprehensive visualizations"""
        visualization.create_visualizations(self.data, self.shares, self.buy_prices, self.current_prices, self.weights, self.symbols, self.metrics)

    def monte_carlo_simulation(self, num_simulations=1000, time_horizon=252):
        """Monte Carlo simulation for portfolio forecasting"""
        return monte_carlo.monte_carlo_simulation(self.data, self.shares, self.current_prices, self.weights, num_simulations, time_horizon)

    def save_comprehensive_data(self):
        """Save comprehensive analysis data for LLM"""
        # Calculate all metrics
        fundamental_data = self.calculate_fundamental_metrics()
        diversification_report = self.check_diversification()
        valuation_analysis = self.advanced_valuation_analysis()
        risk_analysis_report = self.risk_analysis()
        correlation_report, correlation_matrix = self.correlation_analysis()
        
        # Prepare comprehensive data
        llm_data = {
            "timestamp": datetime.now().isoformat(),
            "symbols": self.symbols,
            "portfolio_summary": {
                "shares": self.shares,
                "buy_prices": self.buy_prices,
                "current_prices": self.current_prices,
                "weights": self.weights,
                "total_invested": sum(q * bp for q, bp in zip(self.shares, self.buy_prices)),
                "current_value": sum(q * cp for q, cp in zip(self.shares, self.current_prices)),
                "total_pnl": sum(q * cp for q, cp in zip(self.shares, self.current_prices)) - 
                           sum(q * bp for q, bp in zip(self.shares, self.buy_prices))
            },
            "technical_metrics": self.metrics,
            "fundamental_data": fundamental_data,
            "risk_analysis": {
                "portfolio_volatility": self.metrics['annual_volatility'],
                "max_drawdown": self.metrics['max_drawdown'],
                "var_95": self.metrics['var_95'],
                "cvar_95": self.metrics['cvar_95'],
                "portfolio_beta": self.metrics['portfolio_beta'],
                "sharpe_ratio": self.metrics['sharpe_ratio'],
                "sortino_ratio": self.metrics['sortino_ratio']
            },
            "diversification_analysis": diversification_report,
            "valuation_analysis": valuation_analysis,
            "correlation_analysis": correlation_report,
            "correlation_matrix": correlation_matrix.to_dict('records') if hasattr(correlation_matrix, 'to_dict') else correlation_matrix.tolist(),
            "recommendations": self.generate_recommendations()
        }
        
        # Save to JSON with custom serializer
        def json_serializer(obj):
            if hasattr(obj, 'tolist'):
                return obj.tolist()
            elif hasattr(obj, 'to_dict'):
                return obj.to_dict()
            elif isinstance(obj, (np.integer, np.floating)):
                return float(obj)
            elif isinstance(obj, np.ndarray):
                return obj.tolist()
            else:
                return str(obj)
        
        # Save to JSON
        with open("comprehensive_portfolio_analysis.json", "w") as f:
            json.dump(llm_data, f, indent=4, default=json_serializer)
        
        print("✓ Comprehensive analysis saved to 'comprehensive_portfolio_analysis.json'")
        return llm_data

    def generate_recommendations(self):
        """Generate actionable recommendations"""
        return report.generate_recommendations(self.metrics, self.weights)

    def get_llm_insights(self, file_path="comprehensive_portfolio_analysis.json"):
        """Get AI insights using Gemini API"""
        ai_insights.get_llm_insights(API_KEY, file_path)

    def run_complete_analysis(self):
        """Run the complete portfolio analysis"""
        print("🚀 Starting Comprehensive Portfolio Analysis...")
        print("=" * 60)
        
        # Input validation and data collection
        symbols = input("Enter NSE stock symbols (comma-separated, e.g., RELIANCE,TCS,INFY): ").split(",")
        self.symbols = [s.strip().upper() for s in symbols if s.strip()]
        
        if not self.symbols:
            print("❌ No valid symbols provided. Exiting.")
            return
        
        # Fetch data
        print(f"\n📊 Fetching data for {len(self.symbols)} stocks...")
        self.get_tickers_data(self.symbols)
        
        if not self.data:
            print("❌ No data fetched. Exiting.")
            return
        
        # Calculate technical indicators
        print("📈 Calculating technical indicators...")
        self.calculate_technical_indicators()
        
        # Get portfolio composition
        print(f"\n💰 Enter portfolio details:")
        for symbol in self.symbols:
            ticker_ns = symbol + ".NS"
            if ticker_ns not in self.data:
                continue
                
            while True:
                try:
                    qty = float(input(f"Number of shares for {symbol}: "))
                    self.shares.append(qty)
                    break
                except ValueError:
                    print("Invalid input. Please enter a number.")
            
            while True:
                try:
                    bp = float(input(f"Average buy price for {symbol}: ₹"))
                    self.buy_prices.append(bp)
                    break
                except ValueError:
                    print("Invalid input. Please enter a number.")
            
            # Get current price
            current_price = self.data[ticker_ns]['history']['Close'].iloc[-1]
            self.current_prices.append(current_price)
            print(f"Current price for {symbol}: ₹{current_price:.2f}")
        
        # Calculate weights
        invested_values = [q * bp for q, bp in zip(self.shares, self.buy_prices)]
        total_invested = sum(invested_values)
        self.weights = [iv / total_invested for iv in invested_values]
        
        # Beta analysis
        print("\n🔢 Performing beta analysis...")
        industry_avg_beta = self.get_industry_avg_beta()
        self.fill_missing_betas(industry_avg_beta)
        
        # Calculate comprehensive metrics
        print("📊 Calculating portfolio metrics...")
        self.calculate_portfolio_metrics()
        
        # Generate comprehensive report
        print("\n📋 Generating comprehensive report...")
        report_text = self.generate_comprehensive_report()
        print(report_text)
        
        # Risk analysis
        print(self.risk_analysis())
        
        # Diversification analysis
        print(f"\n{self.check_diversification()}")
        
        # Valuation analysis
        print(f"\n{self.advanced_valuation_analysis()}")
        
        # Correlation analysis
        correlation_report, _ = self.correlation_analysis()
        print(f"\n{correlation_report}")
        
        # Monte Carlo simulation
        print(f"\n{'='*60}")
        print("🎲 MONTE CARLO SIMULATION")
        print('='*60)
        self.monte_carlo_simulation()
        
        # Create visualizations
        print(f"\n📊 Creating visualizations...")
        self.create_visualizations()
        
        # Save comprehensive data
        print(f"\n💾 Saving comprehensive analysis...")
        self.save_comprehensive_data()
        
        # Get AI insights
        print(f"\n🤖 Getting AI insights...")
        self.get_llm_insights()
        
        print(f"\n✅ Complete analysis finished!")
        print(f"📁 Files generated:")
        print(f"   - comprehensive_portfolio_analysis.json")
        print(f"   - portfolio_analysis.png")
        print(f"   - ai_portfolio_insights.txt") 