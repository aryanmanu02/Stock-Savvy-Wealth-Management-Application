# Risk analysis functions will go here 

def risk_analysis(metrics):
    """Comprehensive risk analysis"""
    analysis = ["=== RISK ANALYSIS ===\n"]
    volatility = metrics['annual_volatility']
    max_dd = metrics['max_drawdown']
    beta = metrics['portfolio_beta']
    var_95 = metrics['var_95']
    analysis.append("Portfolio Risk Metrics:")
    analysis.append(f"  Annual Volatility: {volatility:.2%}")
    analysis.append(f"  Maximum Drawdown: {max_dd:.2%}")
    analysis.append(f"  Portfolio Beta: {beta:.2f}")
    analysis.append(f"  Value at Risk (95%): {var_95:.2%}")
    if volatility > 0.25:
        analysis.append(f"\n\U0001F534 HIGH RISK PORTFOLIO")
    elif volatility > 0.15:
        analysis.append(f"\n\U0001F7E1 MODERATE RISK PORTFOLIO")
    else:
        analysis.append(f"\n\U0001F7E2 LOW RISK PORTFOLIO")
    if beta > 1.2:
        analysis.append(f"\U0001F4C8 Portfolio is {((beta-1)*100):.0f}% more volatile than market")
    elif beta < 0.8:
        analysis.append(f"\U0001F4C9 Portfolio is {((1-beta)*100):.0f}% less volatile than market")
    analysis.append(f"\nIndividual Stock Volatilities:")
    for ticker, vol in zip(metrics['tickers'], metrics['individual_volatility']):
        symbol = ticker.replace('.NS', '')
        analysis.append(f"  {symbol}: {vol:.2%}")
    return "\n".join(analysis) 