# 金融AI投资助手 - 技术架构文档

> **版本**：v1.0
> **作者**：架构师Agent
> **日期**：2026-05-12
> **状态**：待评审
> **基于**：PRD v1.1（已通过二审）

---

## 一、技术决策确认

### 1.1 已确认的技术决策

| 决策点 | 选择 | 决策依据 |
|--------|------|----------|
| **数据源** | AKShare + 东方财富 | 成熟免费、社区活跃（12k+ star）、满足实时行情需求 |
| **后端服务** | Railway + FastAPI | 已有基础设施，稳定可靠 |
| **前端服务** | Netlify + React + Vite | 已有基础设施，CDN加速 |
| **用户配置存储** | localStorage | MVP最快实现，Phase 2升级云端 |
| **AI结论生成** | 混合方案 | 规则引擎 + LLM按场景匹配 |

### 1.2 AI结论混合方案详解

#### 场景匹配原则

| 场景 | AI方案 | 理由 |
|------|--------|------|
| **涨跌幅阈值判断** | 规则引擎 | 确定性高，规则明确，无需LLM |
| **异动信号识别** | 规则引擎 | 成交量放大、突破均线等可量化 |
| **结论等级输出** | 规则引擎 | 5档结论可精确映射 |
| **核心逻辑生成** | LLM | 需要自然语言解释，增强可读性 |
| **风险提示生成** | LLM | 个性化风险描述更人性化 |
| **资讯摘要** | LLM | 压缩长文本，保留关键信息 |

#### 混合架构示意

```
┌─────────────────────────────────────────────────────────────┐
│                    AI结论生成混合架构                        │
└─────────────────────────────────────────────────────────────┘

  输入数据 ──► 规则引擎 ──► 定量结论
                    │
                    ├── 涨跌幅得分（+20分）
                    ├── 成交量得分（+15分）
                    ├── 趋势得分（+10分）
                    │
                    ▼
              定量评分（0-100）
                    │
                    ▼
            ┌───────────────┐
            │  结论映射表    │
            │  强烈推荐(+5)  │
            │  推荐(+3)     │
            │  中性(0)      │
            │  谨慎(-3)     │
            │  回避(-5)     │
            └───────────────┘
                    │
                    ▼
               LLM增强 ──► 自然语言解释
                    │
                    ├── 核心逻辑生成
                    ├── 风险提示
                    └── 投资建议

  输出：AI结论（等级 + 自然语言解释 + 免责声明）
```

---

## 二、系统架构

### 2.1 整体架构图

```
┌─────────────────────────────────────────────────────────────────────┐
│                           系统架构全景图                             │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                         前端层（Netlify CDN）                        │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │                    React + TypeScript + Vite                 │    │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │    │
│  │  │ 自选股    │  │ 个股详情  │  │ 风险偏好  │  │ 免责声明  │   │    │
│  │  │ 列表页    │  │ 页面     │  │ 配置页    │  │ 弹窗     │   │    │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │    │
│  └─────────────────────────────────────────────────────────────┘    │
│                              │                                      │
│                    localStorage（用户配置）                          │
└─────────────────────────────────────────────────────────────────────┘
                              │ HTTP API
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         后端层（Railway）                            │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │                    FastAPI + Python                          │    │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐      │    │
│  │  │ AKShare     │  │ 规则引擎    │  │ LLM接口         │      │    │
│  │  │ 数据服务    │  │ 量化评分    │  │ 自然语言生成    │      │    │
│  │  └─────────────┘  └─────────────┘  └─────────────────┘      │    │
│  └─────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         数据源层                                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              │
│  │  AKShare     │  │  东方财富    │  │  LLM API    │              │
│  │  (Python库)  │  │  (数据源)    │  │ (可选)       │              │
│  └──────────────┘  └──────────────┘  └──────────────┘              │
└─────────────────────────────────────────────────────────────────────┘
```

### 2.2 数据流向

