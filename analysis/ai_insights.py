# AI/LLM insights functions using Perplexity AI

def get_llm_insights(API_KEY, file_path="comprehensive_portfolio_analysis.json"):
    import json
    import requests
    if not API_KEY or API_KEY == "YOUR_PERPLEXITY_API_KEY":
        print("⚠️  API_KEY not set. Please update the API_KEY variable with your Perplexity API key.")
        return
    
    # Basic API key validation
    if not API_KEY.startswith("pplx-"):
        print("⚠️  API_KEY format appears incorrect. Perplexity API keys should start with 'pplx-'")
        print("🔄 Generating fallback insights instead...")
        try:
            with open(file_path, "r") as f:
                data = json.load(f)
            generate_fallback_insights(data)
        except Exception as e:
            print(f"[ERROR] Failed to generate fallback insights: {e}")
        return
    try:
        with open(file_path, "r") as f:
            data = json.load(f)
    except FileNotFoundError:
        print(f"[ERROR] File '{file_path}' not found.")
        return
    
    # Enhanced prompt with current market trends and comprehensive analysis
    prompt = f"""You are an expert financial advisor and portfolio analyst specializing in Indian stock markets with deep knowledge of current market trends, economic conditions, and future outlook. Analyze this comprehensive portfolio data and provide detailed, actionable insights.

### PORTFOLIO OVERVIEW:
Symbols: {', '.join(data['symbols'])}
Total Invested: ₹{data['portfolio_summary']['total_invested']:,.2f}
Current Value: ₹{data['portfolio_summary']['current_value']:,.2f}
    Total P&L: ₹{data['portfolio_summary']['total_pnl']:,.2f}
    
    ### INDIVIDUAL STOCK DETAILS:
    """
    
    # Add individual stock details with current prices from yfinance
    for i, symbol in enumerate(data['symbols']):
        if i < len(data['portfolio_summary'].get('current_prices', [])):
            current_price = data['portfolio_summary']['current_prices'][i]
            buy_price = data['portfolio_summary']['buy_prices'][i] if i < len(data['portfolio_summary'].get('buy_prices', [])) else 0
            shares = data['portfolio_summary']['shares'][i] if i < len(data['portfolio_summary'].get('shares', [])) else 0
            weight = data['portfolio_summary']['weights'][i] if i < len(data['portfolio_summary'].get('weights', [])) else 0
            
            prompt += f"""
    {symbol}:
    - Current Market Price: ₹{current_price:.2f}
    - Buy Price: ₹{buy_price:.2f}
    - Shares Held: {shares:,.0f}
    - Portfolio Weight: {weight:.1%}
    - Individual P&L: ₹{(current_price - buy_price) * shares:,.2f}
    - Individual Return: {((current_price - buy_price) / buy_price * 100):.1f}%
    """
    
    prompt += f"""
    
    ### PERFORMANCE METRICS:
- Expected Annual Return: {data['technical_metrics']['annual_return']:.2%}
- Annual Volatility: {data['technical_metrics']['annual_volatility']:.2%}
- Sharpe Ratio: {data['technical_metrics']['sharpe_ratio']:.3f}
- Sortino Ratio: {data['technical_metrics']['sortino_ratio']:.3f}
- Maximum Drawdown: {data['technical_metrics']['max_drawdown']:.2%}
- Portfolio Beta: {data['technical_metrics']['portfolio_beta']:.3f}

### RISK ANALYSIS:
- VaR (95%): {data['risk_analysis']['var_95']:.2%}
- CVaR (95%): {data['risk_analysis']['cvar_95']:.2%}

### DIVERSIFICATION:
{data['diversification_analysis']}

### VALUATION:
{data['valuation_analysis']}

### CURRENT RECOMMENDATIONS:
{chr(10).join(data['recommendations'])}

### COMPREHENSIVE ANALYSIS REQUIRED:

1. **EXECUTIVE SUMMARY**: Overall portfolio health, risk assessment, and key concerns

2. **CURRENT MARKET TRENDS & OUTLOOK**:
   - Recent market performance and sector trends
   - Economic indicators affecting Indian markets
   - Interest rate environment and RBI policy impact
   - Global market influences on Indian stocks
   - Future market outlook for next 6-12 months

3. **PORTFOLIO HEALTH ASSESSMENT**:
   - Risk level evaluation (High/Medium/Low)
   - Concentration risk analysis
   - Correlation analysis between holdings
   - Stress testing scenarios

    4. **SPECIFIC STOCK ANALYSIS**:
    - Individual stock performance analysis using CURRENT MARKET PRICES (not buy prices)
    - Fundamental analysis of each holding
    - Technical analysis and price targets based on current market prices
    - Buy/Sell/Hold recommendations with specific price levels relative to current market prices
    - Risk factors specific to each stock
    - IMPORTANT: Use the "Current Market Price" provided above for all price-based recommendations

5. **SECTOR ALLOCATION STRATEGY**:
   - Current sector exposure analysis
   - Optimal sector mix for Indian markets
   - Sector rotation opportunities
   - Emerging sector trends and opportunities
   - Defensive vs growth sector balance

6. **RISK MANAGEMENT**:
   - Specific risk mitigation strategies
   - Stop-loss recommendations
   - Position sizing guidelines
   - Hedging strategies
   - Portfolio insurance options

7. **MARKET TIMING & OPPORTUNITIES**:
   - Current market cycle analysis
   - Entry and exit timing recommendations
   - Seasonal trends and patterns
   - Event-driven opportunities
   - Market correction preparation

8. **ALTERNATIVE INVESTMENTS**:
   - Gold and precious metals allocation
   - Real estate investment options
   - Debt instruments and fixed income
   - International diversification
   - Commodity exposure

9. **REBALANCING STRATEGY**:
   - Specific rebalancing timeline
   - Tax-efficient rebalancing methods
   - Systematic investment plan (SIP) recommendations
   - Dollar-cost averaging opportunities

10. **FUTURE OUTLOOK & LONG-TERM STRATEGY**:
    - 5-year portfolio growth projections
    - Retirement planning considerations
    - Tax optimization strategies
    - Estate planning implications

11. **ACTIONABLE STEPS**:
    - Immediate actions (next 30 days)
    - Short-term goals (3-6 months)
    - Long-term objectives (1-3 years)
    - Monitoring and review schedule

12. **CURRENT EVENTS IMPACT**:
    - Recent policy changes affecting the portfolio
    - Corporate actions and news impact
    - Regulatory changes and compliance
    - Global economic events influence

Please provide a comprehensive, detailed analysis with specific recommendations, price targets, and actionable steps. Focus on current market conditions, emerging trends, and future opportunities in the Indian market context. Include specific stock recommendations with entry/exit levels and risk management strategies.

CRITICAL: Always use the "Current Market Price" provided in the Individual Stock Details section for all price-based analysis, target prices, and stop-loss recommendations. Do NOT use the buy prices for current analysis."""
    
    # Check prompt length and truncate if necessary (rough estimate: 1 token ≈ 4 characters)
    max_chars = 8000  # Conservative limit for llama-3.1-haiku
    if len(prompt) > max_chars:
        print(f"⚠️  Prompt too long ({len(prompt)} chars), truncating to {max_chars} chars")
        prompt = prompt[:max_chars] + "\n\n[Analysis truncated due to length limits]"
    
    try:
        # Perplexity AI API endpoint
        url = "https://api.perplexity.ai/chat/completions"
        headers = {
            "Authorization": f"Bearer {API_KEY}",
            "Content-Type": "application/json"
        }
        payload = {
            "model": "sonar-pro",
            "messages": [
                {
                    "role": "system",
                    "content": "You are an expert financial advisor specializing in Indian stock markets with access to real-time market data and current trends. Provide detailed, actionable investment advice with specific recommendations."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            "max_tokens": 2000,
            "temperature": 0.7,
            "stream": False
        }

        # Retries with exponential backoff for transient errors/timeouts
        max_attempts = 3
        timeout_seconds = 200
        for attempt in range(1, max_attempts + 1):
            try:
                response = requests.post(url, headers=headers, json=payload, timeout=timeout_seconds)
                print(f"Response status code: {response.status_code}")
                if response.status_code == 200:
                    break
                else:
                    print(f"Response text: {response.text}")
                    response.raise_for_status()
            except requests.exceptions.Timeout:
                if attempt == max_attempts:
                    raise
                backoff = 2 ** attempt
                print(f"Timeout on attempt {attempt}. Retrying in {backoff}s...")
                import time
                time.sleep(backoff)
            except requests.exceptions.RequestException as req_err:
                if attempt == max_attempts:
                    raise
                backoff = 2 ** attempt
                print(f"Request error on attempt {attempt}: {req_err}. Retrying in {backoff}s...")
                import time
                time.sleep(backoff)

        result = response.json()

        if "choices" in result and result["choices"]:
            insights = result["choices"][0]["message"]["content"]
            print("\n" + "="*80)
            print("🤖 AI PORTFOLIO INSIGHTS (Perplexity AI)")
            print("="*80)
            print(insights)
            with open("ai_portfolio_insights.txt", "w", encoding='utf-8') as f:
                f.write(insights)
            print(f"\n✓ AI insights saved to 'ai_portfolio_insights.txt'")
        else:
            print("No insights generated from AI")
            print(f"Response structure: {result}")
    except requests.exceptions.RequestException as e:
        print(f"[ERROR] Failed to get AI insights: {e}")
        if hasattr(e, 'response') and e.response is not None:
            print(f"Response status: {e.response.status_code}")
            print(f"Response text: {e.response.text}")
        
        # Fallback: Generate basic insights without API
        print("\n🔄 Generating fallback insights...")
        generate_fallback_insights(data)
    except Exception as e:
        print(f"[ERROR] Unexpected error: {e}")
        # Fallback: Generate basic insights without API
        print("\n🔄 Generating fallback insights...")
        generate_fallback_insights(data)

def generate_fallback_insights(data):
    """Generate basic portfolio insights without external API"""
    try:
        insights = f"""
🤖 PORTFOLIO INSIGHTS (Fallback Analysis)

📊 PORTFOLIO OVERVIEW:
- Total Invested: ₹{data['portfolio_summary']['total_invested']:,.2f}
- Current Value: ₹{data['portfolio_summary']['current_value']:,.2f}
- Total P&L: ₹{data['portfolio_summary']['total_pnl']:,.2f}
- Return: {(data['portfolio_summary']['total_pnl'] / data['portfolio_summary']['total_invested'] * 100):.2f}%

📈 PERFORMANCE METRICS:
- Expected Annual Return: {data['technical_metrics']['annual_return']:.2%}
- Annual Volatility: {data['technical_metrics']['annual_volatility']:.2%}
- Sharpe Ratio: {data['technical_metrics']['sharpe_ratio']:.3f}
- Maximum Drawdown: {data['technical_metrics']['max_drawdown']:.2%}

⚠️ RISK ANALYSIS:
- VaR (95%): {data['risk_analysis']['var_95']:.2%}
- CVaR (95%): {data['risk_analysis']['cvar_95']:.2%}

💡 KEY RECOMMENDATIONS:
1. Monitor portfolio volatility and consider rebalancing if it exceeds your risk tolerance
2. Review individual stock performance and consider profit booking on overperforming stocks
3. Ensure proper diversification across sectors
4. Set stop-losses based on your risk appetite
5. Consider systematic investment plans for long-term wealth building

📋 NEXT STEPS:
- Review portfolio allocation monthly
- Monitor market trends and economic indicators
- Consider tax-efficient rebalancing strategies
- Stay updated with company fundamentals and news

Note: This is a basic analysis. For detailed AI-powered insights, please check your API configuration.
"""
        
        print(insights)
        with open("ai_portfolio_insights.txt", "w", encoding='utf-8') as f:
            f.write(insights)
        print(f"\n✓ Fallback insights saved to 'ai_portfolio_insights.txt'")
        
    except Exception as e:
        print(f"[ERROR] Failed to generate fallback insights: {e}") 