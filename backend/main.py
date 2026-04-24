from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Body
from fastapi.responses import FileResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
import os
import shutil
import math
import pandas as pd
import numpy as np
from pymongo import MongoClient
from bson import ObjectId
from portfolio.portfolio_analyzer import PortfolioAnalyzer

client = MongoClient("mongodb://localhost:27017/")
db = client["portfolio_db"]
stocks_collection = db["stocks"]

app = FastAPI()

# Allow CORS for local frontend development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class StockModel(BaseModel):
    symbol: str
    shares: float
    buy_price: float

class StockUpdateModel(BaseModel):
    symbol: str
    shares: float
    buy_price: float

def to_serializable(val):
    if val is None:
        return None
    if isinstance(val, pd.Series):
        return [to_serializable(x) for x in val.tolist()]
    if isinstance(val, np.ndarray):
        return [to_serializable(x) for x in val.tolist()]
    if isinstance(val, pd.DataFrame):
        return {k: to_serializable(v) for k, v in val.to_dict().items()}
    if isinstance(val, dict):
        return {str(k): to_serializable(v) for k, v in val.items()}
    if isinstance(val, (list, tuple, set)):
        return [to_serializable(x) for x in val]
    if isinstance(val, (np.floating, float)):
        f = float(val)
        return f if math.isfinite(f) else None
    if isinstance(val, (np.integer, int)):
        return int(val)
    if isinstance(val, (np.bool_, bool)):
        return bool(val)
    return val

@app.post("/stocks")
def add_stock(stock: StockModel):
    result = stocks_collection.insert_one(stock.dict())
    return {"message": "Stock added", "id": str(result.inserted_id)}

@app.get("/stocks")
def get_stocks():
    stocks = list(stocks_collection.find({}))
    # Convert ObjectId to string for JSON serialization
    for stock in stocks:
        stock["_id"] = str(stock["_id"])
    return {"stocks": stocks}

@app.put("/stocks/{stock_id}")
def update_stock(stock_id: str, stock: StockUpdateModel):
    try:
        result = stocks_collection.update_one(
            {"_id": ObjectId(stock_id)},
            {"$set": stock.dict()}
        )
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Stock not found")
        return {"message": "Stock updated"}
    except Exception as e:
        raise HTTPException(status_code=400, detail="Invalid stock ID")

@app.delete("/stocks/{stock_id}")
def delete_stock(stock_id: str):
    try:
        result = stocks_collection.delete_one({"_id": ObjectId(stock_id)})
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Stock not found")
        return {"message": "Stock deleted"}
    except Exception as e:
        raise HTTPException(status_code=400, detail="Invalid stock ID")

@app.delete("/stocks")
def clear_stocks():
    stocks_collection.delete_many({})
    return {"message": "All stocks cleared"}

