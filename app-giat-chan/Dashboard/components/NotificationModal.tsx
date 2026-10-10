import React from "react";
import { View, Text, TouchableOpacity, ScrollView, Modal } from "react-native";

export default function NotificationModal({ visible, onClose, urgentOrders }: { visible: boolean, onClose: () => void, urgentOrders: any[] }) {
  return (
    <Modal 
      visible={visible} 
      animationType="fade" 
      transparent={true}
      // Khắc phục lỗi viền trắng trên/dưới
      statusBarTranslucent={true}
    >
      
      {/* 1. LỚP MÀNG MỜ VÔ HÌNH: Bấm ra ngoài là tự động đóng */}
      <TouchableOpacity 
        style={{ flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.15)' }} 
        activeOpacity={1} 
        onPress={onClose} 
      />

      {/* 2. KHỐI THÔNG BÁO LƠ LỬNG: Được neo ở góc trên bên phải, ngay dưới cái chuông */}
      <View style={{ 
        position: 'absolute', 
        top: 90, 
        right: 15, 
        width: 320,
        maxHeight: '65%', 
        backgroundColor: '#FFF', 
        borderRadius: 16, 
        padding: 16, 
        elevation: 10, 
        shadowColor: '#000', 
        shadowOffset: { width: 0, height: 8 }, 
        shadowOpacity: 0.15, 
        shadowRadius: 12 
      }}>
        
        {/* Header của bảng thông báo */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15, paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' }}>
          <Text style={{ fontSize: 18, fontWeight: '900', color: '#0F172A' }}>Thông báo</Text>
          {urgentOrders.length > 0 && (
             <Text style={{ fontSize: 13, color: '#3B82F6', fontWeight: 'bold' }}>{urgentOrders.length} Đơn mới</Text>
          )}
        </View>

        {/* Nội dung bên trong */}
        {urgentOrders.length === 0 ? (
          <View style={{ paddingVertical: 30, alignItems: 'center' }}>
            <Text style={{ fontSize: 40, marginBottom: 10 }}>🎉</Text>
            <Text style={{ color: '#475569', fontSize: 14, textAlign: 'center', fontWeight: 'bold' }}>Không có đơn lấy ngay nào!</Text>
          </View>
        ) : (
          <ScrollView showsVerticalScrollIndicator={false}>
            {urgentOrders.map((order, idx) => (
              <View key={idx} style={{ paddingVertical: 12, borderBottomWidth: idx === urgentOrders.length - 1 ? 0 : 1, borderBottomColor: '#F1F5F9' }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                  <Text style={{ fontWeight: '900', color: '#0F172A', fontSize: 15 }}>{order.name}</Text>
                  <Text style={{ color: '#DC2626', fontSize: 12, fontWeight: 'bold' }}>{order.time}</Text>
                </View>
                <Text style={{ color: '#64748B', fontSize: 13, marginBottom: 4 }}>📞 {order.phone || 'Không có SĐT'}</Text>
                <Text style={{ color: '#1D4ED8', fontSize: 13, fontWeight: '600', backgroundColor: '#EFF6FF', padding: 6, borderRadius: 6 }} numberOfLines={2}>
                  📦 {order.items}
                </Text>
              </View>
            ))}
          </ScrollView>
        )}
      </View>
    </Modal>
  );
}