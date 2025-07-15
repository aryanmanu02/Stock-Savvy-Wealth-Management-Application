# Visualization functions will go here 

def create_visualizations(data, shares, buy_prices, current_prices, weights, symbols, metrics):
    import matplotlib.pyplot as plt
    import numpy as np
    import pandas as pd
    plt.style.use('seaborn-v0_8')
    fig = plt.figure(figsize=(20, 16))
    ax1 = plt.subplot(3, 3, 1)
    colors = plt.cm.Set3(np.linspace(0, 1, len(symbols)))
    wedges, texts, autotexts = ax1.pie(weights, labels=symbols, autopct='%1.1f%%', colors=colors, startangle=90)
    ax1.set_title('Portfolio Composition', fontsize=14, fontweight='bold')
    ax2 = plt.subplot(3, 3, 2)
    returns = metrics['individual_returns']
    volatilities = metrics['individual_volatility']
    scatter = ax2.scatter(volatilities, returns, s=[w*1000 for w in weights], c=colors, alpha=0.7)
    ax2.scatter(metrics['annual_volatility'], metrics['annual_return'], s=200, c='red', marker='D', label='Portfolio')
    ax2.set_xlabel('Annual Volatility')
    ax2.set_ylabel('Annual Return')
    ax2.set_title('Risk-Return Profile', fontsize=14, fontweight='bold')
    ax2.legend()
    ax2.grid(True, alpha=0.3)
    for i, symbol in enumerate(symbols):
        ax2.annotate(symbol, (volatilities[i], returns[i]), xytext=(5, 5), textcoords='offset points', fontsize=8)
    ax3 = plt.subplot(3, 3, 3)
    sectors = metrics['sectors']
    sector_weights = {}
    for s, w in zip(sectors, weights):
        sector_weights[s] = sector_weights.get(s, 0) + w
    bars = ax3.bar(range(len(sector_weights)), list(sector_weights.values()), color=plt.cm.Set2(np.linspace(0, 1, len(sector_weights))))
    ax3.set_xlabel('Sectors')
    ax3.set_ylabel('Weight')
    ax3.set_title('Sector Allocation', fontsize=14, fontweight='bold')
    ax3.set_xticks(range(len(sector_weights)))
    ax3.set_xticklabels(list(sector_weights.keys()), rotation=45, ha='right')
    for bar, weight in zip(bars, sector_weights.values()):
        ax3.text(bar.get_x() + bar.get_width()/2, bar.get_height() + 0.01, f'{weight:.1%}', ha='center', va='bottom', fontsize=10)
    ax4 = plt.subplot(3, 3, 4)
    price_df = pd.DataFrame({t: data[t]['history']['Close'] for t in data})
    price_df = price_df.dropna()
    portfolio_value = (price_df * np.array(shares)).sum(axis=1)
    ax4.plot(portfolio_value.index, portfolio_value.values, linewidth=2, color='darkblue')
    ax4.set_xlabel('Date')
    ax4.set_ylabel('Portfolio Value (₹)')
    ax4.set_title('Portfolio Performance Over Time', fontsize=14, fontweight='bold')
    ax4.grid(True, alpha=0.3)
    ax5 = plt.subplot(3, 3, 5)
    normalized_prices = price_df / price_df.iloc[0]
    for col in normalized_prices.columns:
        symbol = col.replace('.NS', '')
        ax5.plot(normalized_prices.index, normalized_prices[col], label=symbol, linewidth=1.5)
    ax5.set_xlabel('Date')
    ax5.set_ylabel('Normalized Price')
    ax5.set_title('Individual Stock Performance', fontsize=14, fontweight='bold')
    ax5.legend(bbox_to_anchor=(1.05, 1), loc='upper left')
    ax5.grid(True, alpha=0.3)
    ax6 = plt.subplot(3, 3, 6)
    returns_df = price_df.pct_change().dropna()
    returns_df.columns = [col.replace('.NS', '') for col in returns_df.columns]
    correlation_matrix = returns_df.corr()
    im = ax6.imshow(correlation_matrix, cmap='RdYlBu_r', aspect='auto', vmin=-1, vmax=1)
    ax6.set_xticks(range(len(correlation_matrix.columns)))
    ax6.set_yticks(range(len(correlation_matrix.columns)))
    ax6.set_xticklabels(correlation_matrix.columns, rotation=45, ha='right')
    ax6.set_yticklabels(correlation_matrix.columns)
    ax6.set_title('Correlation Matrix', fontsize=14, fontweight='bold')
    for i in range(len(correlation_matrix)):
        for j in range(len(correlation_matrix.columns)):
            ax6.text(j, i, f'{correlation_matrix.iloc[i, j]:.2f}', ha='center', va='center', fontsize=8, color='white' if abs(correlation_matrix.iloc[i, j]) > 0.5 else 'black')
    plt.colorbar(im, ax=ax6, shrink=0.8)
    ax7 = plt.subplot(3, 3, 7)
    risk_metrics = ['Volatility', 'Max Drawdown', 'VaR (95%)', 'Beta']
    risk_values = [metrics['annual_volatility'], abs(metrics['max_drawdown']), abs(metrics['var_95']), metrics['portfolio_beta']]
    max_val = max(risk_values)
    normalized_values = [v/max_val for v in risk_values]
    bars = ax7.bar(risk_metrics, normalized_values, color=['red', 'orange', 'yellow', 'blue'])
    ax7.set_ylabel('Normalized Risk Level')
    ax7.set_title('Risk Metrics Comparison', fontsize=14, fontweight='bold')
    ax7.set_xticklabels(risk_metrics, rotation=45, ha='right')
    for bar, value in zip(bars, risk_values):
        if 'Beta' in risk_metrics[bars.index(bar)]:
            label = f'{value:.2f}'
        else:
            label = f'{value:.2%}'
        ax7.text(bar.get_x() + bar.get_width()/2, bar.get_height() + 0.01, label, ha='center', va='bottom', fontsize=10)
    ax8 = plt.subplot(3, 3, 8)
    invested_values = [q * bp for q, bp in zip(shares, buy_prices)]
    current_values = [q * cp for q, cp in zip(shares, current_prices)]
    pnl_values = [cv - iv for cv, iv in zip(current_values, invested_values)]
    pnl_percentages = [(cv - iv) / iv * 100 for cv, iv in zip(current_values, invested_values)]
    colors_pnl = ['green' if pnl > 0 else 'red' for pnl in pnl_values]
    bars = ax8.bar(symbols, pnl_percentages, color=colors_pnl, alpha=0.7)
    ax8.set_xlabel('Stocks')
    ax8.set_ylabel('P&L %')
    ax8.set_title('Individual Stock P&L', fontsize=14, fontweight='bold')
    ax8.axhline(y=0, color='black', linestyle='-', alpha=0.3)
    ax8.grid(True, alpha=0.3)
    for bar, pnl_pct in zip(bars, pnl_percentages):
        ax8.text(bar.get_x() + bar.get_width()/2, bar.get_height() + (1 if pnl_pct > 0 else -3), f'{pnl_pct:.1f}%', ha='center', va='bottom' if pnl_pct > 0 else 'top', fontsize=10, fontweight='bold')
    ax9 = plt.subplot(3, 3, 9)
    portfolio_prices = (price_df * np.array(shares)).sum(axis=1)
    portfolio_sma_20 = portfolio_prices.rolling(window=20).mean()
    portfolio_sma_50 = portfolio_prices.rolling(window=50).mean()
    ax9.plot(portfolio_prices.index, portfolio_prices, label='Portfolio Value', linewidth=2)
    ax9.plot(portfolio_sma_20.index, portfolio_sma_20, label='SMA 20', alpha=0.7)
    ax9.plot(portfolio_sma_50.index, portfolio_sma_50, label='SMA 50', alpha=0.7)
    ax9.set_xlabel('Date')
    ax9.set_ylabel('Value (₹)')
    ax9.set_title('Portfolio Technical Analysis', fontsize=14, fontweight='bold')
    ax9.legend()
    ax9.grid(True, alpha=0.3)
    plt.tight_layout()
    plt.savefig('portfolio_analysis.png', dpi=300, bbox_inches='tight')
    plt.show() 