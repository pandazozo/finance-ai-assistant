# 金融AI投资助手 - 项目文档索引

> 本项目所有文档的总索引，方便快速查找

---

## 📚 核心文档

| 文档 | 说明 | 链接 |
|------|------|------|
| **多Agent协作规范** | 完整的研发流程与分工定义 | [查看](file:///workspace/.trae/documents/Multi-Agent-Workflow.md) |
| **发布规范与流程** | 铁律发布流程与凭证管理 | [查看](file:///workspace/.trae/documents/Release-Workflow.md) |
| **部署配置信息** | 前后端部署详细配置 | [查看](file:///workspace/.trae/documents/Deployment-Config.md) |
| **产品需求(PRD)** | 产品功能需求文档 | [查看](file:///workspace/.trae/documents/PRD.md) |
| **技术架构** | 技术方案与架构设计 | [查看](file:///workspace/.trae/documents/Technical-Architecture.md) |

---

## ✅ 评审检查清单

| 清单 | 负责角色 | 说明 | 链接 |
|------|----------|------|------|
| **PRD检查清单** | 产品经理 | PRD文档完整性检查 | [查看](file:///workspace/.trae/checklists/prd-checklist.md) |
| **技术方案检查清单** | 架构师 | 技术架构质量检查 | [查看](file:///workspace/.trae/checklists/architecture-checklist.md) |
| **代码评审检查清单** | 代码评审 | 代码质量检查 | [查看](file:///workspace/.trae/checklists/code-review-checklist.md) |
| **QA测试检查清单** | QA测试 | 测试覆盖检查 | [查看](file:///workspace/.trae/checklists/qa-checklist.md) |
| **部署运维检查清单** | 部署运维 | 发布上线检查 | [查看](file:///workspace/.trae/checklists/devops-checklist.md) |

---

## 🤖 Agent角色总览

### 1. 产品经理 (Product Manager)
- **职责**：PRD编写、需求管理、验收标准
- **输出**：PRD文档、功能清单、验收标准
- **检查清单**：[PRD检查清单](file:///workspace/.trae/checklists/prd-checklist.md)

### 2. 架构师 (Architect)
- **职责**：技术方案、系统设计、API设计
- **输出**：技术架构文档、API文档、部署方案
- **检查清单**：[技术方案检查清单](file:///workspace/.trae/checklists/architecture-checklist.md)

### 3. 方案评审 (Solution Reviewer)
- **职责**：审核PRD、审核技术方案、识别风险
- **输出**：评审报告、风险清单、改进建议

### 4. 代码评审 (Code Reviewer)
- **职责**：审核代码质量、检查Bug、安全审查
- **输出**：评审意见、问题清单
- **检查清单**：[代码评审检查清单](file:///workspace/.trae/checklists/code-review-checklist.md)

### 5. QA测试 (QA Tester)
- **职责**：测试计划、执行测试、Bug跟踪
- **输出**：测试报告、Bug列表
- **检查清单**：[QA测试检查清单](file:///workspace/.trae/checklists/qa-checklist.md)

### 6. 部署运维 (DevOps Engineer)
- **职责**：部署发布、CI/CD、监控运维
- **输出**：部署报告、监控配置
- **检查清单**：[部署运维检查清单](file:///workspace/.trae/checklists/devops-checklist.md)

---

## 🛠️ 工具脚本

| 脚本 | 说明 | 链接 |
|------|------|------|
| **check-deploy.sh** | 部署后自动检查脚本 | [查看](file:///workspace/scripts/check-deploy.sh) |
| **release.sh** | 一键发布脚本（谨慎使用） | [查看](file:///workspace/scripts/release.sh) |

---

## 🔐 配置与凭证

| 文件 | 说明 | 链接 |
|------|------|------|
| **.netlify/config.json** | Netlify配置与Token | [查看](file:///workspace/.netlify/config.json) |
| **.env.netlify** | Netlify环境变量备份 | [查看](file:///workspace/.env.netlify) |
| **.config-complete.env** | 完整配置清单备份 | [查看](file:///workspace/.config-complete.env) |

---

## 📊 研发流程总览

```
需求阶段
    ↓
[产品经理] → 编写PRD → [方案评审] → 确认
    ↓
设计阶段
    ↓
[架构师] → 技术方案 → [方案评审] → 确认
    ↓
开发阶段
    ↓
开发实现 → [代码评审] → 修改确认 → 合并
    ↓
测试阶段
    ↓
[QA测试] → 测试 → Bug修复 → 再次测试 → 测试通过
    ↓
发布阶段
    ↓
[部署运维] → 部署上线 → 验证 → 完成
```

---

## 🌐 项目访问地址

| 服务 | 地址 |
|------|------|
| 前端 | https://illustrious-bonbon-069326.netlify.app |
| 后端 | https://finance-ai-assistant-production.up.railway.app |
| GitHub | https://github.com/pandazozo/finance-ai-assistant |

---

## 📝 使用建议

1. **开始新需求**：先看 [多Agent协作规范](file:///workspace/.trae/documents/Multi-Agent-Workflow.md)
2. **准备发布**：先看 [发布规范](file:///workspace/.trae/documents/Release-Workflow.md)
3. **任何评审**：使用对应检查清单
4. **发布后**：运行 `/workspace/scripts/check-deploy.sh` 验证
