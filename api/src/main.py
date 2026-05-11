from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routes import stocks_router
from .config import get_settings

settings = get_settings()

app = FastAPI(
    title=settings.app_name,
    description="金融AI投资助手数据API",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(stocks_router)

@app.get("/")
async def root():
    return {
        "message": "金融AI投资助手API",
        "version": "1.0.0",
        "docs": "/docs"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host=settings.host, port=settings.port)
