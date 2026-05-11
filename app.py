import http.server
import socketserver
import json
import os

class Handler(http.server.BaseHTTPRequestHandler):
    def do_GET(self):
        self.send_response(200)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        
        if self.path == '/api/health':
            response = {"status": "ok", "timestamp": 1234567890}
        elif self.path == '/api/opportunities':
            response = [{"id": "opp_1", "topic": "AI芯片", "topicDescription": "AI芯片板块今日表现活跃", "heatIndex": 85, "score": 4.5, "stocks": [{"code": "688981", "name": "中芯国际", "change": 5.2, "relevance": 0.9}], "news": [], "drivers": ["AI需求增长"], "updatedAt": "刚刚"}]
        elif self.path == '/api/anomalies':
            response = [{"id": "anomaly_1", "stockName": "宁德时代", "stockCode": "300750", "type": "price", "change": 6.5, "time": "14:30:00", "newsCount": 2, "news": [], "aiInsight": "大幅上涨", "hasNews": True}]
        elif self.path == '/api/review':
            response = {"date": "2024-01-15", "indices": [{"name": "上证指数", "value": 3200.0, "change": 0.5}], "hotSectors": [{"name": "AI芯片", "change": 5.2, "driver": "英伟达业绩", "leaders": ["寒武纪"]}], "outlook": {"opportunities": ["关注AI板块"], "risks": ["控制仓位"]}, "portfolio": []}
        elif self.path.startswith('/api/search'):
            keyword = self.path.split('=')[1] if '=' in self.path else ''
            stocks = [{"code": "300750", "name": "宁德时代"}, {"code": "688981", "name": "中芯国际"}, {"code": "002594", "name": "比亚迪"}]
            response = [s for s in stocks if keyword.lower() in s['name'].lower() or keyword in s['code']]
        else:
            response = {"message": "金融AI投资助手API"}
        
        self.wfile.write(json.dumps(response).encode())

if __name__ == '__main__':
    PORT = int(os.environ.get('PORT', 8000))
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(('0.0.0.0', PORT), Handler) as httpd:
        print(f'Server running on port {PORT}')
        httpd.serve_forever()