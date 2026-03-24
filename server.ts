import express from "express";
import path from "path";
import YahooFinance from "yahoo-finance2";
import { mockStocks } from "./src/data/mockData";

const yahooFinance = new YahooFinance();

async function fetchRealTimeTWSE(symbols: string[]) {
  const querySymbols = symbols.map(s => `tse_${s.split('.')[0]}.tw`).join('|');
  const url = `https://mis.twse.com.tw/stock/api/getStockInfo.jsp?ex_ch=tse_t00.tw|${querySymbols}&json=1&delay=0`;
  
  try {
    // Use a 3-second timeout so we don't exhaust Vercel's 10s function limit
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);
    
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);
    
    const data = await res.json();
    const realTimeData = new Map();
    
    if (data.msgArray) {
      data.msgArray.forEach((item: any) => {
        let price = parseFloat(item.z);
        if (isNaN(price)) price = parseFloat(item.pz);
        if (isNaN(price)) {
          const bestBid = item.b ? parseFloat(item.b.split('_')[0]) : NaN;
          const bestAsk = item.a ? parseFloat(item.a.split('_')[0]) : NaN;
          if (!isNaN(bestBid) && !isNaN(bestAsk)) price = (bestBid + bestAsk) / 2;
          else if (!isNaN(bestBid)) price = bestBid;
          else if (!isNaN(bestAsk)) price = bestAsk;
        }
        if (isNaN(price)) price = parseFloat(item.y);
        
        const y = parseFloat(item.y);
        const change = price - y;
        const changePercent = (change / y) * 100;
        
        const key = item.c === 't00' ? '^TWII' : `${item.c}.TW`;
        realTimeData.set(key, {
          price,
          change,
          changePercent,
          dayHigh: parseFloat(item.h),
          dayLow: parseFloat(item.l)
        });
      });
    }
    return realTimeData;
  } catch (e) {
    console.warn('TWSE API unavailable (likely blocked by cloud provider), falling back to Yahoo Finance data.');
    return new Map();
  }
}

const app = express();

