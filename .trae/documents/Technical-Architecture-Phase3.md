# 金融AI投资助手 - Phase 3 技术架构

> **版本**：v1.0
> **作者**：架构师Agent
> **日期**：2026-05-12
> **状态**：待评审
> **依赖**：Phase 2 技术架构

---

## 一、架构概览

### 1.1 整体架构图

```
┌─────────────────────────────────────────────────────────────┐
│                        前端层                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌─────────────────┐  │
│  │ 规则编辑器   │  │ 回测结果页   │  │ 社群内容页      │  │
│  │ (React)     │  │ (React)      │  │ (React)        │  │
│  └──────┬───────┘  └──────┬───────┘  └────────┬────────┘  │
└─────────┼─────────────────┼────────────────────┼───────────┘
          │                 │                    │
          └─────────────────┼────────────────────┘
                            │
┌───────────────────────────┴─────────────────────────────────┐
│                        API 网关层                            │
│              FastAPI + Pydantic + OpenAPI                    │
└───────────────────────────┬─────────────────────────────────┘
                            │
┌───────────────────────────┴─────────────────────────────────┐
│                    业务逻辑层                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌─────────────────┐  │
│  │ 规则引擎服务  │  │ 回测引擎服务  │  │ 社群内容服务    │  │
│  │ RuleEngine   │  │ Backtest     │  │ Community       │  │
│  └──────┬───────┘  └──────┬───────┘  └────────┬────────┘  │
└─────────┼─────────────────┼────────────────────┼───────────┘
          │                 │                    │
          └─────────────────┼────────────────────┘
                            │
┌───────────────────────────┴─────────────────────────────────┐
│                       数据层                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌─────────────────┐  │
│  │ 规则存储      │  │ 回测缓存      │  │ 社群内容缓存    │  │
│  │ (LocalStorage)│ │ (Redis)      │  │ (Elasticsearch) │  │
│  └──────────────┘  └──────────────┘  └─────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### 1.2 技术选型

| 层级 | 技术 | 说明 |
|------|------|------|
| 前端框架 | React + TypeScript + Vite | 保持与Phase 1-2一致 |
| 后端框架 | FastAPI + Python | 保持与Phase 1-2一致 |
| 规则解析 | Pydantic + AST | 规则语法验证与解析 |
| 回测引擎 | Pandas + NumPy | 历史数据处理与计算 |
| 社区爬虫 | BeautifulSoup + Requests | 社群内容爬取 |
| 缓存 | Redis | 回测结果缓存 |
| 搜索 | Elasticsearch | 社群内容全文检索 |

---

## 二、后端架构

### 2.1 规则引擎服务

#### 2.1.1 模块职责

| 模块 | 职责 |
|------|------|
| 规则解析器 | 解析前端传入的规则表达式，验证语法 |
| 条件执行器 | 执行单个条件，返回布尔结果 |
| 逻辑组合器 | 处理 AND/OR 逻辑组合 |
| 匹配引擎 | 对股票列表执行完整规则匹配 |

#### 2.1.2 核心类设计

```python
# rule_engine.py
from pydantic import BaseModel, Field
from enum import Enum
from typing import List, Union, Callable

class ConditionType(str, Enum):
    TECHNICAL = "technical"
    FUNDAMENTAL = "fundamental"
    NEWS = "news"

class Operator(str, Enum):
    GT = ">"
    GE = ">="
    LT = "<"
    LE = "<="
    EQ = "=="
    NE = "!="
    CONTAINS = "contains"
    NOT_CONTAINS = "not_contains"

class Condition(BaseModel):
    type: ConditionType
    field: str
    operator: Operator
    value: Union[float, int, str]

class Rule(BaseModel):
    id: str
    name: str
    conditions: List[Condition]
    condition_logic: str = Field(default="AND", pattern="^(AND|OR)$")
    is_active: bool = True
    created_at: str

