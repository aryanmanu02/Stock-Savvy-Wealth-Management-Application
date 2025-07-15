# Report generation and recommendations functions will go here 

def generate_comprehensive_report(symbols, shares, buy_prices, current_prices, metrics):
    from datetime import datetime
    report = []
    report.append("=" * 60)
    report.append("COMPREHENSIVE PORTFOLIO ANALYSIS REPORT")
    report.append("=" * 60)
    report.append(f"Generated on: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    report.append("")
    total_invested = sum(q * bp for q, bp in zip(shares, buy_prices))
    total_current = sum(q * cp for q, cp in zip(shares, current_prices))
    total_pnl = total_current - total_invested
    total_pnl_pct = (total_pnl / total_invested) * 100 if total_invested > 0 else 0
    report.append("PORTFOLIO SUMMARY")
    report.append("-" * 20)
    report.append(f"Total Invested: ₹{total_invested:,.2f}")
    report.append(f"Current Value: ₹{total_current:,.2f}")
    report.append(f"Total P&L: ₹{total_pnl:,.2f} ({total_pnl_pct:.2f}%)")
    report.append(f"Number of Holdings: {len(symbols)}")
    report.append("")
    report.append("PERFORMANCE METRICS")
    report.append("-" * 20)
    report.append(f"Expected Annual Return: {metrics['annual_return']:.2%}")
    report.append(f"Annual Volatility: {metrics['annual_volatility']:.2%}")
    report.append(f"Sharpe Ratio: {metrics['sharpe_ratio']:.3f}")
    report.append(f"Sortino Ratio: {metrics['sortino_ratio']:.3f}")
    report.append(f"Information Ratio: {metrics['information_ratio']:.3f}")
    report.append(f"Treynor Ratio: {metrics['treynor_ratio']:.3f}")
    report.append(f"Maximum Drawdown: {metrics['max_drawdown']:.2%}")
    report.append(f"Portfolio Beta: {metrics['portfolio_beta']:.3f}")
    report.append("")
    return "\n".join(report)

def generate_recommendations(metrics, weights):
    recommendations = []
    if metrics['sharpe_ratio'] < 0.5:
        recommendations.append("LOW SHARPE RATIO: Consider rebalancing to improve risk-adjusted returns")
    if metrics['annual_volatility'] > 0.3:
        recommendations.append("HIGH VOLATILITY: Add defensive stocks or bonds to reduce portfolio risk")
    if abs(metrics['max_drawdown']) > 0.3:
        recommendations.append("HIGH DRAWDOWN RISK: Implement stop-loss strategies or diversify further")
    sectors = metrics['sectors']
    sector_weights = {}
    for s, w in zip(sectors, weights):
        sector_weights[s] = sector_weights.get(s, 0) + w
    if len(sector_weights) < 5:
        recommendations.append("LIMITED DIVERSIFICATION: Consider adding stocks from more sectors")
    concentrated_sectors = [s for s, w in sector_weights.items() if w > 0.4]
    if concentrated_sectors:
        recommendations.append(f"SECTOR CONCENTRATION: Reduce exposure to {', '.join(concentrated_sectors)}")
    if metrics['portfolio_beta'] > 1.5:
        recommendations.append("HIGH BETA: Portfolio is very sensitive to market movements - consider defensive stocks")
    elif metrics['portfolio_beta'] < 0.5:
        recommendations.append("LOW BETA: Portfolio may underperform in bull markets - consider growth stocks")
    return recommendations 