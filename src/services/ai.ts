import { GoogleGenAI } from "@google/genai";
import { StockData } from "@/src/data/mockData";

let aiClient: GoogleGenAI | null = null;

function getAIClient() {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not set");
    }
    aiClient = new GoogleGenAI({ apiKey });
  }
  return aiClient;
}

export async function generateStockAnalysis(stock: StockData) {
  try {
    const ai = getAIClient();
    const prompt = `
    你是一位專業的台股量化分析師。請根據以下股票數據，產生一段簡短的分析報告。
    
    股票：${stock.symbol} ${stock.name}
    最新價格：${stock.price}
    總評分：${stock.scores.total}/100
    殖利率：${stock.metrics.yieldPercent}%
    ROE：${stock.metrics.roePercent}%
    營收成長率：${stock.metrics.revenueGrowthPercent}%
    本益比：${stock.metrics.peRatio}
    
    請提供以下三個段落，每個段落不超過50字：
    1. 投資理由 (基於上述數據的優勢)
    2. 風險提示 (潛在的弱點或市場風險)
    3. 趨勢解讀 (綜合評估與建議區間：買進/觀望/賣出)
    
    請以 JSON 格式回傳，格式如下：
    {
      "reason": "投資理由...",
      "risk": "風險提示...",
      "trend": "趨勢解讀..."
    }
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      }
    });

    const text = response.text;
    if (text) {
      return JSON.parse(text);
    }
  } catch (error) {
    console.error("Failed to generate analysis:", error);
    // Fallback if API fails or no key
    return {
      reason: `該公司ROE達${stock.metrics.roePercent}%，且營收持續成長，屬於高品質標的。`,
      risk: "需注意總體經濟波動及產業庫存調整風險。",
      trend: "綜合評估基本面穩健，建議區間：買進。"
    };
  }
}
