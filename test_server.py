#!/usr/bin/env python3
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
            response = {"status": "ok", "message": "测试服务器运行正常"}
        else:
            response = {"message": "金融AI投资助手 - 测试服务器"}
        
        self.wfile.write(json.dumps(response).encode())

print(f"启动测试服务器，端口: {PORT}")
socketserver.TCPServer.allow_reuse_address = True
with socketserver.TCPServer(('0.0.0.0', PORT), Handler) as httpd:
    httpd.serve_forever()