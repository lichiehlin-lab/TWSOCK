import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import YahooFinance from "yahoo-finance2";

const yahooFinance = new YahooFinance();

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

      const [marketQuote, ...results] = await Promise.all([
        yahooFinance.quote('^TWII').catch(() => null),
        ...symbols.map(async (s) => {
        try {
          // Fetch real-time quote and historical data
          const quote = await yahooFinance.quote(s.symbol) as any;
          const chartData = await yahooFinance.chart(s.symbol, {
            period1: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Last 30 days
            interval: '1d'
          });

          const history = chartData.quotes
            .filter(h => h.close !== null && h.close !== undefined)
            .map(h => ({
              date: h.date.toISOString().split('T')[0],
              price: h.close
            }));

          // Parse metrics (fallback to sensible defaults if missing, e.g., for ETFs)
          const price = quote.regularMarketPrice || 0;
          const change = quote.regularMarketChange || 0;
          const changePercent = quote.regularMarketChangePercent || 0;
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

      res.setHeader('Cache-Control', 'no-store, max-age=0');
      res.json({
        market: marketQuote ? {
          price: marketQuote.regularMarketPrice,
          change: marketQuote.regularMarketChange,
          changePercent: marketQuote.regularMarketChangePercent,
          dayHigh: marketQuote.regularMarketDayHigh,
          dayLow: marketQuote.regularMarketDayLow,
          fiftyTwoWeekHigh: marketQuote.fiftyTwoWeekHigh,
          fiftyTwoWeekLow: marketQuote.fiftyTwoWeekLow
        } : null,
        stocks: results.filter(r => r !== null)
      });
    } catch (error) {
      console.error("API Error:", error);
      res.status(500).json({ error: "Failed to fetch stock data" });
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
