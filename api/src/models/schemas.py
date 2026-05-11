from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

class Stock(BaseModel):
    code: str
    name: str
    change: float
    relevance: float = 1.0

class News(BaseModel):
    id: str
    title: str
    source: str
    time: str
    summary: str = ""

class Opportunity(BaseModel):
    id: str
    topic: str
    topicDescription: str
    heatIndex: int = Field(ge=0, le=100)
    score: float = Field(ge=1, le=5)
    stocks: List[Stock]
    news: List[News]
    drivers: List[str]
    updatedAt: str

class Anomaly(BaseModel):
    id: str
    stockName: str
    stockCode: str
    type: str  # price, fund, volume
    change: float
    time: str
    newsCount: int
    news: List[News]
    aiInsight: str
    hasNews: bool

class IndexData(BaseModel):
    name: str
    value: float
    change: float

class Sector(BaseModel):
    name: str
    change: float
    driver: str
    leaders: List[str]

class PortfolioItem(BaseModel):
    stockName: str
    stockCode: str
    change: float
    comment: str

class ReviewReport(BaseModel):
    date: str
    indices: List[IndexData]
    hotSectors: List[Sector]
    outlook: dict
    portfolio: List[PortfolioItem]

class StockInfo(BaseModel):
    code: str
    name: str
    price: float
    change: float
    changePercent: float
    volume: float
    amount: float
    high: float
    low: float
    open: float
    previousClose: float

class MoneyFlow(BaseModel):
    code: str
    name: str
    closePrice: float
    changePercent: float
    netAmount: float
    netAmountPercent: float
    buyAmount: float
    sellAmount: float

class SearchResult(BaseModel):
    code: str
    name: str