class RuleEngine:
    def __init__(self):
        self.condition_handlers: Dict[ConditionType, Callable] = {
            ConditionType.TECHNICAL: self._evaluate_technical,
            ConditionType.FUNDAMENTAL: self._evaluate_fundamental,
            ConditionType.NEWS: self._evaluate_news
        }
    
    def validate_rule(self, rule: Rule) -> Tuple[bool, str]:
        # 验证规则语法和条件合法性
        pass
    
    def evaluate_condition(self, condition: Condition, stock_data: Dict) -> bool:
        # 执行单个条件
        handler = self.condition_handlers[condition.type]
        return handler(condition, stock_data)
    
    def execute_rule(self, rule: Rule, stocks: List[Dict]) -> List[Dict]:
        # 执行完整规则，返回匹配的股票列表
        pass
    
    def _evaluate_technical(self, condition: Condition, stock_data: Dict) -> bool:
        # 技术面条件评估
        pass
    
    def _evaluate_fundamental(self, condition: Condition, stock_data: Dict) -> bool:
        # 基本面条件评估
        pass
    
    def _evaluate_news(self, condition: Condition, stock_data: Dict) -> bool:
        # 消息面条件评估
        pass
```

#### 2.1.3 预设策略模板

```python
# preset_strategies.py

PRESET_STRATEGIES = [
    {
        "id": "preset_breakout",
        "name": "突破新高",
        "description": "价格创20日新高且放量上涨",
        "conditions": [
            {"type": "technical", "field": "change_percent", "operator": ">", "value": 3},
            {"type": "technical", "field": "volume_ratio", "operator": ">", "value": 1.5},
            {"type": "technical", "field": "is_new_high_20d", "operator": "==", "value": True}
        ],
        "condition_logic": "AND"
    },
    {
        "id": "preset_rebound",
        "name": "低位反弹",
        "description": "超跌后缩量企稳，放量反弹",
        "conditions": [
            {"type": "technical", "field": "max_drawdown_20d", "operator": "<", "value": -15},
            {"type": "technical", "field": "volume_ratio", "operator": ">", "value": 1.3},
            {"type": "technical", "field": "change_percent", "operator": ">", "value": 2}
        ],
        "condition_logic": "AND"
    },
    {
        "id": "preset_value",
        "name": "基本面优选",
        "description": "低估值+高成长+资金流入",
        "conditions": [
            {"type": "fundamental", "field": "pe_ratio", "operator": "<", "value": 30},
            {"type": "fundamental", "field": "revenue_growth_yoy", "operator": ">", "value": 20},
            {"type": "technical", "field": "northbound_net_inflow", "operator": ">", "value": 0}
        ],
        "condition_logic": "AND"
    }
]
```

### 2.2 回测引擎服务

#### 2.2.1 模块职责

| 模块 | 职责 |
|------|------|
| 历史数据加载器 | 从AKShare加载历史行情数据 |
| 策略执行器 | 在历史数据上模拟交易 |
| 指标计算器 | 计算收益率、回撤、胜率、夏普比率等 |
| 结果缓存器 | 缓存回测结果，避免重复计算 |

#### 2.2.2 核心类设计

```python
# backtest_engine.py
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from typing import List, Dict

class BacktestResult(BaseModel):
    strategy_id: str
    period: str
    total_return: float
    benchmark_return: float
    max_drawdown: float
    win_rate: float
    sharpe_ratio: float
    trades: List[Dict]

