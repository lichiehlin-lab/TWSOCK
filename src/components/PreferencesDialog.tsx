import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Slider } from "./ui/slider";
import { Settings2 } from "lucide-react";

interface PreferencesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PreferencesDialog({ open, onOpenChange }: PreferencesDialogProps) {
  const [amount, setAmount] = useState(100);
  const [risk, setRisk] = useState("medium");
  const [cashflow, setCashflow] = useState(10000);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-zinc-950 border-zinc-800 text-zinc-100">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings2 className="w-5 h-5 text-blue-500" />
            個人化投資設定
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium text-zinc-300">投資金額 (萬元)</label>
              <span className="text-sm font-mono text-blue-400">{amount} 萬</span>
            </div>
            <Slider
              value={[amount]}
              onValueChange={(v) => setAmount(v[0])}
              max={1000}
              step={10}
              className="[&_[role=slider]]:bg-blue-500"
            />
          </div>

          <div className="space-y-4">
            <label className="text-sm font-medium text-zinc-300">風險偏好</label>
            <div className="grid grid-cols-3 gap-2">
              <Button 
                variant={risk === "low" ? "default" : "outline"} 
                className={risk === "low" ? "bg-blue-600 hover:bg-blue-700" : "border-zinc-800 bg-zinc-900"}
                onClick={() => setRisk("low")}
              >
                低 (防禦)
              </Button>
              <Button 
                variant={risk === "medium" ? "default" : "outline"} 
                className={risk === "medium" ? "bg-blue-600 hover:bg-blue-700" : "border-zinc-800 bg-zinc-900"}
                onClick={() => setRisk("medium")}
              >
                中 (平衡)
              </Button>
              <Button 
                variant={risk === "high" ? "default" : "outline"} 
                className={risk === "high" ? "bg-blue-600 hover:bg-blue-700" : "border-zinc-800 bg-zinc-900"}
                onClick={() => setRisk("high")}
              >
                高 (成長)
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium text-zinc-300">現金流需求 (每月目標)</label>
              <span className="text-sm font-mono text-blue-400">{cashflow.toLocaleString()} 元</span>
            </div>
            <Slider
              value={[cashflow]}
              onValueChange={(v) => setCashflow(v[0])}
              max={100000}
              step={1000}
              className="[&_[role=slider]]:bg-blue-500"
            />
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="border-zinc-800 bg-zinc-900">
            取消
          </Button>
          <Button onClick={() => onOpenChange(false)} className="bg-blue-600 hover:bg-blue-700 text-white">
            儲存設定
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
