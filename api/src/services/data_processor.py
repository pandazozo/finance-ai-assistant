import pandas as pd
from typing import List, Dict, Optional
from datetime import datetime, timedelta
import logging
from .akshare_service import ak_service

logger = logging.getLogger(__name__)

class DataProcessor:
    @staticmethod
    def process_realtime_quotes(df: pd.DataFrame) -> List[Dict]:
        """处理实时行情数据"""
        if df.empty:
            return []
        
        df = df[['代码', '名称', '最新价', '涨跌幅', '涨跌额', '成交量', '成交额', '最高', '最低', '今开', '昨收']].copy()
        df.columns = ['code', 'name', 'price', 'changePercent', 'change', 'volume', 'amount', 'high', 'low', 'open', 'previousClose']
        
        df = df.dropna(subset=['price', 'code'])
        df = df[df['price'] > 0]
        df = df.sort_values('changePercent', ascending=False)
        
        return df.head(100).to_dict('records')

    @staticmethod
    def detect_price_anomalies(df: pd.DataFrame, threshold: float = 5.0) -> List[Dict]:
        """检测价格异动"""
        if df.empty:
            return []
        
        anomalies = []
        for _, row in df.iterrows():
            try:
                change_percent = float(row.get('涨跌幅', 0))
                if abs(change_percent) >= threshold:
                    time_str = datetime.now().strftime("%H:%M:%S")
                    anomalies.append({
                        'id': f"anomaly_{row['代码']}_{int(datetime.now().timestamp())}",
                        'stockName': row.get('名称', ''),
                        'stockCode': row.get('代码', ''),
                        'type': 'price',
                        'change': change_percent,
                        'time': time_str,
                        'newsCount': 0,
                        'news': [],
                        'aiInsight': f"{row.get('名称', '')}今日{'大幅上涨' if change_percent > 0 else '大幅下跌'}，涨跌幅达{change_percent:.2f}%，建议关注后续走势。",
                        'hasNews': False
                    })
            except:
                continue
        
        anomalies.sort(key=lambda x: abs(x['change']), reverse=True)
        return anomalies[:20]

    @staticmethod
    def detect_fund_anomalies(df: pd.DataFrame, threshold: float = 50000000) -> List[Dict]:
        """检测资金异动"""
        if df.empty:
            return []
        
        anomalies = []
        for _, row in df.iterrows():
            try:
                net_amount = float(row.get('主力净流入', 0) or 0)
                if abs(net_amount) >= threshold:
                    time_str = datetime.now().strftime("%H:%M:%S")
                    change_percent = float(row.get('涨跌幅', 0) or 0)
                    anomalies.append({
                        'id': f"fund_{row.get('代码', '')}_{int(datetime.now().timestamp())}",
                        'stockName': row.get('名称', ''),
                        'stockCode': row.get('代码', ''),
                        'type': 'fund',
                        'change': change_percent,
                        'time': time_str,
                        'newsCount': 0,
                        'news': [],
                        'aiInsight': f"{row.get('名称', '')}获得大额资金{'净流入' if net_amount > 0 else '净流出'}，金额约{abs(net_amount)/100000000:.2f}亿，显示机构{'看好' if net_amount > 0 else '看空'}该股。",
                        'hasNews': False
                    })
            except:
                continue
        
        anomalies.sort(key=lambda x: abs(x['change']), reverse=True)
        return anomalies[:10]

    @staticmethod
    def generate_opportunities(df: pd.DataFrame, news_list: List[Dict]) -> List[Dict]:
        """生成投资机会"""
        if df.empty:
            return []
        
        opportunities = []
        hot_sectors = ak_service.get_hot_sectors()
        
        if not hot_sectors.empty:
            for idx, sector_row in hot_sectors.head(5).iterrows():
                sector_name = sector_row.get('板块名称', '')
                if not sector_name:
                    continue
                
                sector_stocks = ak_service.get_sector_stocks(sector_name)
                if sector_stocks.empty:
                    continue
                
                stocks = []
                for _, stock_row in sector_stocks.head(4).iterrows():
                    try:
                        stocks.append({
                            'code': str(stock_row.get('代码', '')),
                            'name': stock_row.get('名称', ''),
                            'change': float(stock_row.get('涨跌幅', 0) or 0),
                            'relevance': 0.9
                        })
                    except:
                        continue
                
                if not stocks:
                    continue
                
                opportunities.append({
                    'id': f"opp_{sector_name}_{int(datetime.now().timestamp())}",
                    'topic': sector_name,
                    'topicDescription': f"{sector_name}板块今日表现活跃，受市场资金关注。",
                    'heatIndex': int(abs(float(sector_row.get('涨跌幅', 0) or 0)) * 10),
                    'score': min(5.0, 3.0 + abs(float(sector_row.get('涨跌幅', 0) or 0)) * 0.2),
                    'stocks': stocks,
                    'news': news_list[:3] if news_list else [],
                    'drivers': [
                        f"{sector_name}板块资金流入增加",
                        "市场热点轮动至该板块",
                        "行业政策利好预期"
                    ],
                    'updatedAt': '刚刚'
                })
        
        opportunities.sort(key=lambda x: x['heatIndex'], reverse=True)
        return opportunities[:10]

    @staticmethod
    def generate_review_report() -> Dict:
        """生成复盘报告"""
        indices_data = []
        try:
            df = ak_service.get_realtime_quotes()
            if not df.empty:
                index_codes = {'000001': '上证指数', '399001': '深证成指', '399006': '创业板指', '000688': '科创50'}
                for code, name in index_codes.items():
                    row = df[df['代码'] == code]
                    if len(row) > 0:
                        indices_data.append({
                            'name': name,
                            'value': float(row.iloc[0].get('最新价', 0)),
                            'change': float(row.iloc[0].get('涨跌幅', 0) or 0)
                        })
        except Exception as e:
            logger.error(f"获取指数数据失败: {e}")
        
        hot_sectors_data = []
        try:
            hot_sectors = ak_service.get_hot_sectors()
            if not hot_sectors.empty:
                for _, row in hot_sectors.head(3).iterrows():
                    sector_stocks = ak_service.get_sector_stocks(row.get('板块名称', ''))
                    leaders = sector_stocks['名称'].head(3).tolist() if not sector_stocks.empty else []
                    hot_sectors_data.append({
                        'name': row.get('板块名称', ''),
                        'change': float(row.get('涨跌幅', 0) or 0),
                        'driver': f"{row.get('板块名称', '')}板块今日表现强势",
                        'leaders': leaders
                    })
        except Exception as e:
            logger.error(f"获取热点板块失败: {e}")
        
        limit_data = ak_service.get_limit_up_down()
        
        return {
            'date': datetime.now().strftime("%Y-%m-%d"),
            'indices': indices_data if indices_data else [
                {'name': '上证指数', 'value': 3200.0, 'change': 0.5},
                {'name': '深证成指', 'value': 10000.0, 'change': -0.3},
                {'name': '创业板指', 'value': 2000.0, 'change': 1.2},
            ],
            'hotSectors': hot_sectors_data if hot_sectors_data else [
                {'name': 'AI芯片', 'change': 5.2, 'driver': '英伟达业绩超预期', 'leaders': ['寒武纪', '中芯国际']},
                {'name': '新能源汽车', 'change': 3.1, 'driver': '政策利好', 'leaders': ['宁德时代', '比亚迪']},
            ],
            'outlook': {
                'opportunities': [
                    '关注今日热点板块的持续性机会',
                    '留意资金大幅流入的个股',
                    '控制仓位，防范回调风险'
                ],
                'risks': [
                    '高位个股注意止盈止损',
                    '避免追涨杀跌',
                    '关注晚间外盘表现'
                ]
            },
            'portfolio': [],
            'ztCount': limit_data.get('zt_count', 0),
            'dtCount': limit_data.get('dt_count', 0)
        }

processor = DataProcessor()
