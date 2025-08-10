from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Body
from fastapi.responses import FileResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
import os
import shutil
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
    if isinstance(val, pd.Series):
        return val.tolist()
    if isinstance(val, np.ndarray):
        return val.tolist()
    if isinstance(val, pd.DataFrame):
        return val.to_dict()
    if isinstance(val, (np.floating, float)):
        return float(val)
    if isinstance(val, (np.integer, int)):
        return int(val)
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
    analyzer.current_prices = [analyzer.data[symbol + ".NS"]['history']['Close'].iloc[-1] for symbol in analyzer.symbols]
    invested_values = [q * bp for q, bp in zip(analyzer.shares, analyzer.buy_prices)]
    total_invested = sum(invested_values)
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
    return JSONResponse(content=response)

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