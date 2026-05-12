from pydantic import BaseModel, Field
from enum import Enum
from typing import List, Dict, Union, Tuple, Optional
from datetime import datetime


class ConditionType(str, Enum):
    TECHNICAL = "technical"
    FUNDAMENTAL = "fundamental"
    NEWS = "news"


class Operator(str, Enum):
    GT = ">"
    GE = ">="
    LT = "<"
    LE = "<="
    EQ = "=="
    NE = "!="
    CONTAINS = "contains"
    NOT_CONTAINS = "not_contains"


class Condition(BaseModel):
    type: ConditionType
    field: str
    operator: Operator
    value: Union[float, int, str, bool]


class Rule(BaseModel):
    id: Optional[str] = None
    name: str
    conditions: List[Condition]
    condition_logic: str = Field(default="AND", pattern="^(AND|OR)$")
    is_active: bool = True
    created_at: Optional[str] = None


class RuleEngine:
    def __init__(self):
        self.condition_handlers = {
            ConditionType.TECHNICAL: self._evaluate_technical,
            ConditionType.FUNDAMENTAL: self._evaluate_fundamental,
            ConditionType.NEWS: self._evaluate_news
        }

    def validate_rule(self, rule: Rule) -> Tuple[bool, str]:
        if not rule.name or len(rule.name.strip()) == 0:
            return False, "Rule name cannot be empty"
        if not rule.conditions:
            return False, "Rule must have at least one condition"
        if rule.condition_logic not in ["AND", "OR"]:
            return False, "Condition logic must be AND or OR"
        for condition in rule.conditions:
            valid, msg = self._validate_condition(condition)
            if not valid:
                return False, msg
        return True, "Rule is valid"

    def _validate_condition(self, condition: Condition) -> Tuple[bool, str]:
        valid_fields = {
            ConditionType.TECHNICAL: ["change_percent", "volume_ratio", "turnover_rate", 
                                      "is_new_high_20d", "is_new_low_20d", "max_drawdown_20d"],
            ConditionType.FUNDAMENTAL: ["pe_ratio", "pb_ratio", "revenue_growth_yoy", 
                                        "profit_growth_yoy", "northbound_net_inflow"],
            ConditionType.NEWS: ["has_positive_news", "has_negative_news", "has_official_news"]
        }
        if condition.type not in valid_fields:
            return False, f"Invalid condition type: {condition.type}"
        if condition.field not in valid_fields[condition.type]:
            return False, f"Invalid field for {condition.type}: {condition.field}"
        return True, "Condition is valid"

    def evaluate_condition(self, condition: Condition, stock_data: Dict) -> bool:
        handler = self.condition_handlers[condition.type]
        return handler(condition, stock_data)

    def execute_rule(self, rule: Rule, stocks: List[Dict]) -> List[Dict]:
        matching_stocks = []
        for stock in stocks:
            if self._match_rule(rule, stock):
                matching_stocks.append(stock)
        return matching_stocks

    def _match_rule(self, rule: Rule, stock_data: Dict) -> bool:
        if rule.condition_logic == "AND":
            return all(self.evaluate_condition(cond, stock_data) for cond in rule.conditions)
        else:
            return any(self.evaluate_condition(cond, stock_data) for cond in rule.conditions)

    def _evaluate_technical(self, condition: Condition, stock_data: Dict) -> bool:
        field_value = stock_data.get(condition.field)
        if field_value is None:
            return False
        return self._compare_values(field_value, condition.operator, condition.value)

    def _evaluate_fundamental(self, condition: Condition, stock_data: Dict) -> bool:
        field_value = stock_data.get(condition.field)
        if field_value is None:
            return False
        return self._compare_values(field_value, condition.operator, condition.value)

    def _evaluate_news(self, condition: Condition, stock_data: Dict) -> bool:
        field_value = stock_data.get(condition.field)
        if field_value is None:
            return False
        if isinstance(field_value, bool) and isinstance(condition.value, bool):
            return field_value == condition.value
        return False

    def _compare_values(self, left: Union[float, int, str], 
                       operator: Operator, 
                       right: Union[float, int, str]) -> bool:
        if operator == Operator.GT:
            return left > right
        elif operator == Operator.GE:
            return left >= right
        elif operator == Operator.LT:
            return left < right
        elif operator == Operator.LE:
            return left <= right
        elif operator == Operator.EQ:
            return left == right
        elif operator == Operator.NE:
            return left != right
        elif operator == Operator.CONTAINS:
            return str(right).lower() in str(left).lower()
        elif operator == Operator.NOT_CONTAINS:
            return str(right).lower() not in str(left).lower()
        return False


_rule_engine_instance = None


def get_rule_engine() -> RuleEngine:
    global _rule_engine_instance
    if _rule_engine_instance is None:
        _rule_engine_instance = RuleEngine()
    return _rule_engine_instance
