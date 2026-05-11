import { Opportunity, Anomaly, ReviewReport } from './mockData';

const API_BASE_URL = 'https://finance-ai-assistant-production.up.railway.app';

interface ApiResponse<T> {
  data?: T;
  error?: string;
}

async function fetchApi<T>(endpoint: string): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const data = await response.json();
    return { data };
  } catch (error) {
    console.warn(`API call failed, using mock data: ${error}`);
    return { error: String(error) };
  }
}

export const dataService = {
  async getOpportunities(): Promise<Opportunity[]> {
    const result = await fetchApi<Opportunity[]>('/api/opportunities');
    if (result.data) {
      return result.data;
    }
    
    const { mockOpportunities } = await import('./mockData');
    return mockOpportunities;
  },

  async getAnomalies(): Promise<Anomaly[]> {
    const result = await fetchApi<Anomaly[]>('/api/anomalies');
    if (result.data) {
      return result.data;
    }
    
    const { mockAnomalies } = await import('./mockData');
    return mockAnomalies;
  },

  async getReviewReport(): Promise<ReviewReport> {
    const result = await fetchApi<ReviewReport>('/api/review');
    if (result.data) {
      return result.data;
    }
    
    const { mockReviewReport } = await import('./mockData');
    return mockReviewReport;
  },

  async searchStocks(keyword: string): Promise<{ code: string; name: string }[]> {
    const result = await fetchApi<{ code: string; name: string }[]>(`/api/search?keyword=${encodeURIComponent(keyword)}`);
    if (result.data) {
      return result.data;
    }
    
    const allStocks = [
      { code: '300750', name: '宁德时代' },
      { code: '688981', name: '中芯国际' },
      { code: '002594', name: '比亚迪' },
      { code: '300059', name: '东方财富' },
      { code: '002371', name: '北方华创' },
      { code: '688256', name: '寒武纪' },
      { code: '603986', name: '兆易创新' },
      { code: '688008', name: '澜起科技' },
    ];
    return allStocks.filter(s => 
      s.name.includes(keyword) || s.code.includes(keyword)
    );
  },
};
