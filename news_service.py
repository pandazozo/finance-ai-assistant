from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

try:
    import akshare as ak
    AKSHARE_AVAILABLE = True
except ImportError:
    AKSHARE_AVAILABLE = False
    logger.warning("akshare not available")


AUTHORITATIVE_SOURCES = [
    "上证报", "中证报", "证券时报", "中国证券报",
    "上海证券报", "证券日报", "经济参考报"
]

MAJOR_SOURCES = [
    "东方财富", "同花顺", "财联社", "雪球",
    "新浪财经", "凤凰财经", "网易财经", "腾讯财经"
]


class NewsService:
    """资讯服务 - 股票新闻获取+权重计算"""

    def __init__(self):
        self.authoritative_sources = AUTHORITATIVE_SOURCES
        self.major_sources = MAJOR_SOURCES

    def calculate_timeliness_score(self, news_time: str) -> float:
        """
        计算时效性得分（0-100）

        Args:
            news_time: 新闻时间字符串

        Returns:
            时效性得分
        """
        try:
            if "分钟" in news_time or "小时" in news_time or "刚刚" in news_time:
                return 100.0

            if "昨天" in news_time:
                return 50.0

            time_str = news_time.replace("年", "-").replace("月", "-").replace("日", " ")
            if "-" in time_str:
                parts = time_str.split()
                if len(parts) >= 2:
                    date_part = parts[0]
                    time_part = parts[1] if len(parts) > 1 else "00:00"

                    news_dt = datetime.strptime(f"{date_part} {time_part}", "%Y-%m-%d %H:%M")
                    hours_diff = (datetime.now() - news_dt).total_seconds() / 3600

                    if hours_diff < 1:
                        return 100.0
                    elif hours_diff < 3:
                        return 80.0
                    elif hours_diff < 6:
                        return 60.0
                    elif hours_diff < 12:
                        return 40.0
                    elif hours_diff < 24:
                        return 20.0
                    else:
                        return 10.0
        except Exception as e:
            logger.warning(f"解析时间失败: {news_time}, {e}")

        return 50.0

    def calculate_relevance_score(self, title: str, stock_name: str, stock_code: str) -> float:
        """
        计算相关性得分（0-100）

        Args:
            title: 新闻标题
            stock_name: 股票名称
            stock_code: 股票代码

        Returns:
            相关性得分
        """
        score = 0.0
        title_lower = title.lower()
        name_lower = stock_name.lower()

        if name_lower in title_lower:
            score += 50.0

        if stock_code in title:
            score += 30.0

        words = ["涨停", "跌停", "大涨", "大跌", "业绩", "分红", "回购", "减持", "增持", "预警"]
        for word in words:
            if word in title:
                score += 10.0

        return min(100.0, score)

    def calculate_authority_score(self, source: str) -> float:
        """
        计算权威性得分（0-100）

        Args:
            source: 新闻来源

        Returns:
            权威性得分
        """
        for auth in self.authoritative_sources:
            if auth in source:
                return 100.0

        for major in self.major_sources:
            if major in source:
                return 70.0

        return 30.0

    def calculate_impact_score(self, news: Dict[str, Any], stock_name: str, stock_code: str) -> Dict[str, Any]:
        """
        计算资讯影响力评分

        Args:
            news: 新闻数据
            stock_name: 股票名称
            stock_code: 股票代码

        Returns:
            包含影响力评分和重要标记的新闻
        """
        title = news.get("title", "")
        source = news.get("source", "")
        news_time = news.get("time", "")

        timeliness = self.calculate_timeliness_score(news_time)
        relevance = self.calculate_relevance_score(title, stock_name, stock_code)
        authority = self.calculate_authority_score(source)

        impact_score = round(timeliness * 0.3 + relevance * 0.4 + authority * 0.3, 1)

        is_important = impact_score >= 80

        return {
            "id": news.get("id", f"news_{hash(title)}"),
            "title": title,
            "source": source,
            "time": news_time,
            "summary": news.get("summary", ""),
            "impactScore": impact_score,
            "isImportant": is_important,
            "breakdown": {
                "timeliness": timeliness,
                "relevance": relevance,
                "authority": authority
            }
        }

    def fetch_stock_news(self, stock_code: str, limit: int = 10) -> List[Dict[str, Any]]:
        """
        获取股票新闻

        Args:
            stock_code: 股票代码
            limit: 返回数量限制

        Returns:
            新闻列表
        """
        if not AKSHARE_AVAILABLE:
            return self._get_mock_news(stock_code)

        try:
            stock_symbol = f"{stock_code}"
            if not stock_symbol.startswith(("sh", "sz")):
                stock_symbol = f"sh{stock_code}" if stock_code.startswith("6") else f"sz{stock_code}"

            df = ak.stock_news_em(symbol=stock_symbol)

            if df is None or df.empty:
                return self._get_mock_news(stock_code)

            news_list = []
            for _, row in df.head(limit).iterrows():
                news = {
                    "title": str(row.get("新闻标题", "")),
                    "source": str(row.get("文章来源", "")),
                    "time": str(row.get("发布时间", "")),
                    "summary": ""
                }
                news_list.append(news)

            return news_list

        except Exception as e:
            logger.error(f"获取新闻失败: {e}")
            return self._get_mock_news(stock_code)

    def _get_mock_news(self, stock_code: str) -> List[Dict[str, Any]]:
        """获取模拟新闻数据"""
        return [
            {
                "id": f"mock_{stock_code}_1",
                "title": "暂无相关资讯",
                "source": "系统提示",
                "time": "刚刚",
                "summary": "当前暂无该股票的相关新闻资讯"
            }
        ]

    def get_news_with_impact(
        self,
        stock_code: str,
        stock_name: str = "",
        limit: int = 10
    ) -> List[Dict[str, Any]]:
        """
        获取带影响力评分的股票新闻

        Args:
            stock_code: 股票代码
            stock_name: 股票名称（用于相关性计算）
            limit: 返回数量限制

        Returns:
            带影响力评分的新闻列表，按评分降序排列
        """
        raw_news = self.fetch_stock_news(stock_code, limit)

        if not raw_news or (len(raw_news) == 1 and "暂无" in raw_news[0].get("title", "")):
            return raw_news

        news_with_impact = []
        for news in raw_news:
            enhanced_news = self.calculate_impact_score(news, stock_name, stock_code)
            news_with_impact.append(enhanced_news)

        news_with_impact.sort(key=lambda x: x["impactScore"], reverse=True)

        return news_with_impact


news_service = NewsService()
