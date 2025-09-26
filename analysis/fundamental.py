# Fundamental analysis functions will go here 

def calculate_fundamental_metrics(data):
    """Calculate fundamental analysis metrics"""
    import numpy as np
    fundamental_data = {}
    for ticker in data:
        info = data[ticker]['info']
        symbol = ticker.replace('.NS', '')
        pe_ratio = info.get('trailingPE', np.nan)
        pb_ratio = info.get('priceToBook', np.nan)
        ps_ratio = info.get('priceToSalesTrailing12Months', np.nan)
        peg_ratio = info.get('pegRatio', np.nan)
        roe = info.get('returnOnEquity', np.nan)
        roa = info.get('returnOnAssets', np.nan)
        profit_margin = info.get('profitMargins', np.nan)
        debt_to_equity = info.get('debtToEquity', np.nan)
        current_ratio = info.get('currentRatio', np.nan)
        quick_ratio = info.get('quickRatio', np.nan)
        revenue_growth = info.get('revenueGrowth', np.nan)
        earnings_growth = info.get('earningsGrowth', np.nan)
        dividend_yield = info.get('dividendYield', 0)
        payout_ratio = info.get('payoutRatio', np.nan)
        fundamental_data[symbol] = {
            'pe_ratio': pe_ratio,
            'pb_ratio': pb_ratio,
            'ps_ratio': ps_ratio,
            'peg_ratio': peg_ratio,
            'roe': roe,
            'roa': roa,
            'profit_margin': profit_margin,
            'debt_to_equity': debt_to_equity,
            'current_ratio': current_ratio,
            'quick_ratio': quick_ratio,
            'revenue_growth': revenue_growth,
            'earnings_growth': earnings_growth,
            'dividend_yield': dividend_yield,
            'payout_ratio': payout_ratio
        }
    return fundamental_data

def advanced_valuation_analysis(data, symbols, BENCHMARK_PE):
    import numpy as np
    fundamental_data = calculate_fundamental_metrics(data)
    flags = ["=== VALUATION ANALYSIS ===\n"]
    for symbol in symbols:
        ticker_ns = symbol + ".NS"
        info = data[ticker_ns]['info']
        fund_data = fundamental_data.get(symbol, {})
        name = info.get('shortName', symbol)
        flags.append(f"\U0001F4CA {name} ({symbol}):")
        pe = fund_data.get('pe_ratio', np.nan)
        if not np.isnan(pe) and pe > 0:
            if pe < BENCHMARK_PE * 0.7:
                flags.append(f"   P/E: {pe:.2f} - \U0001F7E2 UNDERVALUED")
            elif pe > BENCHMARK_PE * 1.5:
                flags.append(f"   P/E: {pe:.2f} - \U0001F534 OVERVALUED")
            else:
                flags.append(f"   P/E: {pe:.2f} - \U0001F7E1 FAIRLY VALUED")
        else:
            flags.append(f"   P/E: N/A")
        pb = fund_data.get('pb_ratio', np.nan)
        if not np.isnan(pb) and pb > 0:
            if pb < 1.0:
                flags.append(f"   P/B: {pb:.2f} - \U0001F7E2 TRADING BELOW BOOK VALUE")
            elif pb > 3.0:
                flags.append(f"   P/B: {pb:.2f} - \U0001F534 EXPENSIVE")
            else:
                flags.append(f"   P/B: {pb:.2f} - \U0001F7E1 REASONABLE")
        peg = fund_data.get('peg_ratio', np.nan)
        if not np.isnan(peg) and peg > 0:
            if peg < 1.0:
                flags.append(f"   PEG: {peg:.2f} - \U0001F7E2 GOOD GROWTH VALUE")
            elif peg > 2.0:
                flags.append(f"   PEG: {peg:.2f} - \U0001F534 OVERPRICED FOR GROWTH")
            else:
                flags.append(f"   PEG: {peg:.2f} - \U0001F7E1 FAIR")
        roe = fund_data.get('roe', np.nan)
        if not np.isnan(roe):
            if roe > 0.15:
                flags.append(f"   ROE: {roe:.2%} - \U0001F7E2 EXCELLENT")
            elif roe > 0.10:
                flags.append(f"   ROE: {roe:.2%} - \U0001F7E1 GOOD")
            else:
                flags.append(f"   ROE: {roe:.2%} - \U0001F534 WEAK")
        debt_eq = fund_data.get('debt_to_equity', np.nan)
        if not np.isnan(debt_eq):
            if debt_eq < 0.3:
                flags.append(f"   Debt/Equity: {debt_eq:.2f} - \U0001F7E2 LOW DEBT")
            elif debt_eq > 1.0:
                flags.append(f"   Debt/Equity: {debt_eq:.2f} - \U0001F534 HIGH DEBT")
            else:
                flags.append(f"   Debt/Equity: {debt_eq:.2f} - \U0001F7E1 MODERATE")
        flags.append("")
    return "\n".join(flags) 