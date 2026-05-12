from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime

from api.src.routes import stocks, health

app = FastAPI(
    title="金融AI投资助手API",
    version="1.0.0",
    description="基于AKShare的股票行情和AI结论服务"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router, prefix="/api", tags=["健康检查"])
app.include_router(stocks.router, prefix="/api/v1/stocks", tags=["股票服务"])

@app.get("/")
async def root():
    return {
        "name": "金融AI投资助手API",
        "version": "1.0.0",
        "status": "running",
        "timestamp": datetime.now().isoformat()
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
