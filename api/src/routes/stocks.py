from fastapi import APIRouter, HTTPException, Query
from typing import Optional, List
import logging
import pandas as pd
import time
from ..services import ak_service, processor

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api", tags=["金融数据"])

_cached_opportunities: Optional[List[dict]] = None
_cached_anomalies: Optional[List[dict]] = None
_cached_review: Optional[dict] = None
_cache_time_opportunities = 0
_cache_time_anomalies = 0
_cache_time_review = 0

@router.get("/opportunities")
async def get_opportunities():
    """获取投资机会列表"""
    global _cached_opportunities, _cache_time_opportunities
    
    current_time = time.time()
    if _cached_opportunities and (current_time - _cache_time_opportunities) < 300:
        return _cached_opportunities
    
    try:
        quotes_df = ak_service.get_realtime_quotes()
        news_list = ak_service.get_stock_news()
        
        news_formatted = []
        if news_list:
            for idx, row in pd.DataFrame(news_list).head(5).iterrows():
                news_formatted.append({
                    'id': str(row.get('发布时间', '')),
                    'title': str(row.get('新闻标题', '')),
                    'source': str(row.get('新闻媒体', '')),
                    'time': str(row.get('发布时间', '')),
                    'summary': str(row.get('新闻内容', ''))[:100] if pd.notna(row.get('新闻内容')) else ''
                })
        
        opportunities = processor.generate_opportunities(quotes_df, news_formatted)
        _cached_opportunities = opportunities
        _cache_time_opportunities = current_time
        return opportunities
    except Exception as e:
        logger.error(f"获取机会失败: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/anomalies")
async def get_anomalies(type: Optional[str] = Query(None)):
    """获取异动列表"""
    global _cached_anomalies, _cache_time_anomalies
    
    current_time = time.time()
    if _cached_anomalies and (current_time - _cache_time_anomalies) < 30:
        anomalies = _cached_anomalies
    else:
        try:
            quotes_df = ak_service.get_realtime_quotes()
            money_flow_df = ak_service.get_money_flow()
            
            price_anomalies = processor.detect_price_anomalies(quotes_df, threshold=5.0)
            fund_anomalies = processor.detect_fund_anomalies(money_flow_df, threshold=50000000)
            
            anomalies = price_anomalies + fund_anomalies
            anomalies.sort(key=lambda x: abs(x['change']), reverse=True)
            
            _cached_anomalies = anomalies
            _cache_time_anomalies = current_time
        except Exception as e:
            logger.error(f"获取异动失败: {e}")
            raise HTTPException(status_code=500, detail=str(e))
    
    if type:
        anomalies = [a for a in anomalies if a['type'] == type]
    
    return anomalies

@router.get("/review")
async def get_review():
    """获取复盘报告"""
    global _cached_review, _cache_time_review
    
    current_time = time.time()
    if _cached_review and (current_time - _cache_time_review) < 3600:
        return _cached_review
    
    try:
        review = processor.generate_review_report()
        _cached_review = review
        _cache_time_review = current_time
        return review
    except Exception as e:
        logger.error(f"获取复盘失败: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/quotes")
async def get_quotes():
    """获取实时行情"""
    try:
        df = ak_service.get_realtime_quotes()
        quotes = processor.process_realtime_quotes(df)
        return quotes
    except Exception as e:
        logger.error(f"获取行情失败: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/search")
async def search_stocks(keyword: str = Query(..., min_length=1)):
    """搜索股票"""
    try:
        results = ak_service.search_stock(keyword)
        return results
    except Exception as e:
        logger.error(f"搜索失败: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/sectors")
async def get_hot_sectors():
    """获取热门板块"""
    try:
        df = ak_service.get_hot_sectors()
        if df.empty:
            return []
        return df.to_dict('records')
    except Exception as e:
        logger.error(f"获取板块失败: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/sectors/{sector_name}/stocks")
async def get_sector_stocks(sector_name: str):
    """获取板块成分股"""
    try:
        df = ak_service.get_sector_stocks(sector_name)
        if df.empty:
            return []
        return df.to_dict('records')
    except Exception as e:
        logger.error(f"获取成分股失败: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/news")
async def get_news(stock_code: Optional[str] = None):
    """获取新闻"""
    try:
        news_list = ak_service.get_stock_news(stock_code or "000001")
        return news_list
    except Exception as e:
        logger.error(f"获取新闻失败: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/health")
async def health_check():
    """健康检查"""
    return {"status": "ok", "timestamp": time.time()}