// API routes FIRST
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.get("/api/stocks", async (req, res) => {
    try {
      const symbols = [
        { id: '2330', symbol: '2330.TW', name: '台積電', strategies: ['growth', 'balanced'] },
        { id: '2454', symbol: '2454.TW', name: '聯發科', strategies: ['dividend', 'growth', 'balanced'] },
        { id: '2317', symbol: '2317.TW', name: '鴻海', strategies: ['dividend', 'balanced'] },
        { id: '2881', symbol: '2881.TW', name: '富邦金', strategies: ['dividend'] },
        { id: '2382', symbol: '2382.TW', name: '廣達', strategies: ['growth'] },
        { id: '0056', symbol: '0056.TW', name: '元大高股息', strategies: ['dividend'] },
        { id: '00878', symbol: '00878.TW', name: '國泰永續高股息', strategies: ['dividend'] },
        { id: '3231', symbol: '3231.TW', name: '緯創', strategies: ['growth'] },
        { id: '2412', symbol: '2412.TW', name: '中華電', strategies: ['dividend', 'balanced'] },
        { id: '2308', symbol: '2308.TW', name: '台達電', strategies: ['growth', 'balanced'] },
        { id: '2882', symbol: '2882.TW', name: '國泰金', strategies: ['dividend', 'balanced'] },
        { id: '2891', symbol: '2891.TW', name: '中信金', strategies: ['dividend'] },
        { id: '2002', symbol: '2002.TW', name: '中鋼', strategies: ['dividend'] },
        { id: '1216', symbol: '1216.TW', name: '統一', strategies: ['dividend', 'balanced'] },
        { id: '2303', symbol: '2303.TW', name: '聯電', strategies: ['dividend', 'balanced'] },
        { id: '3711', symbol: '3711.TW', name: '日月光投控', strategies: ['growth', 'balanced'] },
        { id: '2884', symbol: '2884.TW', name: '玉山金', strategies: ['dividend'] },
        { id: '2892', symbol: '2892.TW', name: '第一金', strategies: ['dividend'] },
        { id: '5871', symbol: '5871.TW', name: '中租-KY', strategies: ['growth'] },
        { id: '2395', symbol: '2395.TW', name: '研華', strategies: ['growth', 'balanced'] },
        { id: '2357', symbol: '2357.TW', name: '華碩', strategies: ['dividend', 'growth'] },
        { id: '2379', symbol: '2379.TW', name: '瑞昱', strategies: ['growth', 'balanced'] },
        { id: '3008', symbol: '3008.TW', name: '大立光', strategies: ['growth'] },
        { id: '3034', symbol: '3034.TW', name: '聯詠', strategies: ['dividend', 'growth'] },
        { id: '2324', symbol: '2324.TW', name: '仁寶', strategies: ['dividend'] },
        { id: '2356', symbol: '2356.TW', name: '英業達', strategies: ['dividend', 'balanced'] },
        { id: '2603', symbol: '2603.TW', name: '長榮', strategies: ['dividend', 'growth'] },
        { id: '0050', symbol: '0050.TW', name: '元大台灣50', strategies: ['balanced', 'growth'] },
        { id: '00929', symbol: '00929.TW', name: '復華台灣科技優息', strategies: ['dividend'] },
        { id: '00713', symbol: '00713.TW', name: '元大台灣高息低波', strategies: ['dividend', 'balanced'] }
      ];

      // Fetch real-time data from TWSE first
      const realTimeData = await fetchRealTimeTWSE(symbols.map(s => s.symbol));

      const [marketQuote, ...results] = await Promise.all([
        yahooFinance.quote('^TWII').catch(() => null),
        ...symbols.map(async (s) => {
        try {
          // Fetch historical data
          const chartData = await yahooFinance.chart(s.symbol, {
            period1: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Last 30 days
            interval: '1d'
          }).catch(() => null);

          // Fetch quote for metrics (PE, ROE, etc.)
          const quote = await yahooFinance.quote(s.symbol).catch(() => ({})) as any;

          const history = chartData?.quotes
            .filter(h => h.close !== null && h.close !== undefined)
            .map(h => ({
              date: h.date.toISOString().split('T')[0],
              price: h.close
            })) || [];

          // Use real-time data if available, otherwise fallback to Yahoo Finance
          const rt = realTimeData.get(s.symbol);
          const price = rt?.price || quote.regularMarketPrice || 0;
          const change = rt?.change || quote.regularMarketChange || 0;
          const changePercent = rt?.changePercent || quote.regularMarketChangePercent || 0;
          
          const peRatio = quote.trailingPE || quote.forwardPE || (s.id.startsWith('00') ? 0 : 15);
          const yieldPercent = quote.dividendYield ? quote.dividendYield : (s.id.startsWith('00') ? 6 : 2);
          
          // Calculate ROE from EPS and Book Value if available
          const roePercent = (quote.epsTrailingTwelveMonths && quote.bookValue) 
            ? (quote.epsTrailingTwelveMonths / quote.bookValue) * 100 
            : (s.id.startsWith('00') ? 0 : 12);
            
          // Calculate EPS Growth from Forward EPS and Trailing EPS if available
          const revenueGrowthPercent = (quote.epsForward && quote.epsTrailingTwelveMonths)
            ? ((quote.epsForward - quote.epsTrailingTwelveMonths) / quote.epsTrailingTwelveMonths) * 100
            : (s.id.startsWith('00') ? 0 : 5);

          // Calculate scores (0-100) based on real data
          const yieldScore = Math.min(20, (yieldPercent / 8) * 20);
          const roeScore = Math.min(15, (roePercent / 20) * 15);
          const revScore = Math.min(15, (revenueGrowthPercent / 20) * 15);
          const peScore = Math.max(0, 10 - (peRatio / 30) * 10);
          
          // Mock remaining scores for completeness (since these require complex scraping from Goodinfo)
          const cashFlow = 8;
          const institutional = 8;
          const debtRatio = 4;
          const grossMargin = 4;
          const marketShare = 4;
          const marginUsage = 4;

          const totalScore = Math.round(yieldScore + roeScore + revScore + peScore + cashFlow + institutional + debtRatio + grossMargin + marketShare + marginUsage);

          return {
            id: s.id,
            symbol: s.id,
            name: s.name,
            price: Number(price.toFixed(2)),
            change: Number(change.toFixed(2)),
            changePercent: Number(changePercent.toFixed(2)),
            scores: {
              total: totalScore,
              yield: Math.round(yieldScore),
              roe: Math.round(roeScore),
              revenueGrowth: Math.round(revScore),
              peRatio: Math.round(peScore),
              cashFlow, institutional, debtRatio, grossMargin, marketShare, marginUsage
            },
            metrics: {
              yieldPercent: Number(yieldPercent.toFixed(2)),
              roePercent: Number(roePercent.toFixed(2)),
              revenueGrowthPercent: Number(revenueGrowthPercent.toFixed(2)),
              peRatio: Number(peRatio.toFixed(2))
            },
            history,
            strategies: s.strategies
          };
        } catch (e: any) {
          console.error(`Error fetching ${s.symbol}:`, e);
          if (e.name === 'InvalidOptionsError') {
            console.error('Validation errors:', e.errors);
          }
          return null;
        }
      })]);

      const rtMarket = realTimeData.get('^TWII');

      const finalMarket = rtMarket ? {
        price: rtMarket.price,
        change: rtMarket.change,
        changePercent: rtMarket.changePercent,
        dayHigh: rtMarket.dayHigh,
        dayLow: rtMarket.dayLow,
        fiftyTwoWeekHigh: marketQuote?.fiftyTwoWeekHigh || rtMarket.price,
        fiftyTwoWeekLow: marketQuote?.fiftyTwoWeekLow || rtMarket.price
      } : (marketQuote ? {
        price: marketQuote.regularMarketPrice,
        change: marketQuote.regularMarketChange,
        changePercent: marketQuote.regularMarketChangePercent,
        dayHigh: marketQuote.regularMarketDayHigh,
        dayLow: marketQuote.regularMarketDayLow,
        fiftyTwoWeekHigh: marketQuote.fiftyTwoWeekHigh,
        fiftyTwoWeekLow: marketQuote.fiftyTwoWeekLow
      } : {
        price: 21500,
        change: 150,
        changePercent: 0.7,
        dayHigh: 21600,
        dayLow: 21400,
        fiftyTwoWeekHigh: 22000,
        fiftyTwoWeekLow: 16000
      });

      res.setHeader('Cache-Control', 'no-store, max-age=0');
      res.json({
        market: finalMarket,
        stocks: results.filter(r => r !== null).length > 0 ? results.filter(r => r !== null) : mockStocks
      });
    } catch (error) {
      console.error("API Error:", error);
      res.json({
        market: {
          price: 21500,
          change: 150,
          changePercent: 0.7,
          dayHigh: 21600,
          dayLow: 21400,
          fiftyTwoWeekHigh: 22000,
          fiftyTwoWeekLow: 16000
        },
        stocks: mockStocks
      });
    }
  });

// Export the app for Vercel serverless functions
export default app;

// Only start the Vite dev server / Express listen if NOT on Vercel
if (!process.env.VERCEL) {
  async function startServer() {
    const PORT = 3000;

    // Vite middleware for development
    if (process.env.NODE_ENV !== "production") {
      const { createServer: createViteServer } = await import("vite");
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: "spa",
      });
      app.use(vite.middlewares);
    } else {
      const distPath = path.join(process.cwd(), 'dist');
      app.use(express.static(distPath));
      app.get('*', (req, res) => {
        res.sendFile(path.join(distPath, 'index.html'));
      });
    }

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  }

  startServer();
}
