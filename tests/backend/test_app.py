import pytest
from fastapi.testclient import TestClient
from datetime import datetime
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from app import (
    app,
    fetch_with_cache,
    get_stock_quote,
    get_indices,
    get_top_stocks,
    search_stocks,
    calculate_risk_coefficient,
    map_score_to_conclusion,
    RiskPreference,
    AIConclusionRequest,
    CACHE,
    COMMON_STOCKS
)

client = TestClient(app)

def setup_function():
    CACHE.clear()

def teardown_function():
    CACHE.clear()


class TestHelperFunctions:
    """测试辅助函数 - fetch_with_cache"""

    def test_fetch_with_cache_cache_hit(self):
        import time
        CACHE['test_key'] = ('cached_data', time.time())
        result = fetch_with_cache('test_key', lambda: 'new_data', ttl=30)
        assert result == 'cached_data'

    def test_fetch_with_cache_cache_expired(self):
        import time
        CACHE['test_key'] = ('old_data', time.time() - 100)
        result = fetch_with_cache('test_key', lambda: 'new_data', ttl=30)
        assert result == 'new_data'

    def test_fetch_with_cache_no_cache_no_error(self):
        result = fetch_with_cache('nonexistent_key', lambda: 'data', ttl=30)
        assert result == 'data'

    def test_fetch_with_cache_fetch_error_with_cache(self):
        import time
        CACHE['error_key'] = ('fallback_data', time.time() - 10)
        result = fetch_with_cache('error_key', lambda: 1/0, ttl=30)
        assert result == 'fallback_data'

    def test_fetch_with_cache_fetch_error_without_cache(self):
        result = fetch_with_cache('error_no_cache', lambda: 1/0, ttl=30)
        assert result is None


class TestRiskPreferenceModel:
    """测试风险偏好模型"""

    def test_risk_preference_default_values(self):
        rp = RiskPreference()
        assert rp.high == 40
        assert rp.medium == 35
        assert rp.low == 25

    def test_risk_preference_custom_values(self):
        rp = RiskPreference(high=80, medium=15, low=5)
        assert rp.high == 80
        assert rp.medium == 15
        assert rp.low == 5


class TestAIConclusionRequest:
    """测试AI结论请求模型"""

    def test_ai_conclusion_request_basic(self):
        req = AIConclusionRequest(code='600519')
        assert req.code == '600519'
        assert req.riskPreference is None

    def test_ai_conclusion_request_with_risk_preference(self):
        rp = RiskPreference(high=80, medium=15, low=5)
        req = AIConclusionRequest(code='600519', riskPreference=rp)
        assert req.code == '600519'
        assert req.riskPreference.high == 80


class TestSearchStocks:
    """测试股票搜索函数"""

    def test_search_by_code(self):
        results = search_stocks('600519')
        assert len(results) >= 1
        assert any(s['code'] == '600519' for s in results)

    def test_search_by_name(self):
        results = search_stocks('茅台')
        assert len(results) >= 1
        assert any('茅台' in s['name'] for s in results)

    def test_search_by_partial_name(self):
        results = search_stocks('宁德')
        assert len(results) >= 1
        assert any('宁德' in s['name'] for s in results)

    def test_search_no_match_returns_defaults(self):
        results = search_stocks('xyz123')
        assert len(results) == 5

    def test_search_short_keyword(self):
        results = search_stocks('x')
        assert len(results) == 5

    def test_search_case_insensitive(self):
        results1 = search_stocks('GUOPIAO')
        results2 = search_stocks('guopiao')
        assert len(results1) == len(results2)

    def test_search_with_space(self):
        results = search_stocks('贵州 茅台')
        assert any('贵州' in s['name'] for s in results)


class TestCalculateRiskCoefficient:
    """测试风险偏好系数计算"""

    def test_coefficient_none_risk_preference(self):
        result = calculate_risk_coefficient(None)
        assert result == 1.0

    def test_coefficient_aggressive_high(self):
        rp = RiskPreference(high=80, medium=15, low=5)
        result = calculate_risk_coefficient(rp)
        assert abs(result - 1.38) < 0.01

    def test_coefficient_balanced(self):
        rp = RiskPreference(high=40, medium=35, low=25)
        result = calculate_risk_coefficient(rp)
        assert abs(result - 1.075) < 0.01

    def test_coefficient_conservative(self):
        rp = RiskPreference(high=10, medium=30, low=60)
        result = calculate_risk_coefficient(rp)
        assert result == 0.75

    def test_coefficient_min_bound(self):
        rp = RiskPreference(high=0, medium=0, low=100)
        result = calculate_risk_coefficient(rp)
        assert result == 0.7

    def test_coefficient_max_bound(self):
        rp = RiskPreference(high=100, medium=0, low=0)
        result = calculate_risk_coefficient(rp)
        assert result == 1.4

    def test_coefficient_zero_values(self):
        rp = RiskPreference(high=0, medium=0, low=0)
        result = calculate_risk_coefficient(rp)
        assert result == 1.0


