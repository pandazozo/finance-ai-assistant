#!/usr/bin/env python3
"""
E2E API 测试脚本
验证后端所有API接口的完整功能
"""

import requests
import time
import json
from typing import Dict, List

BASE_URL = "http://localhost:8000"
FRONTEND_URL = "http://localhost:5173"

class Colors:
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    END = '\033[0m'

def print_test(name: str, passed: bool, details: str = ""):
    status = f"{Colors.GREEN}✓ PASS{Colors.END}" if passed else f"{Colors.RED}✗ FAIL{Colors.END}"
    print(f"{status} | {name}")
    if details:
        print(f"       {details}")

def test_health() -> bool:
    """测试健康检查"""
    try:
        resp = requests.get(f"{BASE_URL}/api/health", timeout=5)
        if resp.status_code == 200:
            print_test("健康检查", True)
            return True
        print_test("健康检查", False, f"状态码: {resp.status_code}")
        return False
    except Exception as e:
        print_test("健康检查", False, str(e))
        return False

def test_stock_quote() -> bool:
    """测试股票行情API"""
    try:
        resp = requests.get(f"{BASE_URL}/api/v1/stocks/quote?codes=600519,000001", timeout=10)
        data = resp.json()
        if data.get("code") == 0 and "quotes" in data.get("data", {}):
            quotes = data["data"]["quotes"]
            print_test("股票行情API", True, f"获取{len(quotes)}只股票")
            return True
        print_test("股票行情API", False, str(data))
        return False
    except Exception as e:
        print_test("股票行情API", False, str(e))
        return False

def test_stock_search() -> bool:
    """测试股票搜索API"""
    try:
        resp = requests.get(f"{BASE_URL}/api/v1/stocks/search?keyword=茅台", timeout=10)
        data = resp.json()
        if data.get("code") == 0:
            results = data.get("data", {}).get("results", [])
            print_test("股票搜索API", True, f"找到{len(results)}个结果")
            return True
        print_test("股票搜索API", False, str(data))
        return False
    except Exception as e:
        print_test("股票搜索API", False, str(e))
        return False

def test_opportunities() -> bool:
    """测试热点机会API"""
    try:
        resp = requests.get(f"{BASE_URL}/api/opportunities", timeout=10)
        data = resp.json()
        if isinstance(data, list):
            print_test("热点机会API", True, f"获取{len(data)}个机会")
            return True
        elif data.get("code") == 0:
            items = data.get("data", [])
            if not isinstance(items, list):
                items = data.get("data", {}).get("items", [])
            print_test("热点机会API", True, f"获取{len(items)}个机会")
            return True
        print_test("热点机会API", False, str(data))
        return False
    except Exception as e:
        print_test("热点机会API", False, str(e))
        return False

def test_anomalies() -> bool:
    """测试异动情报API"""
    try:
        resp = requests.get(f"{BASE_URL}/api/anomalies", timeout=10)
        data = resp.json()
        if isinstance(data, list):
            print_test("异动情报API", True, f"获取{len(data)}条异动")
            return True
        elif data.get("code") == 0:
            anomalies = data.get("data", [])
            if not isinstance(anomalies, list):
                anomalies = data.get("data", {}).get("anomalies", [])
            print_test("异动情报API", True, f"获取{len(anomalies)}条异动")
            return True
        print_test("异动情报API", False, str(data))
        return False
    except Exception as e:
        print_test("异动情报API", False, str(e))
        return False

def test_review() -> bool:
    """测试市场复盘API"""
    try:
        resp = requests.get(f"{BASE_URL}/api/review", timeout=10)
        data = resp.json()
        if data.get("code") == 0 or "indices" in data:
            indices = data.get("data", {}).get("indices", data.get("indices", []))
            print_test("市场复盘API", True, f"获取{len(indices)}个指数")
            return True
        print_test("市场复盘API", False, str(data))
        return False
    except Exception as e:
        print_test("市场复盘API", False, str(e))
        return False

def test_news() -> bool:
    """测试资讯API"""
    try:
        resp = requests.get(f"{BASE_URL}/api/v1/stocks/news?code=600519&limit=5", timeout=10)
        data = resp.json()
        if data.get("code") == 0:
            news = data.get("data", {}).get("news", [])
            print_test("资讯API", True, f"获取{len(news)}条新闻")
            if news:
                sample = news[0]
                impact = sample.get("impactScore", 0)
                print(f"       样本影响指数: {impact}")
            return True
        print_test("资讯API", False, str(data))
        return False
    except Exception as e:
        print_test("资讯API", False, str(e))
        return False

