import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { PieChart as PieChartIcon } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

interface PortfolioDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const data = [
  { name: '高股息 (穩定現金流)', value: 40, color: '#3b82f6' },
  { name: '成長股 (資本利得)', value: 40, color: '#8b5cf6' },
  { name: '防禦股 (低波動)', value: 20, color: '#10b981' },
];

export function PortfolioDialog({ open, onOpenChange }: PortfolioDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-zinc-950 border-zinc-800 text-zinc-100">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <PieChartIcon className="w-5 h-5 text-purple-500" />
            投資組合建議
          </DialogTitle>
        </DialogHeader>
        
        <div className="py-6">
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="rgba(0,0,0,0)" />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '8px' }}
                  itemStyle={{ color: '#fafafa' }}
                  formatter={(value: number) => [`${value}%`, '配置比例']}
                />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-6 space-y-4">
            <h4 className="text-sm font-medium text-zinc-400">系統建議說明</h4>
            <div className="space-y-3">
              <div className="bg-zinc-900/50 p-3 rounded-lg border border-zinc-800/50">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  <span className="font-medium text-sm">高股息 (40%)</span>
                </div>
                <p className="text-xs text-zinc-400 pl-5">配置如 0056, 00878 等標的，提供每月穩定的現金流基礎。</p>
              </div>
              <div className="bg-zinc-900/50 p-3 rounded-lg border border-zinc-800/50">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                  <span className="font-medium text-sm">成長股 (40%)</span>
                </div>
                <p className="text-xs text-zinc-400 pl-5">配置如 台積電, 廣達 等AI概念股，追求長期資本利得最大化。</p>
              </div>
              <div className="bg-zinc-900/50 p-3 rounded-lg border border-zinc-800/50">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                  <span className="font-medium text-sm">防禦股 (20%)</span>
                </div>
                <p className="text-xs text-zinc-400 pl-5">配置如 中華電, 富邦金 等低Beta值標的，降低整體投資組合波動。</p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
