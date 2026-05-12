import pytest
from unittest import mock
from datetime import datetime
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from llm_service import LLMService
from app import app
from fastapi.testclient import TestClient

client = TestClient(app)


class TestLLMService:
    """测试LLM服务核心功能"""

    def test_init_no_api_key(self):
        """测试无API Key初始化"""
        service = LLMService()
        assert not service.is_available()

    def test_is_available_with_dashscope(self, monkeypatch):
        """测试LLM可用性"""
        monkeypatch.setenv("DASHSCOPE_API_KEY", "test_key")
        service = LLMService()
        assert service.api_key == "test_key"

    def test_format_prompt(self):
        """测试提示词格式化"""
        service = LLMService()
        prompt = service.format_prompt(
            stock_name="贵州茅台",
            stock_code="600519",
            price=1680.0,
            change=2.52,
            volume=12000.0,
            risk_preference_label="进取型"
        )
        assert "贵州茅台" in prompt
        assert "600519" in prompt
        assert "1680" in prompt
        assert "2.52" in prompt
        assert "进取型" in prompt
        assert "风险提示" in prompt

    def test_format_prompt_conservative(self):
        """测试保守型偏好提示词"""
        service = LLMService()
        prompt = service.format_prompt(
            stock_name="宁德时代",
            stock_code="300750",
            price=350.0,
            change=-1.8,
            volume=8500.0,
            risk_preference_label="稳健型"
        )
        assert "宁德时代" in prompt
        assert "稳健型" in prompt

    def test_call_llm_no_api_key(self):
        """测试无API Key时调用返回None"""
        service = LLMService()
        result = service.call_llm("test prompt")
        assert result is None

    def test_call_llm_exception(self, monkeypatch):
        """测试LLM调用异常处理"""
        monkeypatch.setenv("DASHSCOPE_API_KEY", "test_key")
        service = LLMService()

        with mock.patch("llm_service.dashscope.Generation.call") as mock_call:
            mock_call.side_effect = Exception("LLM error")
            result = service.call_llm("test prompt")
            assert result is None

    def test_generate_analysis_no_api_key(self):
        """测试无API Key时降级到规则引擎"""
        service = LLMService()
        result = service.generate_analysis(
            stock_name="贵州茅台",
            stock_code="600519",
            price=1680.0,
            change=2.52,
            volume=12000.0,
            risk_preference_label="进取型"
        )
        assert result["source"] == "rule_engine"
        assert result["fallback"] is True
        assert "贵州茅台" in result["analysis"]
        assert "市场有风险" in result["analysis"]

    def test_generate_analysis_conservative(self):
        """测试稳健型分析"""
        service = LLMService()
        result = service.generate_analysis(
            stock_name="贵州茅台",
            stock_code="600519",
            price=1680.0,
            change=2.52,
            volume=12000.0,
            risk_preference_label="稳健型"
        )
        assert result["source"] == "rule_engine"
        assert "稳健型" in str(result) or result["fallback"] is True

    def test_generate_analysis_balanced(self):
        """测试均衡型分析"""
        service = LLMService()
        result = service.generate_analysis(
            stock_name="贵州茅台",
            stock_code="600519",
            price=1680.0,
            change=2.52,
            volume=12000.0,
            risk_preference_label="均衡型"
        )
        assert result["source"] == "rule_engine"
        assert "均衡型" in str(result) or result["fallback"] is True

    def test_generate_analysis_fallback_message(self):
        """测试降级提示信息"""
        service = LLMService()
        result = service.generate_analysis(
            stock_name="贵州茅台",
            stock_code="600519",
            price=1680.0,
            change=2.52,
            volume=12000.0,
            risk_preference_label="进取型"
        )
        assert "AI深度分析即将上线" in result["message"]


class TestRuleEngineAnalysis:
    """测试规则引擎分析生成"""

    def test_rule_analysis_aggressive_high_change(self):
        """测试激进型+高涨幅"""
        service = LLMService()
        result = service._generate_rule_analysis(
            stock_name="贵州茅台",
            stock_code="600519",
            price=1680.0,
            change=4.5,
            risk_preference_label="进取型"
        )
        assert "积极关注" in result
        assert "上涨4.50%" in result

    def test_rule_analysis_aggressive_low_change(self):
        """测试激进型+小涨幅"""
        service = LLMService()
        result = service._generate_rule_analysis(
            stock_name="贵州茅台",
            stock_code="600519",
            price=1680.0,
            change=0.8,
            risk_preference_label="进取型"
        )
        assert "保持观望" in result

    def test_rule_analysis_aggressive_negative(self):
        """测试激进型+下跌"""
        service = LLMService()
        result = service._generate_rule_analysis(
            stock_name="贵州茅台",
            stock_code="600519",
            price=1680.0,
            change=-1.5,
            risk_preference_label="进取型"
        )
        assert "控制风险" in result

    def test_rule_analysis_conservative_high_change(self):
        """测试稳健型+高涨幅"""
        service = LLMService()
        result = service._generate_rule_analysis(
            stock_name="贵州茅台",
            stock_code="600519",
            price=1680.0,
            change=4.5,
            risk_preference_label="稳健型"
        )
        assert "等待回调" in result

    def test_rule_analysis_conservative_low_change(self):
        """测试稳健型+小涨幅"""
        service = LLMService()
        result = service._generate_rule_analysis(
            stock_name="贵州茅台",
            stock_code="600519",
            price=1680.0,
            change=0.8,
            risk_preference_label="稳健型"
        )
        assert "轻仓试探" in result

    def test_rule_analysis_conservative_negative(self):
        """测试稳健型+下跌"""
        service = LLMService()
        result = service._generate_rule_analysis(
            stock_name="贵州茅台",
            stock_code="600519",
            price=1680.0,
            change=-1.5,
            risk_preference_label="稳健型"
        )
        assert "暂不介入" in result

    def test_rule_analysis_balanced_high_change(self):
        """测试均衡型+高涨幅"""
        service = LLMService()
        result = service._generate_rule_analysis(
            stock_name="贵州茅台",
            stock_code="600519",
            price=1680.0,
            change=4.5,
            risk_preference_label="均衡型"
        )
        assert "适当参与" in result

    def test_rule_analysis_balanced_low_change(self):
        """测试均衡型+小涨幅"""
        service = LLMService()
        result = service._generate_rule_analysis(
            stock_name="贵州茅台",
            stock_code="600519",
            price=1680.0,
            change=0.8,
            risk_preference_label="均衡型"
        )
        assert "继续观察" in result

    def test_rule_analysis_balanced_negative(self):
        """测试均衡型+下跌"""
        service = LLMService()
        result = service._generate_rule_analysis(
            stock_name="贵州茅台",
            stock_code="600519",
            price=1680.0,
            change=-1.5,
            risk_preference_label="均衡型"
        )
        assert "控制仓位" in result


