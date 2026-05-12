# 金融AI投资助手 - 部署指南

## 🚀 快速部署

### 后端部署 (Railway)

1. 访问 [Railway](https://railway.app/)
2. 导入 GitHub 仓库
3. 配置环境变量（如需要）
4. 自动部署完成！

### 前端部署 (Vercel)

1. 访问 [Vercel](https://vercel.com/)
2. 导入 GitHub 仓库
3. 自动部署完成！

---

## 📋 部署配置

### 后端配置

**启动命令：** `python app.py`

**端口：** 8000 (或环境变量 PORT)

**健康检查：** `/api/health`

**环境变量：**
- `PORT` - 服务器端口 (默认: 8000)

### 前端配置

**构建命令：** `npm run build`

**输出目录：** `dist`

**框架：** Vite + React

---

## 🔗 访问地址

部署成功后，你将获得：
- 后端API地址: `https://your-backend.railway.app`
- 前端地址: `https://your-app.vercel.app`

---

## 📝 本地开发

```bash
# 后端
python app.py

# 前端
npm run dev
```

---

## ✅ 功能清单

- ✅ Phase 1: 股票机会、异动提醒、市场复盘
- ✅ Phase 2: LLM分析、新闻权重
- ✅ Phase 3: 规则引擎、策略回测、社区聚合、券商跳转
- ✅ 完整测试覆盖
