# 金融AI投资助手 - 项目配置

## 部署信息

### 前端 (Netlify)
- **站点ID**: `17700ca4-52f6-4147-816a-da482627ea86`
- **站点名称**: illustrious-bonbon-069326
- **访问地址**: https://illustrious-bonbon-069326.netlify.app
- **GitHub仓库**: https://github.com/pandazozo/finance-ai-assistant
- **部署触发**: 通过GitHub推送自动触发
- **构建命令**: `npm run build`
- **发布目录**: `dist`

### 后端 (Railway)
- **API地址**: https://finance-ai-assistant-production.up.railway.app
- **健康检查**: https://finance-ai-assistant-production.up.railway.app/api/health

## API端点

| 端点 | 说明 |
|------|------|
| `/api/health` | 服务健康检查 |
| `/api/opportunities` | 今日投资机会 |
| `/api/anomalies` | 盘中异动监控 |
| `/api/review` | 行情复盘数据 |

## 本地开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览生产版本
npm run preview
```

## 部署工作流

1. 推送代码到GitHub `main`分支
2. GitHub Actions自动构建
3. 自动部署到Netlify
4. 访问 https://illustrious-bonbon-069326.netlify.app 验证

## 环境变量

| 变量名 | 值 | 说明 |
|--------|-----|------|
| `VITE_API_URL` | https://finance-ai-assistant-production.up.railway.app | 后端API地址 |

## GitHub Secrets (用于CI/CD)

| Secret Name | Value |
|-------------|-------|
| `NETLIFY_AUTH_TOKEN` | `nfp_MWBPAFxVh2aimaoYeYhZVuTdYaXj9Wwub0b0` |
| `NETLIFY_SITE_ID` | `17700ca4-52f6-4147-816a-da482627ea86` |
