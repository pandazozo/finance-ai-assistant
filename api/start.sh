#!/bin/bash

echo "=========================================="
echo "  金融AI投资助手 - 后端服务启动脚本"
echo "=========================================="
echo ""

cd "$(dirname "$0")"

echo "[1/3] 检查Python环境..."
if ! command -v python3 &> /dev/null; then
    echo "错误: 未找到Python3，请先安装Python 3.8+"
    exit 1
fi
echo "✓ Python版本: $(python3 --version)"

echo ""
echo "[2/3] 安装依赖..."
pip3 install -r requirements.txt

echo ""
echo "[3/3] 启动API服务..."
echo "=========================================="
echo "  API文档地址: http://localhost:8000/docs"
echo "=========================================="
echo ""

python3 -m uvicorn src.main:app --host 0.0.0.0 --port 8000 --reload