def test_ai_analysis() -> bool:
    """测试AI分析API"""
    try:
        resp = requests.post(
            f"{BASE_URL}/api/v1/stocks/analysis",
            json={"code": "600519", "riskPreference": {"type": "balanced"}},
            timeout=15
        )
        data = resp.json()
        if data.get("code") == 0:
            analysis = data.get("data", {})
            conclusion = analysis.get("conclusion", "")[:50]
            print_test("AI分析API", True, f"生成分析: {conclusion}...")
            return True
        print_test("AI分析API", False, str(data))
        return False
    except Exception as e:
        print_test("AI分析API", False, str(e))
        return False

def test_rules() -> bool:
    """测试规则引擎API"""
    try:
        resp = requests.get(f"{BASE_URL}/api/v3/rules", timeout=10)
        data = resp.json()
        if data.get("code") == 0:
            rules = data.get("data", {}).get("rules", [])
            print_test("规则列表API", True, f"当前{rules.__len__()}条规则")
            return True
        print_test("规则列表API", False, str(data))
        return False
    except Exception as e:
        print_test("规则列表API", False, str(e))
        return False

def test_presets() -> bool:
    """测试预设策略API"""
    try:
        resp = requests.get(f"{BASE_URL}/api/v3/presets", timeout=10)
        data = resp.json()
        if data.get("code") == 0:
            presets = data.get("data", {}).get("presets", [])
            print_test("预设策略API", True, f"获取{len(presets)}个预设策略")
            for p in presets[:3]:
                print(f"       - {p.get('name', 'unknown')}")
            return True
        print_test("预设策略API", False, str(data))
        return False
    except Exception as e:
        print_test("预设策略API", False, str(e))
        return False

def test_create_rule() -> bool:
    """测试创建规则"""
    try:
        rule_data = {
            "name": "E2E测试规则",
            "conditions": [
                {"type": "technical", "field": "change_percent", "operator": ">", "value": 5.0}
            ],
            "conditionLogic": "AND"
        }
        resp = requests.post(f"{BASE_URL}/api/v3/rules", json=rule_data, timeout=10)
        data = resp.json()
        if data.get("code") == 0:
            rule = data.get("data", {})
            print_test("创建规则API", True, f"规则ID: {rule.get('id')}")
            return True
        print_test("创建规则API", False, str(data))
        return False
    except Exception as e:
        print_test("创建规则API", False, str(e))
        return False

def test_community_posts() -> bool:
    """测试社群帖子API"""
    try:
        resp = requests.get(f"{BASE_URL}/api/v3/community/posts?code=600519&limit=5", timeout=10)
        data = resp.json()
        if data.get("code") == 0:
            posts = data.get("data", {}).get("posts", [])
            print_test("社群帖子API", True, f"获取{len(posts)}条帖子")
            return True
        print_test("社群帖子API", False, str(data))
        return False
    except Exception as e:
        print_test("社群帖子API", False, str(e))
        return False

def test_frontend_accessible() -> bool:
    """测试前端页面可访问"""
    try:
        resp = requests.get(FRONTEND_URL, timeout=5)
        if resp.status_code == 200:
            print_test("前端页面访问", True, "HTML加载成功")
            return True
        print_test("前端页面访问", False, f"状态码: {resp.status_code}")
        return False
    except Exception as e:
        print_test("前端页面访问", False, str(e))
        return False

def main():
    print(f"\n{Colors.BLUE}{'='*60}{Colors.END}")
    print(f"{Colors.BLUE}  金融AI助手 - E2E API 完整测试{Colors.END}")
    print(f"{Colors.BLUE}{'='*60}{Colors.END}\n")
    
    print(f"{Colors.YELLOW}[1] Phase 1: 核心功能API测试{Colors.END}")
    results = []
    results.append(test_health())
    results.append(test_stock_quote())
    results.append(test_stock_search())
    results.append(test_opportunities())
    results.append(test_anomalies())
    results.append(test_review())
    
    print(f"\n{Colors.YELLOW}[2] Phase 2: LLM与资讯API测试{Colors.END}")
    results.append(test_news())
    results.append(test_ai_analysis())
    
    print(f"\n{Colors.YELLOW}[3] Phase 3: 规则引擎API测试{Colors.END}")
    results.append(test_rules())
    results.append(test_presets())
    results.append(test_create_rule())
    results.append(test_community_posts())
    
    print(f"\n{Colors.YELLOW}[4] 前端集成测试{Colors.END}")
    results.append(test_frontend_accessible())
    
    passed = sum(results)
    total = len(results)
    
    print(f"\n{Colors.BLUE}{'='*60}{Colors.END}")
    print(f"  测试结果: {passed}/{total} 通过")
    
    if passed == total:
        print(f"  {Colors.GREEN}✓ 所有测试通过！{Colors.END}")
    else:
        print(f"  {Colors.RED}✗ 有{total - passed}个测试失败{Colors.END}")
    print(f"{Colors.BLUE}{'='*60}{Colors.END}\n")
    
    return passed == total

if __name__ == "__main__":
    main()
