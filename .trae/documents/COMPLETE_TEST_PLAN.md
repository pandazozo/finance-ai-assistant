# 金融AI投资助手 - 100%代码覆盖全面测试计划

> **版本**：v2.0 (完整覆盖版)
> **作者**：QA测试负责人
> **日期**：2026-05-12
> **目标**：实现代码覆盖100%
> **范围**：所有Phase 1-3功能

---

## 一、测试覆盖目标

### 1.1 总体目标
- **后端代码覆盖**：100%
- **前端代码覆盖**：100%
- **API接口覆盖**：100%
- **E2E用户流程覆盖**：100%

### 1.2 测试金字塔

```
              /\
             /  \       E2E测试 (20%)
            /____\
           /      \     集成测试 (30%)
          /________\
         /          \    单元测试 (50%)
        /____________\
```

---

## 二、后端代码完整覆盖计划

### 2.1 后端模块清单

| 模块文件 | 代码行数 | 优先级 | 现有测试 | 新增测试数 | 目标覆盖 |
|---------|---------|-------|---------|----------|---------|
| [app.py](file:///workspace/app.py) | ~900 | P0 | 部分 | 30+ | 100% |
| [rule_engine.py](file:///workspace/rule_engine.py) | 135 | P0 | 28 | 10+ | 100% |
| [backtest_engine.py](file:///workspace/backtest_engine.py) | 317 | P0 | 0 | 35+ | 100% |
| [community_service.py](file:///workspace/community_service.py) | 173 | P1 | 0 | 25+ | 100% |
| [news_service.py](file:///workspace/news_service.py) | 待查 | P1 | 部分 | 15+ | 100% |
| [llm_service.py](file:///workspace/llm_service.py) | 待查 | P1 | 部分 | 15+ | 100% |
| [preset_strategies.py](file:///workspace/preset_strategies.py) | 待查 | P1 | 7 | 8+ | 100% |

### 2.2 [app.py](file:///workspace/app.py) 全面测试覆盖

#### 测试分类

| 类别 | 用例数 | 目标路径 | 说明 |
|-----|--------|--------|------|
| Phase 1 API | 12 | `/api/health`, `/api/v1/stocks/*`, `/api/opportunities`, `/api/anomalies`, `/api/review` | 核心行情、机会、异动、复盘API |
| Phase 2 API | 8 | `/api/v1/stocks/news`, `/api/v1/stocks/analysis` | 资讯、AI分析API |
| Phase 3 API | 15 | `/api/v3/rules/*`, `/api/v3/presets`, `/api/v3/backtest`, `/api/v3/community/posts` | 规则引擎、回测、社群API |
| 错误处理 | 8 | 所有异常路径 | 404, 500, 400错误 |
| 边界情况 | 10 | 空数据、网络超时 | 边界测试 |

#### 具体测试用例

##### 2.2.1 Phase 1 - 核心功能测试

```python
# 文件: tests/backend/test_phase1.py

class TestPhase1Core:
    """Phase 1核心功能完整测试"""
    
    def test_health_endpoint(self):
        """测试健康检查端点"""
        
    def test_stock_quote_single(self):
        """测试单只股票行情"""
        
    def test_stock_quote_multiple(self):
        """测试多只股票行情"""
        
    def test_stock_quote_invalid_code(self):
        """测试无效股票代码"""
        
    def test_stock_quote_empty_list(self):
        """测试空股票代码列表"""
        
    def test_stock_search_success(self):
        """测试股票搜索成功"""
        
    def test_stock_search_no_results(self):
        """测试股票搜索无结果"""
        
    def test_stock_search_empty_query(self):
        """测试空搜索词"""
        
    def test_opportunities_endpoint(self):
        """测试投资机会端点"""
        
    def test_opportunities_with_risk_preference(self):
        """测试带风险偏好的机会"""
        
    def test_anomalies_endpoint(self):
        """测试异动情报端点"""
        
    def test_review_endpoint(self):
        """测试市场复盘端点"""
```

##### 2.2.2 Phase 2 - AI与资讯测试

```python
# 文件: tests/backend/test_phase2.py

class TestPhase2AI:
    """Phase 2 AI和资讯功能完整测试"""
    
    def test_news_list(self):
        """测试资讯列表"""
        
    def test_news_with_impact_score(self):
        """测试资讯影响分数计算"""
        
    def test_news_empty_code(self):
        """测试空股票代码的资讯"""
        
    def test_news_invalid_code(self):
        """测试无效股票代码的资讯"""
        
    def test_ai_conclusion_with_risk_preference(self):
        """测试带风险偏好的AI结论"""
        
    def test_ai_conclusion_conservative(self):
        """测试保守型风险偏好"""
        
    def test_ai_conclusion_aggressive(self):
        """测试激进型风险偏好"""
        
    def test_ai_conclusion_balanced(self):
        """测试平衡型风险偏好"""
        
    def test_ai_conclusion_fallback(self):
        """测试AI结论降级逻辑"""
        
    def test_news_weighting_algorithm(self):
        """测试新闻权重算法 (时效性×0.3 + 相关性×0.4 + 权威性×0.3)"""
```

##### 2.2.3 Phase 3 - 规则引擎测试

```python
# 文件: tests/backend/test_phase3.py

class TestPhase3RuleEngine:
    """Phase 3规则引擎完整测试"""
    
    # 规则管理
    def test_get_rules_empty(self):
        """测试获取空规则列表"""
        
    def test_create_rule_valid(self):
        """测试创建有效规则"""
        
    def test_create_rule_invalid(self):
        """测试创建无效规则"""
        
    def test_create_rule_duplicate_name(self):
        """测试创建重复名称规则"""
        
    def test_update_rule(self):
        """测试更新规则"""
        
    def test_update_rule_invalid_id(self):
        """测试更新不存在的规则"""
        
    def test_delete_rule(self):
        """测试删除规则"""
        
    def test_delete_rule_invalid_id(self):
        """测试删除不存在的规则"""
    
    # 规则匹配
    def test_match_rule_no_stocks(self):
        """测试无股票匹配"""
        
    def test_match_rule_and_logic(self):
        """测试AND逻辑匹配"""
        
    def test_match_rule_or_logic(self):
        """测试OR逻辑匹配"""
        
    def test_match_rule_all_matches(self):
        """测试所有股票都匹配"""
        
    def test_match_rule_no_matches(self):
        """测试没有股票匹配"""
    
    # 预设策略
    def test_get_all_presets(self):
        """测试获取所有预设策略"""
        
    def test_get_preset_by_id(self):
        """测试按ID获取预设"""
        
    def test_get_preset_invalid_id(self):
        """测试获取无效ID预设"""
        
    def test_create_rule_from_preset(self):
        """测试从预设创建规则"""
    
    # 回测功能
    def test_backtest_success(self):
        """测试成功回测"""
        
    def test_backtest_empty_stock_data(self):
        """测试空股票数据回测"""
        
    def test_backtest_no_trades(self):
        """测试无交易回测"""
        
    def test_backtest_with_degradation_1y(self):
        """测试1年降级回测"""
        
    def test_backtest_with_degradation_6m(self):
        """测试6个月降级回测"""
        
    def test_backtest_with_degradation_3m(self):
        """测试3个月降级回测"""
        
    def test_backtest_with_degradation_1m(self):
        """测试1个月降级回测"""
        
    def test_backtest_preset_fallback(self):
        """测试预设回测降级"""
        
    def test_backtest_calculate_metrics(self):
        """测试回测指标计算"""
        
    def test_backtest_max_drawdown(self):
        """测试最大回撤计算"""
        
    def test_backtest_sharpe_ratio(self):
        """测试夏普比率计算"""
        
    def test_backtest_win_rate(self):
        """测试胜率计算"""
    
    # 社群服务
    def test_community_posts(self):
        """测试社群帖子获取"""
        
    def test_community_posts_with_code(self):
        """测试带股票代码的社群帖子"""
        
    def test_community_posts_sorting(self):
        """测试社群帖子排序"""
        
    def test_community_posts_sentiment(self):
        """测试社群帖子情感分析"""
        
    def test_community_posts_quality_scoring(self):
        """测试社群帖子质量评分"""
```

##### 2.2.4 错误处理与边界测试

```python
# 文件: tests/backend/test_error_handling.py

class TestErrorHandling:
    """错误处理完整测试"""
    
    def test_404_not_found(self):
        """测试404错误"""
        
    def test_500_internal_error(self):
        """测试500错误"""
        
    def test_400_bad_request(self):
        """测试400错误"""
        
    def test_invalid_risk_preference(self):
        """测试无效风险偏好"""
        
    def test_network_timeout(self):
        """测试网络超时"""
        
    def test_akshare_failure(self):
        """测试AKShare失败"""
        
    def test_empty_data_handling(self):
        """测试空数据处理"""
        
    def test_invalid_json_payload(self):
        """测试无效JSON载荷"""
```

### 2.3 [rule_engine.py](file:///workspace/rule_engine.py) 完整测试

```python
# 文件: tests/backend/test_rule_engine_complete.py

class TestRuleEngineComplete:
    """规则引擎完整测试 - 覆盖100%代码"""
    
    # 已覆盖：初始化、验证、评估、执行、单例
    # 新增覆盖：
    
    def test_validate_condition_invalid_type(self):
        """测试验证无效类型条件"""
        
    def test_validate_condition_empty_field(self):
        """测试验证空字段"""
        
    def test_evaluate_condition_field_none(self):
        """测试字段为None的评估"""
        
    def test_evaluate_news_condition_not_bool(self):
        """测试非布尔值的新闻条件"""
        
    def test_compare_contains(self):
        """测试包含比较"""
        
    def test_compare_not_contains(self):
        """测试不包含比较"""
        
    def test_compare_string_values(self):
        """测试字符串值比较"""
        
    def test_compare_invalid_operator(self):
        """测试无效操作符"""
        
    def test_match_rule_empty_conditions(self):
        """测试空条件匹配"""
```

### 2.4 [backtest_engine.py](file:///workspace/backtest_engine.py) 完整测试

```python
# 文件: tests/backend/test_backtest_engine.py

class TestBacktestEngine:
    """回测引擎完整测试 - 覆盖100%代码"""
    
    def test_backtest_engine_init(self):
        """测试回测引擎初始化"""
        
    def test_calculate_start_date_1y(self):
        """测试计算1年起始日期"""
        
    def test_calculate_start_date_6m(self):
        """测试计算6个月起始日期"""
        
    def test_calculate_start_date_3m(self):
        """测试计算3个月起始日期"""
        
    def test_calculate_start_date_1m(self):
        """测试计算1个月起始日期"""
        
    def test_load_historical_data_success(self):
        """测试加载历史数据成功"""
        
    def test_load_historical_data_failure(self):
        """测试加载历史数据失败"""
        
    def test_load_benchmark_data(self):
        """测试加载基准数据"""
        
    def test_load_benchmark_data_failure(self):
        """测试加载基准数据失败"""
        
    def test_simulate_trading_buy(self):
        """测试模拟交易买入"""
        
    def test_simulate_trading_hold(self):
        """测试模拟交易持有"""
        
    def test_simulate_trading_sell(self):
        """测试模拟交易卖出"""
        
    def test_simulate_trading_no_position(self):
        """测试无持仓模拟"""
        
    def test_check_match(self):
        """测试检查匹配"""
        
    def test_calculate_metrics_no_trades(self):
        """测试无交易指标计算"""
        
    def test_calculate_metrics_with_trades(self):
        """测试有交易指标计算"""
        
    def test_calculate_max_drawdown(self):
        """测试最大回撤计算"""
        
    def test_calculate_max_drawdown_empty(self):
        """测试空交易最大回撤"""
        
    def test_calculate_sharpe_ratio(self):
        """测试夏普比率计算"""
        
    def test_calculate_sharpe_ratio_few_trades(self):
        """测试少交易夏普比率"""
        
    def test_calculate_sharpe_ratio_zero_std(self):
        """测试零标准差夏普比率"""
        
    def test_run_backtest_full(self):
        """测试完整回测"""
        
    def test_run_backtest_empty_data(self):
        """测试空数据回测"""
        
    def test_run_backtest_with_degradation_all_levels(self):
        """测试所有降级级别回测"""
        
    def test_get_preset_backtest_placeholder(self):
        """测试预设回测占位符"""
```

### 2.5 [community_service.py](file:///workspace/community_service.py) 完整测试

```python
# 文件: tests/backend/test_community_service.py

class TestCommunityService:
    """社群服务完整测试 - 覆盖100%代码"""
    
    def test_community_service_init(self):
        """测试社群服务初始化"""
        
    def test_get_posts_default(self):
        """测试默认获取帖子"""
        
    def test_get_posts_with_code(self):
        """测试带股票代码获取帖子"""
        
    def test_get_posts_with_name(self):
        """测试带股票名称获取帖子"""
        
    def test_get_posts_limit(self):
        """测试限制帖子数量"""
        
    def test_generate_mock_posts(self):
        """测试生成模拟帖子"""
        
    def test_generate_mock_posts_templates(self):
        """测试所有模板帖子"""
        
    def test_get_sentiment_label_bullish(self):
        """测试看涨标签"""
        
    def test_get_sentiment_label_bearish(self):
        """测试看跌标签"""
        
    def test_get_sentiment_label_neutral(self):
        """测试中性标签"""
        
    def test_get_sentiment_label_unknown(self):
        """测试未知标签"""
        
    def test_score_posts_likes(self):
        """测试帖子点赞评分"""
        
    def test_score_posts_comments(self):
        """测试帖子评论评分"""
        
    def test_score_posts_followers(self):
        """测试作者粉丝评分"""
        
    def test_score_posts_recency(self):
        """测试帖子时效性评分"""
        
    def test_score_posts_sentiment(self):
        """测试帖子情感评分"""
        
    def test_calculate_recency_score_new(self):
        """测试新帖时效性评分"""
        
    def test_calculate_recency_score_medium(self):
        """测试中等时效性评分"""
        
    def test_calculate_recency_score_old(self):
        """测试旧帖时效性评分"""
        
    def test_calculate_recency_score_invalid(self):
        """测试无效日期评分"""
        
    def test_get_quality_label_high(self):
        """测试高质量标签"""
        
    def test_get_quality_label_good(self):
        """测试良好质量标签"""
        
    def test_get_quality_label_average(self):
        """测试一般质量标签"""
        
    def test_get_quality_label_low(self):
        """测试低质量标签"""
        
    def test_get_community_service_singleton(self):
        """测试单例获取"""
```

---

## 三、前端代码完整覆盖计划

### 3.1 前端模块清单

| 模块文件 | 优先级 | 现有测试 | 新增测试数 | 目标覆盖 |
|---------|-------|---------|----------|---------|
| [src/services/api.ts](file:///workspace/src/services/api.ts) | P0 | 10 | 15+ | 100% |
| [src/services/brokerService.ts](file:///workspace/src/services/brokerService.ts) | P0 | 0 | 10+ | 100% |
| [src/services/dataService.ts](file:///workspace/src/services/dataService.ts) | P0 | 8 | 12+ | 100% |
| [src/services/llmService.ts](file:///workspace/src/services/llmService.ts) | P1 | 部分 | 10+ | 100% |
| [src/services/newsService.ts](file:///workspace/src/services/newsService.ts) | P1 | 部分 | 10+ | 100% |
| [src/services/ruleService.ts](file:///workspace/src/services/ruleService.ts) | P0 | 部分 | 12+ | 100% |
| [src/stores/](file:///workspace/src/stores/) | P0 | 8 | 15+ | 100% |
| [src/pages/](file:///workspace/src/pages/) | P0 | 0 | 30+ | 100% |
| [src/components/](file:///workspace/src/components/) | P1 | 0 | 20+ | 100% |

### 3.2 前端服务层测试

```typescript
// 文件: tests/frontend/api.test.ts (增强版)

describe('API Service - 100% Coverage', () => {
    // 已覆盖的基础测试
    
    // 新增：
    test('fetchOpportunities with risk preference', async () => {});
    test('fetchOpportunities network error', async () => {});
    test('fetchOpportunities timeout', async () => {});
    
    test('fetchAnomalies with thresholds', async () => {});
    test('fetchAnomalies error handling', async () => {});
    
    test('fetchReview date range', async () => {});
    test('fetchReview fallback data', async () => {});
    
    test('searchStocks empty query', async () => {});
    test('searchStocks no results', async () => {});
    
    test('fetchStockAIConclusion aggressive', async () => {});
    test('fetchStockAIConclusion conservative', async () => {});
    test('fetchStockAIConclusion error', async () => {});
    
    test('fetchNews with impact score', async () => {});
    test('fetchNews empty', async () => {});
});
```

```typescript
// 文件: tests/frontend/brokerService.test.ts (新增)

describe('Broker Service - 100% Coverage', () => {
    test('jumpToBroker huatai', async () => {});
    test('jumpToBroker citic', async () => {});
    test('jumpToBroker unknown broker', async () => {});
    test('jumpToBroker invalid stock code', async () => {});
    test('getBrokerList', () => {});
    test('getBrokerById existing', () => {});
    test('getBrokerById not found', () => {});
    test('buildDeepLink', () => {});
    test('buildDeepLink special characters', () => {});
});
```

```typescript
// 文件: tests/frontend/ruleService.test.ts (增强版)

describe('Rule Service - 100% Coverage', () => {
    test('getRules empty', async () => {});
    test('getRules with data', async () => {});
    test('createRule valid', async () => {});
    test('createRule invalid', async () => {});
    test('updateRule success', async () => {});
    test('updateRule not found', async () => {});
    test('deleteRule success', async () => {});
    test('deleteRule not found', async () => {});
    test('matchRule success', async () => {});
    test('matchRule no matches', async () => {});
    test('getPresets', async () => {});
    test('runBacktest success', async () => {});
    test('runBacktest error', async () => {});
});
```

### 3.3 前端状态管理测试

```typescript
// 文件: tests/frontend/stores.test.ts (增强版)

describe('Stores - 100% Coverage', () => {
    describe('useAppStore', () => {
        test('initial state', () => {});
        test('setDisclaimerAccepted', () => {});
        test('toggleDisclaimer', () => {});
        test('addWatchlistStock', () => {});
        test('addWatchlistStock duplicate', () => {});
        test('removeWatchlistStock', () => {});
        test('removeWatchlistStock not found', () => {});
        test('setRiskPreference', () => {});
        test('setRiskPreference invalid', () => {});
        test('setAnomalyThreshold', () => {});
        test('setAnomalyThreshold out of range', () => {});
        test('toggleAnomalyAlert', () => {});
    });
    
    describe('ruleStore', () => {
        test('initial state', () => {});
        test('setRules', () => {});
        test('addRule', () => {});
        test('updateRule', () => {});
        test('deleteRule', () => {});
        test('selectRule', () => {});
        test('clearSelectedRule', () => {});
    });
});
```

### 3.4 前端页面组件测试

```typescript
// 文件: tests/frontend/components.test.ts (新增)

describe('Components - 100% Coverage', () => {
    describe('HomePage', () => {
        test('renders empty state', () => {});
        test('renders watchlist', () => {});
        test('refresh button', () => {});
    });
    
    describe('StockDetailPage', () => {
        test('renders stock info', () => {});
        test('renders AI conclusion', () => {});
        test('jump to trade button', () => {});
        test('back button', () => {});
    });
    
    describe('RuleEditorPage', () => {
        test('renders rule list', () => {});
        test('renders preset strategies', () => {});
        test('creates new rule', () => {});
        test('edits rule', () => {});
        test('deletes rule', () => {});
    });
    
    describe('BacktestResultPage', () => {
        test('renders backtest results', () => {});
        test('renders chart', () => {});
        test('renders metrics', () => {});
        test('renders trades list', () => {});
    });
    
    describe('AnomalyPage', () => {
        test('renders anomaly list', () => {});
        test('filters by type', () => {});
    });
    
    describe('SettingsPage', () => {
        test('renders risk preference', () => {});
        test('renders anomaly settings', () => {});
        test('updates settings', () => {});
    });
});
```

---

## 四、E2E 完整测试计划

### 4.1 Playwright E2E 测试扩展

```typescript
// 文件: e2e/app.spec.ts (增强版)

describe('Phase 1 - Core Features E2E', () => {
    test('Homepage loads with hot opportunities', async () => {});
    test('Add stock to watchlist', async () => {});
    test('Remove stock from watchlist', async () => {});
    test('Navigate to stock detail', async () => {});
    test('View anomalies list', async () => {});
    test('View market review', async () => {});
});

describe('Phase 2 - AI & News E2E', () => {
    test('View AI conclusion on stock detail', async () => {});
    test('AI conclusion changes with risk preference', async () => {});
    test('View news list with impact scores', async () => {});
    test('News weighting algorithm visible', async () => {});
});

describe('Phase 3 - Rule Engine E2E', () => {
    test('Navigate to rule editor', async () => {});
    test('View preset strategies', async () => {});
    test('Create custom rule', async () => {});
    test('Edit existing rule', async () => {});
    test('Delete rule', async () => {});
    test('Run backtest', async () => {});
    test('View backtest results chart', async () => {});
    test('View community posts', async () => {});
    test('Jump to broker trading', async () => {});
});

describe('User Journey E2E', () => {
    test('Complete user journey - first time user', async () => {
        // 1. Open app, see disclaimer
        // 2. Accept disclaimer
        // 3. Add stock to watchlist
        // 4. View stock detail, read AI conclusion
        // 5. Adjust risk preference
        // 6. Check opportunities
        // 7. Check anomalies
        // 8. Create custom rule
        // 9. Run backtest
        // 10. View community
    });
    
    test('Complete user journey - power user', async () => {
        // 1. Multiple stocks in watchlist
        // 2. Switch between tabs
        // 3. Create multiple rules
        // 4. Compare backtest results
        // 5. Adjust risk settings
    });
});
```

---

## 五、测试覆盖率度量

### 5.1 后端覆盖率目标

```bash
# 运行后端覆盖率测试
cd /workspace && pytest tests/backend/ \
    --cov=app \
    --cov=rule_engine \
    --cov=backtest_engine \
    --cov=community_service \
    --cov=news_service \
    --cov=llm_service \
    --cov=preset_strategies \
    --cov-report=html \
    --cov-report=term-missing
```

**接受标准**：
- 每个模块覆盖率 ≥ 95%
- 总体覆盖率 = 100%
- 关键路径无遗漏

### 5.2 前端覆盖率目标

```bash
# 运行前端覆盖率测试
cd /workspace && npx vitest run tests/frontend/ \
    --coverage \
    --coverage.reporter=html \
    --coverage.reporter=text
```

**接受标准**：
- 语句覆盖率 ≥ 95%
- 分支覆盖率 ≥ 90%
- 函数覆盖率 ≥ 95%
- 行数覆盖率 ≥ 95%

---

## 六、测试执行计划

### 6.1 执行阶段

| 阶段 | 任务 | 估计时间 |
|------|-----|---------|
| 第1阶段 | 后端单元测试 (100%覆盖) | 2小时 |
| 第2阶段 | 前端单元测试 (100%覆盖) | 2小时 |
| 第3阶段 | 集成测试 | 1小时 |
| 第4阶段 | E2E测试 | 1小时 |
| 第5阶段 | 覆盖率验证与修复 | 1小时 |
| **总计** | | **7小时** |

### 6.2 验证检查清单

- [ ] 后端所有模块 100% 覆盖
- [ ] 前端所有模块 100% 覆盖
- [ ] 所有 API 端点测试
- [ ] 所有错误路径测试
- [ ] 所有边界条件测试
- [ ] 所有降级逻辑测试
- [ ] E2E 用户流程完成
- [ ] 性能基准测试

---

## 七、关键测试数据

### 7.1 测试股票池

| 股票代码 | 股票名称 | 用途 |
|---------|---------|------|
| 600519 | 贵州茅台 | 标准测试 |
| 688981 | 中芯国际 | 科技股测试 |
| 601398 | 工商银行 | 金融股测试 |
| 000001 | 平安银行 | 深市测试 |
| 300750 | 宁德时代 | 创业板测试 |

### 7.2 风险偏好组合

| 组合 | 高风险 | 中风险 | 低风险 |
|------|-------|-------|-------|
| 激进型 | 80% | 15% | 5% |
| 平衡型 | 40% | 35% | 25% |
| 保守型 | 10% | 30% | 60% |

---

## 八、验收标准

### 8.1 代码覆盖

| 指标 | 目标 |
|------|------|
| 后端总体覆盖率 | 100% |
| 前端总体覆盖率 | 100% |
| API 接口覆盖 | 100% |
| 关键业务路径 | 100% |

### 8.2 测试通过率

| 测试类型 | 通过率目标 |
|---------|-----------|
| 单元测试 | 100% |
| 集成测试 | 100% |
| E2E测试 | 100% |

### 8.3 质量标准

- 无 P0/P1 级别 Bug
- 测试执行时间 < 10分钟
- 测试稳定，无随机失败
- 所有文档更新同步

---

**文档版本**：v2.0  
**最后更新**：2026-05-12  
**状态**：待执行
