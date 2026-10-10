import React, { useEffect, useRef } from "react";
import { Modal, View, Text, TouchableOpacity, Animated, Easing, Dimensions, Platform } from "react-native";

const { width } = Dimensions.get("window");

export default function BeautifulPopup({ visible, type, title, message, onConfirm, onClose }: any) {
  const scaleValue = useRef(new Animated.Value(0)).current;
  const opacityValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Khi bật popup: Nảy to lên + Mờ dần thành rõ
      Animated.parallel([
        Animated.spring(scaleValue, {
          toValue: 1,
          useNativeDriver: true,
          tension: 50, // Lực nảy
          friction: 6, // Lực cản (càng nhỏ càng rung nảy nhiều)
        }),
        Animated.timing(opacityValue, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
          easing: Easing.out(Easing.ease),
        })
      ]).start();
    } else {
      // Reset khi ẩn để lần sau bật lên vẫn có hiệu ứng
      scaleValue.setValue(0);
      opacityValue.setValue(0);
    }
  }, [visible]);

  if (!visible) return null;

  // Cài đặt tông màu và icon tự động theo "Loại" popup
  let icon = "🎉";
  let color = "#10B981"; // Xanh lá cây (Thành công)
  let btnText = "Tuyệt vời!";

  if (type === "ERROR") {
    icon = "❌";
    color = "#EF4444"; // Đỏ (Lỗi)
    btnText = "Đóng lại";
  } else if (type === "WARNING") {
    icon = "⚠️";
    color = "#F59E0B"; // Cam (Cảnh báo)
    btnText = "Đã hiểu";
  }

  const handlePress = () => {
    // Nếu có truyền lệnh Confirm (Ví dụ: Quay lại màn hình cũ) thì chạy lệnh đó
    if (onConfirm) onConfirm();
    else onClose(); // Nếu không thì đóng popup
  };

  return (
    <Modal transparent visible={visible} animationType="none" statusBarTranslucent>
      <View style={{ flex: 1, backgroundColor: "rgba(15, 23, 42, 0.65)", justifyContent: "center", alignItems: "center", padding: 20 }}>
        
        {/* Lớp màng mờ bọc ngoài, bấm ra ngoài viền để đóng popup luôn cho tiện */}
        <TouchableOpacity style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0 }} activeOpacity={1} onPress={onClose} />

        {/* Khung Popup chính có hoạt ảnh */}
        <Animated.View style={{
          width: width * 0.85,
          maxWidth: 340,
          backgroundColor: "#FFF",
          borderRadius: 24,
          alignItems: "center",
          padding: 24,
          paddingTop: 45, // Nới rộng phía trên để nhường chỗ cho icon trồi lên
          elevation: 10,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 10 },
          shadowOpacity: 0.25,
          shadowRadius: 20,
          opacity: opacityValue,
          transform: [{ scale: scaleValue }]
        }}>
          
          {/* 🧙‍♂️ ICON TRỒI LÊN TRÊN VIỀN POPUP (ĐIỂM NHẤN 3D) */}
          <View style={{
            position: 'absolute',
            top: -35,
            width: 70,
            height: 70,
            borderRadius: 35,
            backgroundColor: color,
            justifyContent: 'center',
            alignItems: 'center',
            borderWidth: 5,
            borderColor: '#FFF',
            elevation: 5,
            shadowColor: color,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.4,
            shadowRadius: 8,
          }}>
            <Text style={{ fontSize: 32 }}>{icon}</Text>
          </View>

          {/* Tiêu đề & Nội dung */}
          <Text style={{ fontSize: 22, fontWeight: "900", color: "#0F172A", marginBottom: 8, textAlign: "center" }}>
            {title}
          </Text>
          <Text style={{ fontSize: 15, color: "#64748B", textAlign: "center", marginBottom: 25, lineHeight: 22, fontWeight: "600" }}>
            {message}
          </Text>

          {/* Nút bấm đồng bộ màu với Icon */}
          <TouchableOpacity
            onPress={handlePress}
            style={{
              backgroundColor: color,
              width: "100%",
              paddingVertical: 14,
              borderRadius: 14,
              alignItems: "center",
              ...Platform.select({
                ios: {
                  shadowColor: color,
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 6,
                },
                android: {
                  elevation: 4
                }
              })
            }}
          >
            <Text style={{ color: "#FFF", fontSize: 16, fontWeight: "900", letterSpacing: 0.5 }}>
              {btnText}
            </Text>
          </TouchableOpacity>

        </Animated.View>
      </View>
    </Modal>
  );
}