import { Opportunity, Anomaly, ReviewReport, mockOpportunities, mockAnomalies, mockReviewReport } from './mockData';

export const dataService = {
  async getOpportunities(): Promise<Opportunity[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockOpportunities;
  },

  async getAnomalies(): Promise<Anomaly[]> {
    await new Promise(resolve => setTimeout(resolve, 200));
    return mockAnomalies;
  },

  async getReviewReport(): Promise<ReviewReport> {
    await new Promise(resolve => setTimeout(resolve, 400));
    return mockReviewReport;
  },

  async searchStocks(keyword: string): Promise<{ code: string; name: string }[]> {
    await new Promise(resolve => setTimeout(resolve, 150));
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