class TestMapScoreToConclusion:
    """测试评分到结论映射"""

    def test_strong_recommend(self):
        level, label, score = map_score_to_conclusion(85)
        assert level == 4
        assert label == '强烈推荐'
        assert score == 85

    def test_recommend(self):
        level, label, score = map_score_to_conclusion(70)
        assert level == 3
        assert label == '推荐'
        assert score == 70

    def test_neutral(self):
        level, label, score = map_score_to_conclusion(55)
        assert level == 0
        assert label == '中性'
        assert score == 55

    def test_cautious(self):
        level, label, score = map_score_to_conclusion(40)
        assert level == -2
        assert label == '谨慎'
        assert score == 40

    def test_avoid(self):
        level, label, score = map_score_to_conclusion(20)
        assert level == -4
        assert label == '回避'
        assert score == 20

    def test_boundary_80(self):
        level, label, score = map_score_to_conclusion(80)
        assert level == 4

    def test_boundary_65(self):
        level, label, score = map_score_to_conclusion(65)
        assert level == 3

    def test_boundary_50(self):
        level, label, score = map_score_to_conclusion(50)
        assert level == 0

    def test_boundary_35(self):
        level, label, score = map_score_to_conclusion(35)
        assert level == -2


class TestCommonStocks:
    """测试常量数据"""

    def test_common_stocks_not_empty(self):
        assert len(COMMON_STOCKS) > 0

    def test_common_stocks_structure(self):
        for stock in COMMON_STOCKS:
            assert 'code' in stock
            assert 'name' in stock
            assert 'market' in stock

    def test_common_stocks_includes_major_stocks(self):
        codes = [s['code'] for s in COMMON_STOCKS]
        assert '600519' in codes
        assert '688981' in codes
        assert '300750' in codes


class TestHealthEndpoint:
    """测试健康检查接口"""

    def test_health_check(self):
        response = client.get('/api/health')
        assert response.status_code == 200
        data = response.json()
        assert data['status'] == 'healthy'
        assert data['version'] == '2.0.0'
        assert data['data_source'] == 'AKShare'
        assert 'timestamp' in data


class TestStockQuoteEndpoint:
    """测试股票行情接口"""

    def test_quote_missing_codes(self):
        response = client.get('/api/v1/stocks/quote')
        assert response.status_code == 400

    def test_quote_empty_codes(self):
        response = client.get('/api/v1/stocks/quote?codes=')
        assert response.status_code == 400

    def test_quote_single_code(self):
        response = client.get('/api/v1/stocks/quote?codes=600519')
        assert response.status_code == 200
        data = response.json()
        assert data['code'] == 0

    def test_quote_multiple_codes(self):
        response = client.get('/api/v1/stocks/quote?codes=600519,300750')
        assert response.status_code == 200

    def test_quote_with_spaces(self):
        response = client.get('/api/v1/stocks/quote?codes=600519, 300750')
        assert response.status_code == 200


class TestStockSearchEndpoint:
    """测试股票搜索接口"""

    def test_search_missing_keyword(self):
        response = client.get('/api/v1/stocks/search')
        assert response.status_code == 400

    def test_search_empty_keyword(self):
        response = client.get('/api/v1/stocks/search?keyword=')
        assert response.status_code == 400

    def test_search_by_code(self):
        response = client.get('/api/v1/stocks/search?keyword=600519')
        assert response.status_code == 200
        data = response.json()
        assert data['code'] == 0
        assert 'stocks' in data['data']

    def test_search_by_name(self):
        response = client.get('/api/v1/stocks/search?keyword=茅台')
        assert response.status_code == 200
        data = response.json()
        assert len(data['data']['stocks']) > 0

    def test_search_no_results(self):
        response = client.get('/api/v1/stocks/search?keyword=xyznotexist')
        assert response.status_code == 200
        data = response.json()
        assert len(data['data']['stocks']) == 5


class TestAIConclusionEndpoint:
    """测试AI结论接口"""

    def test_ai_conclusion_post_missing_code(self):
        response = client.post('/api/v1/stocks/ai-conclusion', json={})
        assert response.status_code == 422

    def test_ai_conclusion_post_basic(self):
        response = client.post('/api/v1/stocks/ai-conclusion', json={'code': '600519'})
        assert response.status_code == 200
        data = response.json()
        assert data['code'] == 0
        assert 'conclusion' in data['data']

    def test_ai_conclusion_post_with_risk_preference(self):
        response = client.post('/api/v1/stocks/ai-conclusion', json={
            'code': '600519',
            'riskPreference': {'high': 80, 'medium': 15, 'low': 5}
        })
        assert response.status_code == 200
        data = response.json()
        assert data['code'] == 0
        assert data['data']['conclusion']['riskPreferenceLabel'] == '（进取型）'
        assert abs(data['data']['conclusion']['riskCoefficient'] - 1.38) < 0.01

    def test_ai_conclusion_post_conservative(self):
        response = client.post('/api/v1/stocks/ai-conclusion', json={
            'code': '600519',
            'riskPreference': {'high': 10, 'medium': 30, 'low': 60}
        })
        assert response.status_code == 200
        data = response.json()
        assert data['code'] == 0
        assert data['data']['conclusion']['riskPreferenceLabel'] == '（稳健型）'

    def test_ai_conclusion_get_missing_code(self):
        response = client.get('/api/v1/stocks/ai-conclusion')
        assert response.status_code == 400

    def test_ai_conclusion_get_basic(self):
        response = client.get('/api/v1/stocks/ai-conclusion?code=600519')
        assert response.status_code == 200

    def test_ai_conclusion_get_with_risk_params(self):
        response = client.get('/api/v1/stocks/ai-conclusion?code=600519&high=80&medium=15&low=5')
        assert response.status_code == 200


