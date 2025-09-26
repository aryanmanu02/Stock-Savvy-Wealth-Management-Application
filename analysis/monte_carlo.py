# Monte Carlo simulation functions will go here 

def monte_carlo_simulation(data, shares, current_prices, weights, num_simulations=1000, time_horizon=252):
    import numpy as np
    import pandas as pd
    print("Running Monte Carlo Simulation...")
    price_df = pd.DataFrame({t: data[t]['history']['Close'] for t in data})
    returns = price_df.pct_change().dropna()
    portfolio_returns = returns.dot(weights)
    mean_return = portfolio_returns.mean()
    std_return = portfolio_returns.std()
    current_value = sum(q * cp for q, cp in zip(shares, current_prices))
    simulation_results = []
    for _ in range(num_simulations):
        random_returns = np.random.normal(mean_return, std_return, time_horizon)
        cumulative_returns = np.cumprod(1 + random_returns)
        final_value = current_value * cumulative_returns[-1]
        simulation_results.append(final_value)
    simulation_results = np.array(simulation_results)
    mean_final_value = np.mean(simulation_results)
    percentile_5 = np.percentile(simulation_results, 5)
    percentile_95 = np.percentile(simulation_results, 95)
    prob_loss = np.mean(simulation_results < current_value) * 100
    print(f"\nMonte Carlo Simulation Results (1 Year Horizon):")
    print(f"Current Portfolio Value: ₹{current_value:,.2f}")
    print(f"Expected Value: ₹{mean_final_value:,.2f}")
    print(f"5th Percentile (VaR): ₹{percentile_5:,.2f}")
    print(f"95th Percentile: ₹{percentile_95:,.2f}")
    print(f"Probability of Loss: {prob_loss:.1f}%")
    return simulation_results 