import http.server
import socketserver
import json
import os
from datetime import datetime

PORT = int(os.environ.get('PORT', 8000))

def get_stock_data():
    try:
        import akshare as ak
        
        opportunities = []
        anomalies = []
        
        try:
            stock_zh_a_spot_em = ak.stock_zh_a_spot_em()
            top_stocks = stock_zh_a_spot_em.nlargest(10, '涨跌幅')
            
            for idx, row in top_stocks.iterrows():
                change = float(row['涨跌幅']) if pd.notna(row['涨跌幅']) else 0
                opportunities.append({
                    "id": f"opp_{row['代码']}",
                    "topic": row['名称'],
                    "topicDescription": f"{row['名称']} 今日涨幅 {change:.2f}%",
                    "heatIndex": int(min(abs(change) * 10, 100))
                })
                
                if abs(change) > 5:
                    anomalies.append({
                        "id": f"anomaly_{row['代码']}",
                        "stockName": row['名称'],
                        "stockCode": row['代码'],
                        "type": "price",
                        "change": change
                    })
        except Exception as e:
            print(f"获取A股数据失败: {e}")
            
        return {
            "opportunities": opportunities[:5] if opportunities else [],
            "anomalies": anomalies[:10] if anomalies else []
        }
    except ImportError:
        return {"opportunities": [], "anomalies": [], "error": "akshare未安装"}
    except Exception as e:
        return {"opportunities": [], "anomalies": [], "error": str(e)}

class Handler(http.server.BaseHTTPRequestHandler):
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
    
    def do_GET(self):
        self.send_response(200)
        self.send_header('Content-Type', 'application/json')
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
                "indices": [
                    {"name": "上证指数", "value": 3200.0 + (datetime.now().hour - 9) * 5, "change": 0.5}
                ]
            }
        else:
            response = {"message": "金融AI投资助手API", "data": real_data}
        
        self.wfile.write(json.dumps(response, ensure_ascii=False).encode('utf-8'))
    
    def log_message(self, format, *args):
        print(f"{self.address_string()} - [{self.log_date_time_string()}] {format % args}")

print(f"启动服务器，端口: {PORT}")
print("正在获取真实股票数据...")
socketserver.TCPServer.allow_reuse_address = True
with socketserver.TCPServer(('0.0.0.0', PORT), Handler) as httpd:
    httpd.serve_forever()
