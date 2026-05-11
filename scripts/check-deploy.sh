#!/bin/bash

# ============================================
# 金融AI投资助手 - 部署自动化检查脚本
# ============================================

# 颜色定义
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}====================================${NC}"
echo -e "${GREEN}  金融AI投资助手 - 部署检查${NC}"
echo -e "${GREEN}====================================${NC}"
echo ""

# 后端配置
BACKEND_URL="https://finance-ai-assistant-production.up.railway.app"
FRONTEND_URL="https://illustrious-bonbon-069326.netlify.app"

# 检查状态变量
ALL_PASSED=true

# 1. 检查后端健康接口
echo -e "${YELLOW}[1/5] 检查后端健康接口...${NC}"
HEALTH_RESPONSE=$(curl -s "$BACKEND_URL/api/health" 2>&1)
if echo "$HEALTH_RESPONSE" | grep -q "status.*ok"; then
    echo -e "${GREEN}✓ 后端健康检查正常${NC}"
    echo "  响应: $HEALTH_RESPONSE"
else
    echo -e "${RED}✗ 后端健康检查失败${NC}"
    echo "  响应: $HEALTH_RESPONSE"
    ALL_PASSED=false
fi
echo ""

# 2. 检查机会接口
echo -e "${YELLOW}[2/5] 检查机会接口...${NC}"
OPPORTUNITIES_RESPONSE=$(curl -s "$BACKEND_URL/api/opportunities" 2>&1)
if [ -n "$OPPORTUNITIES_RESPONSE" ] && [ "$OPPORTUNITIES_RESPONSE" != "[]" ]; then
    echo -e "${GREEN}✓ 机会接口正常${NC}"
    echo "  数据条数: $(echo "$OPPORTUNITIES_RESPONSE" | grep -o '"id"' | wc -l)"
else
    echo -e "${RED}✗ 机会接口异常${NC}"
    echo "  响应: $OPPORTUNITIES_RESPONSE"
    ALL_PASSED=false
fi
echo ""

# 3. 检查异动接口
echo -e "${YELLOW}[3/5] 检查异动接口...${NC}"
ANOMALIES_RESPONSE=$(curl -s "$BACKEND_URL/api/anomalies" 2>&1)
if [ -n "$ANOMALIES_RESPONSE" ]; then
    echo -e "${GREEN}✓ 异动接口正常${NC}"
    echo "  数据条数: $(echo "$ANOMALIES_RESPONSE" | grep -o '"id"' | wc -l)"
else
    echo -e "${RED}✗ 异动接口异常${NC}"
    echo "  响应: $ANOMALIES_RESPONSE"
    ALL_PASSED=false
fi
echo ""

# 4. 检查复盘接口
echo -e "${YELLOW}[4/5] 检查复盘接口...${NC}"
REVIEW_RESPONSE=$(curl -s "$BACKEND_URL/api/review" 2>&1)
if echo "$REVIEW_RESPONSE" | grep -q "indices"; then
    echo -e "${GREEN}✓ 复盘接口正常${NC}"
else
    echo -e "${RED}✗ 复盘接口异常${NC}"
    echo "  响应: $REVIEW_RESPONSE"
    ALL_PASSED=false
fi
echo ""

# 5. 检查前端可访问性
echo -e "${YELLOW}[5/5] 检查前端可访问性...${NC}"
FRONTEND_STATUS=$(curl -L -s -o /dev/null -w "%{http_code}" "$FRONTEND_URL" 2>&1)
if [ "$FRONTEND_STATUS" = "200" ]; then
    echo -e "${GREEN}✓ 前端可访问${NC}"
    echo "  地址: $FRONTEND_URL"
else
    echo -e "${RED}✗ 前端访问异常 (HTTP $FRONTEND_STATUS)${NC}"
    ALL_PASSED=false
fi
echo ""

# 总结
echo -e "${GREEN}====================================${NC}"
if [ "$ALL_PASSED" = true ]; then
    echo -e "${GREEN}✓ 所有检查通过！部署成功！${NC}"
    echo -e "${GREEN}====================================${NC}"
    echo ""
    echo -e "📱 前端地址: ${YELLOW}$FRONTEND_URL${NC}"
    echo -e "🔌 后端地址: ${YELLOW}$BACKEND_URL${NC}"
else
    echo -e "${RED}✗ 部分检查失败，请排查问题！${NC}"
    echo -e "${GREEN}====================================${NC}"
    exit 1
fi
echo ""
