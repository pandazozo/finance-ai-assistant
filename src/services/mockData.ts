export interface Stock {
  code: string;
  name: string;
  change: number;
  relevance: number;
}

export interface News {
  id: string;
  title: string;
  source: string;
  time: string;
  summary: string;
}

export interface Opportunity {
  id: string;
  topic: string;
  topicDescription: string;
  heatIndex: number;
  score: number;
  stocks: Stock[];
  news: News[];
  drivers: string[];
  updatedAt: string;
}

export interface Anomaly {
  id: string;
  stockName: string;
  stockCode: string;
  type: 'price' | 'fund' | 'volume';
  change: number;
  time: string;
  newsCount: number;
  news: News[];
  aiInsight: string;
  hasNews: boolean;
}

export interface IndexData {
  name: string;
  value: number;
  change: number;
}

export interface Sector {
  name: string;
  change: number;
  driver: string;
  leaders: string[];
}

export interface PortfolioItem {
  stockName: string;
  stockCode: string;
  change: number;
  comment: string;
}

export interface ReviewReport {
  date: string;
  indices: IndexData[];
  hotSectors: Sector[];
  outlook: {
    opportunities: string[];
    risks: string[];
  };
  portfolio: PortfolioItem[];
}

export const mockOpportunities: Opportunity[] = [
  {
    id: '1',
    topic: 'AI芯片',
    topicDescription: '受益于全球AI算力需求爆发，芯片代工龙头业绩超预期，带动整个AI芯片板块持续走强',
    heatIndex: 92,
    score: 4.5,
    stocks: [
      { code: '688981', name: '中芯国际', change: 5.82, relevance: 0.95 },
      { code: '002415', name: '海康威视', change: 3.21, relevance: 0.88 },
      { code: '688256', name: '寒武纪', change: 8.45, relevance: 0.92 },
      { code: '603986', name: '兆易创新', change: 4.12, relevance: 0.85 },
    ],
    news: [
      { id: 'n1', title: '英伟达业绩超预期，AI芯片需求持续火爆', source: '财经网', time: '10:30', summary: '全球AI芯片龙头企业英伟达发布财报显示...' },
      { id: 'n2', title: '国产AI芯片替代加速，机构上调评级', source: '证券时报', time: '09:45', summary: '多家券商发布研报看好AI芯片板块...' },
    ],
    drivers: ['海外AI巨头业绩超预期', '国产替代进程加速', '算力需求爆发式增长'],
    updatedAt: '10分钟前',
  },
  {
    id: '2',
    topic: '新能源汽车',
    topicDescription: '政策利好持续加码，新能源汽车销量数据亮眼，板块估值有望修复',
    heatIndex: 85,
    score: 4.2,
    stocks: [
      { code: '300750', name: '宁德时代', change: 4.56, relevance: 0.98 },
      { code: '002594', name: '比亚迪', change: 3.28, relevance: 0.94 },
      { code: '688005', name: '容百科技', change: 6.12, relevance: 0.82 },
    ],
    news: [
      { id: 'n3', title: '新能源汽车购置税减免政策延续至2027年', source: '中国政府网', time: '14:20', summary: '财政部宣布新能源汽车购置税减免政策...' },
    ],
    drivers: ['购置税减免政策加码', '电池技术持续突破', '出海需求强劲'],
    updatedAt: '25分钟前',
  },
  {
    id: '3',
    topic: '创新药',
    topicDescription: '创新药审批加速，多款国产创新药获批上市，行业迎来发展黄金期',
    heatIndex: 78,
    score: 4.0,
    stocks: [
      { code: '688180', name: '君实生物', change: 7.23, relevance: 0.91 },
      { code: '300759', name: '康龙化成', change: 2.85, relevance: 0.78 },
      { code: '000963', name: '华东医药', change: 1.92, relevance: 0.72 },
    ],
    news: [
      { id: 'n4', title: '国产PD-1抑制剂获FDA批准上市', source: '医药时报', time: '11:30', summary: '首款国产PD-1抑制剂获得美国FDA批准...' },
    ],
    drivers: ['创新药审批提速', '出海逻辑逐步兑现', '估值处于历史低位'],
    updatedAt: '1小时前',
  },
  {
    id: '4',
    topic: '低空经济',
    topicDescription: '政策密集出台支持低空经济发展，万亿级市场蓝海打开',
    heatIndex: 88,
    score: 4.3,
    stocks: [
      { code: '002368', name: '太极股份', change: 9.82, relevance: 0.89 },
      { code: '688589', name: '莱斯信息', change: 6.54, relevance: 0.85 },
      { code: '300620', name: '光库科技', change: 5.21, relevance: 0.81 },
    ],
    news: [
      { id: 'n5', title: '工信部发布低空经济产业发展指导意见', source: '工信部', time: '13:45', summary: '文件提出到2030年形成万亿级市场规模...' },
    ],
    drivers: ['政策支持力度超预期', '应用场景快速落地', '基础设施投资加速'],
    updatedAt: '30分钟前',
  },
  {
    id: '5',
    topic: '存储芯片',
    topicDescription: '存储芯片周期拐点已现，AI驱动HBM需求爆发，行业景气度持续回升',
    heatIndex: 82,
    score: 4.1,
    stocks: [
      { code: '688008', name: '澜起科技', change: 5.67, relevance: 0.93 },
      { code: '603986', name: '兆易创新', change: 4.12, relevance: 0.87 },
      { code: '688521', name: '芯原股份', change: 3.89, relevance: 0.79 },
    ],
    news: [
      { id: 'n6', title: '存储芯片价格上涨趋势确立', source: '半导体行业观察', time: '09:15', summary: '主流存储芯片合约价格环比上涨15%...' },
    ],
    drivers: ['存储芯片价格回暖', 'HBM需求爆发', '国产化率持续提升'],
    updatedAt: '2小时前',
  },
];