class BacktestEngine:
    def __init__(self):
        self.benchmark_code = "000300.SH"  # 沪深300
    
    def run_backtest(self, rule: Rule, period: str = "1Y") -> BacktestResult:
        """
        执行回测
        period: "1M", "3M", "6M", "1Y"
        """
        end_date = datetime.now()
        start_date = self._calculate_start_date(end_date, period)
        
        # 1. 加载历史数据
        stock_data = self._load_historical_data(start_date, end_date)
        benchmark_data = self._load_benchmark_data(start_date, end_date)
        
        # 2. 模拟交易
        trades = self._simulate_trading(rule, stock_data)
        
        # 3. 计算指标
        result = self._calculate_metrics(trades, benchmark_data, start_date, end_date)
        
        return result
    
    def _load_historical_data(self, start_date: datetime, end_date: datetime) -> pd.DataFrame:
        # 从AKShare加载历史行情数据
        pass
    
    def _load_benchmark_data(self, start_date: datetime, end_date: datetime) -> pd.DataFrame:
        # 加载基准指数数据
        pass
    
    def _simulate_trading(self, rule: Rule, data: pd.DataFrame) -> List[Dict]:
        # 在历史数据上模拟交易
        # 简化版：每日执行规则，匹配则买入，N日后卖出
        trades = []
        position = None
        
        for date, day_data in data.iterrows():
            if position is None:
                # 无持仓，检查是否买入
                if self._check_match(rule, day_data):
                    position = {
                        "stock_code": day_data["code"],
                        "buy_date": date,
                        "buy_price": day_data["close"]
                    }
            else:
                # 有持仓，检查是否卖出（简化：持有5个交易日）
                hold_days = (date - position["buy_date"]).days
                if hold_days >= 5:
                    position["sell_date"] = date
                    position["sell_price"] = day_data["close"]
                    position["return"] = (position["sell_price"] / position["buy_price"] - 1) * 100
                    trades.append(position)
                    position = None
        
        return trades
    
    def _calculate_metrics(self, trades: List[Dict], 
                          benchmark: pd.DataFrame,
                          start_date: datetime,
                          end_date: datetime) -> BacktestResult:
        """
        计算回测指标
        """
        if not trades:
            return BacktestResult(
                strategy_id="",
                period="",
                total_return=0,
                benchmark_return=0,
                max_drawdown=0,
                win_rate=0,
                sharpe_ratio=0,
                trades=[]
            )
        
        # 计算策略总收益率
        strategy_return = 1.0
        for trade in trades:
            strategy_return *= (1 + trade["return"] / 100)
        total_return = (strategy_return - 1) * 100
        
        # 计算基准收益率
        benchmark_start = benchmark.iloc[0]["close"]
        benchmark_end = benchmark.iloc[-1]["close"]
        benchmark_return = (benchmark_end / benchmark_start - 1) * 100
        
        # 计算胜率
        winning_trades = [t for t in trades if t["return"] > 0]
        win_rate = len(winning_trades) / len(trades) * 100
        
        # 计算最大回撤
        max_drawdown = self._calculate_max_drawdown(trades)
        
        # 计算夏普比率
        sharpe_ratio = self._calculate_sharpe_ratio(total_return, trades)
        
        return BacktestResult(
            strategy_id="",
            period="",
            total_return=total_return,
            benchmark_return=benchmark_return,
            max_drawdown=max_drawdown,
            win_rate=win_rate,
            sharpe_ratio=sharpe_ratio,
            trades=trades
        )
    
    def _calculate_max_drawdown(self, trades: List[Dict]) -> float:
        # 计算最大回撤
        pass
    
    def _calculate_sharpe_ratio(self, total_return: float, trades: List[Dict]) -> float:
        # 计算夏普比率
        pass

#### 2.2.3 回测降级策略

**降级实现流程**：

