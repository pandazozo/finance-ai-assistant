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
        url = "http://push2.eastmoney.com/api/qt/clist/get?pn=1&pz=20&po=1&np=1&ut=bd1d9ddb04089700cf9c27f6f7426281&fltt=2&invt=2&fid=f3&fs=m:0+t:6,m:0+t:80,m:1+t:2,m:1+t:23&fields=f2,f3,f4,f12,f14&cb=jQuery&_=1"
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=10) as response:
            text = response.read().decode('utf-8')
            text = text.strip().lstrip('jQuery(').rstrip(');')
            data = json.loads(text)
            
            if data.get('data') and data['data'].get('diff'):
                for item in data['data']['diff'][:10]:
                    change = float(item.get('f3', 0) or 0)
                    if item.get('f2') and item.get('f12') and item.get('f14'):
                        opportunities.append({
                            "id": f"opp_{item['f12']}",
                            "topic": item['f14'],
                            "topicDescription": f"{item['f14']} 涨幅 {change:.2f}%",
                            "heatIndex": int(min(abs(change) * 5, 100))
                        })
                        if abs(change) > 5:
                            anomalies.append({
                                "id": f"anomaly_{item['f12']}",
                                "stockName": item['f14'],
                                "stockCode": item['f12'],
                                "type": "price",
                                "change": change
                            })
    except Exception as e:
        print(f"获取数据失败: {e}")
        opportunities = [{"id": "fallback", "topic": "数据获取中", "topicDescription": "请稍后刷新", "heatIndex": 50}]
    
    return {"opportunities": opportunities[:5], "anomalies": anomalies[:10]}

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
            response = real_data.get("opportunities", [])
        elif self.path == '/api/anomalies':
            response = real_data.get("anomalies", [])
        elif self.path == '/api/review':
            response = {
                "date": datetime.now().strftime("%Y-%m-%d"),
                "indices": [{"name": "上证指数", "value": 3200.5, "change": 0.35}]
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