```
用户操作 ──► 前端 ──► Railway后端 ──► AKShare ──► 东方财富
                │          │            │            │
                │          ▼            │            │
                │     规则引擎 ◄────────┘            │
                │          │                         │
                │          ▼                         │
                │     定量评分                       │
                │          │                         │
                │          ▼ (条件触发)              │
                │     LLM API ◄─────────────────────┘
                │          │
                ▼          ▼
           展示给用户 ←─ AI结论
```

---

## 三、技术栈详细说明

### 3.1 前端技术栈

| 技术 | 版本 | 用途 | 说明 |
|------|------|------|------|
| **React** | 18.x | UI框架 | 组件化、生态成熟 |
| **TypeScript** | 5.x | 类型系统 | 减少运行时错误 |
| **Vite** | 5.x | 构建工具 | 快速热更新 |
| **Zustand** | 4.x | 状态管理 | 轻量级、够用 |
| **TailwindCSS** | 3.x | 样式方案 | 快速开发 |
| **React Router** | 6.x | 路由管理 | 页面导航 |

### 3.2 后端技术栈

| 技术 | 版本 | 用途 | 说明 |
|------|------|------|------|
| **Python** | 3.11+ | 运行时 | 简单高效 |
| **FastAPI** | 0.109+ | Web框架 | 自动API文档、高性能 |
| **AKShare** | 1.x | 数据获取 | 实时行情、历史数据 |
| **Pydantic** | 2.x | 数据验证 | 请求/响应校验 |
| **Uvicorn** | 0.27+ | ASGI服务器 | 高性能异步服务 |

### 3.3 外部依赖

| 服务 | 用途 | 成本 | 说明 |
|------|------|------|------|
| **Netlify** | 前端部署 | 免费 | 已有账户 |
| **Railway** | 后端部署 | 免费额度 | 已有账户 |
| **OpenAI/Claude** | LLM服务 | 按量付费 | Phase 2接入 |

---

## 四、数据库设计

### 4.1 MVP阶段数据存储

**说明**：MVP阶段使用localStorage存储用户配置，不使用后端数据库。

#### 4.1.1 localStorage数据结构

```typescript
// 用户自选股
interface WatchList {
  version: string;        // 数据版本号
  updatedAt: string;      // 更新时间
  stocks: StockItem[];    // 股票列表
}

interface StockItem {
  code: string;          // 股票代码，如 "600519"
  name: string;           // 股票名称，如 "贵州茅台"
  addedAt: string;        // 添加时间
  group?: string;         // 分组（Phase 2支持）
}

// 用户风险偏好配置
interface RiskPreference {
  version: string;
  updatedAt: string;
  levels: RiskLevel;      // 风险层级配置
  answers: number[];      // 问卷答案（用于后续优化）
}

interface RiskLevel {
  high: number;          // 高风险配置比例，默认40
  medium: number;        // 中风险配置比例，默认35
  low: number;           // 低风险配置比例，默认25
}

// 异动监控配置
interface AlertConfig {
  version: string;
  threshold: number;      // 涨跌幅阈值，默认5
  enabled: boolean;       // 是否启用
}

// 免责声明确认状态
interface DisclaimerStatus {
  confirmed: boolean;     // 是否已确认
  confirmedAt?: string;   // 确认时间
}
```

#### 4.1.2 数据存储键名

| 键名 | 数据类型 | 说明 |
|------|----------|------|
| `fa_watchlist` | WatchList | 自选股列表 |
| `fa_risk_preference` | RiskPreference | 风险偏好配置 |
| `fa_alert_config` | AlertConfig | 异动监控配置 |
| `fa_disclaimer_status` | DisclaimerStatus | 免责声明确认状态 |

### 4.2 Phase 2 数据库设计（预留）

```sql
-- 用户表
CREATE TABLE users (
  id UUID PRIMARY KEY,
  device_id VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 自选股表
CREATE TABLE watchlist (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  stock_code VARCHAR(10) NOT NULL,
  stock_name VARCHAR(50) NOT NULL,
  group_name VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, stock_code)
);

-- 风险偏好表
CREATE TABLE risk_preference (
  id UUID PRIMARY KEY,
  user_id UUID UNIQUE REFERENCES users(id),
  high_ratio INT DEFAULT 40,
  medium_ratio INT DEFAULT 35,
  low_ratio INT DEFAULT 25,
  answers JSONB,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 异动监控配置表
CREATE TABLE alert_config (
  id UUID PRIMARY KEY,
  user_id UUID UNIQUE REFERENCES users(id),
  threshold DECIMAL(5,2) DEFAULT 5.00,
  enabled BOOLEAN DEFAULT TRUE,
  updated_at TIMESTAMP DEFAULT NOW()
);
```

