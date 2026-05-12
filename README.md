# 金融AI投资助手

一个智能的金融投资助手，包含股票机会发现、异动监控、市场复盘、AI分析、自定义规则策略等功能。

## 🚀 功能特性

### Phase 1 - 核心功能
- 📈 股票机会发现
- ⚡ 实时异动监控
- 📊 市场复盘总结

### Phase 2 - AI与资讯
- 🤖 AI智能分析
- 📰 新闻权重算法
- 🎯 风险偏好配置

### Phase 3 - 规则引擎
- 📋 自定义投资规则
- 🔙 策略回测引擎
- 👥 社区观点聚合
- 💹 多券商交易跳转

## 🛠️ 技术栈

**后端**
- Python + FastAPI
- AKShare 数据
- 通义千问 LLM

**前端**
- React + TypeScript + Vite
- Tailwind CSS
- Zustand 状态管理

**测试**
- pytest (后端)
- Vitest (前端)
- Playwright (E2E)

## 🚀 快速开始

### 本地开发

```bash
# 后端
python app.py

# 前端
npm install
npm run dev
```

### 部署

详细部署指南见 [DEPLOYMENT.md](./DEPLOYMENT.md)

## 📚 文档

- [PRD 需求文档](.trae/documents/PRD.md)
- [完整测试计划](.trae/documents/COMPLETE_TEST_PLAN.md)
- [UI穷举测试计划](.trae/documents/UI_COMPLETE_TEST_PLAN.md)
- [部署指南](DEPLOYMENT.md)

## ✅ 测试覆盖

- 🧪 后端单元测试: 215+ 个用例
- 🧪 前端单元测试: 完整覆盖
- 🧪 E2E 集成测试: Playwright 自动化

## 📝 License

MIT