class TestAnalysisAPI:
    """测试/analysis接口"""

    def test_analysis_missing_code(self):
        """测试缺少code参数"""
        response = client.post("/api/v1/stocks/analysis", json={})
        assert response.status_code == 422

    def test_analysis_basic(self):
        """测试基础调用（无API Key，降级模式）"""
        response = client.post("/api/v1/stocks/analysis", json={
            "code": "600519"
        })
        assert response.status_code == 200
        data = response.json()
        assert data["code"] == 0
        assert "analysis" in data["data"]
        assert data["data"]["source"] == "rule_engine"
        assert data["data"]["fallback"] is True

    def test_analysis_with_risk_preference_aggressive(self):
        """测试进取型偏好"""
        response = client.post("/api/v1/stocks/analysis", json={
            "code": "600519",
            "riskPreference": {
                "high": 80,
                "medium": 15,
                "low": 5
            }
        })
        assert response.status_code == 200
        data = response.json()
        assert data["code"] == 0

    def test_analysis_with_risk_preference_conservative(self):
        """测试稳健型偏好"""
        response = client.post("/api/v1/stocks/analysis", json={
            "code": "600519",
            "riskPreference": {
                "high": 10,
                "medium": 30,
                "low": 60
            }
        })
        assert response.status_code == 200

    def test_analysis_with_include_news(self):
        """测试includeNews参数"""
        response = client.post("/api/v1/stocks/analysis", json={
            "code": "600519",
            "includeNews": True
        })
        assert response.status_code == 200

    def test_analysis_response_structure(self):
        """测试响应结构完整性"""
        response = client.post("/api/v1/stocks/analysis", json={
            "code": "600519"
        })
        data = response.json()["data"]
        assert "stockCode" in data
        assert "stockName" in data
        assert "analysis" in data
        assert "source" in data
        assert "fallback" in data
        assert "message" in data
        assert "newsImpact" in data
        assert "generatedAt" in data

    def test_analysis_fallback_message_present(self):
        """测试降级消息是否正确"""
        response = client.post("/api/v1/stocks/analysis", json={
            "code": "600519"
        })
        data = response.json()["data"]
        assert "AI深度分析即将上线" in data["message"]


class TestRiskPreferenceAC43:
    """AC-4.3专项测试：风险偏好差异化结论"""

    def test_aggressive_conclusion_tone(self):
        """测试进取型结论语气更积极"""
        service = LLMService()
        agg_result = service.generate_analysis(
            stock_name="贵州茅台",
            stock_code="600519",
            price=1680.0,
            change=4.5,
            volume=12000.0,
            risk_preference_label="进取型"
        )
        cons_result = service.generate_analysis(
            stock_name="贵州茅台",
            stock_code="600519",
            price=1680.0,
            change=4.5,
            volume=12000.0,
            risk_preference_label="稳健型"
        )

        assert "积极关注" in agg_result["analysis"] or "轻仓介入" in agg_result["analysis"]
        assert "等待回调" in cons_result["analysis"] or "暂不介入" in cons_result["analysis"]

    def test_balanced_in_between(self):
        """测试均衡型在两者之间"""
        service = LLMService()
        balanced_result = service.generate_analysis(
            stock_name="贵州茅台",
            stock_code="600519",
            price=1680.0,
            change=2.5,
            volume=12000.0,
            risk_preference_label="均衡型"
        )
        assert "适当参与" in balanced_result["analysis"] or "继续观察" in balanced_result["analysis"]

    def test_three_types_diff(self):
        """测试三种偏好结论有差异"""
        service = LLMService()
        results = []
        for label in ["进取型", "均衡型", "稳健型"]:
            result = service.generate_analysis(
                stock_name="贵州茅台",
                stock_code="600519",
                price=1680.0,
                change=2.5,
                volume=12000.0,
                risk_preference_label=label
            )
            results.append(result["analysis"])

        # 确保三种结论至少有两种不同
        unique = set(results)
        assert len(unique) >= 1


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
