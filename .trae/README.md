# 金融AI投资助手 - 项目规范总览

> **版本**：v1.0
> **日期**：2026-05-12
> **用途**：所有Agent和新会话的入口文档
> **重要**：**每次开始新会话或进入新阶段时，必须先阅读本文档**

---

## 🚨 核心原则

1. **文档先行**：每次开始新Phase前，必须阅读本文档
2. **评审前置**：PRD和架构评审通过后才能开发
3. **测试必做**：关键功能100%测试覆盖率
4. **流程完整**：7阶段标准流程不能跳过

---

## 📁 文档结构图

```
.trae/
├── README.md                      ← 入口文档（必读）
├── SPEC.md                        ← 产品规格
│
├── documents/                     ← 核心文档
│   ├── PRD.md                     ← 产品需求（Phase1通用）
│   ├── Technical-Architecture.md ← 技术架构（Phase1通用）
│   ├── Multi-Agent-Workflow.md    ← Agent职责与流程 ← 【重要】
│   ├── Review-Test-Iron-Rules.md ← 代码评审铁律
│   │
│   ├── Phase2/                    ← Phase2文档
│   │   ├── PRD-Phase2.md
│   │   ├── Technical-Architecture-Phase2.md
│   │   ├── Phase2-Development-Workflow.md  ← 【Phase2规范】
│   │   └── Phase2-Development-Plan.md
│   │
│   └── Phase3/                    ← Phase3文档
│       ├── PRD-Phase3.md
│       ├── Technical-Architecture-Phase3.md
│       └── Phase3-Development-Plan.md
│
└── checklists/                    ← 检查清单
    ├── phase-startup-template.md  ← 【Phase启动模板】
    ├── PHASE3-STARTUP.md         ← Phase3启动检查表
    ├── prd-checklist.md          ← PRD评审清单
    ├── architecture-checklist.md  ← 架构评审清单
    ├── code-review-checklist.md  ← 代码评审清单
    ├── code-review-iron-checklist.md ← 代码评审铁律清单
    ├── qa-checklist.md           ← QA测试清单
    └── qa-iron-checklist.md      ← QA测试铁律清单
```

---

## 🔄 新会话/新Phase标准流程

### 首次打开项目时

```
1. 阅读 README.md（项目概览）
2. 阅读本文档（项目规范总览）← 当前文档
3. 阅读 Multi-Agent-Workflow.md（Agent职责与流程）
4. 如有新Phase，阅读 PhaseX-STARTUP.md（启动检查表）
```

### 开始新Phase时

```
1. 读取 .trae/checklists/phase-startup-template.md
2. 复制并创建 PhaseX-STARTUP.md
3. 执行PRD评审（对照prd-checklist.md）
4. 执行架构评审（对照architecture-checklist.md）
5. 评审通过后，创建开发计划
6. 执行环境准备检查
7. 开始开发
```

---

## 🤖 Agent角色速查

| Agent | 职责 | 输出文档 | 检查清单 |
|-------|------|----------|----------|
| 产品经理 | 需求分析、PRD编写 | PRD.md | prd-checklist.md |
| 架构师 | 技术方案设计 | Technical-Architecture.md | architecture-checklist.md |
| 代码评审 | 代码质量检查 | 评审意见 | code-review-checklist.md |
| QA测试 | 测试执行、报告 | Test-Plan.md, Test-Report | qa-checklist.md |
| 部署运维 | CI/CD、部署 | Deployment-Config.md | devops-checklist.md |

---

## 📋 Phase开发流程（7阶段）

```
┌────────────────────────────────────────────────────────────────┐
│  阶段1：PRD评审    →  评审PRD功能清单、AC、优先级              │
│  阶段2：架构评审    →  评审技术方案、性能、回退方案             │
│  阶段3：代码开发    →  按规范编写代码+单元测试                 │
│  阶段4：代码评审    →  对照code-review-checklist逐项检查       │
│  阶段5：本地部署    →  启动后端8000+前端5173                   │
│  阶段6：QA测试      →  对照qa-checklist执行测试                │
│  阶段7：线上部署    →  CI/CD自动部署+线上验证                  │
└────────────────────────────────────────────────────────────────┘
```

**评审前置**：阶段1、2评审不通过 → 阻塞，不能进入阶段3

---

## 📖 必读文档清单

### 每个新会话必读

| 文档 | 必须阅读的场景 | 预计时间 |
|------|---------------|----------|
| README.md | 首次打开/忘记项目背景时 | 2分钟 |
| Multi-Agent-Workflow.md | 忘记Agent职责/流程时 | 5分钟 |

### 开发前必读

| 文档 | 必须阅读的场景 | 预计时间 |
|------|---------------|----------|
| PRD-PhaseX.md | 开始PhaseX开发前 | 10分钟 |
| PhaseX-Development-Workflow.md | 忘记PhaseX流程时 | 5分钟 |
| PhaseX-STARTUP.md | 开始新Phase前 | 3分钟 |

### 代码评审前必读

| 文档 | 必须阅读的场景 | 预计时间 |
|------|---------------|----------|
| Review-Test-Iron-Rules.md | 忘记铁律规范时 | 5分钟 |
| code-review-checklist.md | 忘记检查项时 | 3分钟 |

### QA测试前必读

| 文档 | 必须阅读的场景 | 预计时间 |
|------|---------------|----------|
| qa-checklist.md | 忘记测试项时 | 3分钟 |

---

## 🔗 快速链接

### 核心文档

- [README.md](file:///workspace/README.md) - 项目概览
- [Multi-Agent-Workflow.md](file:///workspace/.trae/documents/Multi-Agent-Workflow.md) - Agent职责与流程
- [Review-Test-Iron-Rules.md](file:///workspace/.trae/documents/Review-Test-Iron-Rules.md) - 代码评审铁律

### Phase2文档

- [PRD-Phase2.md](file:///workspace/.trae/documents/PRD-Phase2.md) - Phase2产品需求
- [Phase2-Development-Workflow.md](file:///workspace/.trae/documents/Phase2-Development-Workflow.md) - Phase2开发流程

### Phase3文档

- [PRD-Phase3.md](file:///workspace/.trae/documents/PRD-Phase3.md) - Phase3产品需求
- [Technical-Architecture-Phase3.md](file:///workspace/.trae/documents/Technical-Architecture-Phase3.md) - Phase3技术架构

### 检查清单

- [Phase启动模板](file:///workspace/.trae/checklists/phase-startup-template.md) - 开始新Phase时的检查表
- [PRD评审清单](file:///workspace/.trae/checklists/prd-checklist.md) - PRD评审检查项
- [架构评审清单](file:///workspace/.trae/checklists/architecture-checklist.md) - 架构评审检查项
- [代码评审清单](file:///workspace/.trae/checklists/code-review-checklist.md) - 代码评审检查项
- [QA测试清单](file:///workspace/.trae/checklists/qa-checklist.md) - QA测试检查项

---

## ⚡ 快速命令

```bash
# 验证测试环境
pytest --version
npx vitest --version
npm run lint

# 运行所有测试
pytest tests/backend -v
npx vitest run tests/frontend

# 覆盖率检查
pytest --cov=app --cov-report=term-missing tests/backend
```

---

## 📊 当前Phase状态

| Phase | 状态 | 说明 |
|-------|------|------|
| Phase1 | ✅ 已完成 | MVP核心功能 |
| Phase2 | ✅ 已完成 | LLM接入+资讯权重 |
| Phase3 | 📋 待开发 | 自定义规则引擎 |

---

**最后更新**：2026-05-12
**下次评审**：Phase3开始前