---

## 五、API接口设计

### 5.1 后端API服务（Railway）

#### 5.1.1 股票行情接口

**GET** `/api/v1/stocks/quote`

获取股票实时行情

**请求参数**：
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| codes | string | 是 | 股票代码，多个用逗号分隔，如 "600519,000001" |

**响应示例**：
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "quotes": [
      {
        "code": "600519",
        "name": "贵州茅台",
        "price": 1850.00,
        "change": 42.50,
        "changePercent": 2.35,
        "volume": 1234567,
        "amount": 1234567890.00,
        "high": 1860.00,
        "low": 1820.00,
        "open": 1820.00,
        "prevClose": 1807.50,
        "updateTime": "2026-05-12 14:30:05"
      }
    ]
  }
}
```

#### 5.1.2 AI结论接口

**POST** `/api/v1/stocks/ai-conclusion`

获取股票AI结论

**请求参数**：
```json
{
  "code": "600519",
  "riskPreference": {
    "high": 40,
    "medium": 35,
    "low": 25
  }
}
```

**响应示例**：
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "code": "600519",
    "name": "贵州茅台",
    "conclusion": {
      "level": 3,
      "label": "推荐",
      "score": 78,
      "explanation": "基于当前技术面和资金面分析，该股呈现强势特征。...",
      "signals": [
        {"type": "技术面", "signal": "突破20日均线", "score": 20},
        {"type": "资金面", "signal": "北向资金净流入", "score": 15}
      ],
      "riskTips": "当前估值处于历史高位，建议关注回调风险..."
    },
    "generatedAt": "2026-05-12 14:30:10"
  }
}
```

#### 5.1.3 股票搜索接口

**GET** `/api/v1/stocks/search`

搜索股票

**请求参数**：
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| keyword | string | 是 | 搜索关键词（代码或名称） |
| limit | int | 否 | 返回数量，默认10 |

**响应示例**：
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "stocks": [
      {"code": "600519", "name": "贵州茅台", "market": "沪市主板"},
      {"code": "600036", "name": "招商银行", "market": "沪市主板"}
    ]
  }
}
```

#### 5.1.4 健康检查接口

**GET** `/api/health`

**响应示例**：
```json
{
  "status": "healthy",
  "version": "1.0.0",
  "timestamp": "2026-05-12 14:30:00"
}
```

### 5.2 前端API调用封装

```typescript
// api/client.ts
const API_BASE = import.meta.env.VITE_API_BASE || 'https://finance-ai-assistant-production.up.railway.app';

export const api = {
  // 获取股票行情
  async getQuote(codes: string[]) {
    const res = await fetch(`${API_BASE}/api/v1/stocks/quote?codes=${codes.join(',')}`);
    return res.json();
  },

  // 获取AI结论
  async getAIConclusion(code: string, riskPreference: RiskPreference) {
    const res = await fetch(`${API_BASE}/api/v1/stocks/ai-conclusion`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, riskPreference })
    });
    return res.json();
  },

  // 搜索股票
  async searchStocks(keyword: string) {
    const res = await fetch(`${API_BASE}/api/v1/stocks/search?keyword=${keyword}`);
    return res.json();
  }
};
```

---

## 六、核心模块设计

### 6.1 规则引擎模块

**位置**：`backend/rule_engine/`

#### 6.1.1 评分因子

| 因子类型 | 因子名称 | 权重 | 计算方式 |
|----------|----------|------|----------|
| **价格因子** | 涨跌幅 | 25% | 根据涨跌幅大小给分 |
| **价格因子** | 突破均线 | 15% | 是否突破5/10/20日均线 |
| **成交量因子** | 量比 | 20% | 当日成交量/5日均量 |
| **资金因子** | 资金净流入 | 20% | 根据资金流向给分 |
| **趋势因子** | 趋势强度 | 10% | 基于MACD/KDJ综合判断 |
| **波动因子** | 波动率 | 10% | 历史波动率计算 |

#### 6.1.2 评分公式

```
综合评分 = Σ(因子得分 × 因子权重) × 风险偏好系数