export const mockAnomalies: Anomaly[] = [
  {
    id: 'a1',
    stockName: '东方财富',
    stockCode: '300059',
    type: 'price',
    change: 8.52,
    time: '14:32:15',
    newsCount: 3,
    news: [
      { id: 'an1', title: '东方财富发布2024年半年报，营收利润双增长', source: '公司公告', time: '14:30', summary: '公司上半年实现营业收入XX亿元，同比增长XX%...' },
      { id: 'an2', title: '券商板块集体走强，东方财富领涨', source: '财联社', time: '14:28', summary: '受市场交易活跃度提升影响，券商板块今日表现强势...' },
    ],
    aiInsight: '东方财富今日大幅上涨，主要受益于市场交易活跃度提升和券商板块集体走强，公司业绩增长预期增强。建议关注后续成交量变化。',
    hasNews: true,
  },
  {
    id: 'a2',
    stockName: '宁德时代',
    stockCode: '300750',
    type: 'fund',
    change: 5.82,
    time: '14:15:42',
    newsCount: 2,
    news: [
      { id: 'an3', title: '宁德时代获北向资金大幅净买入', source: '东方财富网', time: '14:10', summary: '今日北向资金净买入宁德时代超10亿元...' },
    ],
    aiInsight: '宁德时代获得大额资金净流入，显示机构投资者对公司中长期发展充满信心。新能源汽车政策利好或持续催化股价。',
    hasNews: true,
  },
  {
    id: 'a3',
    stockName: '三六零',
    stockCode: '601360',
    type: 'price',
    change: -6.28,
    time: '13:58:22',
    newsCount: 0,
    news: [],
    aiInsight: '三六零今日大幅下跌，暂无明显消息面利空。疑似纯盘面资金出逃，建议关注是否有潜在利空消息，等待企稳信号。',
    hasNews: false,
  },
  {
    id: 'a4',
    stockName: '科大国创',
    stockCode: '300520',
    type: 'volume',
    change: 12.35,
    time: '13:45:08',
    newsCount: 1,
    news: [
      { id: 'an4', title: '科大国创：公司在AI领域持续布局', source: '投资者互动', time: '13:40', summary: '公司在互动平台表示正积极拓展AI应用场景...' },
    ],
    aiInsight: '科大国创成交量突增，股价涨停。AI概念持续活跃，但追高需谨慎，建议关注封单量变化。',
    hasNews: true,
  },
  {
    id: 'a5',
    stockName: '贵州茅台',
    stockCode: '600519',
    type: 'fund',
    change: -2.15,
    time: '13:30:55',
    newsCount: 2,
    news: [
      { id: 'an5', title: '白酒板块集体调整，贵州茅台跌破1700元', source: '证券日报', time: '13:25', summary: '受消费数据低于预期影响，白酒板块今日整体走弱...' },
    ],
    aiInsight: '贵州茅台等白酒龙头集体调整，或与消费数据低于预期有关。外资近期持续流出白酒板块，建议谨慎观望。',
    hasNews: true,
  },
  {
    id: 'a6',
    stockName: '光启技术',
    stockCode: '002625',
    type: 'price',
    change: 9.86,
    time: '11:22:33',
    newsCount: 1,
    news: [
      { id: 'an6', title: '光启技术：超材料产品订单饱满', source: '全景网', time: '11:15', summary: '公司在业绩说明会表示目前在手订单充足...' },
    ],
    aiInsight: '光启技术涨停，超材料概念受市场关注。公司表示订单饱满，基本面支撑较强，但追板需注意风险。',
    hasNews: true,
  },
  {
    id: 'a7',
    stockName: 'st大集',
    stockCode: '000564',
    type: 'price',
    change: -4.89,
    time: '10:58:17',
    newsCount: 0,
    news: [],
    aiInsight: 'ST大集继续调整，暂无新增利空公告。ST股流动性较差，建议规避。',
    hasNews: false,
  },
  {
    id: 'a8',
    stockName: '北方华创',
    stockCode: '002371',
    type: 'fund',
    change: 4.23,
    time: '10:35:44',
    newsCount: 1,
    news: [
      { id: 'an7', title: '半导体设备龙头获机构密集调研', source: '调研数据显示', time: '10:30', summary: '北方华创近一个月获机构调研次数位居前列...' },
    ],
    aiInsight: '北方华创作为半导体设备龙头，持续获得机构关注。国产替代逻辑持续，建议逢低布局。',
    hasNews: true,
  },
];

