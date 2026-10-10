import AsyncStorage from '@react-native-async-storage/async-storage';

const SERVER_IP = "https://backend-giat-chan.onrender.com";

export class HeThongService {
  // 1. Cập nhật Bảng giá mới lên Đám mây
  static async updatePrices(prices: any[]) {
    try {
      const res = await fetch(`${SERVER_IP}/api/prices`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prices }), 
      });
      return res.ok;
    } catch {
      return false;
    }
  }

  // 2. Dọn dẹp bộ nhớ đệm (Cache) của ứng dụng
  static async clearSystemCache() {
    try {
      await AsyncStorage.clear();
      return true;
    } catch {
      return false;
    }
  }

  // 3. Đọc thông tin Tài khoản đang đăng nhập
  static async getUserProfile() {
    try {
      const phone = await AsyncStorage.getItem("user_phone");
      const name = await AsyncStorage.getItem("user_name");
      const role = await AsyncStorage.getItem("user_role");
      
      return {
        name: name || "Chưa cập nhật",
        phone: phone || "Chưa cập nhật",
        role: role || "admin",
      };
    } catch (e) {
      console.error("Lỗi đọc dữ liệu cá nhân:", e);
      return { name: "Lỗi", phone: "Lỗi", role: "admin" };
    }
  }
}