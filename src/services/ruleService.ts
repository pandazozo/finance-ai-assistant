const API_BASE = import.meta.env.VITE_API_BASE || '';

export interface Condition {
  type: 'technical' | 'fundamental' | 'news';
  field: string;
  operator: '>' | '>=' | '<' | '<=' | '==' | '!=' | 'contains' | 'not_contains';
  value: number | string | boolean;
}

export interface Rule {
  id?: string;
  name: string;
  conditions: Condition[];
  conditionLogic: 'AND' | 'OR';
  isActive?: boolean;
  createdAt?: string;
}

export interface PresetStrategy {
  id: string;
  name: string;
  description: string;
  conditions: Condition[];
  conditionLogic: 'AND' | 'OR';
}

export interface RulesResponse {
  code: number;
  data: {
    rules: Rule[];
  };
}

export interface PresetsResponse {
  code: number;
  data: {
    presets: PresetStrategy[];
  };
}

export interface MatchResponse {
  code: number;
  data: {
    ruleId: string;
    matchingCount: number;
    matchingStocks: string[];
  };
}

export const ruleService = {
  async getRules(): Promise<RulesResponse> {
    const response = await fetch(`${API_BASE}/api/v3/rules`);
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    return response.json();
  },

  async createRule(rule: Omit<Rule, 'id' | 'createdAt' | 'isActive'>): Promise<any> {
    const response = await fetch(`${API_BASE}/api/v3/rules`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(rule),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    return response.json();
  },

  async updateRule(ruleId: string, rule: Partial<Rule>): Promise<any> {
    const response = await fetch(`${API_BASE}/api/v3/rules/${ruleId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(rule),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    return response.json();
  },

  async deleteRule(ruleId: string): Promise<any> {
    const response = await fetch(`${API_BASE}/api/v3/rules/${ruleId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    return response.json();
  },

  async matchRule(ruleId: string): Promise<MatchResponse> {
    const response = await fetch(`${API_BASE}/api/v3/rules/${ruleId}/match`);
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    return response.json();
  },

  async getPresets(): Promise<PresetsResponse> {
    const response = await fetch(`${API_BASE}/api/v3/presets`);
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    return response.json();
  },

  getConditionTypeLabel(type: string): string {
    const labels: Record<string, string> = {
      technical: '技术面',
      fundamental: '基本面',
      news: '消息面',
    };
    return labels[type] || type;
  },

  getFieldLabel(field: string): string {
    const labels: Record<string, string> = {
      change_percent: '涨跌幅(%)',
      volume_ratio: '量比',
      turnover_rate: '换手率(%)',
      is_new_high_20d: '创20日新高',
      is_new_low_20d: '创20日新低',
      max_drawdown_20d: '20日最大回撤(%)',
      pe_ratio: 'PE市盈率',
      pb_ratio: 'PB市净率',
      revenue_growth_yoy: '营收同比增长(%)',
      profit_growth_yoy: '利润同比增长(%)',
      northbound_net_inflow: '北向资金净流入',
      has_positive_news: '有正面消息',
      has_negative_news: '有负面消息',
      has_official_news: '有官方消息',
    };
    return labels[field] || field;
  },

  getOperatorLabel(operator: string): string {
    const labels: Record<string, string> = {
      '>': '大于',
      '>=': '大于等于',
      '<': '小于',
      '<=': '小于等于',
      '==': '等于',
      '!=': '不等于',
      'contains': '包含',
      'not_contains': '不包含',
    };
    return labels[operator] || operator;
  },

  getFieldsForType(type: string): string[] {
    const fields: Record<string, string[]> = {
      technical: ['change_percent', 'volume_ratio', 'turnover_rate', 'is_new_high_20d', 'is_new_low_20d', 'max_drawdown_20d'],
      fundamental: ['pe_ratio', 'pb_ratio', 'revenue_growth_yoy', 'profit_growth_yoy', 'northbound_net_inflow'],
      news: ['has_positive_news', 'has_negative_news', 'has_official_news'],
    };
    return fields[type] || [];
  },
};
