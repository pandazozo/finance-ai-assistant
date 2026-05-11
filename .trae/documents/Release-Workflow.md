# 金融AI投资助手 - 发布规范与流程

> **重要**：这是项目的核心发布规范，**每次修改后必须严格遵循此流程**

---

## 📋 项目基础信息

### 项目名称
金融AI投资助手

### 核心地址

| 服务 | 地址 |
|------|------|
| **前端** | https://illustrious-bonbon-069326.netlify.app |
| **后端** | https://finance-ai-assistant-production.up.railway.app |
| **GitHub仓库** | https://github.com/pandazozo/finance-ai-assistant |

---

## 🔐 凭证与Token管理

### Netlify配置

```json
{
  "netlify": {
    "authToken": "nfp_MWBPAFxVh2aimaoYeYhZVuTdYaXj9Wwub0b0",
    "siteId": "17700ca4-52f6-4147-816a-da482627ea86",
    "siteName": "illustrious-bonbon-069326",
    "siteUrl": "https://illustrious-bonbon-069326.netlify.app"
  }
}
```

### GitHub Secrets配置

在 https://github.com/pandazozo/finance-ai-assistant/settings/secrets/actions 中，需配置：

| Secret Name | Value |
|-------------|-------|
| `NETLIFY_AUTH_TOKEN` | `nfp_MWBPAFxVh2aimaoYeYhZVuTdYaXj9Wwub0b0` |
| `NETLIFY_SITE_ID` | `17700ca4-52f6-4147-816a-da482627ea86` |

### 后端配置
- Railway自动从GitHub拉取，无需额外Token
- 构建命令：Python自动检测并启动`server.py`
- Procfile配置：`web: python server.py`

---

## ⚡ 发布流程（铁律）

### 每次开发完成后必须执行的流程：

```
开发完成 → 测试验证 → 代码提交 → GitHub推送 → 部署验证
```

---

### 📌 详细步骤说明

#### 1️⃣ 本地验证
- **测试前端**：本地访问 http://localhost:5173 确保功能正常
- **测试后端**：本地运行 `python server.py`，验证API：
  - `http://localhost:8000/api/health`
  - `http://localhost:8000/api/opportunities`
  - `http://localhost:8000/api/anomalies`
  - `http://localhost:8000/api/review`

#### 2️⃣ Git提交
```bash
# 在 /workspace 目录下执行
git add .
git commit -m "描述性提交信息（如：修复XXX问题/新增YYY功能）"
git push origin main
```

#### 3️⃣ 等待部署
- **前端部署**：推送后30-60秒，Netlify自动部署
- **后端部署**：推送后30-90秒，Railway自动部署

#### 4️⃣ 最终验证（最重要！）

必须依次验证以下地址，**确保全部正常后任务才算完成**：

| 验证项 | 验证地址 | 期望结果 |
|--------|----------|----------|
| 1. 后端健康检查 | https://finance-ai-assistant-production.up.railway.app/api/health | `{"status": "ok"}` |
| 2. 后端机会接口 | https://finance-ai-assistant-production.up.railway.app/api/opportunities | 返回真实A股数据 |
| 3. 后端异动接口 | https://finance-ai-assistant-production.up.railway.app/api/anomalies | 返回真实异动数据 |
| 4. 后端复盘接口 | https://finance-ai-assistant-production.up.railway.app/api/review | 返回真实复盘数据 |
| 5. 前端可访问 | https://illustrious-bonbon-069326.netlify.app | 正常打开应用 |

---

## 🛠️ 紧急问题处理

### 如果部署失败：

1. **检查GitHub Actions日志**：https://github.com/pandazozo/finance-ai-assistant/actions
2. **检查Railway部署日志**：登录Railway控制台查看
3. **检查Netlify部署日志**：登录Netlify控制台查看
4. **回滚方案**：如果新代码导致问题，紧急回滚到上一个稳定版本：
   ```bash
   git log --oneline  # 找到之前的稳定commit
   git revert <commit_id>
   git push origin main
   ```

---

## 📝 API接口说明

| 接口 | 说明 |
|------|------|
| `/api/health` | 服务健康检查 |
| `/api/opportunities` | 今日投资机会（实时A股数据） |
| `/api/anomalies` | 盘中异动监控（涨跌幅>1%） |
| `/api/review` | 行情复盘数据（指数涨跌） |

---

## 📂 项目配置存储位置

所有关键信息持久化存储在项目中，防止丢失：

| 文件 | 说明 | 链接 |
|------|------|------|
| `.netlify/config.json` | Netlify凭证与配置 | [config.json](file:///workspace/.netlify/config.json) |
| `.env.netlify` | Netlify环境变量备份 | [.env.netlify](file:///workspace/.env.netlify) |
| `.trae/documents/Release-Workflow.md` | 本文档（发布规范） | [Release-Workflow.md](file:///workspace/.trae/documents/Release-Workflow.md) |
| `.trae/documents/Deployment-Config.md` | 部署配置信息 | [Deployment-Config.md](file:///workspace/.trae/documents/Deployment-Config.md) |
| `server.py` | 后端API服务 | [server.py](file:///workspace/server.py) |

---

## ⚠️ 注意事项

1. **绝不**跳过验证流程直接交付
2. **绝不**修改后忘记git push
3. **定期**检查所有凭证是否有效
4. **每次**发布后必须先验证所有接口正常，再验证前端
