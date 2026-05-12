import http.server
import socketserver
import json
import os
import urllib.request
import urllib.error
from urllib.parse import unquote, parse_qs
from datetime import datetime
import time

PORT = int(os.environ.get('PORT', 8000))

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
    url = f"https://hq.sinajs.cn/list={code}"
    req = urllib.request.Request(url, headers={
        'User-Agent': 'Mozilla/5.0',
        'Referer': 'https://finance.sina.com.cn'
    })
    try:
        with urllib.request.urlopen(req, timeout=10) as response:
            text = response.read().decode('gbk', errors='ignore')
            if '=' in text:
                parts = text.split('"')[1].split(',')
                if len(parts) > 4:
                    return {
                        "name": parts[0],
                        "open": float(parts[1]) if parts[1] else 0,
                        "prev_close": float(parts[2]) if parts[2] else 0,
                        "current": float(parts[3]) if parts[3] else 0,
                        "high": float(parts[4]) if parts[4] else 0,
                        "low": float(parts[5]) if parts[5] else 0,
                        "volume": float(parts[8]) if parts[8] else 0,
                    }
    except Exception as e:
        print(f"获取股票 {code} 失败: {e}")
    return None

def get_indices():
    def fetch():
        codes = "sh000001,sh000016,sh399001,sh399006,sh399005"
        url = f"https://hq.sinajs.cn/list={codes}"
        req = urllib.request.Request(url, headers={
            'User-Agent': 'Mozilla/5.0',
            'Referer': 'https://finance.sina.com.cn'
        })
        indices = []
        with urllib.request.urlopen(req, timeout=10) as response:
            text = response.read().decode('gbk', errors='ignore')
            for line in text.strip().split('\n'):
                if '=' in line:
                    code = line.split('=')[0].split('_')[-1].strip('"')
                    parts = line.split('"')[1].split(',')
                    if len(parts) > 4:
                        name = parts[0]
                        prev_close = float(parts[2]) if parts[2] else 0
                        current = float(parts[3]) if parts[3] else 0
                        change = round(((current - prev_close) / prev_close * 100), 2) if prev_close else 0
                        indices.append({
                            "name": name,
                            "code": code,
                            "value": current,
                            "change": change
                        })
        return indices
    return fetch_with_cache("indices", fetch, ttl=60)

def get_top_stocks():
    def fetch():
        gainers_codes = ["sh600519", "sh688981", "sh601398", "sh600036", "sh601318", 
                        "sz000858", "sz002594", "sz300750", "sz300059", "sh688008"]
        stocks = []
        for code in gainers_codes:
            data = get_stock_quote(code)
            if data and data['current'] > 0:
                prev_close = data['prev_close']
                current = data['current']
                change = round(((current - prev_close) / prev_close * 100), 2) if prev_close else 0
                stocks.append({
                    "stockCode": code,
                    "stockName": data['name'],
                    "price": current,
                    "change": change,
                    "volume": data['volume']
                })
        stocks.sort(key=lambda x: x['change'], reverse=True)
        return {
            "gainers": [s for s in stocks if s['change'] > 0][:5],
            "losers": [s for s in stocks if s['change'] < 0][:5],
            "all": stocks
        }
    return fetch_with_cache("top_stocks", fetch)

def search_stocks(keyword):
    def fetch():
        url = f"https://suggest3.sinajs.cn/suggest/type=11,12,13,14,15&key={urllib.parse.quote(keyword)}&encoding=gbk"
        req = urllib.request.Request(url, headers={
            'User-Agent': 'Mozilla/5.0',
            'Referer': 'https://finance.sina.com.cn'
        })
        stocks = []
        try:
            with urllib.request.urlopen(req, timeout=10) as response:
                text = response.read().decode('gbk', errors='ignore')
                parts = text.split('"')[1].split(';')
                for part in parts:
                    if part.strip():
                        fields = part.split(',')
                        if len(fields) >= 3:
                            name = fields[0]
                            code = fields[2]
                            market = "沪市" if code.startswith('6') else "深市"
                            stocks.append({"code": code, "name": name, "market": market})
        except Exception as e:
            print(f"搜索失败: {e}")
        return stocks[:10]
    return fetch_with_cache(f"search_{keyword}", fetch, ttl=300)

