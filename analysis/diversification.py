# Diversification analysis functions will go here 

def check_diversification(metrics, weights):
    """Comprehensive diversification analysis"""
    import numpy as np
    sectors = metrics['sectors']
    # Sector analysis
    sector_weights = {}
    for s, w in zip(sectors, weights):
        sector_weights[s] = sector_weights.get(s, 0) + w
    hhi = sum(w**2 for w in sector_weights.values())
    individual_vols = metrics['individual_volatility']
    weighted_avg_vol = np.sum(individual_vols * weights)
    portfolio_vol = metrics['annual_volatility']
    diversification_ratio = weighted_avg_vol / portfolio_vol if portfolio_vol != 0 else 1
    report = ["=== DIVERSIFICATION ANALYSIS ===\n"]
    report.append("Sector Exposure:")
    for sector, w in sorted(sector_weights.items(), key=lambda x: x[1], reverse=True):
        report.append(f"  {sector}: {w:.2%}")
    report.append(f"\nConcentration Metrics:")
    report.append(f"  Herfindahl-Hirschman Index: {hhi:.3f}")
    report.append(f"  Diversification Ratio: {diversification_ratio:.2f}")
    concentrated = [s for s, w in sector_weights.items() if w > 0.4]
    if concentrated:
        report.append(f"\n\u26A0\uFE0F  HIGH CONCENTRATION RISK:")
        for c in concentrated:
            report.append(f"   - {c}: {sector_weights[c]:.2%}")
    elif hhi > 0.25:
        report.append(f"\n\u26A0\uFE0F  MODERATE CONCENTRATION RISK")
    else:
        report.append(f"\n\u2713 GOOD DIVERSIFICATION")
    if len(sector_weights) < 5:
        report.append(f"\n\U0001F4A1 RECOMMENDATION: Consider adding stocks from more sectors")
    return "\n".join(report) 