风险偏好系数：
- 高风险偏好：1.2（放大正向信号）
- 中风险偏好：1.0（标准）
- 低风险偏好：0.8（放大风险信号）
```

#### 6.1.3 结论映射

| 评分区间 | 结论等级 | 标签 |
|----------|----------|------|
| 80-100 | +5 | 强烈推荐 |
| 60-79 | +3 | 推荐 |
| 40-59 | 0 | 中性 |
| 20-39 | -3 | 谨慎 |
| 0-19 | -5 | 回避 |

### 6.2 LLM增强模块

**位置**：`backend/llm_enhancer/`

**触发条件**：
- 定量评分完成后
- 用户请求查看详细解释时（懒加载）

**LLM调用场景**：
1. **核心逻辑生成**：将规则引擎的量化得分转换为自然语言解释
2. **风险提示**：生成个性化风险描述
3. **资讯摘要**（Phase 2）：长文本压缩

**LLM Prompt模板**（示例）：
```
你是一个专业的股票分析助手。请根据以下信息，生成简洁易懂的股票分析结论。

股票信息：
- 股票代码：{code}
- 股票名称：{name}

量化评分结果：
- 综合评分：{score}/100
- 结论等级：{level}
- 因子得分：
  {signals}

请生成一段100字左右的分析说明，包含：
1. 当前走势判断
2. 主要利好因素
3. 主要风险提示

注意：分析仅供参考，不构成投资建议。
```

### 6.3 前端状态管理

**位置**：`frontend/src/stores/`

```typescript
// stores/watchlist.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface WatchListState {
  stocks: StockItem[];
  addStock: (code: string, name: string) => void;
  removeStock: (code: string) => void;
}

export const useWatchList = create<WatchListState>()(
  persist(
    (set) => ({
      stocks: [],
      addStock: (code, name) => set((state) => ({
        stocks: [...state.stocks, { code, name, addedAt: new Date().toISOString() }]
      })),
      removeStock: (code) => set((state) => ({
        stocks: state.stocks.filter(s => s.code !== code)
      }))
    }),
    { name: 'fa_watchlist' }
  )
);

// stores/riskPreference.ts
interface RiskPreferenceState {
  config: RiskLevel;
  setConfig: (config: RiskLevel) => void;
}

export const useRiskPreference = create<RiskPreferenceState>()(
  persist(
    (set) => ({
      config: { high: 40, medium: 35, low: 25 },
      setConfig: (config) => set({ config })
    }),
    { name: 'fa_risk_preference' }
  )
);
```

---

## 七、部署方案

### 7.1 前端部署（Netlify）

**构建命令**：
```bash
npm run build
```

**输出目录**：`dist/`

**环境变量**：
| 变量名 | 说明 | 示例 |
|--------|------|------|
| `VITE_API_BASE` | 后端API地址 | `https://finance-ai-assistant-production.up.railway.app` |

**部署配置**（netlify.toml）：
```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### 7.2 后端部署（Railway）

**项目结构**：
```
backend/
├── main.py              # FastAPI入口
├── requirements.txt     # Python依赖
├── rule_engine/         # 规则引擎
├── llm_enhancer/        # LLM增强
└── routers/             # API路由
```

**环境变量**（Railway配置）：
| 变量名 | 说明 | 示例 |
|--------|------|------|
| `OPENAI_API_KEY` | LLM API密钥 | `sk-xxx`（Phase 2配置） |

**健康检查**：
- URL：`/api/health`
- 间隔：Railway默认30秒

### 7.3 CI/CD流程

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: netlify/actions/cli@main
        with:
          args: deploy --prod
        env:
          NETLIFY_AUTH_TOKEN: ${{ secrets.NETLIFY_AUTH_TOKEN }}
          NETLIFY_SITE_ID: ${{ secrets.NETLIFY_SITE_ID }}

  deploy-backend:
    runs-on: ubuntu-latest
    # Railway自动部署，配置好GitHub连接即可
```