class TestOpportunitiesEndpoint:
    """测试投资机会接口"""

    def test_opportunities(self):
        response = client.get('/api/opportunities')
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)

    def test_opportunities_structure(self):
        response = client.get('/api/opportunities')
        assert response.status_code == 200
        data = response.json()
        if len(data) > 0:
            opp = data[0]
            assert 'id' in opp
            assert 'topic' in opp
            assert 'topicDescription' in opp
            assert 'heatIndex' in opp
            assert 'score' in opp
            assert 'stocks' in opp


class TestAnomaliesEndpoint:
    """测试异动监控接口"""

    def test_anomalies(self):
        response = client.get('/api/anomalies')
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)

    def test_anomalies_structure(self):
        response = client.get('/api/anomalies')
        assert response.status_code == 200
        data = response.json()
        for anomaly in data:
            assert 'id' in anomaly
            assert 'stockName' in anomaly
            assert 'stockCode' in anomaly
            assert 'type' in anomaly
            assert 'change' in anomaly


class TestReviewEndpoint:
    """测试智能复盘接口"""

    def test_review(self):
        response = client.get('/api/review')
        assert response.status_code == 200
        data = response.json()
        assert 'date' in data
        assert 'indices' in data
        assert 'hotSectors' in data
        assert 'outlook' in data

    def test_review_indices_structure(self):
        response = client.get('/api/review')
        data = response.json()
        if len(data['indices']) > 0:
            idx = data['indices'][0]
            assert 'name' in idx
            assert 'value' in idx
            assert 'change' in idx

    def test_review_outlook_structure(self):
        response = client.get('/api/review')
        data = response.json()
        assert 'opportunities' in data['outlook']
        assert 'risks' in data['outlook']
        assert isinstance(data['outlook']['opportunities'], list)
        assert isinstance(data['outlook']['risks'], list)


class TestCodeNormalization:
    """测试代码标准化逻辑"""

    def test_code_already_sh_prefix(self):
        response = client.get('/api/v1/stocks/search?keyword=sh600519')
        assert response.status_code == 200

    def test_code_already_sz_prefix(self):
        response = client.get('/api/v1/stocks/search?keyword=sz300750')
        assert response.status_code == 200

    def test_ai_conclusion_sh_prefix(self):
        response = client.post('/api/v1/stocks/ai-conclusion', json={'code': 'sh600519'})
        assert response.status_code == 200

    def test_ai_conclusion_sz_prefix(self):
        response = client.post('/api/v1/stocks/ai-conclusion', json={'code': 'sz300750'})
        assert response.status_code == 200


class TestAppConfiguration:
    """测试应用配置"""

    def test_app_title(self):
        assert app.title == "金融AI投资助手 API"

    def test_app_version(self):
        assert app.version == "2.0.0"

    def test_cors_middleware_configured(self):
        middleware = [m for m in app.user_middleware if 'CORSMiddleware' in str(m)]
        assert len(middleware) > 0


class TestNewsEndpoint:
    """测试资讯接口"""

    def test_news_missing_code(self):
        response = client.get('/api/v1/stocks/news')
        assert response.status_code == 422

    def test_news_basic(self):
        response = client.get('/api/v1/stocks/news?code=600519')
        assert response.status_code == 200
        data = response.json()
        assert data["code"] == 0
        assert "news" in data["data"]
        assert "count" in data["data"]

    def test_news_with_limit(self):
        response = client.get('/api/v1/stocks/news?code=600519&limit=5')
        assert response.status_code == 200
        data = response.json()
        assert data["data"]["count"] <= 5

    def test_news_structure(self):
        response = client.get('/api/v1/stocks/news?code=600519')
        data = response.json()
        for news in data["data"]["news"]:
            assert "id" in news
            assert "title" in news
            assert "source" in news
            assert "time" in news
            assert "impactScore" in news
            assert "isImportant" in news

    def test_news_important_mark(self):
        response = client.get('/api/v1/stocks/news?code=600519')
        data = response.json()
        for news in data["data"]["news"]:
            if news["isImportant"]:
                assert news["impactScore"] >= 80


if __name__ == '__main__':
    pytest.main([__file__, '-v'])
