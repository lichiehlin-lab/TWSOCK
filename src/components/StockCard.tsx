import { StockData } from "@/src/data/mockData";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { LineChart, Line, ResponsiveContainer, YAxis } from "recharts";
import { TrendingUp, TrendingDown } from "lucide-react";

interface StockCardProps {
  stock: StockData;
  rank?: number;
  onClick: (stock: StockData) => void;
}

export function StockCard({ stock, rank, onClick }: StockCardProps) {
  const isUp = stock.change >= 0;
  const colorClass = isUp ? "text-[#ff333a]" : "text-[#00c853]";
  const strokeColor = isUp ? "#ff333a" : "#00c853";

  return (
    <Card 
      className="cursor-pointer transition-all hover:bg-accent/50 hover:shadow-md"
      onClick={() => onClick(stock)}
    >
      <CardContent className="p-5 flex flex-col gap-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-bold text-lg">{stock.name}</h3>
            <p className="text-sm text-muted-foreground">{stock.symbol}</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-mono font-bold">{stock.scores.total}</div>
            <div className="text-xs text-muted-foreground uppercase tracking-wider">Score</div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <div className="text-xl font-mono">{stock.price}</div>
            <div className={`text-sm font-mono flex items-center ${colorClass}`}>
              {isUp ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
              {isUp ? "+" : ""}{stock.change} ({isUp ? "+" : ""}{stock.changePercent}%)
            </div>
          </div>
          <div className="h-12 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stock.history}>
                <YAxis domain={['dataMin', 'dataMax']} hide />
                <Line 
                  type="monotone" 
                  dataKey="price" 
                  stroke={strokeColor} 
                  strokeWidth={2} 
                  dot={false} 
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="flex gap-2 mt-2">
          <Badge variant="secondary" className="text-xs">
            殖利率 {stock.metrics.yieldPercent}%
          </Badge>
          <Badge variant="secondary" className="text-xs">
            ROE {stock.metrics.roePercent}%
          </Badge>
          <Badge variant="secondary" className="text-xs">
            本益比 {stock.metrics.peRatio}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}
