# AI/LLM insights functions will go here 

def get_llm_insights(API_KEY, file_path="comprehensive_portfolio_analysis.json"):
    import json
    import requests
    if not API_KEY or API_KEY == "YOUR_GEMINI_API_KEY":
        print("⚠️  API_KEY not set. Please update the API_KEY variable with your Gemini API key.")
        return
    try:
        with open(file_path, "r") as f:
            data = json.load(f)
    except FileNotFoundError:
        print(f"[ERROR] File '{file_path}' not found.")
        return
    prompt = f"""You are an expert financial advisor specializing in Indian stock markets. Analyze this comprehensive portfolio data and provide actionable insights:\n\n### PORTFOLIO OVERVIEW:\nSymbols: {', '.join(data['symbols'])}\nTotal Invested: ₹{data['portfolio_summary']['total_invested']:,.2f}\nCurrent Value: ₹{data['portfolio_summary']['current_value']:,.2f}\nTotal P&L: ₹{data['portfolio_summary']['total_pnl']:,.2f}\n\n### PERFORMANCE METRICS:\n- Expected Annual Return: {data['technical_metrics']['annual_return']:.2%}\n- Annual Volatility: {data['technical_metrics']['annual_volatility']:.2%}\n- Sharpe Ratio: {data['technical_metrics']['sharpe_ratio']:.3f}\n- Sortino Ratio: {data['technical_metrics']['sortino_ratio']:.3f}\n- Maximum Drawdown: {data['technical_metrics']['max_drawdown']:.2%}\n- Portfolio Beta: {data['technical_metrics']['portfolio_beta']:.3f}\n\n### RISK ANALYSIS:\n- VaR (95%): {data['risk_analysis']['var_95']:.2%}\n- CVaR (95%): {data['risk_analysis']['cvar_95']:.2%}\n\n### DIVERSIFICATION:\n{data['diversification_analysis']}\n\n### VALUATION:\n{data['valuation_analysis']}\n\n### CURRENT RECOMMENDATIONS:\n{chr(10).join(data['recommendations'])}\n\n### YOUR EXPERT ANALYSIS REQUIRED:\n1. **Portfolio Health Assessment**: Overall portfolio quality and risk level\n2. **Specific Stock Recommendations**: Which stocks to buy/sell/hold and why\n3. **Sector Allocation Strategy**: Optimal sector mix for Indian markets\n4. **Risk Management**: Specific actions to improve risk-adjusted returns\n5. **Market Timing**: Current market conditions and timing considerations\n6. **Alternative Investments**: Suggest complementary asset classes\n7. **Rebalancing Strategy**: Specific steps to optimize the portfolio\n\nPlease provide a detailed, actionable report with specific recommendations tailored to the Indian stock market context."""
    try:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={API_KEY}"
        headers = {"Content-Type": "application/json"}
        payload = {
            "contents": [{"parts": [{"text": prompt}]}],
            "generationConfig": {
                "temperature": 0.7,
                "topK": 40,
                "topP": 0.95,
                "maxOutputTokens": 2048
            }
        }
        response = requests.post(url, headers=headers, json=payload, timeout=30)
        response.raise_for_status()
        result = response.json()
        if "candidates" in result and result["candidates"]:
            insights = result["candidates"][0]["content"]["parts"][0]["text"]
            print("\n" + "="*80)
            print("🤖 AI PORTFOLIO INSIGHTS")
            print("="*80)
            print(insights)
            with open("ai_portfolio_insights.txt", "w", encoding='utf-8') as f:
                f.write(insights)
            print(f"\n✓ AI insights saved to 'ai_portfolio_insights.txt'")
        else:
            print("No insights generated from AI")
    except requests.exceptions.RequestException as e:
        print(f"[ERROR] Failed to get AI insights: {e}")
    except Exception as e:
        print(f"[ERROR] Unexpected error: {e}") 