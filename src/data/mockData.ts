export type Strategy = 'dividend' | 'growth' | 'balanced';

export interface StockData {
  id: string;
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  scores: {
    total: number;
    yield: number; // 20%
    roe: number; // 15%
    revenueGrowth: number; // 15%
    peRatio: number; // 10%
    cashFlow: number; // 10%
    institutional: number; // 10%
    debtRatio: number; // 5%
    grossMargin: number; // 5%
    marketShare: number; // 5%
    marginUsage: number; // 5%
  };
  metrics: {
    yieldPercent: number;
    roePercent: number;
    revenueGrowthPercent: number;
    peRatio: number;
  };
  history: { date: string; price: number }[];
  strategies: Strategy[];
}

const generateHistory = (basePrice: number, trend: 'up' | 'down' | 'flat') => {
  const history = [];
  let currentPrice = basePrice * (trend === 'up' ? 0.8 : trend === 'down' ? 1.2 : 1);
  for (let i = 30; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const change = currentPrice * (Math.random() * 0.04 - 0.02);
    currentPrice += change;
    if (trend === 'up') currentPrice += currentPrice * 0.005;
    if (trend === 'down') currentPrice -= currentPrice * 0.005;
    history.push({ date: date.toISOString().split('T')[0], price: Number(currentPrice.toFixed(2)) });
  }
  return history;
};

