const API_BASE = import.meta.env.VITE_API_BASE || '';

export interface NewsItem {
  id: string;
  title: string;
  source: string;
  time: string;
  summary: string;
  impactScore: number;
  isImportant: boolean;
  breakdown?: {
    timeliness: number;
    relevance: number;
    authority: number;
  };
}

export interface NewsResponse {
  code: number;
  data: {
    news: NewsItem[];
    count: number;
  };
}

export const newsService = {
  async getNews(code: string, limit: number = 10): Promise<NewsResponse> {
    const response = await fetch(
      `${API_BASE}/api/v1/stocks/news?code=${code}&limit=${limit}`
    );

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    return response.json();
  },

  getImpactColor(score: number): string {
    if (score >= 80) return 'text-red-500';
    if (score >= 60) return 'text-orange-500';
    if (score >= 40) return 'text-yellow-500';
    return 'text-text-secondary';
  },

  getImpactBgColor(score: number): string {
    if (score >= 80) return 'bg-red-500/10';
    if (score >= 60) return 'bg-orange-500/10';
    if (score >= 40) return 'bg-yellow-500/10';
    return 'bg-bg-dark';
  },

  formatImpactScore(score: number): string {
    return `${score}分`;
  },

  getImportanceLabel(isImportant: boolean): string {
    return isImportant ? '重要' : '';
  },
};
