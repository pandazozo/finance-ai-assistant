import pytest
from rule_engine import Rule, Condition, ConditionType, Operator, RuleEngine, get_rule_engine
from preset_strategies import PRESET_STRATEGIES, get_preset_strategies, get_preset_strategy_by_id, create_rule_from_preset


class TestRuleEngine:
    """规则引擎测试"""
    
    def test_rule_engine_init(self):
        """测试规则引擎初始化"""
        engine = RuleEngine()
        assert engine is not None
        assert engine.condition_handlers is not None
    
    def test_validate_rule_valid(self):
        """测试验证有效规则"""
        engine = RuleEngine()
        
        condition = Condition(
            type=ConditionType.TECHNICAL,
            field="change_percent",
            operator=Operator.GT,
            value=3.0
        )
        
        rule = Rule(
            name="测试规则",
            conditions=[condition],
            condition_logic="AND"
        )
        
        valid, msg = engine.validate_rule(rule)
        assert valid is True
        assert "valid" in msg.lower()
    
    def test_validate_rule_no_name(self):
        """测试验证无名称规则"""
        engine = RuleEngine()
        
        condition = Condition(
            type=ConditionType.TECHNICAL,
            field="change_percent",
            operator=Operator.GT,
            value=3.0
        )
        
        rule = Rule(
            name="",
            conditions=[condition],
            condition_logic="AND"
        )
        
        valid, msg = engine.validate_rule(rule)
        assert valid is False
        assert "name" in msg.lower()
    
    def test_validate_rule_no_conditions(self):
        """测试验证无条件规则"""
        engine = RuleEngine()
        
        rule = Rule(
            name="测试规则",
            conditions=[],
            condition_logic="AND"
        )
        
        valid, msg = engine.validate_rule(rule)
        assert valid is False
        assert "condition" in msg.lower()
    
    def test_validate_rule_invalid_field(self):
        """测试验证无效字段"""
        engine = RuleEngine()
        
        condition = Condition(
            type=ConditionType.TECHNICAL,
            field="invalid_field",
            operator=Operator.GT,
            value=3.0
        )
        
        rule = Rule(
            name="测试规则",
            conditions=[condition],
            condition_logic="AND"
        )
        
        valid, msg = engine.validate_rule(rule)
        assert valid is False
        assert "invalid" in msg.lower()
    
    def test_evaluate_technical_condition(self):
        """测试评估技术面条件"""
        engine = RuleEngine()
        
        condition = Condition(
            type=ConditionType.TECHNICAL,
            field="change_percent",
            operator=Operator.GT,
            value=3.0
        )
        
        stock_data = {
            "change_percent": 5.0,
            "volume_ratio": 1.5
        }
        
        result = engine.evaluate_condition(condition, stock_data)
        assert result is True
    
    def test_evaluate_fundamental_condition(self):
        """测试评估基本面条件"""
        engine = RuleEngine()
        
        condition = Condition(
            type=ConditionType.FUNDAMENTAL,
            field="pe_ratio",
            operator=Operator.LT,
            value=30.0
        )
        
        stock_data = {
            "pe_ratio": 25.0,
            "revenue_growth_yoy": 20.0
        }
        
        result = engine.evaluate_condition(condition, stock_data)
        assert result is True
    
    def test_evaluate_news_condition(self):
        """测试评估消息面条件"""
        engine = RuleEngine()
        
        condition = Condition(
            type=ConditionType.NEWS,
            field="has_positive_news",
            operator=Operator.EQ,
            value=True
        )
        
        stock_data = {
            "has_positive_news": True
        }
        
        result = engine.evaluate_condition(condition, stock_data)
        assert result is True
    
    def test_execute_rule_and(self):
        """测试执行AND逻辑规则"""
        engine = RuleEngine()
        
        conditions = [
            Condition(
                type=ConditionType.TECHNICAL,
                field="change_percent",
                operator=Operator.GT,
                value=3.0
            ),
            Condition(
                type=ConditionType.TECHNICAL,
                field="volume_ratio",
                operator=Operator.GT,
                value=1.0
            )
        ]
        
        rule = Rule(
            name="AND规则测试",
            conditions=conditions,
            condition_logic="AND"
        )
        
        stocks = [
            {"code": "001", "name": "测试1", "change_percent": 5.0, "volume_ratio": 1.5},
            {"code": "002", "name": "测试2", "change_percent": 2.0, "volume_ratio": 1.5},
            {"code": "003", "name": "测试3", "change_percent": 5.0, "volume_ratio": 0.5}
        ]
        
        result = engine.execute_rule(rule, stocks)
        assert len(result) == 1
        assert result[0]["code"] == "001"
    
    def test_execute_rule_or(self):
        """测试执行OR逻辑规则"""
        engine = RuleEngine()
        
        conditions = [
            Condition(
                type=ConditionType.TECHNICAL,
                field="change_percent",
                operator=Operator.GT,
                value=3.0
            ),
            Condition(
                type=ConditionType.TECHNICAL,
                field="volume_ratio",
                operator=Operator.GT,
                value=1.0
            )
        ]
        
        rule = Rule(
            name="OR规则测试",
            conditions=conditions,
            condition_logic="OR"
        )
        
        stocks = [
            {"code": "001", "name": "测试1", "change_percent": 5.0, "volume_ratio": 1.5},
            {"code": "002", "name": "测试2", "change_percent": 2.0, "volume_ratio": 1.5},
            {"code": "003", "name": "测试3", "change_percent": 5.0, "volume_ratio": 0.5},
            {"code": "004", "name": "测试4", "change_percent": 1.0, "volume_ratio": 0.5}
        ]
        
        result = engine.execute_rule(rule, stocks)
        assert len(result) == 3
    
    def test_compare_values(self):
        """测试比较值函数"""
        engine = RuleEngine()
        
        assert engine._compare_values(5.0, Operator.GT, 3.0) is True
        assert engine._compare_values(2.0, Operator.GT, 3.0) is False
        assert engine._compare_values(3.0, Operator.GE, 3.0) is True
        assert engine._compare_values(2.0, Operator.LT, 3.0) is True
        assert engine._compare_values(3.0, Operator.LE, 3.0) is True
        assert engine._compare_values(3.0, Operator.EQ, 3.0) is True
        assert engine._compare_values(3.0, Operator.NE, 4.0) is True
    
    def test_get_rule_engine_singleton(self):
        """测试获取单例规则引擎"""
        engine1 = get_rule_engine()
        engine2 = get_rule_engine()
        assert engine1 is engine2


