const SERVER_IP = "https://backend-giat-chan.onrender.com";

export class TaiChinhService {
  // 1. Tải danh sách toàn bộ giao dịch (Cho màn Thu Chi)
  static async getAllTransactions() {
    try {
      const res = await fetch(`${SERVER_IP}/api/transactions`);
      return res.ok ? await res.json() : [];
    } catch { return []; }
  }

  // 2. Tạo phiếu Thu / Chi mới
  static async createTransaction(type: "IN" | "OUT", amount: number, description: string) {
    try {
      const res = await fetch(`${SERVER_IP}/api/transactions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          trans_code: (type === "IN" ? "THU-" : "CHI-") + Date.now().toString().slice(-4),
          type,
          amount,
          description,
        }),
      });
      return res.ok;
    } catch { throw new Error("Lỗi tạo phiếu"); }
  }

  // 3. Tải data gốc cho màn Báo Cáo
  static async getRawReportData() {
    try {
      const [resTrans, resOrders] = await Promise.all([
        fetch(`${SERVER_IP}/api/transactions`),
        fetch(`${SERVER_IP}/api/orders`),
      ]);
      if (!resTrans.ok || !resOrders.ok) return { transactions: [], orders: [] };
      return { transactions: await resTrans.json(), orders: await resOrders.json() };
    } catch { return { transactions: [], orders: [] }; }
  }

  // 4. Máy tính toán số liệu Báo Cáo Doanh Thu
  static calculateReport(transactions: any[], orders: any[], timeRange: "DAY" | "WEEK" | "MONTH") {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const dWeek = new Date(now);
    const day = dWeek.getDay();
    const diff = dWeek.getDate() - day + (day === 0 ? -6 : 1);
    const startOfWeek = new Date(dWeek.setDate(diff)).setHours(0, 0, 0, 0);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();

    let startTime = startOfWeek;
    if (timeRange === "DAY") startTime = startOfDay;
    if (timeRange === "MONTH") startTime = startOfMonth;

    const filteredTrans = transactions.filter((t) => new Date(t.created_at).getTime() >= startTime);
    const filteredOrders = orders.filter((o) => new Date(o.created_at).getTime() >= startTime);

    const revenue = filteredTrans.filter((t) => t.type === "IN").reduce((sum, t) => sum + t.amount, 0);
    const expense = filteredTrans.filter((t) => t.type === "OUT").reduce((sum, t) => sum + t.amount, 0);
    const profit = revenue - expense;

    const chartData = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(startOfDay);
      d.setDate(d.getDate() - i);
      const dayRev = transactions
        .filter((t) => t.type === "IN" && new Date(t.created_at).getTime() >= d.getTime() && new Date(t.created_at).getTime() < d.getTime() + 86400000)
        .reduce((sum, t) => sum + t.amount, 0);
      chartData.push({ day: ["CN", "T2", "T3", "T4", "T5", "T6", "T7"][d.getDay()], value: dayRev });
    }
    const maxChartValue = Math.max(...chartData.map((d) => d.value), 100000);

    return { orderCount: filteredOrders.length, revenue, expense, profit, chartData, maxChartValue };
  }
}