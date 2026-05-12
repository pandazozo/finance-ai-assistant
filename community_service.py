from typing import List, Dict, Optional
from datetime import datetime, timedelta
import random


class CommunityPost(BaseModel):
    id: str
    source: str
    title: str
    content: str
    author: str
    author_followers: int
    likes: int
    comments: int
    publish_time: str
    related_stocks: List[str]
    sentiment: str
    quality_score: float


class CommunityService:
    def __init__(self):
        self.sources = ["guba", "xueqiu", "eastmoney"]
        self.sentiment_keywords = {
            "bullish": ["买入", "看好", "涨停", "突破", "加仓", "创新高"],
            "bearish": ["卖出", "看空", "跌停", "止损", "减仓", "创新低"],
            "neutral": ["观察", "等待", "震荡", "整理"]
        }

    def get_posts(self, stock_code: str = None, stock_name: str = None, limit: int = 20) -> List[Dict]:
        posts = self._generate_mock_posts(stock_code, stock_name, limit)
        scored_posts = self._score_posts(posts)
        return scored_posts

    def _generate_mock_posts(self, stock_code: str, stock_name: str, limit: int) -> List[Dict]:
        posts = []
        sources_config = {
            "guba": {"name": "股吧", "weight": 0.4},
            "xueqiu": {"name": "雪球", "weight": 0.35},
            "eastmoney": {"name": "东方财富", "weight": 0.25}
        }
        
        stock_name = stock_name or "贵州茅台"
        stock_code = stock_code or "600519"
        
        templates = [
            {
                "title": f"【{stock_name}】技术面分析，后市如何走？",
                "content": f"分析了{stock_name}近期的技术形态，从K线图来看，目前处于关键位置。各位大神怎么看？",
                "sentiment": "neutral"
            },
            {
                "title": f"重仓{stock_name}，坚定持有！",
                "content": f"继续看好{stock_name}，基本面优秀，业绩稳定增长。准备长期持有，静待花开。",
                "sentiment": "bullish"
            },
            {
                "title": f"{stock_name}出了利好消息，要起飞了？",
                "content": f"刚刚看到{stock_name}发布了重磅公告，应该是利好。明天开盘要不要追？",
                "sentiment": "bullish"
            },
            {
                "title": f"警示！{stock_name}风险正在积聚",
                "content": f"从技术面来看，{stock_name}已经连续上涨多日，积累了大量获利盘，建议谨慎。",
                "sentiment": "bearish"
            },
            {
                "title": f"分享{stock_name}最新研报摘要",
                "content": f"今天读了关于{stock_name}的深度研报，给出了买入评级，目标价上调。",
                "sentiment": "bullish"
            },
            {
                "title": f"新人请教：{stock_name}现在能进吗？",
                "content": f"我是股市新手，看好{stock_name}这个赛道，请问现在买入时机合适吗？",
                "sentiment": "neutral"
            }
        ]
        
        for i in range(min(limit, len(templates))):
            template = templates[i % len(templates)]
            source_key = random.choices(list(sources_config.keys()), 
                                        weights=[v["weight"] for v in sources_config.values()])[0]
            source_name = sources_config[source_key]["name"]
            
            minutes_ago = random.randint(5, 1440)
            publish_time = (datetime.now() - timedelta(minutes=minutes_ago)).strftime("%Y-%m-%d %H:%M")
            
            post = {
                "id": f"post_{source_key}_{i+1}",
                "source": source_key,
                "sourceName": source_name,
                "title": template["title"],
                "content": template["content"],
                "author": f"用户{random.randint(1000, 9999)}",
                "authorFollowers": random.randint(100, 50000),
                "likes": random.randint(0, 500),
                "comments": random.randint(0, 100),
                "publishTime": publish_time,
                "relatedStocks": [stock_code],
                "sentiment": template["sentiment"],
                "sentimentLabel": self._get_sentiment_label(template["sentiment"])
            }
            posts.append(post)
        
        posts.sort(key=lambda x: x["likes"], reverse=True)
        return posts

    def _get_sentiment_label(self, sentiment: str) -> str:
        labels = {
            "bullish": "看涨",
            "bearish": "看跌",
            "neutral": "中性"
        }
        return labels.get(sentiment, "中性")

    def _score_posts(self, posts: List[Dict]) -> List[Dict]:
        for post in posts:
            likes_score = min(post["likes"] / 100, 1.0) * 30
            comments_score = min(post["comments"] / 50, 1.0) * 20
            followers_score = min(post["authorFollowers"] / 10000, 1.0) * 30
            recency_score = self._calculate_recency_score(post["publishTime"])
            
            sentiment_score = 0
            if post["sentiment"] == "bullish":
                sentiment_score = 10
            elif post["sentiment"] == "bearish":
                sentiment_score = -10
            
            total_score = likes_score + comments_score + followers_score + recency_score + sentiment_score
            post["qualityScore"] = round(min(total_score, 100), 1)
            post["qualityLabel"] = self._get_quality_label(total_score)
        
        posts.sort(key=lambda x: x["qualityScore"], reverse=True)
        return posts

    def _calculate_recency_score(self, publish_time: str) -> float:
        try:
            post_time = datetime.strptime(publish_time, "%Y-%m-%d %H:%M")
            minutes_ago = (datetime.now() - post_time).total_seconds() / 60
            
            if minutes_ago < 60:
                return 20
            elif minutes_ago < 360:
                return 15
            elif minutes_ago < 1440:
                return 10
            else:
                return 5
        except:
            return 10

    def _get_quality_label(self, score: float) -> str:
        if score >= 80:
            return "高质量"
        elif score >= 60:
            return "良好"
        elif score >= 40:
            return "一般"
        else:
            return "低质量"


_community_service_instance = None


def get_community_service() -> CommunityService:
    global _community_service_instance
    if _community_service_instance is None:
        _community_service_instance = CommunityService()
    return _community_service_instance


from pydantic import BaseModel
