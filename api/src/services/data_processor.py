from typing import Dict, Any

class RuleEngine:
    def __init__(self):
        self.factors = {
            "change_percent": 0.25,
            "breakthrough": 0.15,
            "volume_ratio": 0.20,
            "fund_flow": 0.20,
            "trend_strength": 0.10,
            "volatility": 0.10
        }
        
        self.risk_coefficients = {
            "high": 1.2,
            "medium": 1.0,
            "low": 0.8
        }
        
        self.conclusion_mapping = [
            (80, 5, "强烈推荐"),
            (60, 3, "推荐"),
            (40, 0, "中性"),
            (20, -3, "谨慎"),
            (0, -5, "回避")
        ]

    def calculate(self, market_data: Dict[str, Any], risk_preference: Dict[str, int]) -> Dict[str, Any]:
        scores = {}
        signals = []
        
        change_pct = abs(market_data.get("changePercent", 0))
        if change_pct >= 5:
            scores["change_percent"] = 100
            signals.append({"type": "价格", "signal": f"涨跌幅{market_data.get('changePercent', 0):.2f}%", "score": 25})
        elif change_pct >= 3:
            scores["change_percent"] = 80
            signals.append({"type": "价格", "signal": f"涨跌幅{market_data.get('changePercent', 0):.2f}%", "score": 20})
        elif change_pct >= 1:
            scores["change_percent"] = 60
            signals.append({"type": "价格", "signal": f"涨跌幅{market_data.get('changePercent', 0):.2f}%", "score": 15})
        else:
            scores["change_percent"] = 40
            signals.append({"type": "价格", "signal": f"涨跌幅{market_data.get('changePercent', 0):.2f}%", "score": 10})
        
        high = market_data.get("high", 0)
        low = market_data.get("low", 0)
        price = market_data.get("price", 0)
        if high > 0 and price >= high * 0.98:
            scores["breakthrough"] = 100
            signals.append({"type": "技术面", "signal": "接近日内高点", "score": 15})
        elif price > market_data.get("open", 0):
            scores["breakthrough"] = 70
            signals.append({"type": "技术面", "signal": "价格高于开盘价", "score": 10})
        else:
            scores["breakthrough"] = 40
            signals.append({"type": "技术面", "signal": "价格低于开盘价", "score": 5})
        
        amount = market_data.get("amount", 0)
        if amount > 1e9:
            scores["volume_ratio"] = 100
            signals.append({"type": "资金面", "signal": f"成交额{int(amount/1e8)}亿", "score": 20})
        elif amount > 5e8:
            scores["volume_ratio"] = 70
            signals.append({"type": "资金面", "signal": f"成交额{int(amount/1e8)}亿", "score": 14})
        else:
            scores["volume_ratio"] = 40
            signals.append({"type": "资金面", "signal": f"成交额{int(amount/1e8)}亿", "score": 8})
        
        change = market_data.get("change", 0)
        if change > 0:
            scores["fund_flow"] = 80
            signals.append({"type": "资金面", "signal": "价格上涨", "score": 16})
        else:
            scores["fund_flow"] = 40
            signals.append({"type": "资金面", "signal": "价格下跌", "score": 8})
        
        if high > low:
            price_range = high - low
            distance_from_low = price - low
            if distance_from_low / price_range > 0.7:
                scores["trend_strength"] = 90
                signals.append({"type": "技术面", "signal": "强势", "score": 9})
            elif distance_from_low / price_range > 0.4:
                scores["trend_strength"] = 60
                signals.append({"type": "技术面", "signal": "中性", "score": 6})
            else:
                scores["trend_strength"] = 40
                signals.append({"type": "技术面", "signal": "偏弱", "score": 4})
        else:
            scores["trend_strength"] = 50
            signals.append({"type": "技术面", "signal": "震荡", "score": 5})
        
        scores["volatility"] = 50
        signals.append({"type": "波动性", "signal": "波动正常", "score": 5})
        
        weighted_score = sum(scores[key] * self.factors[key] for key in self.factors)
        
        risk_type = "medium"
        if risk_preference.get("high", 40) >= 50:
            risk_type = "high"
        elif risk_preference.get("low", 25) >= 40:
            risk_type = "low"
        
        risk_coef = self.risk_coefficients[risk_type]
        final_score = min(100, max(0, weighted_score * risk_coef))
        
        level, label = 0, "中性"
        for threshold, lvl, lbl in self.conclusion_mapping:
            if final_score >= threshold:
                level, label = lvl, lbl
                break
        
        if change > 0:
            explanation = f"基于当前行情分析，该股呈现{'强势' if change_pct > 3 else '温和'}上涨态势。"
        else:
            explanation = f"基于当前行情分析，该股呈现{'下跌' if change_pct > 3 else '小幅调整'}态势。"
        
        if risk_type == "high":
            risk_tips = "风险偏好较高，建议关注趋势延续性，控制仓位。"
        elif risk_type == "low":
            risk_tips = "建议关注风险，稳健操作，不宜追高。"
        else:
            risk_tips = "建议观望为主，等待更明确信号。"
        
        return {
            "code": market_data.get("code", ""),
            "name": market_data.get("name", ""),
            "conclusion": {
                "level": level,
                "label": label,
                "score": int(final_score),
                "explanation": explanation,
                "signals": signals,
                "riskTips": risk_tips
            }
        }

__all__ = ["RuleEngine"]
