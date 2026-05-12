# 🚀 金融AI助手 - 手机版简易部署指南

**GitHub仓库:** https://github.com/pandazozo/finance-ai-assistant  
**最新提交:** 0991f44

---

## 📱 第一步：部署后端 (Railway)

### 在手机浏览器操作：

1. **打开** https://railway.app
2. **登录** 你的GitHub账号
3. **点击** "New Project"
4. **选择** "Deploy from repo"
5. **授权** Railway访问你的GitHub
6. **选择** `finance-ai-assistant` 仓库
7. **点击** "Deploy Now"
8. **等待** 自动部署完成 ⏳
9. **获取** 部署后的API地址（类似 `https://xxx.railway.app`）

---

## 📱 第二步：部署前端 (Netlify)

### 在手机浏览器操作：

1. **打开** https://netlify.com
2. **登录** 你的GitHub账号
3. **点击** "Add new site" → "Import an existing project"
4. **选择** `finance-ai-assistant` 仓库
5. **确认** 配置（默认即可）：
   - Build command: `npm run build`
   - Publish directory: `dist`
6. **点击** "Deploy site"
7. **等待** 自动部署完成 ⏳
8. **获取** 部署后的网站地址（类似 `https://xxx.netlify.app`）

---

## 📱 第三步：配置API地址 (可选)

如果需要前端连接你的后端API：

1. 在Netlify中找到你的项目
2. 进入 "Site settings"
3. 找到 "Environment variables"
4. 添加 `VITE_API_BASE_URL`，值为你的Railway API地址

---

## ✅ 部署完成！

部署成功后：
- 📈 **后端API:** https://xxx.railway.app
- 🌐 **前端网站:** https://xxx.netlify.app

现在你可以在手机浏览器访问你的网站了！🎊

---

## 📋 检查清单

- ✅ GitHub代码已推送 (最新: 0991f44)
- ✅ Railway配置文件已就绪 (railway.json)
- ✅ Netlify配置文件已就绪 (netlify.toml)
- ✅ 依赖文件已准备 (requirements.txt, package.json)
- ⏳ 等待你的一键部署！

---

**准备时间:** 5-10分钟  
**难度:** ⭐ 超简单

---
