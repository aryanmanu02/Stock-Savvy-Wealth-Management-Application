# Correlation analysis functions will go here 

def correlation_analysis(data):
    import pandas as pd
    import numpy as np
    price_df = pd.DataFrame({t.replace('.NS', ''): data[t]['history']['Close'] for t in data})
    returns_df = price_df.pct_change().dropna()
    correlation_matrix = returns_df.corr()
    analysis = ["=== CORRELATION ANALYSIS ===\n"]
    upper_triangle = correlation_matrix.where(
        np.triu(np.ones(correlation_matrix.shape), k=1).astype(bool)
    )
    avg_correlation = upper_triangle.stack().mean()
    analysis.append(f"Average Pairwise Correlation: {avg_correlation:.3f}")
    if avg_correlation > 0.7:
        analysis.append("\U0001F534 HIGH CORRELATION - Limited diversification benefit")
    elif avg_correlation > 0.4:
        analysis.append("\U0001F7E1 MODERATE CORRELATION - Some diversification benefit")
    else:
        analysis.append("\U0001F7E2 LOW CORRELATION - Good diversification benefit")
    high_corr_pairs = []
    for i in range(len(correlation_matrix.columns)):
        for j in range(i+1, len(correlation_matrix.columns)):
            corr = correlation_matrix.iloc[i, j]
            if abs(corr) > 0.7:
                high_corr_pairs.append((
                    correlation_matrix.columns[i],
                    correlation_matrix.columns[j],
                    corr
                ))
    if high_corr_pairs:
        analysis.append(f"\nHighly Correlated Pairs (>0.7):")
        for stock1, stock2, corr in high_corr_pairs:
            analysis.append(f"  {stock1} - {stock2}: {corr:.3f}")
    return "\n".join(analysis), correlation_matrix 