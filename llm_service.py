from typing import Optional, Dict, Any
from datetime import datetime
import os
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

try:
    import dashscope
    DASHSCOPE_AVAILABLE = True
except ImportError:
    DASHSCOPE_AVAILABLE = False
    logger.warning("dashscope SDK not available, will use rule engine only")


class LLMService:
    """LLM服务 - 通义千问集成，含降级策略"""

    def __init__(self):
        self.api_key = os.environ.get("DASHSCOPE_API_KEY", "")
        self.model = os.environ.get("DASHSCOPE_MODEL", "qwen-turbo")
        self.timeout = int(os.environ.get("DASHSCOPE_TIMEOUT", 5))

        if self.api_key:
            dashscope.api_key = self.api_key
            logger.info(f"LLM service initialized with model: {self.model}")
        else:
            logger.warning("DASHSCOPE_API_KEY not configured, will use rule engine")

    def is_available(self) -> bool:
        """检查LLM服务是否可用"""
        if not DASHSCOPE_AVAILABLE:
            return False
        if not self.api_key:
            return False
        return True

    def format_prompt(self, stock_name: str, stock_code: str,
                      price: float, change: float, volume: float,
                      risk_preference_label: str) -> str:
        """
        格式化LLM请求提示词
        
        Args:
            stock_name: 股票名称
            stock_code: 股票代码
            price: 最新价
            change: 涨跌幅(%)
            volume: 成交量(万手)
            risk_preference_label: 风险偏好标签
            
        Returns:
            格式化后的提示词
        """
        prompt = f"""你是一位专业的A股分析师，专注于短线交易机会发现。

正在查看的股票：
- 股票名称：{stock_name}
- 股票代码：{stock_code}
- 最新价：{price}元
- 涨跌幅：{change}%
- 成交量：{volume}万手

用户风险偏好：{risk_preference_label}
- 高风险偏好（>60）：进取型，更关注机会
- 中风险偏好（40-60）：均衡型，机会与风险平衡
- 低风险偏好（<40）：稳健型，更关注风险

请生成一段简洁的分析结论（100字以内），要求：
1. 结合行情数据和用户风险偏好
2. 使用专业但易懂的语言
3. 给出明确的投资建议
4. 结尾必须包含风险提示

风险提示：市场有风险，投资需谨慎。AI分析仅供参考，不构成投资建议。"""
        return prompt

    def call_llm(self, prompt: str) -> Optional[str]:
        """
        调用LLM生成分析
        
        Args:
            prompt: 提示词
            
        Returns:
            LLM生成的分析文本，失败返回None
        """
        if not self.is_available():
            logger.warning("LLM service not available")
            return None

        try:
            logger.info(f"Calling LLM with model: {self.model}")

            messages = [
                {"role": "system", "content": "你是一位专业的A股分析师。"},
                {"role": "user", "content": prompt}
            ]

            response = dashscope.Generation.call(
                model=self.model,
                messages=messages,
                result_format='message',
                max_tokens=200,
                temperature=0.7,
                top_p=0.8
            )

            if response.status_code == 200:
                text = response.output.choices[0].message.content
                logger.info(f"LLM call successful, got {len(text)} chars")
                return text
            else:
                logger.error(f"LLM call failed: {response}")
                return None

        except Exception as e:
            logger.error(f"LLM call exception: {str(e)}")
            return None

    def generate_analysis(self, stock_name: str, stock_code: str,
                          price: float, change: float, volume: float,
                          risk_preference_label: str = "均衡型") -> Dict[str, Any]:
        """
        生成股票分析 - 优先使用LLM，不可用时降级到规则引擎
        
        Args:
            stock_name: 股票名称
            stock_code: 股票代码
            price: 最新价
            change: 涨跌幅(%)
            volume: 成交量(万手)
            risk_preference_label: 风险偏好标签
            
        Returns:
            分析结果字典
        """
        prompt = self.format_prompt(
            stock_name, stock_code, price, change, volume, risk_preference_label
        )

        llm_result = self.call_llm(prompt)

        if llm_result:
            return {
                "analysis": llm_result,
                "source": "llm",
                "fallback": False,
                "message": "AI深度分析完成"
            }
        else:
            rule_analysis = self._generate_rule_analysis(
                stock_name, stock_code, price, change, risk_preference_label
            )
            return {
                "analysis": rule_analysis,
                "source": "rule_engine",
                "fallback": True,
                "message": "当前使用规则分析，AI深度分析即将上线"
            }

    def _generate_rule_analysis(self, stock_name: str, stock_code: str,
                                 price: float, change: float,
                                 risk_preference_label: str) -> str:
        """规则引擎生成分析 - 降级方案"""
        change_str = f"上涨{abs(change):.2f}%" if change > 0 else f"下跌{abs(change):.2f}%"
        trend = "强势" if change > 0 else "弱势"

        if risk_preference_label == "进取型":
            if change > 3:
                analysis = f"【{stock_name}】今日{change_str}，表现{trend}。建议积极关注，可考虑轻仓介入。"
            elif change > 0:
                analysis = f"【{stock_name}】今日{change_str}，趋势良好。建议保持观望，等待更佳机会。"
            else:
                analysis = f"【{stock_name}】今日{change_str}，表现{trend}。建议控制风险，谨慎观望。"
        elif risk_preference_label == "稳健型":
            if change > 3:
                analysis = f"【{stock_name}】今日{change_str}，表现{trend}。建议保持耐心，等待回调机会。"
            elif change > 0:
                analysis = f"【{stock_name}】今日{change_str}，趋势{trend}。建议轻仓试探，严格止损。"
            else:
                analysis = f"【{stock_name}】今日{change_str}，表现{trend}。建议暂不介入，关注企稳信号。"
        else:
            if change > 3:
                analysis = f"【{stock_name}】今日{change_str}，表现{trend}。建议关注，可考虑适当参与。"
            elif change > 0:
                analysis = f"【{stock_name}】今日{change_str}，趋势{trend}。建议继续观察，等待明朗。"
            else:
                analysis = f"【{stock_name}】今日{change_str}，表现{trend}。建议控制仓位，风险第一。"

        analysis += "\n市场有风险，投资需谨慎。"
        return analysis


# 全局服务实例
llm_service = LLMService()
