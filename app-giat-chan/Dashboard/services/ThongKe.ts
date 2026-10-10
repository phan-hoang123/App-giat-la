const SERVER_IP = "https://backend-giat-chan.onrender.com";

export class ThongKeService {
  // Hàm tải toàn bộ dữ liệu tổng quan cho Màn hình chính
  static async getDashboardStats() {
    try {
      const [resTrans, resOrders] = await Promise.all([
        fetch(`${SERVER_IP}/api/transactions`), 
        fetch(`${SERVER_IP}/api/orders`)
      ]);

      if (!resOrders.ok || !resTrans.ok) throw new Error("Lỗi tải dữ liệu");

      const ordersData = await resOrders.json();
      const transData = await resTrans.json();

      // 1. Săn lùng các đơn "Lấy ngay" chưa trả khách
      const urgentOrders = ordersData
        .filter((o: any) => o.status !== "COMPLETED" && o.items.toLowerCase().includes("lấy ngay"))
        .map((o: any) => ({
          id: o.id,
          name: o.customer_name,
          phone: o.customer_phone,
          // Bóc tách tên món đồ cho gọn
          items: o.items.split('\n')[0].replace(/\[.*?\]\s*/g, '').split(/[-📝]*\s*Ghi chú/)[0].trim(),
          time: new Date(o.created_at).toLocaleTimeString("vi-VN", { hour: '2-digit', minute: '2-digit' })
        }));

      // 2. Lọc dữ liệu ngày hôm nay
      const startOfDay = new Date(new Date().setHours(0, 0, 0, 0)).getTime();
      const todayOrders = ordersData.filter((o: any) => new Date(o.created_at).getTime() >= startOfDay);
      
      const todayRevenue = transData
        .filter((t: any) => t.type === "IN" && new Date(t.created_at).getTime() >= startOfDay)
        .reduce((sum: number, t: any) => sum + t.amount, 0);
      
      // 3. Bóc tách sản lượng hôm nay tự động (Không code cứng tên món nữa)
      let totalItems = 0;
      const itemsMap: { [key: string]: number } = {};
      
      todayOrders.forEach((o: any) => {
        let mainItemsLine = o.items.split('\n')[0].replace(/\[.*?\]\s*/g, '').split(/[-📝]*\s*Ghi chú/)[0].trim();
        mainItemsLine.split('+').forEach((p: string) => {
          const match = p.trim().match(/^(\d+)\s+(.+)$/);
          if (match) {
            const qty = parseInt(match[1]); 
            const itemName = match[2].trim(); 
            totalItems += qty; 
            // Gom tất cả các món vào một danh sách từ điển
            itemsMap[itemName] = (itemsMap[itemName] || 0) + qty;
          }
        });
      });

      // 4. Chuyển đổi từ điển thành mảng và sắp xếp số lượng từ cao xuống thấp
      const sortedItems = Object.keys(itemsMap)
        .map(key => ({ name: key, qty: itemsMap[key] }))
        .sort((a, b) => b.qty - a.qty);

      return {
        urgentStats: { urgentOrders },
        todayStats: { 
          orders: todayOrders.length, 
          revenue: todayRevenue, 
          totalItems, 
          itemsSummary: sortedItems 
        }
      };
    } catch (error) {
      console.error("Lỗi tại ThongKeService:", error);
      return null;
    }
  }
}