```python
# backtest_engine.py（降级实现补充）
class BacktestEngine:
    def __init__(self):
        self.benchmark_code = "000300.SH"  # 沪深300
        self.degradation_levels = [
            {"period": "1Y", "metrics": "full"},
            {"period": "6M", "metrics": "full"},
            {"period": "3M", "metrics": "simplified"},
            {"period": "1M", "metrics": "simplified"},
            {"use_preset": True}
        ]
    
    def run_backtest_with_degradation(self, rule: Rule, 
                                    max_attempts: int = 5) -> Tuple[BacktestResult, str]:
        """
        带降级的回测执行
        返回：(结果, 降级说明)
        """
        warnings = []
        
        for level, config in enumerate(self.degradation_levels):
            try:
                if "use_preset" in config:
                    # 降级到预设模板
                    preset = self._find_similar_preset(rule)
                    result = self._get_preset_backtest(preset)
                    warnings.append("策略回测失败，已为您展示类似预设模板的历史表现")
                    return result, "; ".join(warnings)
                
                # 执行当前降级级别
                period = config["period"]
                metrics_type = config["metrics"]
                
                result = self.run_backtest(rule, period, metrics_type)
                if level > 0:
                    warnings.append(f"已自动缩短回测周期至{period}以提升速度")
                return result, "; ".join(warnings)
                
            except TimeoutError:
                warnings.append(f"回测周期{period}超时")
                continue
            except DataMissingError:
                warnings.append(f"历史数据不完整")
                continue
            except Exception as e:
                warnings.append(f"回测错误: {str(e)}")
                continue
        
        raise BacktestFailedError("所有降级策略均失败")
    
    def run_backtest(self, rule: Rule, period: str, 
                    metrics_type: str = "full") -> BacktestResult:
        """
        回测（支持简化指标）
        metrics_type: "full"（全部指标）| "simplified"（仅收益率+胜率）
        """
        # ...（原有逻辑）
        if metrics_type == "simplified":
            # 简化模式：不计算夏普比率、最大回撤
            return BacktestResult(
                strategy_id=rule.id,
                period=period,
                total_return=total_return,
                benchmark_return=benchmark_return,
                max_drawdown=0,  # 简化模式不计算
                win_rate=win_rate,
                sharpe_ratio=0,  # 简化模式不计算
                trades=trades,
                metrics_type="simplified",
                data_warning="数据有限，结果仅供参考"
            )
    
    def _find_similar_preset(self, rule: Rule) -> Dict:
        """查找类似的预设策略"""
        # 计算相似度（基于条件类型和数量）
        pass
    
    def _get_preset_backtest(self, preset: Dict) -> BacktestResult:
        """获取预设策略的预计算回测结果"""
        return self.preset_backtest_cache.get(preset["id"])
```

### 2.3 社群内容服务

#### 2.3.1 模块职责

| 模块 | 职责 |
|------|------|
| 爬虫调度器 | 调度多个社区爬虫 |
| 内容清洗器 | 去重、格式统一、敏感词过滤 |
| 质量评分器 | 综合互动量、作者影响力等打分 |
| 情感分析器 | 分析帖子看涨/看跌倾向 |

#### 2.3.2 核心类设计

```python
# community_service.py
from typing import List, Dict
from datetime import datetime

class CommunityPost(BaseModel):
    id: str
    source: str  # "guba", "xueqiu", "eastmoney"
    title: str
    content: str
    author: str
    author_followers: int
    likes: int
    comments: int
    publish_time: str
    related_stocks: List[str]
    sentiment: str  # "bullish", "bearish", "neutral"
    quality_score: float

class CommunityService:
    def __init__(self):
        self.crawlers = {
            "guba": GubaCrawler(),
            "xueqiu": XueqiuCrawler(),
            "eastmoney": EastmoneyCrawler()
        }
    
    def get_posts(self, stock_code: str = None, limit: int = 20) -> List[CommunityPost]:
        """
        获取社群热帖
        """
        all_posts = []
        
        # 1. 从各平台爬取
        for source, crawler in self.crawlers.items():
            try:
                posts = crawler.fetch_posts(stock_code, limit)
                all_posts.extend(posts)
            except Exception as e:
                print(f"Crawl {source} error: {e}")
        
        # 2. 内容清洗
        cleaned_posts = self._clean_posts(all_posts)
        
        # 3. 质量评分
        scored_posts = self._score_posts(cleaned_posts)
        
        # 4. 情感分析
        analyzed_posts = self._analyze_sentiment(scored_posts)
        
        # 5. 排序
        analyzed_posts.sort(key=lambda x: x.quality_score, reverse=True)
        
        return analyzed_posts[:limit]
    
    def _clean_posts(self, posts: List[Dict]) -> List[Dict]:
        # 内容清洗
        pass
    
    def _score_posts(self, posts: List[Dict]) -> List[CommunityPost]:
        # 质量评分
        pass
    
    def _analyze_sentiment(self, posts: List[CommunityPost]) -> List[CommunityPost]:
        # 情感分析
        pass
```

