from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="金融AI投资助手API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "金融AI投资助手API"}

@app.get("/api/health")
async def health_check():
    return {"status": "ok", "timestamp": 1234567890}

@app.get("/api/opportunities")
async def get_opportunities():
    return [
        {
            "id": "opp_1",
            "topic": "AI芯片",
            "topicDescription": "AI芯片板块今日表现活跃",
            "heatIndex": 85,
            "score": 4.5,
            "stocks": [
                {"code": "688981", "name": "中芯国际", "change": 5.2, "relevance": 0.9},
                {"code": "688256", "name": "寒武纪", "change": 8.3, "relevance": 0.85}
            ],
            "news": [],
            "drivers": ["AI需求增长", "政策支持"],
            "updatedAt": "刚刚"
        }
    ]

@app.get("/api/anomalies")
async def get_anomalies():
    return [
        {
            "id": "anomaly_1",
            "stockName": "宁德时代",
            "stockCode": "300750",
            "type": "price",
            "change": 6.5,
            "time": "14:30:00",
            "newsCount": 2,
            "news": [],
            "aiInsight": "大幅上涨",
            "hasNews": True
        }
    ]

@app.get("/api/review")
async def get_review():
    return {
        "date": "2024-01-15",
        "indices": [
            {"name": "上证指数", "value": 3200.0, "change": 0.5},
            {"name": "深证成指", "value": 10000.0, "change": -0.3}
        ],
        "hotSectors": [
            {"name": "AI芯片", "change": 5.2, "driver": "英伟达业绩", "leaders": ["寒武纪"]}
        ],
        "outlook": {
            "opportunities": ["关注AI板块"],
            "risks": ["控制仓位"]
        },
        "portfolio": []
    }

@app.get("/api/search")
async def search_stocks(keyword: str):
    return [
        {"code": "300750", "name": "宁德时代"},
        {"code": "688981", "name": "中芯国际"}
    ]

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