---

## 八、扩展性保障

### 8.1 多用户扩展路径

```
Phase 1（MVP）          Phase 2               Phase 3
─────────────────────────────────────────────────────────
localStorage      ──►   设备绑定           ──►   账号体系
单设备           ──►   最多3设备同步      ──►   无限设备
匿名用户         ──►   手机号登录         ──►   微信OAuth
```

**平滑迁移策略**：
1. Phase 2增加后端数据库（PostgreSQL）
2. 保留localStorage作为缓存
3. 前端增加API调用逻辑
4. 用户数据可导出/导入

### 8.2 LLM升级路径

```
Phase 1（MVP）          Phase 2               Phase 3
─────────────────────────────────────────────────────────
规则引擎          ──►   规则引擎+LLM       ──►   全LLM
确定性输出        ──►   混合输出            ──►   智能个性化
无API成本         ──►   限制LLM调用         ──►   按需计费
```

**升级策略**：
1. LLM调用作为可插拔模块
2. 优先使用规则引擎
3. LLM仅用于解释层
4. 增加缓存减少调用次数

### 8.3 数据源扩展路径

```
当前（MVP）         Phase 2               Phase 3
─────────────────────────────────────────────────────────
AKShare免费版  ──►   AKShare + Tushare  ──►   专业数据商
单数据源       ──►   双数据源冗余       ──►   多数据源融合
可能限流       ──►   分散请求压力       ──►   企业级稳定
```

---

## 九、非功能性指标

### 9.1 性能指标

| 指标 | 目标 | 说明 |
|------|------|------|
| **首页加载** | <2秒 | 4G网络 |
| **行情刷新** | <5秒延迟 | AKShare东方财富接口 |
| **API响应** | <3秒 | 后端处理时间 |
| **首屏渲染** | <1秒 | 用户可见内容 |

### 9.2 可用性指标

| 指标 | 目标 | 说明 |
|------|------|------|
| **服务可用性** | 99% | Railway SLA |
| **崩溃率** | <0.1% | 前端JS错误 |
| **错误率** | <1% | API调用失败 |

### 9.3 安全指标

| 措施 | 说明 |
|------|------|
| **HTTPS** | 全链路加密 |
| **CORS** | 限制跨域 |
| **输入校验** | Pydantic自动校验 |
| **敏感信息** | 不存储用户敏感信息 |

---

## 十、技术债务与后续优化

### 10.1 MVP阶段技术债务

| 债务项 | 影响 | 解决时机 |
|--------|------|----------|
| localStorage容量限制 | 存储大量自选股可能不足 | Phase 2升级IndexedDB |
| 无错误重试机制 | 网络波动时体验差 | 快速修复 |
| LLM未接入 | AI结论质量有限 | Phase 2 |

### 10.2 Phase 2技术优化

1. **数据库迁移**：localStorage → PostgreSQL
2. **LLM接入**：OpenAI/Claude API
3. **数据源增强**：AKShare + Tushare
4. **缓存层**：Redis缓存热点数据
5. **监控告警**：接入Sentry错误监控

---

## 附录

### A. 环境变量参考

**前端（.env）**：
```
VITE_API_BASE=https://finance-ai-assistant-production.up.railway.app
```

**后端（Railway环境变量）**：
```
OPENAI_API_KEY=sk-xxx  # Phase 2配置
```

### B. 依赖清单

**后端（requirements.txt）**：
```
fastapi==0.109.0
uvicorn==0.27.0
akshare==1.12.0
pydantic==2.5.0
python-dotenv==1.0.0
```

**前端（package.json）**：
```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.22.0",
    "zustand": "^4.5.0"
  },
  "devDependencies": {
    "vite": "^5.1.0",
    "typescript": "^5.3.0",
    "@types/react": "^18.2.0",
    "tailwindcss": "^3.4.0"
  }
}
```

---

**文档状态**：待评审
**下一步**：提交方案评审Agent审核
