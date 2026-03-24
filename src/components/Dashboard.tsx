import { useState, useMemo, useEffect } from "react";
import { StockData, Strategy } from "@/src/data/mockData";
import { StockCard } from "./StockCard";
import { StockDetail } from "./StockDetail";
import { PreferencesDialog } from "./PreferencesDialog";
import { PortfolioDialog } from "./PortfolioDialog";
import { Tabs, TabsList, TabsTrigger } from "./ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { TrendingUp, Activity, PieChart, Info, Settings2, Loader2 } from "lucide-react";
import { Button } from "./ui/button";

export function Dashboard() {
  const [strategy, setStrategy] = useState<Strategy>("balanced");
  const [stocks, setStocks] = useState<StockData[]>([]);
  const [market, setMarket] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedStock, setSelectedStock] = useState<StockData | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isPrefsOpen, setIsPrefsOpen] = useState(false);
  const [isPortfolioOpen, setIsPortfolioOpen] = useState(false);

  useEffect(() => {
    fetch('/api/stocks')
      .then(res => res.json())
      .then(data => {
        setStocks(data.stocks || []);
        setMarket(data.market || null);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch stocks:", err);
        setLoading(false);
      });
  }, []);

  const top30 = useMemo(() => {
    return [...stocks]
      .filter(s => s.strategies.includes(strategy))
      .sort((a, b) => b.scores.total - a.scores.total)
      .slice(0, 30);
  }, [stocks, strategy]);

  const handleStockClick = (stock: StockData) => {
    setSelectedStock(stock);
    setIsDetailOpen(true);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 p-4 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header Section */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
              <Activity className="w-8 h-8 text-blue-500" />
              AI Smart Stock Selector
            </h1>
            <p className="text-zinc-400 mt-1">台股 Top30 智能選股系統 (即時數據)</p>
          </div>
          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              className="border-zinc-800 bg-zinc-900/50 hover:bg-zinc-800"
              onClick={() => setIsPrefsOpen(true)}
            >
              <Settings2 className="w-4 h-4 mr-2" />
              個人化設定
            </Button>
            <Button 
              variant="outline" 
              className="border-zinc-800 bg-zinc-900/50 hover:bg-zinc-800"
              onClick={() => setIsPortfolioOpen(true)}
            >
              <PieChart className="w-4 h-4 mr-2" />
              投資組合建議
            </Button>
          </div>
        </header>

        {/* Market Overview & Strategy Selector */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 bg-zinc-900/50 border-zinc-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-zinc-400" />
                今日市場狀況
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-zinc-400">加權指數</p>
                  <p className={`text-2xl font-mono font-bold ${market?.change >= 0 ? 'text-[#ff333a]' : 'text-[#00c853]'}`}>
                    {market ? market.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '...'}
                  </p>
                  <p className={`text-xs font-mono ${market?.change >= 0 ? 'text-[#ff333a]' : 'text-[#00c853]'}`}>
                    {market ? `${market.change >= 0 ? '+' : ''}${market.change.toFixed(2)} (${market.change >= 0 ? '+' : ''}${market.changePercent.toFixed(2)}%)` : '...'}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-zinc-400">今日最高</p>
                  <p className="text-2xl font-mono font-bold text-[#ff333a]">
                    {market?.dayHigh ? market.dayHigh.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '...'}
                  </p>
                  <p className="text-xs font-mono text-zinc-400">即時數據</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-zinc-400">今日最低</p>
                  <p className="text-2xl font-mono font-bold text-[#00c853]">
                    {market?.dayLow ? market.dayLow.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '...'}
                  </p>
                  <p className="text-xs font-mono text-zinc-400">即時數據</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-zinc-400">52週最高</p>
                  <p className="text-2xl font-mono font-bold text-zinc-100">
                    {market?.fiftyTwoWeekHigh ? market.fiftyTwoWeekHigh.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '...'}
                  </p>
                  <p className="text-xs font-mono text-zinc-400">即時數據</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900/50 border-zinc-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Info className="w-5 h-5 text-zinc-400" />
                策略模式
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="balanced" onValueChange={(v) => setStrategy(v as Strategy)} className="w-full">
                <TabsList className="grid w-full grid-cols-3 bg-zinc-950 border border-zinc-800">
                  <TabsTrigger value="dividend" className="data-[state=active]:bg-zinc-800">高股息</TabsTrigger>
                  <TabsTrigger value="growth" className="data-[state=active]:bg-zinc-800">成長股</TabsTrigger>
                  <TabsTrigger value="balanced" className="data-[state=active]:bg-zinc-800">平衡</TabsTrigger>
                </TabsList>
                <div className="mt-4 text-sm text-zinc-400">
                  {strategy === 'dividend' && "💰 殖利率優先，適合追求穩定現金流的投資人。"}
                  {strategy === 'growth' && "🚀 EPS成長優先，適合追求資本利得的投資人。"}
                  {strategy === 'balanced' && "⚖️ 綜合評分，兼顧殖利率與成長性，風險適中。"}
                </div>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Top 30 List */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold tracking-tight">Top 30 推薦名單</h2>
            <span className="text-sm text-zinc-400">更新時間：即時 (Yahoo Finance)</span>
          </div>
          
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-zinc-400">
              <Loader2 className="w-8 h-8 animate-spin mb-4 text-blue-500" />
              <p>正在從市場取得最新報價與基本面數據...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {top30.map((stock, index) => (
                <div key={stock.id} className="relative">
                  <div className="absolute -top-3 -left-3 w-8 h-8 bg-zinc-800 rounded-full flex items-center justify-center font-bold font-mono text-sm z-10 border-2 border-zinc-950 shadow-lg">
                    {index + 1}
                  </div>
                  <StockCard stock={stock} onClick={handleStockClick} />
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      <StockDetail 
        stock={selectedStock} 
        open={isDetailOpen} 
        onOpenChange={setIsDetailOpen} 
      />
      
      <PreferencesDialog 
        open={isPrefsOpen} 
        onOpenChange={setIsPrefsOpen} 
      />
      
      <PortfolioDialog 
        open={isPortfolioOpen} 
        onOpenChange={setIsPortfolioOpen} 
      />
    </div>
  );
}