---

## 三、前端架构

### 3.1 新增页面与组件

| 页面/组件 | 位置 | 功能 |
|---------|------|------|
| RuleEditorPage | `src/pages/RuleEditorPage.tsx` | 规则编辑器 |
| BacktestPage | `src/pages/BacktestPage.tsx` | 回测结果页 |
| CommunityPage | `src/pages/CommunityPage.tsx` | 社群内容页 |
| RuleCard | `src/components/RuleCard.tsx` | 规则卡片组件 |
| ConditionBuilder | `src/components/ConditionBuilder.tsx` | 条件构建组件 |

### 3.2 状态管理

```typescript
// src/stores/ruleStore.ts
import { create } from "zustand";

interface Condition {
  id: string;
  type: "technical" | "fundamental" | "news";
  field: string;
  operator: string;
  value: number | string;
}

interface Rule {
  id: string;
  name: string;
  conditions: Condition[];
  conditionLogic: "AND" | "OR";
  isActive: boolean;
  createdAt: string;
}

interface RuleState {
  rules: Rule[];
  currentRule: Rule | null;
  addRule: (rule: Rule) => void;
  updateRule: (id: string, rule: Partial<Rule>) => void;
  deleteRule: (id: string) => void;
  setCurrentRule: (rule: Rule | null) => void;
}

export const useRuleStore = create<RuleState>((set) => ({
  rules: [],
  currentRule: null,
  addRule: (rule) => set((state) => ({ rules: [...state.rules, rule] })),
  updateRule: (id, updates) =>
    set((state) => ({
      rules: state.rules.map((r) => r.id === id ? { ...r, ...updates } : r),
    })),
  deleteRule: (id) =>
    set((state) => ({
      rules: state.rules.filter((r) => r.id !== id),
    })),
  setCurrentRule: (rule) => set({ currentRule: rule }),
}));
```

### 3.3 服务层

```typescript
// src/services/ruleService.ts
const API_BASE = import.meta.env.VITE_API_BASE || "";

export interface Condition {
  type: "technical" | "fundamental" | "news";
  field: string;
  operator: string;
  value: number | string;
}

export interface Rule {
  id: string;
  name: string;
  conditions: Condition[];
  conditionLogic: "AND" | "OR";
  isActive: boolean;
  createdAt: string;
}

export const ruleService = {
  async getRules(): Promise<{ code: number; data: { rules: Rule[] } }> {
    const res = await fetch(`${API_BASE}/api/v3/rules`);
    return res.json();
  },

  async createRule(rule: Omit<Rule, "id" | "createdAt">): Promise<{ code: number; data: { rule: Rule } }> {
    const res = await fetch(`${API_BASE}/api/v3/rules`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(rule),
    });
    return res.json();
  },

  async matchRule(id: string): Promise<{ code: number; data: { stocks: any[] } }> {
    const res = await fetch(`${API_BASE}/api/v3/rules/${id}/match`);
    return res.json();
  },
};

// src/services/backtestService.ts
export interface BacktestResult {
  strategyId: string;
  period: string;
  totalReturn: number;
  benchmarkReturn: number;
  maxDrawdown: number;
  winRate: number;
  sharpeRatio: number;
  trades: Array<{
    stockCode: string;
    buyDate: string;
    buyPrice: number;
    sellDate: string;
    sellPrice: number;
    return: number;
  }>;
}

export const backtestService = {
  async runBacktest(ruleId: string, period: string = "1Y"): Promise<{ code: number; data: BacktestResult }> {
    const res = await fetch(`${API_BASE}/api/v3/backtest`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ruleId, period }),
    });
    return res.json();
  },
};
```

---

## 四、API 设计

### 4.1 新增接口详情

