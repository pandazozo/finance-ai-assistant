from typing import List, Dict
from rule_engine import Rule, Condition, ConditionType, Operator


PRESET_STRATEGIES: List[Dict] = [
    {
        "id": "preset_breakout",
        "name": "突破新高",
        "description": "价格创20日新高且放量上涨，适合趋势突破",
        "conditions": [
            {
                "type": ConditionType.TECHNICAL,
                "field": "change_percent",
                "operator": Operator.GT,
                "value": 3.0
            },
            {
                "type": ConditionType.TECHNICAL,
                "field": "volume_ratio",
                "operator": Operator.GT,
                "value": 1.5
            },
            {
                "type": ConditionType.TECHNICAL,
                "field": "is_new_high_20d",
                "operator": Operator.EQ,
                "value": True
            }
        ],
        "condition_logic": "AND"
    },
    {
        "id": "preset_rebound",
        "name": "低位反弹",
        "description": "超跌后缩量企稳，放量反弹，适合抄底",
        "conditions": [
            {
                "type": ConditionType.TECHNICAL,
                "field": "max_drawdown_20d",
                "operator": Operator.LT,
                "value": -15.0
            },
            {
                "type": ConditionType.TECHNICAL,
                "field": "volume_ratio",
                "operator": Operator.GT,
                "value": 1.3
            },
            {
                "type": ConditionType.TECHNICAL,
                "field": "change_percent",
                "operator": Operator.GT,
                "value": 2.0
            }
        ],
        "condition_logic": "AND"
    },
    {
        "id": "preset_value",
        "name": "基本面优选",
        "description": "低估值+高成长+资金流入，适合价值投资",
        "conditions": [
            {
                "type": ConditionType.FUNDAMENTAL,
                "field": "pe_ratio",
                "operator": Operator.LT,
                "value": 30.0
            },
            {
                "type": ConditionType.FUNDAMENTAL,
                "field": "revenue_growth_yoy",
                "operator": Operator.GT,
                "value": 20.0
            },
            {
                "type": ConditionType.TECHNICAL,
                "field": "northbound_net_inflow",
                "operator": Operator.GT,
                "value": 0.0
            }
        ],
        "condition_logic": "AND"
    },
    {
        "id": "preset_strong_pullback",
        "name": "强势股回调",
        "description": "前期涨幅20%+后回调5-10%，适合低吸",
        "conditions": [
            {
                "type": ConditionType.TECHNICAL,
                "field": "change_percent",
                "operator": Operator.LT,
                "value": -5.0
            },
            {
                "type": ConditionType.TECHNICAL,
                "field": "change_percent",
                "operator": Operator.GT,
                "value": -10.0
            },
            {
                "type": ConditionType.TECHNICAL,
                "field": "volume_ratio",
                "operator": Operator.LT,
                "value": 0.8
            }
        ],
        "condition_logic": "AND"
    },
    {
        "id": "preset_north_flow",
        "name": "北向资金增持",
        "description": "北向资金大幅流入+技术面配合，适合跟外资",
        "conditions": [
            {
                "type": ConditionType.TECHNICAL,
                "field": "northbound_net_inflow",
                "operator": Operator.GT,
                "value": 10000000.0
            },
            {
                "type": ConditionType.TECHNICAL,
                "field": "change_percent",
                "operator": Operator.GT,
                "value": 0
            },
            {
                "type": ConditionType.TECHNICAL,
                "field": "volume_ratio",
                "operator": Operator.GT,
                "value": 1.2
            }
        ],
        "condition_logic": "AND"
    }
]


def get_preset_strategies() -> List[Dict]:
    return PRESET_STRATEGIES


def get_preset_strategy_by_id(strategy_id: str) -> Dict:
    for strategy in PRESET_STRATEGIES:
        if strategy.get("id") == strategy_id:
            return strategy
    return {}


def create_rule_from_preset(strategy_id: str) -> Rule:
    preset = get_preset_strategy_by_id(strategy_id)
    if not preset:
        raise ValueError(f"Preset strategy not found: {strategy_id}")
    
    conditions = []
    for cond_dict in preset.get("conditions", []):
        conditions.append(Condition(**cond_dict))
    
    return Rule(
        id=preset.get("id"),
        name=preset.get("name"),
        conditions=conditions,
        condition_logic=preset.get("condition_logic", "AND")
    )
