import pytest
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from news_service import NewsService, news_service


class TestTimelinessScore:
    """测试时效性评分"""

    def test_timeliness_recent(self):
        """测试最近新闻"""
        service = NewsService()
        score = service.calculate_timeliness_score("刚刚")
        assert score == 100.0

    def test_timeliness_minutes(self):
        """测试分钟级新闻"""
        service = NewsService()
        score = service.calculate_timeliness_score("30分钟前")
        assert score == 100.0

    def test_timeliness_hours(self):
        """测试小时级新闻"""
        service = NewsService()
        score = service.calculate_timeliness_score("2小时前")
        assert score == 100.0

    def test_timeliness_yesterday(self):
        """测试昨天"""
        service = NewsService()
        score = service.calculate_timeliness_score("昨天")
        assert score == 50.0

    def test_timeliness_parse_error(self):
        """测试解析错误"""
        service = NewsService()
        score = service.calculate_timeliness_score("invalid time")
        assert score == 50.0


class TestRelevanceScore:
    """测试相关性评分"""

    def test_relevance_stock_name(self):
        """测试股票名称匹配"""
        service = NewsService()
        score = service.calculate_relevance_score(
            "贵州茅台发布年报",
            "贵州茅台",
            "600519"
        )
        assert score >= 50.0

    def test_relevance_stock_code(self):
        """测试股票代码匹配"""
        service = NewsService()
        score = service.calculate_relevance_score(
            "600519发布公告",
            "贵州茅台",
            "600519"
        )
        assert score >= 30.0

    def test_relevance_keyword(self):
        """测试关键词"""
        service = NewsService()
        score = service.calculate_relevance_score(
            "贵州茅台涨停",
            "贵州茅台",
            "600519"
        )
        assert score >= 50.0

    def test_relevance_multiple_keywords(self):
        """测试多个关键词"""
        service = NewsService()
        score = service.calculate_relevance_score(
            "贵州茅台业绩大涨",
            "贵州茅台",
            "600519"
        )
        assert score >= 60.0

    def test_relevance_no_match(self):
        """测试无匹配"""
        service = NewsService()
        score = service.calculate_relevance_score(
            "其他股票新闻",
            "贵州茅台",
            "600519"
        )
        assert score == 0.0

    def test_relevance_max_score(self):
        """测试最高分限制"""
        service = NewsService()
        score = service.calculate_relevance_score(
            "贵州茅台600519业绩涨停大涨",
            "贵州茅台",
            "600519"
        )
        assert score <= 100.0


class TestAuthorityScore:
    """测试权威性评分"""

    def test_authority_official(self):
        """测试官方媒体"""
        service = NewsService()
        score = service.calculate_authority_score("上证报")
        assert score == 100.0

    def test_authority_another_official(self):
        """测试另一个官方媒体"""
        service = NewsService()
        score = service.calculate_authority_score("证券时报")
        assert score == 100.0

    def test_authority_major(self):
        """测试主流媒体"""
        service = NewsService()
        score = service.calculate_authority_score("东方财富")
        assert score == 70.0

    def test_authority_another_major(self):
        """测试另一个主流媒体"""
        service = NewsService()
        score = service.calculate_authority_score("同花顺")
        assert score == 70.0

    def test_authority_self_media(self):
        """测试自媒体"""
        service = NewsService()
        score = service.calculate_authority_score("个人博客")
        assert score == 30.0


class TestImpactScore:
    """测试影响力评分"""

    def test_impact_important(self):
        """测试重要新闻"""
        service = NewsService()
        news = {
            "title": "贵州茅台涨停",
            "source": "上证报",
            "time": "刚刚"
        }
        result = service.calculate_impact_score(news, "贵州茅台", "600519")
        assert result["impactScore"] >= 80.0
        assert result["isImportant"] is True

    def test_impact_normal(self):
        """测试普通新闻"""
        service = NewsService()
        news = {
            "title": "其他股票",
            "source": "个人博客",
            "time": "昨天"
        }
        result = service.calculate_impact_score(news, "贵州茅台", "600519")
        assert result["impactScore"] < 80.0
        assert result["isImportant"] is False

    def test_impact_breakdown(self):
        """测试评分分解"""
        service = NewsService()
        news = {
            "title": "贵州茅台",
            "source": "上证报",
            "time": "刚刚"
        }
        result = service.calculate_impact_score(news, "贵州茅台", "600519")
        assert "breakdown" in result
        assert "timeliness" in result["breakdown"]
        assert "relevance" in result["breakdown"]
        assert "authority" in result["breakdown"]

    def test_impact_score_formula(self):
        """测试评分公式"""
        service = NewsService()
        news = {
            "title": "贵州茅台",
            "source": "上证报",
            "time": "刚刚"
        }
        result = service.calculate_impact_score(news, "贵州茅台", "600519")
        expected = result["breakdown"]["timeliness"] * 0.3 + \
                   result["breakdown"]["relevance"] * 0.4 + \
                   result["breakdown"]["authority"] * 0.3
        assert abs(result["impactScore"] - round(expected, 1)) < 0.5


class TestFetchNews:
    """测试新闻获取"""

    def test_fetch_news_returns_list(self):
        """测试返回列表"""
        service = NewsService()
        news = service.fetch_stock_news("600519", limit=5)
        assert isinstance(news, list)

    def test_fetch_news_with_limit(self):
        """测试限制数量"""
        service = NewsService()
        news = service.fetch_stock_news("600519", limit=3)
        assert len(news) <= 3

    def test_get_news_with_impact(self):
        """测试带影响力的新闻"""
        service = NewsService()
        news_list = service.get_news_with_impact("600519", "贵州茅台", limit=5)
        assert isinstance(news_list, list)

    def test_get_news_sorted(self):
        """测试新闻排序"""
        service = NewsService()
        news_list = service.get_news_with_impact("600519", "贵州茅台", limit=5)
        if len(news_list) > 1:
            scores = [n["impactScore"] for n in news_list]
            assert scores == sorted(scores, reverse=True)


class TestEdgeCases:
    """测试边界情况"""

    def test_empty_title(self):
        """测试空标题"""
        service = NewsService()
        score = service.calculate_relevance_score("", "贵州茅台", "600519")
        assert score == 0.0

    def test_empty_source(self):
        """测试空来源"""
        service = NewsService()
        score = service.calculate_authority_score("")
        assert score == 30.0

    def test_empty_stock_name(self):
        """测试空股票名称"""
        service = NewsService()
        score = service.calculate_relevance_score("新闻标题", "", "600519")
        assert score >= 0.0

    def test_news_with_all_fields(self):
        """测试完整新闻数据"""
        service = NewsService()
        news = {
            "title": "贵州茅台业绩预增",
            "source": "上证报",
            "time": "刚刚",
            "summary": "业绩大幅增长"
        }
        result = service.calculate_impact_score(news, "贵州茅台", "600519")
        assert result["id"] is not None
        assert result["title"] == "贵州茅台业绩预增"
        assert result["source"] == "上证报"
        assert result["summary"] == "业绩大幅增长"


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