| 接口 | 方法 | 请求 | 响应 |
|------|------|------|------|
| `/api/v3/rules` | GET | N/A | `{ code: 0, data: { rules: Rule[] } }` |
| `/api/v3/rules` | POST | `RuleCreate` | `{ code: 0, data: { rule: Rule } }` |
| `/api/v3/rules/{id}` | PUT | `RuleUpdate` | `{ code: 0, data: { rule: Rule } }` |
| `/api/v3/rules/{id}` | DELETE | N/A | `{ code: 0 }` |
| `/api/v3/rules/{id}/match` | GET | N/A | `{ code: 0, data: { stocks: Stock[] } }` |
| `/api/v3/backtest` | POST | `{ ruleId, period }` | `{ code: 0, data: BacktestResult }` |
| `/api/v3/community/posts` | GET | `{ stockCode, limit }` | `{ code: 0, data: { posts: Post[] } }` |

### 4.2 集成到 app.py

```python
# app.py (新增)

from rule_engine import RuleEngine, PRESET_STRATEGIES
from backtest_engine import BacktestEngine
from community_service import CommunityService

rule_engine = RuleEngine()
backtest_engine = BacktestEngine()
community_service = CommunityService()

# ====================
# 规则引擎 API
# ====================

@app.get("/api/v3/rules")
async def get_rules():
    """获取规则列表（包含预设策略）"""
    user_rules = []  # TODO: 从存储加载用户规则
    all_rules = PRESET_STRATEGIES + user_rules
    return {"code": 0, "data": {"rules": all_rules}}

@app.post("/api/v3/rules")
async def create_rule(rule: Rule):
    """创建规则"""
    # TODO: 验证规则
    rule.id = f"rule_{int(time.time())}"
    rule.created_at = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    # TODO: 保存规则
    return {"code": 0, "data": {"rule": rule}}

@app.get("/api/v3/rules/{rule_id}/match")
async def match_rule(rule_id: str):
    """规则实时匹配"""
    # TODO: 获取规则
    # TODO: 获取当前股票行情
    # TODO: 执行规则匹配
    return {"code": 0, "data": {"stocks": []}}

# ====================
# 回测引擎 API
# ====================

@app.post("/api/v3/backtest")
async def run_backtest(request: Dict):
    """执行回测"""
    rule_id = request.get("ruleId")
    period = request.get("period", "1Y")
    # TODO: 获取规则
    # TODO: 执行回测
    result = backtest_engine.run_backtest(rule, period)
    return {"code": 0, "data": result}

# ====================
# 社群内容 API
# ====================

@app.get("/api/v3/community/posts")
async def get_community_posts(stock_code: str = None, limit: int = 20):
    """获取社群热帖"""
    posts = community_service.get_posts(stock_code, limit)
    return {"code": 0, "data": {"posts": posts}}
```

---

## 五、数据存储

### 5.1 存储方案

| 数据类型 | 存储方式 | 说明 |
|---------|---------|------|
| 用户规则 | LocalStorage | 前端存储 |
| 回测结果 | Redis | 缓存，TTL=1小时 |
| 社群内容 | Elasticsearch | 可选，需要时再引入 |

---

## 六、部署方案

### 6.1 后端部署 (Railway)

与Phase 2一致，无需额外配置。

### 6.2 前端部署 (Netlify)

与Phase 2一致，无需额外配置。

---

## 七、开发计划

| 阶段 | 任务 | 预计工时 |
|------|------|---------|
| Phase3.1 | 规则引擎后端 + API | 2天 |
| Phase3.1 | 规则引擎前端（编辑器+匹配） | 3天 |
| Phase3.2 | 回测引擎后端 | 2天 |
| Phase3.2 | 回测结果页前端 | 2天 |
| Phase3.3 | 社群内容爬虫 + 服务 | 2天 |
| Phase3.3 | 社群内容页前端 | 1天 |
| Phase3.4 | 多券商跳转（可选） | 2天 |

**总计**：14天

---

**文档状态**：待评审
**下一步**：架构评审 → Phase3.1开发
