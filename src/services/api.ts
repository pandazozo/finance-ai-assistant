const API_BASE = import.meta.env.VITE_API_BASE || 'https://finance-ai-assistant-production.up.railway.app';

export interface StockQuote {
  code: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  amount: number;
  high: number;
  low: number;
  open: number;
  prevClose: number;
  updateTime: string;
}

export interface AISignals {
  type: string;
  signal: string;
  score: number;
}

export interface AIConclusion {
  level: number;
  label: string;
  score: number;
  explanation: string;
  signals: AISignals[];
  riskTips: string;
}

export interface RiskPreference {
  high: number;
  medium: number;
  low: number;
}

export const api = {
  async getQuote(codes: string[]): Promise<{ code: number; message: string; data: { quotes: StockQuote[] } }> {
    const res = await fetch(`${API_BASE}/api/v1/stocks/quote?codes=${codes.join(',')}`);
    return res.json();
  },

  async searchStocks(keyword: string, limit = 10): Promise<{ code: number; data: { stocks: { code: string; name: string; market: string }[] } }> {
    const res = await fetch(`${API_BASE}/api/v1/stocks/search?keyword=${encodeURIComponent(keyword)}&limit=${limit}`);
    return res.json();
  },

  async getAIConclusion(code: string, riskPreference?: RiskPreference): Promise<{ code: number; data: any }> {
    const res = await fetch(`${API_BASE}/api/v1/stocks/ai-conclusion?code=${code}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, riskPreference: riskPreference || { high: 40, medium: 35, low: 25 } })
    });
    return res.json();
  },

  async healthCheck(): Promise<{ status: string; version: string; timestamp: string }> {
    const res = await fetch(`${API_BASE}/api/health`);
    return res.json();
  }
};

export default api;