@app.post("/analyze")
def analyze_portfolio():
    stocks = list(stocks_collection.find({}, {"_id": 0}))
    if not stocks:
        raise HTTPException(status_code=400, detail="No stocks in portfolio.")
    symbols = [s["symbol"].strip().upper() for s in stocks]
    shares = [float(s["shares"]) for s in stocks]
    buy_prices = [float(s["buy_price"]) for s in stocks]
    analyzer = PortfolioAnalyzer()
    analyzer.symbols = symbols
    analyzer.shares = shares
    analyzer.buy_prices = buy_prices

    # Fetch data
    analyzer.get_tickers_data(analyzer.symbols)
    if not analyzer.data:
        raise HTTPException(status_code=400, detail="No data fetched for the given symbols.")

    # Keep portfolio arrays aligned with tickers that actually returned valid history.
    valid_symbols = []
    valid_ticker_keys = []
    valid_shares = []
    valid_buy_prices = []
    valid_current_prices = []

    for symbol, share, buy_price in zip(symbols, shares, buy_prices):
        ticker_key = symbol + ".NS"
        ticker_payload = analyzer.data.get(ticker_key)
        if not ticker_payload:
            continue

        close_series = ticker_payload.get("history", pd.DataFrame()).get("Close")
        if close_series is None or close_series.empty:
            continue

        valid_symbols.append(symbol)
        valid_ticker_keys.append(ticker_key)
        valid_shares.append(float(share))
        valid_buy_prices.append(float(buy_price))
        valid_current_prices.append(float(close_series.iloc[-1]))

    if not valid_symbols:
        raise HTTPException(
            status_code=400,
            detail="No valid market history found for the given symbols."
        )

    # Consolidate duplicate symbols so weights match unique return columns.
    consolidated = {}
    for symbol, ticker_key, share, buy_price, current_price in zip(
        valid_symbols,
        valid_ticker_keys,
        valid_shares,
        valid_buy_prices,
        valid_current_prices,
    ):
        if ticker_key not in consolidated:
            consolidated[ticker_key] = {
                "symbol": symbol,
                "shares": 0.0,
                "invested": 0.0,
                "current_price": current_price,
            }

        consolidated[ticker_key]["shares"] += float(share)
        consolidated[ticker_key]["invested"] += float(share) * float(buy_price)
        consolidated[ticker_key]["current_price"] = float(current_price)

    consolidated_keys = list(consolidated.keys())
    consolidated_symbols = [consolidated[k]["symbol"] for k in consolidated_keys]
    consolidated_shares = [consolidated[k]["shares"] for k in consolidated_keys]
    consolidated_buy_prices = [
        (consolidated[k]["invested"] / consolidated[k]["shares"])
        if consolidated[k]["shares"] > 0
        else 0.0
        for k in consolidated_keys
    ]
    consolidated_current_prices = [consolidated[k]["current_price"] for k in consolidated_keys]

    analyzer.symbols = consolidated_symbols
    analyzer.data = {k: analyzer.data[k] for k in consolidated_keys}
    analyzer.shares = consolidated_shares
    analyzer.buy_prices = consolidated_buy_prices
    analyzer.current_prices = consolidated_current_prices

    invested_values = [q * bp for q, bp in zip(analyzer.shares, analyzer.buy_prices)]
    total_invested = sum(invested_values)
    if total_invested <= 0:
        raise HTTPException(status_code=400, detail="Total invested amount must be greater than zero.")

    analyzer.weights = [iv / total_invested for iv in invested_values]

    # Beta analysis
    industry_avg_beta = analyzer.get_industry_avg_beta()
    analyzer.fill_missing_betas(industry_avg_beta)
    # Calculate metrics
    analyzer.calculate_technical_indicators()
    analyzer.calculate_portfolio_metrics()
    analyzer.save_comprehensive_data()
    analyzer.create_visualizations()
    analyzer.get_llm_insights()
    # Prepare response
    response = {
        "portfolio_summary": {
            "symbols": analyzer.symbols,
            "shares": [to_serializable(x) for x in analyzer.shares],
            "buy_prices": [to_serializable(x) for x in analyzer.buy_prices],
            "current_prices": [to_serializable(x) for x in analyzer.current_prices],
            "weights": [to_serializable(x) for x in analyzer.weights],
        },
        "metrics": {k: to_serializable(v) for k, v in analyzer.metrics.items()},
        "files": {
            "json": "/files/comprehensive_portfolio_analysis.json",
            "png": "/files/portfolio_analysis.png",
            "ai": "/files/ai_portfolio_insights.txt"
        }
    }
    return JSONResponse(content=to_serializable(response))

@app.get("/files/{filename}")
def get_file(filename: str):
    file_path = os.path.join(os.getcwd(), filename)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File not found.")
    # Set correct media type for known files
    if filename.endswith('.png'):
        media_type = 'image/png'
    elif filename.endswith('.json'):
        media_type = 'application/json'
    elif filename.endswith('.txt'):
        media_type = 'text/plain'
    else:
        media_type = 'application/octet-stream'
    return FileResponse(file_path, media_type=media_type) 