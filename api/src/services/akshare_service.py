import akshare as ak
import pandas as pd
from typing import List, Optional, Dict
from datetime import datetime
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class AKShareService:
    @staticmethod
    def get_realtime_quotes() -> pd.DataFrame:
        """获取A股实时行情"""
        try:
            df = ak.stock_zh_a_spot_em()
            return df
        except Exception as e:
            logger.error(f"获取实时行情失败: {e}")
            return pd.DataFrame()

    @staticmethod
    def get_stock_news(stock_code: str = "") -> List[Dict]:
        """获取个股新闻"""
        try:
            if stock_code:
                df = ak.stock_news_em(symbol=stock_code)
            else:
                df = ak.stock_news_em(symbol="000001")
            
            if df is not None and len(df) > 0:
                df = df.head(20)
                return df.to_dict('records')
            return []
        except Exception as e:
            logger.error(f"获取新闻失败: {e}")
            return []

    @staticmethod
    def get_money_flow() -> pd.DataFrame:
        """获取资金流向"""
        try:
            df = ak.stock_individual_fund_flow(stock="all")
            return df
        except Exception as e:
            logger.error(f"获取资金流向失败: {e}")
            return pd.DataFrame()

    @staticmethod
    def get_sector_list() -> pd.DataFrame:
        """获取板块列表（行业板块）"""
        try:
            df = ak.stock_board_industry_name_em()
            return df
        except Exception as e:
            logger.error(f"获取板块列表失败: {e}")
            return pd.DataFrame()

    @staticmethod
    def get_sector_stocks(sector_name: str) -> pd.DataFrame:
        """获取板块成分股"""
        try:
            df = ak.stock_board_industry_cons_em(symbol=sector_name)
            return df
        except Exception as e:
            logger.error(f"获取板块成分股失败: {e}")
            return pd.DataFrame()

    @staticmethod
    def get_index_realtime() -> pd.DataFrame:
        """获取指数实时行情"""
        try:
            indices = ["上证指数", "深证成指", "创业板指", "科创50"]
            codes = ["000001", "399001", "399006", "000688"]
            results = []
            for name, code in zip(indices, codes):
                try:
                    df = ak.stock_zh_a_spot_em()
                    if len(df) > 0:
                        row = df[df['代码'] == code]
                        if len(row) > 0:
                            results.append({
                                'name': name,
                                'code': code,
                                'price': row.iloc[0].get('最新价', 0),
                                'change': row.iloc[0].get('涨跌额', 0),
                                'changePercent': row.iloc[0].get('涨跌幅', 0)
                            })
                except:
                    continue
            return pd.DataFrame(results)
        except Exception as e:
            logger.error(f"获取指数行情失败: {e}")
            return pd.DataFrame()

    @staticmethod
    def get_limit_up_down() -> Dict:
        """获取涨跌停数据"""
        try:
            df = ak.stock_zt_pool_em(date=datetime.now().strftime("%Y%m%d"))
            zt_count = len(df) if df is not None else 0
            
            df_dt = ak.stock_dt_pool_em(date=datetime.now().strftime("%Y%m%d"))
            dt_count = len(df_dt) if df_dt is not None else 0
            
            return {
                'zt_count': zt_count,
                'dt_count': dt_count
            }
        except Exception as e:
            logger.error(f"获取涨跌停失败: {e}")
            return {'zt_count': 0, 'dt_count': 0}

    @staticmethod
    def search_stock(keyword: str) -> List[Dict]:
        """搜索股票"""
        try:
            df = ak.stock_info_a_code_name()
            if df is not None and len(df) > 0:
                mask = df['name'].str.contains(keyword, na=False) | df['code'].str.contains(keyword, na=False)
                result = df[mask].head(10)
                return result.to_dict('records')
            return []
        except Exception as e:
            logger.error(f"搜索股票失败: {e}")
            return []

    @staticmethod
    def get_hot_sectors() -> pd.DataFrame:
        """获取热门板块"""
        try:
            df = ak.stock_board_industry_name_em()
            if df is not None and len(df) > 0:
                df = df.sort_values('涨跌幅', ascending=False).head(10)
                return df
            return pd.DataFrame()
        except Exception as e:
            logger.error(f"获取热门板块失败: {e}")
            return pd.DataFrame()

    @staticmethod
    def get_stock_hist(stock_code: str, period: str = "daily", count: int = 5) -> pd.DataFrame:
        """获取个股历史数据"""
        try:
            end_date = datetime.now().strftime("%Y%m%d")
            start_date = (datetime.now() - pd.Timedelta(days=count*2)).strftime("%Y%m%d")
            df = ak.stock_zh_a_hist(symbol=stock_code, period=period, start_date=start_date, end_date=end_date, adjust="qfq")
            return df.tail(count) if df is not None else pd.DataFrame()
        except Exception as e:
            logger.error(f"获取历史数据失败: {e}")
            return pd.DataFrame()

ak_service = AKShareService()
