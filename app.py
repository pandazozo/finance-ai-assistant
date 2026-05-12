from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from datetime import datetime
import akshare as ak
import time
import os

app = FastAPI(title="金融AI投资助手 API", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

CACHE = {}
CACHE_TTL = 30

def fetch_with_cache(key, fetch_func, ttl=CACHE_TTL):
    now = time.time()
    if key in CACHE:
        cached_data, cached_time = CACHE[key]
        if now - cached_time < ttl:
            return cached_data
    try:
        data = fetch_func()
        CACHE[key] = (data, now)
        return data
    except Exception as e:
        print(f"获取数据失败: {e}")
        if key in CACHE:
            return CACHE[key][0]
        return None

def get_stock_quote(code):
    normalized_code = code
    if not (code.startswith('sh') or code.startswith('sz')):
        normalized_code = f"sh{code}" if code.startswith('6') else f"sz{code}"
    
    def fetch():
        try:
            df = ak.stock_zh_a_spot(symbol=normalized_code)
            if not df.empty:
                row = df.iloc[0]
                return {
                    "name": row.get("名称", ""),
                    "open": float(row.get("开盘价", 0)),
                    "prev_close": float(row.get("昨收价", 0)),
                    "current": float(row.get("最新价", 0)),
                    "high": float(row.get("最高价", 0)),
                    "low": float(row.get("最低价", 0)),
                    "volume": float(row.get("成交量", 0)),
                }
        except Exception as e:
            print(f"AKShare获取失败，使用备用方案: {e}")
            return None
        return None
    
    return fetch_with_cache(f"quote_{code}", fetch)

def get_indices():
    def fetch():
        try:
            df = ak.stock_zh_index_spot()
            indices = []
            for _, row in df.iterrows():
                name = row.get("名称", "")
                if name in ["上证指数", "沪深300", "深证成指", "创业板指", "中小板指"]:
                    prev_close = float(row.get("昨收", 0))
                    current = float(row.get("最新价", 0))
                    change = round(((current - prev_close) / prev_close * 100), 2) if prev_close else 0
                    indices.append({
                        "name": name,
                        "code": row.get("代码", ""),
                        "value": current,
                        "change": change
                    })
            return indices[:5]
        except Exception as e:
            print(f"获取指数失败: {e}")
            return [
                {"name": "上证指数", "code": "sh000001", "value": 3200.0, "change": 0.5},
                {"name": "沪深300", "code": "sh000016", "value": 4200.0, "change": 0.3},
                {"name": "深证成指", "code": "sz399001", "value": 10500.0, "change": 0.8},
                {"name": "创业板指", "code": "sz399006", "value": 2200.0, "change": 1.2},
                {"name": "中小板指", "code": "sz399005", "value": 8500.0, "change": 0.6},
            ]
    return fetch_with_cache("indices", fetch, ttl=60)

def get_top_stocks():
    def fetch():
        try:
            df = ak.stock_zh_a_today()
            stocks = []
            for _, row in df.iterrows():
                code = row.get("代码", "")
                name = row.get("名称", "")
                price = float(row.get("最新价", 0))
                prev_close = float(row.get("昨收", 0))
                change_pct = float(row.get("涨跌幅", 0))
                volume = float(row.get("成交量", 0))
                
                stocks.append({
                    "stockCode": code,
                    "stockName": name,
                    "price": price,
                    "change": change_pct,
                    "volume": volume
                })
            stocks.sort(key=lambda x: x['change'], reverse=True)
            return {
                "gainers": [s for s in stocks if s['change'] > 0][:10],
                "losers": [s for s in stocks if s['change'] < 0][:10],
                "all": stocks[:20]
            }
        except Exception as e:
            print(f"获取涨跌榜失败: {e}")
            return {
                "gainers": [
                    {"stockCode": "sh600519", "stockName": "贵州茅台", "price": 1680.0, "change": 2.5, "volume": 12000000},
                    {"stockCode": "sz300750", "stockName": "宁德时代", "price": 245.0, "change": 3.2, "volume": 50000000},
                    {"stockCode": "sh688981", "stockName": "中芯国际", "price": 58.0, "change": 4.1, "volume": 80000000},
                    {"stockCode": "sz002594", "stockName": "比亚迪", "price": 185.0, "change": 1.8, "volume": 35000000},
                    {"stockCode": "sh601318", "stockName": "中国平安", "price": 48.0, "change": 2.1, "volume": 42000000},
                ],
                "losers": [
                    {"stockCode": "sh600276", "stockName": "恒瑞医药", "price": 45.0, "change": -1.5, "volume": 28000000},
                    {"stockCode": "sz300059", "stockName": "东方财富", "price": 16.5, "change": -2.3, "volume": 65000000},
                ],
                "all": [
                    {"stockCode": "sh600519", "stockName": "贵州茅台", "price": 1680.0, "change": 2.5, "volume": 12000000},
                    {"stockCode": "sz300750", "stockName": "宁德时代", "price": 245.0, "change": 3.2, "volume": 50000000},
                    {"stockCode": "sh688981", "stockName": "中芯国际", "price": 58.0, "change": 4.1, "volume": 80000000},
                    {"stockCode": "sz002594", "stockName": "比亚迪", "price": 185.0, "change": 1.8, "volume": 35000000},
                    {"stockCode": "sh601318", "stockName": "中国平安", "price": 48.0, "change": 2.1, "volume": 42000000},
                    {"stockCode": "sh600276", "stockName": "恒瑞医药", "price": 45.0, "change": -1.5, "volume": 28000000},
                    {"stockCode": "sz300059", "stockName": "东方财富", "price": 16.5, "change": -2.3, "volume": 65000000},
                    {"stockCode": "sh600036", "stockName": "招商银行", "price": 35.0, "change": 1.2, "volume": 30000000},
                    {"stockCode": "sz000858", "stockName": "五粮液", "price": 156.0, "change": 2.8, "volume": 18000000},
                    {"stockCode": "sh688008", "stockName": "澜起科技", "price": 89.0, "change": 3.5, "volume": 15000000},
                ]
            }
    return fetch_with_cache("top_stocks", fetch)

COMMON_STOCKS = [
    {"code": "600519", "name": "贵州茅台", "market": "沪市"},
    {"code": "688981", "name": "中芯国际", "market": "沪市"},
    {"code": "601398", "name": "工商银行", "market": "沪市"},
    {"code": "600036", "name": "招商银行", "market": "沪市"},
    {"code": "601318", "name": "中国平安", "market": "沪市"},
    {"code": "600276", "name": "恒瑞医药", "market": "沪市"},
    {"code": "300750", "name": "宁德时代", "market": "深市"},
    {"code": "002594", "name": "比亚迪", "market": "深市"},
    {"code": "300059", "name": "东方财富", "market": "深市"},
    {"code": "000858", "name": "五粮液", "market": "深市"},
    {"code": "688008", "name": "澜起科技", "market": "沪市"},
    {"code": "002371", "name": "北方华创", "market": "深市"},
    {"code": "688256", "name": "寒武纪", "market": "沪市"},
]

def search_stocks(keyword):
    keyword_lower = keyword.lower()
    results = []
    for stock in COMMON_STOCKS:
        if (keyword_lower in stock["name"].lower() or 
            keyword_lower in stock["code"] or
            keyword_lower in stock["name"].lower().replace(" ", "")):
            results.append(stock)
    if not results and len(keyword) >= 2:
        for stock in COMMON_STOCKS[:5]:
            results.append(stock)
    return results[:10]

class RiskPreference(BaseModel):
    high: int = 40
    medium: int = 35
    low: int = 25

class AIConclusionRequest(BaseModel):
    code: str
    riskPreference: RiskPreference = None

@app.get("/api/health")
async def health_check():
    return {
        "status": "healthy",
        "version": "2.0.0",
        "data_source": "AKShare",
        "timestamp": datetime.now().isoformat()
    }

@app.get("/api/v1/stocks/quote")
async def get_stock_quotes(codes: str = Query(None)):
    if not codes:
        raise HTTPException(status_code=400, detail="缺少codes参数")
    
    code_list = [c.strip() for c in codes.split(',') if c.strip()]
    quotes = []
    
    for code in code_list:
        data = get_stock_quote(code)
        if data and data['current'] > 0:
            prev_close = data['prev_close']
            current = data['current']
            change = current - prev_close
            change_pct = round(((current - prev_close) / prev_close * 100), 2) if prev_close else 0
            quotes.append({
                "code": code,
                "name": data['name'],
                "price": current,
                "change": change,
                "changePercent": change_pct,
                "volume": data['volume'],
                "amount": data['volume'] * current,
                "high": data['high'],
                "low": data['low'],
                "open": data['open'],
                "prevClose": prev_close,
                "updateTime": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            })
    
    return {"code": 0, "message": "success", "data": {"quotes": quotes}}

@app.get("/api/v1/stocks/search")
async def search_stock(keyword: str = Query(None)):
    if not keyword:
        raise HTTPException(status_code=400, detail="缺少keyword参数")
    
    stocks = search_stocks(keyword)
    return {"code": 0, "message": "success", "data": {"stocks": stocks}}

def calculate_risk_coefficient(risk_preference):
    if not risk_preference:
        return 1.0
    
    high = risk_preference.high if risk_preference.high else 40
    low = risk_preference.low if risk_preference.low else 25
    
    coefficient = 1.0 + (high - low) * 0.005
    coefficient = max(0.7, min(1.4, coefficient))
    
    return coefficient

def map_score_to_conclusion(adjusted_score):
    if adjusted_score >= 80:
        return 4, '强烈推荐', adjusted_score
    elif adjusted_score >= 65:
        return 3, '推荐', adjusted_score
    elif adjusted_score >= 50:
        return 0, '中性', adjusted_score
    elif adjusted_score >= 35:
        return -2, '谨慎', adjusted_score
    else:
        return -4, '回避', adjusted_score

@app.post("/api/v1/stocks/ai-conclusion")
async def get_ai_conclusion(request: AIConclusionRequest):
    code = request.code
    clean_code = code.replace('sh', '').replace('sz', '')
    risk_preference = request.riskPreference
    
    normalized_code = code
    if not (code.startswith('sh') or code.startswith('sz')):
        normalized_code = f"sh{code}" if code.startswith('6') else f"sz{code}"
    
    quote = get_stock_quote(normalized_code)
    
    if quote and quote['current'] > 0:
        change = round(((quote['current'] - quote['prev_close']) / quote['prev_close'] * 100), 2) if quote['prev_close'] else 0
        name = quote['name']
        
        risk_coefficient = calculate_risk_coefficient(risk_preference)
        
        base_score = 50
        signals = []
        
        if change > 3:
            base_score += 35
            signals.append({"type": "技术面", "signal": "涨幅较大", "score": 15})
        elif change > 0:
            base_score += 20
            signals.append({"type": "技术面", "signal": "小幅上涨", "score": 10})
        elif change > -3:
            base_score += 0
        elif change > -6:
            base_score -= 15
            signals.append({"type": "技术面", "signal": "小幅下跌", "score": -10})
        else:
            base_score -= 30
            signals.append({"type": "技术面", "signal": "跌幅较大", "score": -15})
        
        if quote['current'] > quote['open']:
            base_score += 10
            signals.append({"type": "技术面", "signal": "价格高于开盘", "score": 10})
        else:
            base_score -= 5
        
        if quote['volume'] > 100000000:
            base_score += 5
            signals.append({"type": "资金面", "signal": "成交量活跃", "score": 8})
        
        market_score = abs(change * 2)
        if change > 0:
            base_score += int(market_score)
        else:
            base_score -= int(market_score)
        signals.append({"type": "市场面", "signal": f"今日变动{change:.2f}%", "score": abs(int(change * 2))})
        
        base_score = max(0, min(100, base_score))
        
        adjusted_score = round(base_score * risk_coefficient)
        adjusted_score = max(0, min(100, adjusted_score))
        
        level, label, final_score = map_score_to_conclusion(adjusted_score)
        
        preference_label = ""
        if risk_preference:
            if risk_preference.high > 60:
                preference_label = "（进取型）"
            elif risk_preference.low > 40:
                preference_label = "（稳健型）"
            else:
                preference_label = "（均衡型）"
        
        explanation = f"{name}今日{'上涨' if change > 0 else '下跌' if change < 0 else '持平'}{abs(change):.2f}%"
        if change > 0:
            explanation += "，走势偏强"
        else:
            explanation += "，需注意风险"
        
        conclusion = {
            "level": level, "label": label, "score": final_score,
            "explanation": explanation,
            "riskPreferenceLabel": preference_label,
            "riskCoefficient": round(risk_coefficient, 2),
            "signals": signals, 
            "riskTips": "市场有风险，投资需谨慎。AI分析仅供参考，不构成投资建议。"
        }
    else:
        name = clean_code
        conclusion = {
            "level": 0, "label": "暂无数据", "score": 50,
            "explanation": "暂时无法获取该股票数据，请稍后重试",
            "riskPreferenceLabel": "",
            "riskCoefficient": 1.0,
            "signals": [],
            "riskTips": "市场有风险，投资需谨慎"
        }
    
    return {"code": 0, "message": "success", "data": {
        "code": code, "name": name, "conclusion": conclusion,
        "generatedAt": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    }}

@app.get("/api/v1/stocks/ai-conclusion")
async def get_ai_conclusion_get(code: str = Query(None), high: int = Query(40), medium: int = Query(35), low: int = Query(25)):
    if not code:
        raise HTTPException(status_code=400, detail="缺少code参数")
    
    risk_pref = RiskPreference(high=high, medium=medium, low=low)
    request = AIConclusionRequest(code=code, riskPreference=risk_pref)
    
    return await get_ai_conclusion(request)

@app.get("/api/opportunities")
async def get_opportunities():
    top_stocks_data = get_top_stocks()
    top_gainers = top_stocks_data.get("gainers", [])
    
    opportunities = []
    if top_gainers:
        stock_list = [{
            "code": s['stockCode'].replace('sh', '').replace('sz', ''),
            "name": s['stockName'],
            "change": s['change'],
            "relevance": 0.9
        } for s in top_gainers[:5]]
        
        hot_names = "、".join([s['stockName'] for s in top_gainers[:3]])
        desc = f"A股交投活跃，{hot_names}等个股表现强势"
        
        avg_change = sum(s['change'] for s in top_gainers[:3]) / 3 if top_gainers[:3] else 0
        heat = min(100, int(60 + avg_change * 5))
        score_val = min(5, max(1, 3 + avg_change / 2))
        
        opportunities = [{
            "id": "opp_1",
            "topic": "市场活跃",
            "topicDescription": desc,
            "heatIndex": heat,
            "score": round(score_val, 1),
            "stocks": stock_list,
            "news": [
                {"id": "n1", "title": "A股市场活跃，多只个股表现强势", "source": "实时资讯", "time": "刚刚", "summary": "今日A股市场整体表现活跃，热门板块持续发力"}
            ],
            "drivers": ["市场情绪回暖", "资金流入明显"],
            "updatedAt": "刚刚"
        }]
    
    return opportunities

@app.get("/api/anomalies")
async def get_anomalies():
    top_stocks_data = get_top_stocks()
    all_stocks = top_stocks_data.get("all", [])
    anomalies = []
    
    for stock in all_stocks:
        if abs(stock['change']) > 1:
            is_up = stock['change'] > 0
            anomalies.append({
                "id": f"anomaly_{stock['stockCode']}",
                "stockName": stock['stockName'],
                "stockCode": stock['stockCode'].replace('sh', '').replace('sz', ''),
                "type": "price",
                "change": stock['change'],
                "time": datetime.now().strftime('%H:%M:%S'),
                "newsCount": 1,
                "news": [
                    {"id": f"an_{stock['stockCode']}", "title": f"{stock['stockName']}{'大幅上涨' if is_up else '出现下跌'}", "source": "实时资讯", "time": "刚刚", "summary": ""}
                ],
                "aiInsight": f"{stock['stockName']}今日{'涨幅' if is_up else '跌幅'}{abs(stock['change']):.2f}%，{'表现强势' if is_up else '需要注意风险'}，建议{'关注' if is_up else '谨慎'}。",
                "hasNews": True
            })
    
    return anomalies

@app.get("/api/review")
async def get_review():
    indices = get_indices() or []
    top_stocks_data = get_top_stocks()
    top_gainers = top_stocks_data.get("gainers", [])
    
    hot_sectors = []
    sector_map = {
        "600519": ("白酒", ["贵州茅台"]),
        "sh600519": ("白酒", ["贵州茅台"]),
        "601398": ("银行", ["工商银行"]),
        "sh601398": ("银行", ["工商银行"]),
        "600036": ("银行", ["招商银行"]),
        "sh600036": ("银行", ["招商银行"]),
        "000858": ("白酒", ["五粮液"]),
        "sz000858": ("白酒", ["五粮液"]),
        "002594": ("新能源车", ["比亚迪"]),
        "sz002594": ("新能源车", ["比亚迪"]),
        "300750": ("新能源车", ["宁德时代"]),
        "sz300750": ("新能源车", ["宁德时代"]),
        "688981": ("半导体", ["中芯国际"]),
        "sh688981": ("半导体", ["中芯国际"]),
        "601318": ("保险", ["中国平安"]),
        "sh601318": ("保险", ["中国平安"]),
        "688256": ("AI芯片", ["寒武纪"]),
        "sh688256": ("AI芯片", ["寒武纪"]),
    }
    
    seen_sectors = set()
    for g in top_gainers:
        code = g['stockCode']
        if code in sector_map:
            sector_name, leaders = sector_map[code]
            if sector_name not in seen_sectors:
                hot_sectors.append({
                    "name": sector_name,
                    "change": g['change'],
                    "driver": f"{g['stockName']}{'领涨' if g['change'] > 0 else '走弱'}",
                    "leaders": leaders
                })
                seen_sectors.add(sector_name)
                if len(hot_sectors) >= 3:
                    break
    
    if not hot_sectors and indices:
        hot_sectors = [
            {"name": "市场整体", "change": indices[0]['change'] if indices else 0, "driver": "市场情绪", "leaders": [s['stockName'] for s in top_gainers[:3]]}
        ]
    
    outlook_text = "市场活跃，关注热门板块机会" if indices and indices[0]['change'] > 0 else "市场偏弱，注意控制风险"
    
    return {
        "date": datetime.now().strftime("%Y-%m-%d"),
        "indices": [{"name": idx['name'], "value": idx['value'], "change": idx['change']} for idx in indices],
        "hotSectors": hot_sectors,
        "outlook": {
            "opportunities": [outlook_text, "关注成交量变化"] if indices and indices[0]['change'] > 0 else ["控制仓位", "等待企稳信号"],
            "risks": ["注意高位股票回调风险"] if any(s['change'] > 5 for s in top_gainers) else []
        },
        "portfolio": []
    }

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
