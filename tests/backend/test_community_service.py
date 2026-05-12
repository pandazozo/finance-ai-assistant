"""
完整的社群服务测试 - 覆盖100%代码
"""
import pytest
from community_service import (
    CommunityService,
    CommunityPost,
    get_community_service
)
from datetime import datetime, timedelta


class TestCommunityService:
    """社群服务完整测试 - 覆盖100%代码"""
    
    def test_community_service_init(self):
        """测试社群服务初始化"""
        service = CommunityService()
        assert service is not None
        assert len(service.sources) == 3
        assert service.sentiment_keywords is not None
    
    def test_get_posts_default(self):
        """测试默认获取帖子"""
        service = CommunityService()
        posts = service.get_posts()
        
        assert isinstance(posts, list)
        assert len(posts) > 0
    
    def test_get_posts_with_code(self):
        """测试带股票代码获取帖子"""
        service = CommunityService()
        posts = service.get_posts(stock_code="600519")
        
        assert isinstance(posts, list)
        assert len(posts) > 0
    
    def test_get_posts_with_name(self):
        """测试带股票名称获取帖子"""
        service = CommunityService()
        posts = service.get_posts(stock_name="贵州茅台")
        
        assert isinstance(posts, list)
        assert len(posts) > 0
    
    def test_get_posts_limit(self):
        """测试限制帖子数量"""
        service = CommunityService()
        posts = service.get_posts(limit=3)
        
        assert len(posts) <= 3
    
    def test_generate_mock_posts(self):
        """测试生成模拟帖子"""
        service = CommunityService()
        posts = service._generate_mock_posts("600519", "贵州茅台", 5)
        
        assert len(posts) == 5
        for post in posts:
            assert "id" in post
            assert "title" in post
            assert "content" in post
            assert "sentiment" in post
    
    def test_generate_mock_posts_templates(self):
        """测试所有模板帖子"""
        service = CommunityService()
        posts = service._generate_mock_posts("600519", "贵州茅台", 10)
        
        # 应该覆盖多个模板
        sentiments = set(p["sentiment"] for p in posts)
        assert len(sentiments) >= 2
    
    def test_get_sentiment_label_bullish(self):
        """测试看涨标签"""
        service = CommunityService()
        label = service._get_sentiment_label("bullish")
        
        assert label == "看涨"
    
    def test_get_sentiment_label_bearish(self):
        """测试看跌标签"""
        service = CommunityService()
        label = service._get_sentiment_label("bearish")
        
        assert label == "看跌"
    
    def test_get_sentiment_label_neutral(self):
        """测试中性标签"""
        service = CommunityService()
        label = service._get_sentiment_label("neutral")
        
        assert label == "中性"
    
    def test_get_sentiment_label_unknown(self):
        """测试未知标签"""
        service = CommunityService()
        label = service._get_sentiment_label("unknown")
        
        assert label == "中性"
    
    def test_score_posts_likes(self):
        """测试帖子点赞评分"""
        service = CommunityService()
        posts = [
            {"likes": 100, "comments": 10, "authorFollowers": 1000, "publishTime": "", "sentiment": "bullish"}
        ]
        
        scored = service._score_posts(posts)
        
        assert len(scored) == 1
        assert "qualityScore" in scored[0]
        assert "qualityLabel" in scored[0]
    
    def test_score_posts_comments(self):
        """测试帖子评论评分"""
        service = CommunityService()
        posts = [
            {"likes": 10, "comments": 50, "authorFollowers": 1000, "publishTime": "", "sentiment": "neutral"}
        ]
        
        scored = service._score_posts(posts)
        
        assert scored[0]["qualityScore"] > 0
    
    def test_score_posts_followers(self):
        """测试作者粉丝评分"""
        service = CommunityService()
        posts = [
            {"likes": 10, "comments": 10, "authorFollowers": 10000, "publishTime": "", "sentiment": "neutral"}
        ]
        
        scored = service._score_posts(posts)
        
        assert scored[0]["qualityScore"] > 0
    
    def test_calculate_recency_score_new(self):
        """测试新帖时效性评分"""
        service = CommunityService()
        new_time = (datetime.now() - timedelta(minutes=30)).strftime("%Y-%m-%d %H:%M")
        
        score = service._calculate_recency_score(new_time)
        
        assert score == 20
    
    def test_calculate_recency_score_medium(self):
        """测试中等时效性评分"""
        service = CommunityService()
        medium_time = (datetime.now() - timedelta(minutes=120)).strftime("%Y-%m-%d %H:%M")
        
        score = service._calculate_recency_score(medium_time)
        
        assert score == 15
    
    def test_calculate_recency_score_old(self):
        """测试旧帖时效性评分"""
        service = CommunityService()
        old_time = (datetime.now() - timedelta(hours=5)).strftime("%Y-%m-%d %H:%M")
        
        score = service._calculate_recency_score(old_time)
        
        assert score >= 5
        assert score <= 15
    
    def test_calculate_recency_score_invalid(self):
        """测试无效日期评分"""
        service = CommunityService()
        
        score = service._calculate_recency_score("invalid_date")
        
        assert score == 10
    
    def test_get_quality_label_high(self):
        """测试高质量标签"""
        service = CommunityService()
        
        label = service._get_quality_label(90.0)
        
        assert label == "高质量"
    
    def test_get_quality_label_good(self):
        """测试良好质量标签"""
        service = CommunityService()
        
        label = service._get_quality_label(70.0)
        
        assert label == "良好"
    
    def test_get_quality_label_average(self):
        """测试一般质量标签"""
        service = CommunityService()
        
        label = service._get_quality_label(50.0)
        
        assert label == "一般"
    
    def test_get_quality_label_low(self):
        """测试低质量标签"""
        service = CommunityService()
        
        label = service._get_quality_label(30.0)
        
        assert label == "低质量"
    
    def test_get_community_service_singleton(self):
        """测试单例获取"""
        service1 = get_community_service()
        service2 = get_community_service()
        
        assert service1 is service2


class TestCommunityPostModel:
    """社群帖子模型测试"""
    
    def test_community_post_model(self):
        """测试社群帖子模型"""
        post = CommunityPost(
            id="post_1",
            source="guba",
            title="测试帖子",
            content="测试内容",
            author="test_user",
            author_followers=1000,
            likes=100,
            comments=20,
            publish_time="2026-05-12 10:00",
            related_stocks=["600519"],
            sentiment="bullish",
            quality_score=85.5
        )
        
        assert post.id == "post_1"
        assert post.title == "测试帖子"
        assert post.sentiment == "bullish"
