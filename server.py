import http.server
import socketserver
import json
import os

PORT = int(os.environ.get('PORT', 8000))

class Handler(http.server.BaseHTTPRequestHandler):
    def do_GET(self):
        self.send_response(200)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        
        if self.path == '/api/health':
            response = {"status": "ok", "message": "服务运行正常"}
        elif self.path == '/api/opportunities':
            response = [{"id": "opp_1", "topic": "AI芯片", "topicDescription": "AI芯片板块今日表现活跃", "heatIndex": 85}]
        elif self.path == '/api/anomalies':
            response = [{"id": "anomaly_1", "stockName": "宁德时代", "stockCode": "300750", "type": "price", "change": 6.5}]
        elif self.path == '/api/review':
            response = {"date": "2024-01-15", "indices": [{"name": "上证指数", "value": 3200.0, "change": 0.5}]}
        else:
            response = {"message": "金融AI投资助手API"}
        
        self.wfile.write(json.dumps(response).encode())

print(f"启动服务器，端口: {PORT}")
socketserver.TCPServer.allow_reuse_address = True
with socketserver.TCPServer(('0.0.0.0', PORT), Handler) as httpd:
    httpd.serve_forever()