import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, SafeAreaView, Modal, ActivityIndicator } from "react-native";
import { styles } from "../styles/globalStyles";
import { DonHangService } from "../services/DonHang";

export default function LichSuDonHang({ onBack }: { onBack: () => void }) {
  const [historyList, setHistoryList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchDate, setSearchDate] = useState(""); 
  const [showDatePicker, setShowDatePicker] = useState(false);

  React.useEffect(() => {
    const fetchHistory = async () => {
      setIsLoading(true);
      const data = await DonHangService.getHistoryStats();
      setHistoryList(data);
      setIsLoading(false);
    };
    fetchHistory();
  }, []);

  const filteredHistoryList = searchDate === "" ? historyList : historyList.filter(h => h.dateStr === searchDate);

  const chartData = [];
  const startOfToday = new Date(new Date().setHours(0, 0, 0, 0));
  for (let i = 6; i >= 0; i--) {
    const d = new Date(startOfToday);
    d.setDate(d.getDate() - i);
    const dStr = d.toLocaleDateString("vi-VN");
    
    const foundData = historyList.find(h => h.dateStr === dStr);
    chartData.push({ day: ["CN", "T2", "T3", "T4", "T5", "T6", "T7"][d.getDay()], value: foundData ? foundData.total : 0 });
  }
  const maxChartValue = Math.max(...chartData.map((d) => d.value), 10);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.moduleHeaderTop}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack}>
          <Text style={styles.backBtnText}>Quay lại</Text>
        </TouchableOpacity>
        <Text style={styles.moduleTitle}>Lịch Sử Sản Phẩm</Text>
        <View style={{ width: 60 }} />
      </View>
      
      {isLoading ? (
        <ActivityIndicator size="large" color="#1E3A8A" style={styles.loadingSpinner} />
      ) : (
        <ScrollView style={styles.historyScrollView} showsVerticalScrollIndicator={false} contentContainerStyle={styles.historyScrollContent}>
          
          <View style={styles.chartCard}>
            <Text style={styles.chartTitle}>📊 TỔNG SẢN PHẨM 7 NGÀY</Text>
            <View style={styles.chartBarsRow}>
              {chartData.map((item, index) => (
                <View key={index} style={styles.chartBarContainer}>
                  {item.value > 0 && <Text style={styles.chartBarValueText}>{item.value}</Text>}
                  {/* Cột biểu đồ cần render chiều cao và màu nền động */}
                  <View style={{ 
                      width: "60%", 
                      height: `${Math.max((item.value / maxChartValue) * 100, 2)}%`, 
                      backgroundColor: item.value > 0 ? "#3B82F6" : "#E5E7EB", 
                      borderTopLeftRadius: 6, 
                      borderTopRightRadius: 6 
                    }} 
                  />
                </View>
              ))}
            </View>
            <View style={styles.chartLabelsRow}>
              {chartData.map((item, index) => <Text key={index} style={styles.chartLabelText}>{item.day}</Text>)}
            </View>
          </View>

          <View style={styles.filterHeaderRow}>
            <Text style={styles.filterTitle}>CHI TIẾT CÁC NGÀY</Text>
            
            <TouchableOpacity 
              onPress={() => setShowDatePicker(true)}
              style={styles.datePickerBtn}
            >
              <Text style={styles.dateIcon}>📅</Text>
              {/* Đổi màu text khi đã lọc ngày */}
              <Text style={{ fontSize: 13, color: searchDate ? "#2563EB" : "#6B7280", fontWeight: '900' }}>
                {searchDate ? searchDate : "Lọc ngày"}
              </Text>
              {searchDate !== "" && (
                <TouchableOpacity onPress={(e) => { e.stopPropagation(); setSearchDate(""); }} style={styles.clearDateBtn}>
                  <Text style={styles.clearDateIcon}>✖</Text>
                </TouchableOpacity>
              )}
            </TouchableOpacity>
          </View>

          {filteredHistoryList.map((h, i) => {
            const itemsArr = Object.keys(h.items).map(k => `${h.items[k]} ${k}`);
            const itemsRows = [];
            for (let j = 0; j < itemsArr.length; j += 2) {
              itemsRows.push("• " + itemsArr.slice(j, j + 2).join("   • "));
            }

            return (
              <View key={i} style={styles.dailyDetailCard}>
                <View style={styles.dailyDetailHeader}>
                    <Text style={styles.dailyDetailDateText}>🗓️ {h.dateStr}</Text>
                    <View style={styles.dailyDetailStatsBadge}>
                      <Text style={styles.dailyDetailStatsText}>{h.orders} đơn / {h.total} món</Text>
                    </View>
                </View>
                <View style={styles.dailyDetailDivider} />
                <Text style={styles.dailyDetailContentText}>
                  {itemsRows.join("\n")}
                </Text>
              </View>
            )
          })}
        </ScrollView>
      )}

      <Modal visible={showDatePicker} transparent={true} animationType="fade" statusBarTranslucent={true}>
        <TouchableOpacity 
          style={styles.dateModalOverlay}
          activeOpacity={1}
          onPress={() => setShowDatePicker(false)}
        >
          <View style={styles.dateModalContainer}>
            
            <View style={styles.dateModalHeader}>
              <Text style={styles.dateModalHeaderText}>📅 Chọn ngày xem lịch sử</Text>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.dateModalScrollContent}>
              
              <TouchableOpacity 
                style={styles.dateModalAllDaysBtn}
                onPress={() => { setSearchDate(""); setShowDatePicker(false); }}
              >
                <Text style={styles.dateModalAllDaysText}>Hiển thị Tất cả các ngày</Text>
              </TouchableOpacity>

              {historyList.map((h, i) => (
                <TouchableOpacity 
                  key={i} 
                  style={styles.dateModalItemRow}
                  onPress={() => { setSearchDate(h.dateStr); setShowDatePicker(false); }}
                >
                  {/* Trạng thái được chọn đổi màu chữ */}
                  <Text style={{ fontSize: 15, color: searchDate === h.dateStr ? '#10B981' : '#4B5563', fontWeight: searchDate === h.dateStr ? '900' : 'bold' }}>
                    {searchDate === h.dateStr && "✅ "} {h.dateStr}
                  </Text>
                  <View style={styles.dateModalItemBadge}>
                    <Text style={styles.dateModalItemBadgeText}>{h.orders} đơn</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <TouchableOpacity 
              style={styles.dateModalCloseBtn}
              onPress={() => setShowDatePicker(false)}
            >
              <Text style={styles.dateModalCloseText}>Đóng lại</Text>
            </TouchableOpacity>

          </View>
        </TouchableOpacity>
      </Modal>

    </SafeAreaView>
  );
}