class TestPresetStrategies:
    """预设策略测试"""
    
    def test_preset_strategies_not_empty(self):
        """测试预设策略不为空"""
        presets = get_preset_strategies()
        assert len(presets) > 0
    
    def test_preset_strategy_has_fields(self):
        """测试预设策略有必需字段"""
        presets = get_preset_strategies()
        preset = presets[0]
        
        assert "id" in preset
        assert "name" in preset
        assert "description" in preset
        assert "conditions" in preset
        assert "condition_logic" in preset
    
    def test_get_preset_by_id(self):
        """测试按ID获取预设策略"""
        preset = get_preset_strategy_by_id("preset_breakout")
        assert preset is not None
        assert preset["id"] == "preset_breakout"
    
    def test_get_preset_by_id_invalid(self):
        """测试按无效ID获取预设策略"""
        preset = get_preset_strategy_by_id("invalid_id")
        assert preset == {}
    
    def test_create_rule_from_preset(self):
        """测试从预设策略创建规则"""
        rule = create_rule_from_preset("preset_breakout")
        assert rule is not None
        assert rule.name == "突破新高"
        assert len(rule.conditions) > 0
    
    def test_create_rule_from_preset_invalid(self):
        """测试从无效预设创建规则"""
        with pytest.raises(ValueError):
            create_rule_from_preset("invalid_id")