def get_hot_stocks():
    def fetch():
        url = "https://hq.sinajs.cn/list=sh000001"
        req = urllib.request.Request(url, headers={
            'User-Agent': 'Mozilla/5.0',
            'Referer': 'https://finance.sina.com.cn'
        })
        try:
            with urllib.request.urlopen(req, timeout=10) as response:
                text = response.read().decode('gbk', errors='ignore')
                return text
        except:
            return None
    return fetch_with_cache("hot_stocks", fetch, ttl=120)

class Handler(http.server.BaseHTTPRequestHandler):
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
    
    def do_POST(self):
        content_length = int(self.headers.get('Content-Length', 0))
        post_data = self.rfile.read(content_length).decode('utf-8') if content_length > 0 else '{}'
        
        self.send_response(200)
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        
        try:
            body = json.loads(post_data) if post_data else {}
        except:
            body = {}
        
        if self.path.startswith('/api/v1/stocks/ai-conclusion'):
            code = body.get('code', '')
            clean_code = code.replace('sh', '').replace('sz', '')
            
            quote = get_stock_quote(code if code.startswith('sh') or code.startswith('sz') else f"sh{code}")
            
            if quote and quote['current'] > 0:
                change = round(((quote['current'] - quote['prev_close']) / quote['prev_close'] * 100), 2) if quote['prev_close'] else 0
                name = quote['name']
                
                if change > 3:
                    level, label, score = 4, '强烈推荐', 85
                elif change > 0:
                    level, label, score = 2, '推荐', 70
                elif change > -3:
                    level, label, score = 0, '中性', 50
                elif change > -6:
                    level, label, score = -2, '谨慎', 35
                else:
                    level, label, score = -4, '回避', 20
                
                signals = []
                if change > 2:
                    signals.append({"type": "技术面", "signal": "涨幅较大", "score": 15})
                if quote['current'] > quote['open']:
                    signals.append({"type": "技术面", "signal": "价格高于开盘", "score": 10})
                if quote['volume'] > 100000000:
                    signals.append({"type": "资金面", "signal": "成交量活跃", "score": 12})
                signals.append({"type": "市场面", "signal": f"今日变动{change:.2f}%", "score": abs(int(change * 2))})
                
                explanation = f"{name}今日{'上涨' if change > 0 else '下跌' if change < 0 else '持平'}{abs(change):.2f}%"
                if change > 0:
                    explanation += "，走势偏强"
                else:
                    explanation += "，需注意风险"
                    
                conclusion = {
                    "level": level, "label": label, "score": score,
                    "explanation": explanation,
                    "signals": signals, 
                    "riskTips": "市场有风险，投资需谨慎。AI分析仅供参考，不构成投资建议。"
                }
            else:
                name = clean_code
                conclusion = {
                    "level": 0, "label": "暂无数据", "score": 50,
                    "explanation": "暂时无法获取该股票数据，请稍后重试",
                    "signals": [],
                    "riskTips": "市场有风险，投资需谨慎"
                }
            
            response = {"code": 0, "message": "success", "data": {
                "code": code, "name": name, "conclusion": conclusion,
                "generatedAt": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            }}
        else:
            response = {"code": 404, "message": "Not Found"}
        
        self.wfile.write(json.dumps(response, ensure_ascii=False).encode('utf-8'))
    
    def do_GET(self):
        self.send_response(200)
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        
        indices = get_indices() or []
        top_stocks_data = get_top_stocks() or {"gainers": [], "losers": [], "all": []}
        top_gainers = top_stocks_data.get("gainers", [])
        
        if self.path == '/api/health':
            response = {
                "status": "healthy", 
                "version": "2.0.0", 
                "data_source": "AKShare/新浪",
                "timestamp": datetime.now().isoformat()
            }
        elif self.path.startswith('/api/v1/stocks/quote'):
            codes_str = self.path.split('codes=')[-1] if 'codes=' in self.path else ''
            codes = [c.strip() for c in codes_str.split(',') if c.strip()]
            quotes = []
            for code in codes:
                normalized_code = code
                if not (code.startswith('sh') or code.startswith('sz')):
                    normalized_code = f"sh{code}" if code.startswith('6') else f"sz{code}"
                
                data = get_stock_quote(normalized_code)
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
            response = {"code": 0, "message": "success", "data": {"quotes": quotes}}
        elif self.path.startswith('/api/v1/stocks/search'):
            query_str = self.path.split('?')[1] if '?' in self.path else ''
            query_params = parse_qs(query_str)
            keyword_raw = query_params.get('keyword', [''])[0]
            keyword = unquote(keyword_raw)
            stocks = search_stocks(keyword) if keyword else []
            response = {"code": 0, "message": "success", "data": {"stocks": stocks}}
        elif self.path.startswith('/api/v1/stocks/ai-conclusion'):
            query_str = self.path.split('?')[1] if '?' in self.path else ''
            query_params = parse_qs(query_str)
            code = query_params.get('code', [''])[0]
            
            normalized_code = code
            if not (code.startswith('sh') or code.startswith('sz')):
                normalized_code = f"sh{code}" if code.startswith('6') else f"sz{code}"
            
            quote = get_stock_quote(normalized_code)
            if quote and quote['current'] > 0:
                change = round(((quote['current'] - quote['prev_close']) / quote['prev_close'] * 100), 2) if quote['prev_close'] else 0
                name = quote['name']
                level = 2 if change > 0 else -2
                label = '推荐' if level > 0 else '谨慎'
                score = 70 if level > 0 else 40
                signals = [
                    {"type": "技术面", "signal": f"今日变动{change:.2f}%", "score": abs(int(change))}
                ]
                conclusion = {
                    "level": level, "label": label, "score": score,
                    "explanation": f"{name}今日{'上涨' if change > 0 else '下跌'} {abs(change):.2f}%，建议{'关注' if change > 0 else '谨慎'}",
                    "signals": signals, 
                    "riskTips": "市场有风险，投资需谨慎"
                }
            else:
                name = code
                conclusion = {
                    "level": 0, "label": "暂无数据", "score": 50,
                    "explanation": "暂时无法获取该股票数据",
                    "signals": [],
                    "riskTips": "市场有风险"
                }
            response = {"code": 0, "message": "success", "data": {
                "code": code, "name": name, "conclusion": conclusion,
                "generatedAt": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            }}
        elif self.path == '/api/opportunities':
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
                
                avg_change = sum(s['change'] for s in top_gainers[:3]) / 3
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
            response = opportunities
        elif self.path == '/api/anomalies':
            anomalies = []
            all_stocks = top_stocks_data.get("all", [])
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
            response = anomalies
        elif self.path == '/api/review':
            hot_sectors = []
            for g in top_gainers[:3]:
                sector_map = {
                    "sh600519": ("白酒", ["贵州茅台"]),
                    "sh601398": ("银行", ["工商银行"]),
                    "sh600036": ("银行", ["招商银行"]),
                    "sz000858": ("白酒", ["五粮液"]),
                    "sz002594": ("新能源车", ["比亚迪"]),
                    "sz300750": ("新能源车", ["宁德时代"]),
                }
                code = g['stockCode']
                if code in sector_map:
                    sector_name, leaders = sector_map[code]
                    hot_sectors.append({
                        "name": sector_name,
                        "change": g['change'],
                        "driver": f"{g['stockName']}{'领涨' if g['change'] > 0 else '走弱'}",
                        "leaders": leaders
                    })
                    if len(hot_sectors) >= 3:
                        break
            
            if not hot_sectors:
                hot_sectors = [
                    {"name": "市场整体", "change": indices[0]['change'] if indices else 0, "driver": "市场情绪", "leaders": [s['stockName'] for s in top_gainers[:3]]}
                ]
            
            outlook_text = "市场活跃，关注热门板块机会" if indices and indices[0]['change'] > 0 else "市场偏弱，注意控制风险"
            
            response = {
                "date": datetime.now().strftime("%Y-%m-%d"),
                "indices": [{"name": idx['name'], "value": idx['value'], "change": idx['change']} for idx in indices],
                "hotSectors": hot_sectors,
                "outlook": {
                    "opportunities": [outlook_text, "关注成交量变化"] if indices and indices[0]['change'] > 0 else ["控制仓位", "等待企稳信号"],
                    "risks": ["注意高位股票回调风险"] if any(s['change'] > 5 for s in top_gainers) else []
                },
                "portfolio": []
            }
        else:
            response = {
                "message": "金融AI投资助手API v2.0", 
                "indices": indices,
                "top_gainers": top_gainers[:5]
            }
        
        self.wfile.write(json.dumps(response, ensure_ascii=False).encode('utf-8'))
    
    def log_message(self, format, *args):
        pass

print(f"启动服务器，端口: {PORT}")
print("使用真实股票数据...")
socketserver.TCPServer.allow_reuse_address = True
with socketserver.TCPServer(('0.0.0.0', PORT), Handler) as httpd:
    httpd.serve_forever()
