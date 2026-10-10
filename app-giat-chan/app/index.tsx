import React, { useState, useEffect } from "react";
import { View, ActivityIndicator } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Sửa lại đường dẫn import cho khớp với cấu trúc thư mục của sếp
import DangNhap from "../Dashboard/screens/DangNhap";
import TrangChu from "../Dashboard/screens/TrangChu";

export default function Index() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isChecking, setIsChecking] = useState(true); // Trạng thái màn hình chờ

  // Kiểm tra xem máy đã lưu thông tin đăng nhập chưa
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const name = await AsyncStorage.getItem("user_name");
        if (name) {
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.log("Lỗi đọc bộ nhớ:", error);
      } finally {
        setIsChecking(false); // Xong thì tắt màn hình chờ
      }
    };
    checkAuth();
  }, []);

  // 1. Nếu đang check bộ nhớ, hiện vòng xoay tải
  if (isChecking) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#F8FAFC" }}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  // 2. Nếu chưa đăng nhập, khóa cửa bằng màn DangNhap
  if (!isAuthenticated) {
    return <DangNhap onAuthSuccess={() => setIsAuthenticated(true)} />;
  }

  // 3. Đăng nhập rồi thì nhả màn hình chính ra, đồng thời truyền phím Đăng xuất
  return <TrangChu onLogout={() => setIsAuthenticated(false)} />;
}