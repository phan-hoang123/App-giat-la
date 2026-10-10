const SERVER_IP = "https://backend-giat-chan.onrender.com";

export class DonHangService {
  // 1. Lấy bảng giá
  static async getPrices() {
    try {
      const res = await fetch(`${SERVER_IP}/api/prices`);
      return res.ok ? await res.json() : [];
    } catch { return []; }
  }

  // 2. Tạo đơn hàng mới
  static async createOrder(payload: any) {
    try {
      const res = await fetch(`${SERVER_IP}/api/orders`, {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload)
      });
      return res.ok;
    } catch { throw new Error("Lỗi mạng"); }
  }

  // 3. Lấy tất cả đơn hàng (Dành cho Kho Chăn)
  static async getAllOrders() {
    try {
      const res = await fetch(`${SERVER_IP}/api/orders`);
      return res.ok ? await res.json() : [];
    } catch { return []; }
  }

  // 4. Cập nhật trạng thái đơn hàng (Khi trả hàng)
  static async markOrdersAsCompleted(orderIds: number[]) {
    try {
      await Promise.all(
        orderIds.map((id) =>
          fetch(`${SERVER_IP}/api/orders/${id}/status`, {
            method: "PUT", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ newStatus: "COMPLETED" }),
          })
        )
      );
      return true;
    } catch { throw new Error("Lỗi cập nhật trạng thái"); }
  }

  // 5. Thống kê sản lượng theo ngày (Cắt từ màn LichSuDonHang sang)
  static async getHistoryStats() {
    const orders = await this.getAllOrders();
    const statsByDate: { [key: string]: any } = {};

    orders.forEach((o: any) => {
      const d = new Date(o.created_at);
      const dateStr = d.toLocaleDateString("vi-VN");
      
      if (!statsByDate[dateStr]) {
        statsByDate[dateStr] = { date: d, orders: 0, items: {}, total: 0 };
      }
      statsByDate[dateStr].orders += 1;

      // Logic bóc tách chuỗi mặt hàng để đếm số lượng
      let mainItemsLine = o.items.split('\n')[0].replace(/\[.*?\]\s*/g, '');
      mainItemsLine = mainItemsLine.split(/[-📝]*\s*Ghi chú/)[0].trim();
      
      mainItemsLine.split('+').forEach((p: string) => {
        const match = p.trim().match(/^(\d+)\s+(.+)$/);
        if (match) {
          const qty = parseInt(match[1]);
          const itemName = match[2].trim();
          statsByDate[dateStr].total += qty;
          statsByDate[dateStr].items[itemName] = (statsByDate[dateStr].items[itemName] || 0) + qty;
        }
      });
    });

    // Trả về mảng đã sắp xếp ngày mới nhất lên đầu
    return Object.keys(statsByDate)
      .map(k => ({ dateStr: k, ...statsByDate[k] }))
      .sort((a, b) => b.date.getTime() - a.date.getTime());
  }

  // Cắt từ dòng 102 đến 172 của KhoChan_3.tsx dán sang đây, sửa lại thành hàm tĩnh
  static processOrdersForKho(orders: any[], statusTab: string, dateFilter: string, searchQuery: string) {
    // 1. Lọc đơn hàng
    const filteredOrders = orders.filter((o) => {
      const query = searchQuery.toLowerCase().trim();

      // NẾU CÓ TÌM KIẾM: Bỏ qua lọc trạng thái để tìm trên toàn kho, chỉ lọc theo từ khóa
      if (query !== "") {
        const nameLower = (o.customer_name || "").toLowerCase();

        // Thuật toán 1: Tiền tố
        const matchPrefix = nameLower.startsWith(query) || nameLower.includes(` ${query}`);

        // Thuật toán 2: Chữ cái đầu (Viết tắt)
        const initials = nameLower
          .split(" ")
          .filter((word: string) => word.length > 0)
          .map((word: string) => word.charAt(0))
          .join("");
        const matchInitials = initials.includes(query.replace(/\s/g, ""));

        // Thuật toán 3: SĐT an toàn
        const safePhone = (o.customer_phone && o.customer_phone !== "Chưa có SĐT") 
          ? o.customer_phone.toLowerCase() : "";
        const matchPhone = safePhone.startsWith(query);

        // Nếu không khớp cái nào thì loại đơn này đi
        if (!matchPrefix && !matchInitials && !matchPhone) return false;
      } 
      // NẾU KHÔNG TÌM KIẾM: Lọc theo Tab Trạng Thái bình thường
      else {
        if (statusTab === "NEED_PICKUP" && o.status === "COMPLETED") return false;
        if (statusTab === "COMPLETED" && o.status !== "COMPLETED") return false;
      }

      // Lọc theo Ngày tháng (Luôn áp dụng)
      if (dateFilter !== "ALL") {
        const orderTime = new Date(o.created_at).getTime();
        const now = new Date();
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
        if (dateFilter === "TODAY" && orderTime < startOfToday) return false;
        
        const dWeek = new Date(now);
        const startOfWeek = new Date(dWeek.setDate(dWeek.getDate() - dWeek.getDay() + (dWeek.getDay() === 0 ? -6 : 1))).setHours(0, 0, 0, 0);
        if (dateFilter === "WEEK" && orderTime < startOfWeek) return false;
      }
      
      return true; // Giữ lại đơn thỏa mãn
    });

    // 2. Gộp đơn hàng cùng nhóm
    const groupedMap = new Map();
    filteredOrders.forEach((o) => {
      const dateStr = new Date(o.created_at).toLocaleDateString("vi-VN");
      let uniqueKey = `${o.status}_${o.customer_phone ? o.customer_phone.replace(/\D/g, "") : o.customer_name}_${dateStr}`;

      if (!groupedMap.has(uniqueKey)) {
        groupedMap.set(uniqueKey, { ...o, originalIds: [o.id], itemsArr: [o.items] });
      } else {
        let existing = groupedMap.get(uniqueKey);
        existing.total_amount += o.total_amount;
        existing.originalIds.push(o.id);
        existing.itemsArr.push(o.items);
        if (new Date(o.created_at).getTime() < new Date(existing.created_at).getTime()) {
          existing.created_at = o.created_at;
        }
      }
    });

    // 3. Sắp xếp đơn ưu tiên
    return Array.from(groupedMap.values()).sort((a, b) => {
      const aText = a.itemsArr.join(" ").toLowerCase();
      const bText = b.itemsArr.join(" ").toLowerCase();
      if (aText.includes("lấy ngay") && !bText.includes("lấy ngay")) return -1;
      if (!aText.includes("lấy ngay") && bText.includes("lấy ngay")) return 1;
      if (aText.includes("cuối năm") && !bText.includes("cuối năm")) return 1;
      if (!aText.includes("cuối năm") && bText.includes("cuối năm")) return -1;

      if (statusTab === "NEED_PICKUP") return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  }

  // Hàm chuyên bóc tách chuỗi văn bản của từng đơn hàng
  static parseOrderItems(itemsArr: string[]) {
    const isAgent = itemsArr[0].includes("[ĐIỂM THU]");
    const aggregatedItems: { [key: string]: number } = {};
    let finalNotes = new Set<string>();
    let isUrgent = false;

    itemsArr.forEach((rawItem: string) => {
      const cleanText = rawItem.replace(/\[ĐIỂM THU\] /g, "").replace(/\[KHÁCH LẺ\] /g, "").trim();
      const parts = cleanText.split(/[-📝\n]*\s*Ghi chú(?: chung)?:\s*/);
      const summaryStr = parts[0].trim();
      const noteStr = parts[1] ? parts[1].trim() : "";

      if (noteStr) {
        noteStr.split(",").forEach((n: string) => {
          const cleanNote = n.trim();
          if (cleanNote) {
            finalNotes.add(cleanNote);
            if (cleanNote.toLowerCase().includes("lấy ngay")) isUrgent = true;
          }
        });
      }

      const firstLine = summaryStr.split("\n")[0].trim();
      firstLine.split("+").forEach((part: string) => {
        const match = part.trim().match(/^(\d+)\s+(.+)$/);
        if (match) {
          const itemName = match[2].trim();
          aggregatedItems[itemName] = (aggregatedItems[itemName] || 0) + parseInt(match[1], 10);
        } else if (part.trim() && !part.includes("Chi tiết lô:")) {
          aggregatedItems[part.trim()] = (aggregatedItems[part.trim()] || 0) + 1;
        }
      });
    });

    const itemArr = Object.keys(aggregatedItems).map((k) => `${aggregatedItems[k]} ${k}`);
    const combinedNotesText = Array.from(finalNotes).join(", ");

    return { isAgent, itemArr, combinedNotesText, isUrgent };
  }

  static async getOrders(): Promise<any[]> {
    try {
      // Gọi API GET đến endpoint /api/orders (Sếp nhớ check lại xem backend có route này chưa nhé)
      const response = await fetch(`${SERVER_IP}/api/orders`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          // 'Authorization': `Bearer ${await AsyncStorage.getItem('user_token')}` // Mở dòng này ra nếu backend sếp có chặn token
        }
      });

      if (!response.ok) {
        throw new Error('Lỗi khi lấy dữ liệu đơn hàng từ server');
      }

      const data = await response.json();
      
      // Đảm bảo dữ liệu trả về luôn là một mảng
      return Array.isArray(data) ? data : (data.data || []);
      
    } catch (error) {
      console.error("DonHangService.getOrders Lỗi:", error);
      return []; // Trả về mảng rỗng để App không bị crash nếu mạng lỗi
    }
  }
}