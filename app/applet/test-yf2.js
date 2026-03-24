import YahooFinance from "yahoo-finance2";
try {
  const yf = new YahooFinance();
  console.log("success");
} catch (e) {
  console.log("error:", e.message);
}
