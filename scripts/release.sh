#!/bin/bash

# ============================================
# 金融AI投资助手 - 一键发布脚本
# ============================================

# 颜色定义
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}====================================${NC}"
echo -e "${GREEN}  金融AI投资助手 - 一键发布${NC}"
echo -e "${GREEN}====================================${NC}"
echo ""

# 1. 检查Git状态
echo -e "${YELLOW}[1/4] 检查Git状态...${NC}"
cd /workspace || { echo "目录不存在"; exit 1; }
git status
echo ""

# 2. 提示提交信息
echo -e "${YELLOW}[2/4] 请输入提交信息：${NC}"
read -r COMMIT_MSG

if [ -z "$COMMIT_MSG" ]; then
    COMMIT_MSG="更新：$(date '+%Y-%m-%d %H:%M:%S')"
fi

echo -e "提交信息：${GREEN}$COMMIT_MSG${NC}"
echo ""

# 3. Git提交并推送
echo -e "${YELLOW}[3/4] Git提交与推送...${NC}"
git add .
git commit -m "$COMMIT_MSG"
git push origin main
echo ""

# 4. 等待部署
echo -e "${YELLOW}[4/4] 等待部署完成（约60秒）...${NC}"
echo -e "${YELLOW}...${NC}"
sleep 60
echo ""

# 运行部署检查
echo -e "${GREEN}运行部署检查脚本...${NC}"
chmod +x /workspace/scripts/check-deploy.sh
/workspace/scripts/check-deploy.sh
