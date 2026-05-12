from fastapi import APIRouter, Query, HTTPException
from pydantic import BaseModel
from typing import List, Optional

from api.src.services import akshare_service

router = APIRouter()

class RiskPreference(BaseModel):
    high: int = 40
    medium: int = 35
    low: int = 25

@router.get("/quote")
async def get_stock_quote(codes: str = Query(..., description="股票代码，多个用逗号分隔，如 600519,000001")):
    try:
        code_list = [c.strip() for c in codes.split(",")]
        quotes = await akshare_service.get_realtime_quotes(code_list)
        return {
            "code": 0,
            "message": "success",
            "data": {
                "quotes": quotes
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/search")
async def search_stocks(
    keyword: str = Query(..., description="搜索关键词"),
    limit: int = Query(10, description="返回数量")
):
    try:
        results = await akshare_service.search_stock(keyword, limit)
        return {
            "code": 0,
            "message": "success",
            "data": {
                "stocks": results
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/ai-conclusion")
async def get_ai_conclusion(
    code: str = Query(..., description="股票代码"),
    riskPreference: Optional[RiskPreference] = None
):
    try:
        if riskPreference is None:
            riskPreference = RiskPreference()
        conclusion = await akshare_service.get_ai_conclusion(code, riskPreference.dict())
        return {
            "code": 0,
            "message": "success",
            "data": conclusion
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
