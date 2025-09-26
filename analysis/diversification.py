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
    
    # Fix: Convert individual_volatility dictionary to list in the same order as weights
    individual_vols = []
    tickers = metrics['tickers']
    individual_volatility_dict = metrics['individual_volatility']
    
    for ticker in tickers:
        # Remove .NS suffix if present to match the dictionary keys
        ticker_key = ticker.replace('.NS', '')
        if ticker_key in individual_volatility_dict:
            individual_vols.append(individual_volatility_dict[ticker_key])
        else:
            # Fallback if ticker not found
            individual_vols.append(0.0)
    
    # Convert to numpy arrays for calculation
    individual_vols = np.array(individual_vols)
    weights_array = np.array(weights)
    
    weighted_avg_vol = np.sum(individual_vols * weights_array)
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
        report.append(f"\n⚠️  HIGH CONCENTRATION RISK:")
        for c in concentrated:
            report.append(f"   - {c}: {sector_weights[c]:.2%}")
    elif hhi > 0.25:
        report.append(f"\n⚠️  MODERATE CONCENTRATION RISK")
    else:
        report.append(f"\n✓ GOOD DIVERSIFICATION")
    if len(sector_weights) < 5:
        report.append(f"\n💡 RECOMMENDATION: Consider adding stocks from more sectors")
    return "\n".join(report) 