export const mockStocks: StockData[] = [
  {
    id: '2330',
    symbol: '2330',
    name: '台積電',
    price: 850,
    change: 15,
    changePercent: 1.8,
    scores: {
      total: 92,
      yield: 12, roe: 15, revenueGrowth: 14, peRatio: 8, cashFlow: 10,
      institutional: 9, debtRatio: 5, grossMargin: 5, marketShare: 5, marginUsage: 4
    },
    metrics: { yieldPercent: 2.5, roePercent: 28.5, revenueGrowthPercent: 15.2, peRatio: 22.4 },
    history: generateHistory(850, 'up'),
    strategies: ['growth', 'balanced']
  },
  {
    id: '2454',
    symbol: '2454',
    name: '聯發科',
    price: 1150,
    change: -20,
    changePercent: -1.7,
    scores: {
      total: 88,
      yield: 16, roe: 14, revenueGrowth: 12, peRatio: 7, cashFlow: 9,
      institutional: 8, debtRatio: 4, grossMargin: 4, marketShare: 5, marginUsage: 4
    },
    metrics: { yieldPercent: 5.2, roePercent: 22.1, revenueGrowthPercent: 8.5, peRatio: 18.2 },
    history: generateHistory(1150, 'flat'),
    strategies: ['dividend', 'growth', 'balanced']
  },
  {
    id: '2317',
    symbol: '2317',
    name: '鴻海',
    price: 155,
    change: 3.5,
    changePercent: 2.3,
    scores: {
      total: 85,
      yield: 15, roe: 10, revenueGrowth: 11, peRatio: 9, cashFlow: 8,
      institutional: 9, debtRatio: 3, grossMargin: 2, marketShare: 5, marginUsage: 4
    },
    metrics: { yieldPercent: 4.8, roePercent: 10.5, revenueGrowthPercent: 5.2, peRatio: 14.5 },
    history: generateHistory(155, 'up'),
    strategies: ['dividend', 'balanced']
  },
  {
    id: '2881',
    symbol: '2881',
    name: '富邦金',
    price: 72.5,
    change: 0.5,
    changePercent: 0.7,
    scores: {
      total: 82,
      yield: 18, roe: 11, revenueGrowth: 8, peRatio: 9, cashFlow: 7,
      institutional: 8, debtRatio: 2, grossMargin: 4, marketShare: 4, marginUsage: 5
    },
    metrics: { yieldPercent: 5.5, roePercent: 12.4, revenueGrowthPercent: 4.1, peRatio: 11.2 },
    history: generateHistory(72.5, 'up'),
    strategies: ['dividend']
  },
  {
    id: '2382',
    symbol: '2382',
    name: '廣達',
    price: 285,
    change: 12,
    changePercent: 4.4,
    scores: {
      total: 89,
      yield: 10, roe: 14, revenueGrowth: 15, peRatio: 6, cashFlow: 9,
      institutional: 10, debtRatio: 4, grossMargin: 3, marketShare: 4, marginUsage: 3
    },
    metrics: { yieldPercent: 3.1, roePercent: 25.2, revenueGrowthPercent: 35.4, peRatio: 24.5 },
    history: generateHistory(285, 'up'),
    strategies: ['growth']
  },
  {
    id: '0056',
    symbol: '0056',
    name: '元大高股息',
    price: 38.4,
    change: -0.2,
    changePercent: -0.5,
    scores: {
      total: 86,
      yield: 20, roe: 8, revenueGrowth: 5, peRatio: 8, cashFlow: 10,
      institutional: 7, debtRatio: 5, grossMargin: 5, marketShare: 5, marginUsage: 5
    },
    metrics: { yieldPercent: 7.2, roePercent: 0, revenueGrowthPercent: 0, peRatio: 0 },
    history: generateHistory(38.4, 'flat'),
    strategies: ['dividend']
  },
  {
    id: '00878',
    symbol: '00878',
    name: '國泰永續高股息',
    price: 22.8,
    change: 0.1,
    changePercent: 0.4,
    scores: {
      total: 87,
      yield: 19, roe: 8, revenueGrowth: 6, peRatio: 8, cashFlow: 10,
      institutional: 8, debtRatio: 5, grossMargin: 5, marketShare: 5, marginUsage: 5
    },
    metrics: { yieldPercent: 6.8, roePercent: 0, revenueGrowthPercent: 0, peRatio: 0 },
    history: generateHistory(22.8, 'up'),
    strategies: ['dividend']
  },
  {
    id: '3231',
    symbol: '3231',
    name: '緯創',
    price: 115,
    change: -1.5,
    changePercent: -1.3,
    scores: {
      total: 81,
      yield: 8, roe: 12, revenueGrowth: 14, peRatio: 7, cashFlow: 8,
      institutional: 7, debtRatio: 3, grossMargin: 3, marketShare: 4, marginUsage: 3
    },
    metrics: { yieldPercent: 2.2, roePercent: 18.5, revenueGrowthPercent: 22.1, peRatio: 20.5 },
    history: generateHistory(115, 'flat'),
    strategies: ['growth']
  },
  {
    id: '2412',
    symbol: '2412',
    name: '中華電',
    price: 125,
    change: 0,
    changePercent: 0,
    scores: {
      total: 84,
      yield: 16, roe: 10, revenueGrowth: 5, peRatio: 8, cashFlow: 10,
      institutional: 6, debtRatio: 5, grossMargin: 5, marketShare: 5, marginUsage: 5
    },
    metrics: { yieldPercent: 4.2, roePercent: 9.8, revenueGrowthPercent: 2.1, peRatio: 25.2 },
    history: generateHistory(125, 'flat'),
    strategies: ['dividend', 'balanced']
  },
  {
    id: '2308',
    symbol: '2308',
    name: '台達電',
    price: 345,
    change: 8,
    changePercent: 2.4,
    scores: {
      total: 90,
      yield: 12, roe: 13, revenueGrowth: 12, peRatio: 8, cashFlow: 9,
      institutional: 9, debtRatio: 4, grossMargin: 5, marketShare: 5, marginUsage: 4
    },
    metrics: { yieldPercent: 3.5, roePercent: 18.2, revenueGrowthPercent: 10.5, peRatio: 21.8 },
    history: generateHistory(345, 'up'),
    strategies: ['growth', 'balanced']
  }
];

export const getTop10 = (strategy: Strategy) => {
  return [...mockStocks]
    .filter(s => s.strategies.includes(strategy))
    .sort((a, b) => b.scores.total - a.scores.total)
    .slice(0, 10);
};
