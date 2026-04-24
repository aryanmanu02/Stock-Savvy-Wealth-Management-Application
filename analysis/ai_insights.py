# AI/LLM insights functions using Perplexity AI with Gemini fallback

def get_llm_insights(perplexity_api_key, gemini_api_key=None, file_path="comprehensive_portfolio_analysis.json"):
    import json
    import requests
    import os

    if not gemini_api_key:
        # Accept both common env spellings.
        gemini_api_key = os.getenv("GEMINI_API_KEY") or os.getenv("GEMINI_API_Key") or os.getenv("Gemini_API_Key")

    try:
        with open(file_path, "r") as f:
            data = json.load(f)
    except FileNotFoundError:
        print(f"[ERROR] File '{file_path}' not found.")
        return
    
    # Keep the prompt compact so the model has room to return the full report.
    prompt = f"""You are an expert financial advisor and portfolio analyst specializing in Indian stock markets.

Write a complete portfolio report with all 12 sections below. Use concise but complete bullets. Do not omit any section.
Keep the answer structured with exact headings 1 to 12. Do not stop after the executive summary.
Do not include any follow-up questions, prompts for more context, or closing questionnaires.

PORTFOLIO OVERVIEW
- Symbols: {', '.join(data['symbols'])}
- Total Invested: ₹{data['portfolio_summary']['total_invested']:,.2f}
- Current Value: ₹{data['portfolio_summary']['current_value']:,.2f}
- Total P&L: ₹{data['portfolio_summary']['total_pnl']:,.2f}

INDIVIDUAL STOCK DETAILS
"""
    
    # Add individual stock details with current prices from yfinance
    for i, symbol in enumerate(data['symbols']):
        if i < len(data['portfolio_summary'].get('current_prices', [])):
            current_price = data['portfolio_summary']['current_prices'][i]
            buy_price = data['portfolio_summary']['buy_prices'][i] if i < len(data['portfolio_summary'].get('buy_prices', [])) else 0
            shares = data['portfolio_summary']['shares'][i] if i < len(data['portfolio_summary'].get('shares', [])) else 0
            weight = data['portfolio_summary']['weights'][i] if i < len(data['portfolio_summary'].get('weights', [])) else 0
            
            prompt += f"""
{symbol}
- Current Market Price: ₹{current_price:.2f}
- Buy Price: ₹{buy_price:.2f}
- Shares Held: {shares:,.0f}
- Portfolio Weight: {weight:.1%}
- Individual P&L: ₹{(current_price - buy_price) * shares:,.2f}
- Individual Return: {((current_price - buy_price) / buy_price * 100):.1f}%
"""
    
    prompt += f"""

PORTFOLIO METRICS
- Expected Annual Return: {data['technical_metrics']['annual_return']:.2%}
- Annual Volatility: {data['technical_metrics']['annual_volatility']:.2%}
- Sharpe Ratio: {data['technical_metrics']['sharpe_ratio']:.3f}
- Sortino Ratio: {data['technical_metrics']['sortino_ratio']:.3f}
- Maximum Drawdown: {data['technical_metrics']['max_drawdown']:.2%}
- Portfolio Beta: {data['technical_metrics']['portfolio_beta']:.3f}
- VaR (95%): {data['risk_analysis']['var_95']:.2%}
- CVaR (95%): {data['risk_analysis']['cvar_95']:.2%}

DIVERSIFICATION SUMMARY
{data['diversification_analysis']}

VALUATION SUMMARY
{data['valuation_analysis']}

CURRENT RECOMMENDATIONS
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
    
    def save_insights(text, source):
        print("\n" + "="*80)
        print(f"🤖 AI PORTFOLIO INSIGHTS ({source})")
        print("="*80)
        print(text)
        with open("ai_portfolio_insights.txt", "w", encoding='utf-8') as f:
            f.write(text)
        print(f"\n✓ AI insights saved to 'ai_portfolio_insights.txt'")

    def clean_ai_response(text):
        """Remove trailing follow-up questions or prompt-like text from model output."""
        lines = text.splitlines()
        cutoff_index = None
        for index, line in enumerate(lines):
            stripped = line.strip().lower()
            if stripped.startswith("to help me refine this report further"):
                cutoff_index = index
                break
            if stripped.startswith("what is your risk tolerance"):
                cutoff_index = index
                break
            if stripped.startswith("are there any specific sectors"):
                cutoff_index = index
                break
            if stripped.startswith("do you have any existing investment accounts"):
                cutoff_index = index
                break

        if cutoff_index is not None:
            text = "\n".join(lines[:cutoff_index]).rstrip()

        return text

    def try_perplexity():
        # Perplexity AI API endpoint
        url = "https://api.perplexity.ai/chat/completions"
        headers = {
            "Authorization": f"Bearer {perplexity_api_key}",
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

        # Retries with exponential backoff for transient errors/timeouts.
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
            return clean_ai_response(result["choices"][0]["message"]["content"])
        else:
            raise RuntimeError(f"No insights generated from Perplexity. Response structure: {result}")

    def try_gemini():
        # Gemini API endpoint (REST). Hardcode the model requested by the user,
        # then retry on 429 (quota/rate-limit) before failing over.
        import time

        base_url = "https://generativelanguage.googleapis.com/v1beta/models"
        model_candidates = ["gemma-3-1b-it"]

        payload = {
            "contents": [
                {
                    "parts": [
                        {
                            "text": (
                                "You are an expert financial advisor specializing in Indian stock markets. "
                                "Provide detailed, actionable investment advice with specific recommendations.\n\n"
                                + prompt
                            )
                        }
                    ]
                }
            ],
            "generationConfig": {
                "temperature": 0.7,
                "maxOutputTokens": 4096
            }
        }

        last_error = None
        for model_name in model_candidates:
            url = f"{base_url}/{model_name}:generateContent"
            try:
                response = None
                max_attempts = 3
                for attempt in range(1, max_attempts + 1):
                    response = requests.post(
                        url,
                        params={"key": gemini_api_key},
                        json=payload,
                        timeout=200,
                    )
                    print(
                        f"Gemini model '{model_name}' response status code: {response.status_code} "
                        f"(attempt {attempt}/{max_attempts})"
                    )

                    # Retry only for rate limit/quota and transient server errors.
                    if response.status_code in (429, 500, 502, 503, 504) and attempt < max_attempts:
                        backoff = 2 ** attempt
                        print(f"Gemini transient error on '{model_name}'. Retrying in {backoff}s...")
                        time.sleep(backoff)
                        continue
                    break

                response.raise_for_status()
                result = response.json()

                candidates = result.get("candidates", [])
                if not candidates:
                    raise RuntimeError(
                        f"No candidates generated from Gemini model '{model_name}'. Response structure: {result}"
                    )

                parts = candidates[0].get("content", {}).get("parts", [])
                text_chunks = [p.get("text", "") for p in parts if p.get("text")]
                if not text_chunks:
                    raise RuntimeError(
                        f"No text content generated from Gemini model '{model_name}'. Response structure: {result}"
                    )

                return clean_ai_response("\n".join(text_chunks))
            except Exception as e:
                last_error = e
                continue

        raise RuntimeError(f"All Gemini model attempts failed. Last error: {last_error}")

    try:
        # Try Perplexity first when key is present and valid format.
        if perplexity_api_key and perplexity_api_key != "YOUR_PERPLEXITY_API_KEY" and perplexity_api_key.startswith("pplx-"):
            try:
                insights = try_perplexity()
                save_insights(insights, "Perplexity AI")
                return
            except Exception as e:
                print(f"[WARN] Perplexity failed: {e}")
                print("🔄 Attempting Gemini fallback...")
        else:
            print("⚠️  Perplexity key missing/invalid. Attempting Gemini fallback...")

        # Fallback to Gemini if key is available.
        if gemini_api_key:
            try:
                insights = try_gemini()
                save_insights(insights, "Gemini")
                return
            except Exception as e:
                print(f"[WARN] Gemini fallback failed: {e}")

        # Final fallback: Generate local insights when both APIs fail.
        print("\n🔄 Generating fallback insights...")
        generate_fallback_insights(data)
    except Exception as e:
        print(f"[ERROR] Unexpected error: {e}")
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