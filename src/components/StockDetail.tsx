import { useEffect, useState } from "react";
import { StockData } from "@/src/data/mockData";
import { generateStockAnalysis } from "@/src/services/ai";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Badge } from "./ui/badge";
import { LineChart, Line, ResponsiveContainer, YAxis, XAxis, Tooltip } from "recharts";
import { Brain, AlertTriangle, TrendingUp, TrendingDown, Activity, ExternalLink } from "lucide-react";

interface StockDetailProps {
  stock: StockData | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface Analysis {
  reason: string;
  risk: string;
  trend: string;
}

export function StockDetail({ stock, open, onOpenChange }: StockDetailProps) {
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (stock && open) {
      setLoading(true);
      generateStockAnalysis(stock).then(res => {
        if (res) setAnalysis(res);
        setLoading(false);
      });
    } else {
      setAnalysis(null);
    }
  }, [stock, open]);

  if (!stock) return null;

  const isUp = stock.change >= 0;
  const colorClass = isUp ? "text-[#ff333a]" : "text-[#00c853]";
  const strokeColor = isUp ? "#ff333a" : "#00c853";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-zinc-950 border-zinc-800 text-zinc-100">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl font-bold">{stock.name}</span>
              <span className="text-xl text-zinc-400 font-mono">{stock.symbol}</span>
            </div>
            <div className="flex items-center gap-4 mr-8">
              <div className="text-right">
                <div className="text-2xl font-mono">{stock.price}</div>
                <div className={`text-sm font-mono flex items-center justify-end ${colorClass}`}>
                  {isUp ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
                  {isUp ? "+" : ""}{stock.change} ({isUp ? "+" : ""}{stock.changePercent}%)
                </div>
              </div>
              <div className="w-16 h-16 rounded-full border-4 border-primary flex items-center justify-center">
                <span className="text-xl font-bold font-mono">{stock.scores.total}</span>
              </div>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          {/* Left Column: Chart & Fundamentals */}
          <div className="space-y-6">
            <div className="h-48 w-full bg-zinc-900 rounded-xl p-4 border border-zinc-800">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stock.history}>
                  <XAxis dataKey="date" hide />
                  <YAxis domain={['auto', 'auto']} hide />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '8px' }}
                    itemStyle={{ color: '#fafafa' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="price" 
                    stroke={strokeColor} 
                    strokeWidth={2} 
                    dot={false} 
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-zinc-900 p-4 rounded-xl border border-zinc-800">
                <div className="text-sm text-zinc-400 mb-1">殖利率</div>
                <div className="text-xl font-mono font-semibold">{stock.metrics.yieldPercent}%</div>
              </div>
              <div className="bg-zinc-900 p-4 rounded-xl border border-zinc-800">
                <div className="text-sm text-zinc-400 mb-1">ROE</div>
                <div className="text-xl font-mono font-semibold">{stock.metrics.roePercent}%</div>
              </div>
              <div className="bg-zinc-900 p-4 rounded-xl border border-zinc-800">
                <div className="text-sm text-zinc-400 mb-1">EPS成長</div>
                <div className="text-xl font-mono font-semibold">{stock.metrics.revenueGrowthPercent}%</div>
              </div>
              <div className="bg-zinc-900 p-4 rounded-xl border border-zinc-800">
                <div className="text-sm text-zinc-400 mb-1">本益比</div>
                <div className="text-xl font-mono font-semibold">{stock.metrics.peRatio}</div>
              </div>
            </div>

            <div className="flex flex-col gap-3 mt-6 pt-6 border-t border-zinc-800">
              <h4 className="text-sm font-medium text-zinc-400">完整數據來源 (外部連結)</h4>
              <div className="flex flex-wrap gap-4">
                <a href={`https://goodinfo.tw/tw/StockDetail.asp?STOCK_ID=${stock.id}`} target="_blank" rel="noreferrer" className="text-sm text-blue-400 hover:text-blue-300 hover:underline flex items-center gap-1 transition-colors">
                  <ExternalLink className="w-4 h-4" /> Goodinfo! 深入分析
                </a>
                <a href={`https://www.cnyes.com/twstock/${stock.id}`} target="_blank" rel="noreferrer" className="text-sm text-blue-400 hover:text-blue-300 hover:underline flex items-center gap-1 transition-colors">
                  <ExternalLink className="w-4 h-4" /> 鉅亨網 即時新聞
                </a>
                <a href={`https://ic.tpex.org.tw/`} target="_blank" rel="noreferrer" className="text-sm text-blue-400 hover:text-blue-300 hover:underline flex items-center gap-1 transition-colors">
                  <ExternalLink className="w-4 h-4" /> 櫃買中心產業價值鏈
                </a>
              </div>
            </div>
          </div>

          {/* Right Column: AI Analysis */}
          <div className="space-y-4">
            <div className="bg-zinc-900/50 p-5 rounded-xl border border-zinc-800/50 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
              <h4 className="flex items-center gap-2 font-semibold text-blue-400 mb-2">
                <Brain className="w-5 h-5" /> AI 投資理由
              </h4>
              {loading ? (
                <div className="animate-pulse flex space-x-4">
                  <div className="flex-1 space-y-2 py-1">
                    <div className="h-2 bg-zinc-700 rounded w-3/4"></div>
                    <div className="h-2 bg-zinc-700 rounded w-5/6"></div>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-zinc-300 leading-relaxed">{analysis?.reason}</p>
              )}
            </div>

            <div className="bg-zinc-900/50 p-5 rounded-xl border border-zinc-800/50 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-yellow-500"></div>
              <h4 className="flex items-center gap-2 font-semibold text-yellow-500 mb-2">
                <AlertTriangle className="w-5 h-5" /> 風險提示
              </h4>
              {loading ? (
                <div className="animate-pulse flex space-x-4">
                  <div className="flex-1 space-y-2 py-1">
                    <div className="h-2 bg-zinc-700 rounded w-3/4"></div>
                    <div className="h-2 bg-zinc-700 rounded w-1/2"></div>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-zinc-300 leading-relaxed">{analysis?.risk}</p>
              )}
            </div>

            <div className="bg-zinc-900/50 p-5 rounded-xl border border-zinc-800/50 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-purple-500"></div>
              <h4 className="flex items-center gap-2 font-semibold text-purple-400 mb-2">
                <Activity className="w-5 h-5" /> 趨勢解讀
              </h4>
              {loading ? (
                <div className="animate-pulse flex space-x-4">
                  <div className="flex-1 space-y-2 py-1">
                    <div className="h-2 bg-zinc-700 rounded w-5/6"></div>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-zinc-300 leading-relaxed">{analysis?.trend}</p>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
