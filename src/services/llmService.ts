import { RiskPreference } from '../stores';

const API_BASE = import.meta.env.VITE_API_BASE || '';

export interface AnalysisResponse {
  code: number;
  data: {
    stockCode: string;
    stockName: string;
    analysis: string;
    source: 'llm' | 'rule_engine';
    fallback: boolean;
    message: string;
    newsImpact: number;
    generatedAt: string;
  };
}

export const llmService = {
  async getAnalysis(
    code: string,
    riskPreference?: RiskPreference,
    includeNews: boolean = false
  ): Promise<AnalysisResponse> {
    const response = await fetch(`${API_BASE}/api/v1/stocks/analysis`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        code,
        riskPreference: riskPreference || { high: 40, medium: 35, low: 25 },
        includeNews,
      }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    return response.json();
  },

  getSourceLabel(source: 'llm' | 'rule_engine'): string {
    return source === 'llm' ? 'AI深度分析' : '智能分析';
  },

  isFallback(source: 'llm' | 'rule_engine'): boolean {
    return source === 'rule_engine';
  },
};
