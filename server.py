import http.server
import socketserver
import json
import os
import urllib.request
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
            
            for line in text.strip().split('\n'):
                if '=' in line:
                    code_start = line.find('list=') + 5
                    code_part = line[code_start:line.find('=')]
                    raw_code = code_part.strip()
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
    
    def do_GET(self):
        self.send_response(200)
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        
        real_data = get_stock_data()
        indices = real_data.get("indices", [])
        top_gainers = real_data.get("top_gainers", [])
        
        if self.path == '/api/health':
            response = {"status": "ok", "message": "服务运行正常", "time": datetime.now().isoformat()}
        elif self.path == '/api/opportunities':
            stock_list = []
            for stock in top_gainers:
                stock_list.append({
                    "code": stock['stockCode'],
                    "name": stock['stockName'],
                    "change": stock['change'],
                    "relevance": 0.9
                })
            
            desc = "A股交投活跃，" + "、".join([s['name'] for s in top_gainers[:3]]) + "等个股表现强势"
            
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
