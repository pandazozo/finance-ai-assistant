import http.server
import socketserver
import json
import os
import urllib.request
from datetime import datetime

PORT = int(os.environ.get('PORT', 8000))

def get_stock_data():
    opportunities = []
    anomalies = []
    
    try:
        codes = "sh000001,sh000016,sh399001,sh399006"
        url = f"https://hq.sinajs.cn/list={codes}"
        req = urllib.request.Request(url, headers={
            'User-Agent': 'Mozilla/5.0',
            'Referer': 'https://finance.sina.com.cn'
        })
        
        with urllib.request.urlopen(req, timeout=10) as response:
            text = response.read().decode('gbk', errors='ignore')
            
            indices = []
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
                            indices.append({
                                "name": name,
                                "code": code,
                                "value": current,
                                "change": round(change, 2)
                            })
                        except:
                            pass
            
            return {"indices": indices}
            
    except Exception as e:
        print(f"获取数据失败: {e}")
        return {"indices": [], "error": str(e)}

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
        
        if self.path == '/api/health':
            response = {"status": "ok", "message": "服务运行正常", "time": datetime.now().isoformat()}
        elif self.path == '/api/opportunities':
            response = [{"id": "idx_1", "topic": "市场概览", "topicDescription": "主要指数涨跌情况", "heatIndex": 75}]
        elif self.path == '/api/anomalies':
            response = [{"id": "anomaly_1", "stockName": "市场指数", "stockCode": "sh000001", "type": "index", "change": 0.5}]
        elif self.path == '/api/review':
            indices = real_data.get("indices", [])
            response = {
                "date": datetime.now().strftime("%Y-%m-%d"),
                "indices": indices if indices else [{"name": "上证指数", "value": 3200, "change": 0.5}]
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
