import akshare as ak
import asyncio
from datetime import datetime
from typing import List, Dict, Any, Optional

from api.src.services.data_processor import RuleEngine

rule_engine = RuleEngine()

async def get_realtime_quotes(codes: List[str]) -> List[Dict[str, Any]]:
    loop = asyncio.get_event_loop()
    try:
        df = await loop.run_in_executor(None, ak.stock_zh_a_spot_em)
        if df is None or df.empty:
            return []
        
        quotes = []
        for code in codes:
            stock = df[df['代码'] == code]
            if not stock.empty:
                row = stock.iloc[0]
                prev_close = row.get('昨收', 0)
                current = row.get('最新价', 0)
                change = current - prev_close if prev_close else 0
                change_pct = (change / prev_close * 100) if prev_close else 0
                
                quotes.append({
                    "code": str(code),
                    "name": str(row.get('名称', '')),
                    "price": float(current),
                    "change": float(change),
                    "changePercent": float(change_pct),
                    "volume": int(row.get('成交量', 0)),
                    "amount": float(row.get('成交额', 0)),
                    "high": float(row.get('最高', 0)),
                    "low": float(row.get('最低', 0)),
                    "open": float(row.get('今开', 0)),
                    "prevClose": float(prev_close),
                    "updateTime": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
                })
        
        return quotes
    except Exception as e:
        print(f"获取行情数据失败: {e}")
        return []

async def search_stock(keyword: str, limit: int = 10) -> List[Dict[str, str]]:
    loop = asyncio.get_event_loop()
    try:
        df = await loop.run_in_executor(None, ak.stock_info_a_code_name)
        if df is None or df.empty:
            return []
        
        keyword_upper = keyword.upper()
        filtered = df[
            df['code'].str.contains(keyword_upper, na=False) |
            df['name'].str.contains(keyword, na=False)
        ].head(limit)
        
        results = []
        for _, row in filtered.iterrows():
            market = "沪市" if row['code'].startswith(('6', '5')) else "深市"
            results.append({
                "code": str(row['code']),
                "name": str(row['name']),
                "market": market
            })
        
        return results
    except Exception as e:
        print(f"搜索股票失败: {e}")
        return []

async def get_ai_conclusion(code: str, risk_preference: Dict[str, int]) -> Dict[str, Any]:
    loop = asyncio.get_event_loop()
    try:
        df = await loop.run_in_executor(None, ak.stock_zh_a_spot_em)
        stock = df[df['代码'] == code] if df is not None and not df.empty else None
        
        if stock is None or stock.empty:
            return {
                "code": code,
                "name": "未知",
                "conclusion": {
                    "level": 0,
                    "label": "中性",
                    "score": 50,
                    "explanation": "数据获取失败",
                    "signals": [],
                    "riskTips": "请稍后重试"
                },
                "generatedAt": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            }
        
        row = stock.iloc[0]
        prev_close = row.get('昨收', 0)
        current = row.get('最新价', 0)
        change_pct = ((current - prev_close) / prev_close * 100) if prev_close else 0
        
        market_data = {
            "code": code,
            "name": str(row.get('名称', '')),
            "price": float(current),
            "change": float(current - prev_close) if prev_close else 0,
            "changePercent": float(change_pct),
            "volume": int(row.get('成交量', 0)),
            "amount": float(row.get('成交额', 0)),
            "high": float(row.get('最高', 0)),
            "low": float(row.get('最低', 0)),
        }
        
        result = await loop.run_in_executor(
            None,
            rule_engine.calculate,
            market_data,
            risk_preference
        )
        
        result["generatedAt"] = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        return result
        
    except Exception as e:
        print(f"生成AI结论失败: {e}")
        return {
            "code": code,
            "name": "未知",
            "conclusion": {
                "level": 0,
                "label": "中性",
                "score": 50,
                "explanation": "分析服务暂时不可用",
                "signals": [],
                "riskTips": "请稍后重试"
            },
            "generatedAt": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        }

__all__ = ["get_realtime_quotes", "search_stock", "get_ai_conclusion"]
