# 金融AI投资助手 API

基于 AKShare 的后端数据服务，为前端提供实时行情、异动监控、复盘报告等数据。

## 快速启动

```bash
cd api
pip install -r requirements.txt
python -m uvicorn src.main:app --host 0.0.0.0 --port 8000 --reload
```

或使用启动脚本：

```bash
chmod +x start.sh
./start.sh
```

## API 接口

| 接口 | 方法 | 说明 |
|-----|------|------|
| `/api/opportunities` | GET | 获取投资机会列表 |
| `/api/anomalies` | GET | 获取异动列表（支持 type 参数过滤） |
| `/api/review` | GET | 获取复盘报告 |
| `/api/quotes` | GET | 获取实时行情 |
| `/api/search` | GET | 搜索股票 |
| `/api/sectors` | GET | 获取热门板块 |
| `/api/news` | GET | 获取新闻 |
| `/health` | GET | 健康检查 |

## API 文档

启动服务后访问：http://localhost:8000/docs

## 数据源

- **AKShare**: 实时行情、历史数据、资金流向、板块数据
- **东方财富**: 新闻资讯

## 注意

- 后端服务需要运行在能访问互联网的环境中
- 实时行情数据来自东方财富等公开接口
- 建议使用缓存避免频繁请求
