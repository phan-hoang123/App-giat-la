const SERVER_IP = "https://backend-giat-chan.onrender.com";

export class KhachHangService {
  /**
   * Hàm gọi API và xử lý gộp nhóm khách hàng
   * Trả về mảng dữ liệu đã được làm sạch và sắp xếp theo tiền chi tiêu
   */
  static async getProcessedCustomers() {
    try {
      const response = await fetch(`${SERVER_IP}/api/orders`);
      if (!response.ok) throw new Error("Lỗi mạng khi tải khách hàng");
      
      const orders = await response.json();
      const customerMap = new Map();

      orders.forEach((o: any) => {
        let rawPhone = o.customer_phone || ""; 
        let cleanPhone = rawPhone.replace(/[\s\-\.]/g, "");
        
        if (cleanPhone.startsWith("+84")) {
          cleanPhone = "0" + cleanPhone.slice(3);
        }

        // Tạo chìa khóa phân biệt (Ưu tiên SĐT, không có SĐT thì lấy Tên)
        let uniqueKey = cleanPhone !== "" ? cleanPhone : `NO_PHONE_${o.customer_name}`;

        if (!customerMap.has(uniqueKey)) {
          customerMap.set(uniqueKey, {
            phone: cleanPhone !== "" ? cleanPhone : "Chưa có SĐT",
            name: o.customer_name,
            totalOrders: 1,
            totalSpent: o.total_amount,
            isAgent: o.items.includes("ĐIỂM THU"),
          });
        } else {
          const c = customerMap.get(uniqueKey);
          c.totalOrders += 1;
          c.totalSpent += o.total_amount;
          if (o.items.includes("ĐIỂM THU")) c.isAgent = true;
        }
      });

      // Sắp xếp giảm dần theo tổng tiền chi tiêu
      return Array.from(customerMap.values()).sort(
        (a: any, b: any) => b.totalSpent - a.totalSpent
      );

    } catch (error) {
      console.error("Lỗi tại KhachHangService:", error);
      return []; // Trả về mảng rỗng để app không bị sập nếu lỗi mạng
    }
  }

  static async getCustomerSuggestions() {
    try {
      const response = await fetch(`${SERVER_IP}/api/orders`);
      if (!response.ok) return { db: new Map(), list: [] };
      
      const orders = await response.json();
      const db = new Map();
      const list: any[] = [];
      const seenNames = new Set();
      
      orders.forEach((o: any) => {
        const cleanPhone = o.customer_phone ? o.customer_phone.replace(/\D/g, "") : "";
        const realAddress = (o.address === "Khách tự mang tới" || o.address === "Đại lý tự mang tới" || o.address === "Khách mang tới" || o.address === "Điểm mang tới") ? "" : o.address || "";
        
        if (cleanPhone && !db.has(cleanPhone)) db.set(cleanPhone, { name: o.customer_name, address: realAddress });
        if (o.customer_name && !seenNames.has(o.customer_name.toLowerCase())) {
          seenNames.add(o.customer_name.toLowerCase());
          list.push({ name: o.customer_name, phone: cleanPhone, address: realAddress });
        }
      });
      
      return { db, list };
    } catch {
      return { db: new Map(), list: [] };
    }
  }
}
