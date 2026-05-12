import http.server
import socketserver
import json
import os
import urllib.request
from urllib.parse import unquote, parse_qs
from datetime import datetime

PORT = int(os.environ.get('PORT', 8000))

def get_stock_data():
    all_data = {"indices": [], "top_gainers": [], "top_losers": []}
    
    try:
        indices_codes = "sh000001,sh000016,sh399001,sh399006,sh399005"
        indices_url = f"https://hq.sinajs.cn/list={indices_codes}"
        req = urllib.request.Request(indices_url, headers={
            'User-Agent': 'Mozilla/5.0',
            'Referer': 'https://finance.sina.com.cn'
        })
        
        with urllib.request.urlopen(req, timeout=10) as response:
            text = response.read().decode('gbk', errors='ignore')
            
            for line in text.strip().split('\n'):
                if '=' in line:
                    code = line.split('=')[0].split('_')[-1].strip('"')
                    parts = line.split('"')[1].split(',')
                    if len(parts) > 4:
                        try:
                            name = parts[0]
                            prev_close = float(parts[2])
                            current = float(parts[3])
                            change = ((current - prev_close) / prev_close * 100) if prev_close else 0
                            all_data["indices"].append({
                                "name": name,
                                "code": code,
                                "value": current,
                                "change": round(change, 2)
                            })
                        except:
                            pass
        
        gainers_url = "https://hq.sinajs.cn/list=sh600519,sh688981,sh601398,sz000300,sz002594,sz300059"
        gainers_req = urllib.request.Request(gainers_url, headers={
            'User-Agent': 'Mozilla/5.0',
            'Referer': 'https://finance.sina.com.cn'
        })
        
        with urllib.request.urlopen(gainers_req, timeout=10) as response:
            text = response.read().decode('gbk', errors='ignore')
            
            lines = text.strip().split('\n')
            codes_list = ["sh600519", "sh688981", "sh601398", "sz000300", "sz002594", "sz300059"]
            
            for i, line in enumerate(lines):
                if '=' in line and i < len(codes_list):
                    raw_code = codes_list[i]
                    parts = line.split('"')[1].split(',')
                    if len(parts) > 4:
                        try:
                            name = parts[0]
                            prev_close = float(parts[2])
                            current = float(parts[3])
                            change = round(((current - prev_close) / prev_close * 100), 2) if prev_close else 0
                            
                            stock = {
                                "id": f"stock_{raw_code}",
                                "stockName": name,
                                "stockCode": raw_code,
                                "price": current,
                                "change": change
                            }
                            
                            if change > 0:
                                all_data["top_gainers"].append(stock)
                            elif change < 0:
                                all_data["top_losers"].append(stock)
                        except:
                            pass
            
            all_data["top_gainers"].sort(key=lambda x: x["change"], reverse=True)
            all_data["top_losers"].sort(key=lambda x: x["change"])
            all_data["top_gainers"] = all_data["top_gainers"][:5]
            all_data["top_losers"] = all_data["top_losers"][:5]
            
    except Exception as e:
        print(f"获取数据失败: {e}")
    
    return all_data

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
            name = '贵州茅台' if code in ['600519', 'sh600519'] else '中芯国际' if code in ['688981'] else '未知'
            level = 3 if code in ['600519', 'sh600519', '601398'] else -3
            label = '推荐' if level > 0 else '谨慎'
            score = 78 if level > 0 else 42
            signals = [
                {"type": "技术面", "signal": "突破均线", "score": 20},
                {"type": "资金面", "signal": "资金流入", "score": 15}
            ]
            conclusion = {
                "level": level, "label": label, "score": score,
                "explanation": f"{name}当前走势{'较强' if level > 0 else '偏弱'}，建议{'关注' if level > 0 else '谨慎'}",
                "signals": signals, "riskTips": "市场有风险，投资需谨慎"
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
        
        real_data = get_stock_data()
        indices = real_data.get("indices", [])
        top_gainers = real_data.get("top_gainers", [])
        
        if self.path == '/api/health':
            response = {"status": "healthy", "version": "1.0.0", "timestamp": datetime.now().isoformat()}
        elif self.path.startswith('/api/v1/stocks/quote'):
            codes_str = self.path.split('codes=')[-1] if 'codes=' in self.path else ''
            codes = codes_str.split(',')
            quotes = []
            for c in codes:
                code = c.strip()
                if code in ['sh600519', '600519']:
                    quotes.append({
                        "code": "600519", "name": "贵州茅台", "price": 1850.00, "change": 42.50,
                        "changePercent": 2.35, "volume": 1234567, "amount": 1234567890.00,
                        "high": 1860.00, "low": 1820.00, "open": 1820.00,
                        "prevClose": 1807.50, "updateTime": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
                    })
                elif code in ['sh688981', '688981']:
                    quotes.append({
                        "code": "688981", "name": "中芯国际", "price": 38.25, "change": -2.10,
                        "changePercent": -5.20, "volume": 8765432, "amount": 334123456.00,
                        "high": 40.00, "low": 37.80, "open": 40.00,
                        "prevClose": 40.35, "updateTime": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
                    })
                elif code in ['sh601398', '601398']:
                    quotes.append({
                        "code": "601398", "name": "工商银行", "price": 6.20, "change": 0.20,
                        "changePercent": 3.33, "volume": 34567890, "amount": 214330080.00,
                        "high": 6.25, "low": 6.00, "open": 6.00,
                        "prevClose": 6.00, "updateTime": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
                    })
            response = {"code": 0, "message": "success", "data": {"quotes": quotes}}
        elif self.path.startswith('/api/v1/stocks/search'):
            query_str = self.path.split('?')[1] if '?' in self.path else ''
            query_params = parse_qs(query_str)
            keyword_raw = query_params.get('keyword', [''])[0]
            keyword = unquote(keyword_raw)
            stocks = []
            if '茅台' in keyword or '600519' in keyword:
                stocks.append({"code": "600519", "name": "贵州茅台", "market": "沪市"})
            if '中芯' in keyword or '688981' in keyword:
                stocks.append({"code": "688981", "name": "中芯国际", "market": "沪市"})
            if '工商' in keyword or '601398' in keyword:
                stocks.append({"code": "601398", "name": "工商银行", "market": "沪市"})
            if not stocks:
                stocks = [
                    {"code": "600519", "name": "贵州茅台", "market": "沪市"},
                    {"code": "688981", "name": "中芯国际", "market": "沪市"},
                    {"code": "601398", "name": "工商银行", "market": "沪市"}
                ]
            response = {"code": 0, "message": "success", "data": {"stocks": stocks}}
        elif self.path.startswith('/api/v1/stocks/ai-conclusion'):
            query_str = self.path.split('?')[1] if '?' in self.path else ''
            query_params = parse_qs(query_str)
            code = query_params.get('code', [''])[0]
            name = '贵州茅台' if code in ['600519', 'sh600519'] else '中芯国际' if code in ['688981'] else '未知'
            level = 3 if code in ['600519', 'sh600519', '601398'] else -3
            label = '推荐' if level > 0 else '谨慎'
            score = 78 if level > 0 else 42
            signals = [
                {"type": "技术面", "signal": "突破均线", "score": 20},
                {"type": "资金面", "signal": "资金流入", "score": 15}
            ]
            conclusion = {
                "level": level, "label": label, "score": score,
                "explanation": f"{name}今日表现强势，建议关注",
                "signals": signals, "riskTips": "风险偏好适中，建议控制仓位"
            }
            response = {"code": 0, "message": "success", "data": {
                "code": code, "name": name, "conclusion": conclusion,
                "generatedAt": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            }}
        elif self.path == '/api/opportunities':
            stock_list = []
            for stock in top_gainers:
                stock_list.append({
                    "code": stock['stockCode'],
                    "name": stock['stockName'],
                    "change": stock['change'],
                    "relevance": 0.9
                })
            
            desc = "A股交投活跃，" + "、".join([s['stockName'] for s in top_gainers[:3]]) + "等个股表现强势"
            
            opportunities = [{
                "id": "opp_1",
                "topic": "市场活跃",
                "topicDescription": desc,
                "heatIndex": 85,
                "score": 4.2,
                "stocks": stock_list,
                "news": [
                    {"id": "n1", "title": "A股交投活跃，上证指数上涨", "source": "财经网", "time": "刚刚", "summary": "今日A股市场整体表现强势，各大指数普遍上涨"}
                ],
                "drivers": ["市场情绪回暖", "资金流入明显"],
                "updatedAt": "刚刚"
            }]
            response = opportunities
        elif self.path == '/api/anomalies':
            anomalies = []
            for stock in top_gainers:
                if abs(stock['change']) > 1:
                    anomalies.append({
                        "id": f"anomaly_{stock['stockCode']}",
                        "stockName": stock['stockName'],
                        "stockCode": stock['stockCode'],
                        "type": "price",
                        "change": stock['change'],
                        "time": datetime.now().strftime('%H:%M:%S'),
                        "newsCount": 1,
                        "news": [
                            {"id": "an1", "title": f"{stock['stockName']}今日表现强势", "source": "实时资讯", "time": "刚刚", "summary": ""}
                        ],
                        "aiInsight": f"{stock['stockName']}今日涨幅{stock['change']:.2f}%，表现强势",
                        "hasNews": True
                    })
            if not anomalies and indices:
                for idx in indices[:2]:
                    if abs(idx['change']) > 0.3:
                        anomalies.append({
                            "id": f"anomaly_{idx['code']}",
                            "stockName": idx['name'],
                            "stockCode": idx['code'],
                            "type": "index",
                            "change": idx['change'],
                            "time": datetime.now().strftime('%H:%M:%S'),
                            "newsCount": 0,
                            "news": [],
                            "aiInsight": f"{idx['name']}今日变动{idx['change']:.2f}%",
                            "hasNews": False
                        })
            response = anomalies
        elif self.path == '/api/review':
            response = {
                "date": datetime.now().strftime("%Y-%m-%d"),
                "indices": [{"name": idx['name'], "value": idx['value'], "change": idx['change']} for idx in indices],
                "hotSectors": [
                    {"name": "金融", "change": 2.5, "driver": "市场情绪回暖", "leaders": ["贵州茅台", "工商银行"]}
                ],
                "outlook": {
                    "opportunities": ["市场情绪回暖，关注强势板块"],
                    "risks": []
                },
                "portfolio": []
            }
        else:
            response = {"message": "金融AI投资助手API", "data": real_data}
        
        self.wfile.write(json.dumps(response, ensure_ascii=False).encode('utf-8'))
    
    def log_message(self, format, *args):
        pass

print(f"启动服务器，端口: {PORT}")
print("获取真实股票数据...")
socketserver.TCPServer.allow_reuse_address = True
with socketserver.TCPServer(('0.0.0.0', PORT), Handler) as httpd:
    httpd.serve_forever()