export const mockReviewReport: ReviewReport = {
  date: '2024-07-15',
  indices: [
    { name: '上证指数', value: 3234.56, change: 1.24 },
    { name: '深证成指', value: 11058.32, change: -0.52 },
    { name: '创业板指', value: 2218.45, change: 2.35 },
  ],
  hotSectors: [
    {
      name: 'AI芯片',
      change: 5.2,
      driver: '英伟达业绩超预期带动，算力需求爆发',
      leaders: ['寒武纪', '中芯国际', '海光信息'],
    },
    {
      name: '新能源汽车',
      change: 3.1,
      driver: '购置税减免政策延续至2027年',
      leaders: ['宁德时代', '比亚迪', '恩捷股份'],
    },
    {
      name: '低空经济',
      change: 4.8,
      driver: '工信部发布产业发展指导意见',
      leaders: ['莱斯信息', '太极股份', '四川九洲'],
    },
  ],
  outlook: {
    opportunities: [
      'AI算力产业链仍是中长期主线，关注算力基础设施',
      '政策持续加码的新能源汽车板块估值有望修复',
      '低空经济万亿市场蓝海打开，适度关注产业链龙头',
    ],
    risks: [
      '白酒板块受消费数据低于预期影响，短期承压',
      '部分高位AI概念股注意回调风险',
      '注意中报业绩地雷，避开业绩低于预期个股',
    ],
  },
  portfolio: [
    {
      stockName: '宁德时代',
      stockCode: '300750',
      change: 4.56,
      comment: '今日表现强势，政策利好持续催化，新能源龙头地位稳固，建议继续持有。',
    },
    {
      stockName: '中芯国际',
      stockCode: '688981',
      change: 5.82,
      comment: 'AI芯片需求爆发带动，国产替代逻辑强化，估值仍有提升空间。',
    },
    {
      stockName: '贵州茅台',
      stockCode: '600519',
      change: -2.15,
      comment: '白酒板块整体调整，短期受消费数据影响，建议控制仓位。',
    },
  ],
};

export const mockWatchList = [
  { code: '300750', name: '宁德时代', price: 198.52, change: 4.56 },
  { code: '688981', name: '中芯国际', price: 52.36, change: 5.82 },
  { code: '002594', name: '比亚迪', price: 268.45, change: 3.28 },
  { code: '300059', name: '东方财富', price: 18.72, change: 8.52 },
  { code: '002371', name: '北方华创', price: 358.62, change: 4.23 },
];
