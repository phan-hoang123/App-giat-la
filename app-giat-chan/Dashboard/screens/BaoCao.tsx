import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ScrollView, SafeAreaView, ActivityIndicator } from "react-native";
import { styles } from "../styles/globalStyles";
import { TaiChinhService } from "../services/TaiChinh";

// Hàm dựng dữ liệu biểu đồ thông minh theo đúng Tab (Hôm nay / Tuần này / Tháng này)
const buildDynamicChartData = (
  transactions: any[],
  orders: any[],
  timeRange: "DAY" | "WEEK" | "MONTH"
) => {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();
  const currentDate = now.getDate();

  // Lấy giá trị tiền từ giao dịch IN hoặc từ đơn hàng
  const getDayRevenue = (targetDate: Date) => {
    const y = targetDate.getFullYear();
    const m = targetDate.getMonth();
    const d = targetDate.getDate();

    const txIn = (transactions || [])
      .filter((t: any) => {
        if (!t.created_at || t.type !== "IN") return false;
        const dt = new Date(t.created_at);
        return dt.getFullYear() === y && dt.getMonth() === m && dt.getDate() === d;
      })
      .reduce((sum: number, t: any) => sum + (Number(t.amount) || 0), 0);

    const orderRev = (orders || [])
      .filter((o: any) => {
        if (!o.created_at) return false;
        const dt = new Date(o.created_at);
        return dt.getFullYear() === y && dt.getMonth() === m && dt.getDate() === d;
      })
      .reduce((sum: number, o: any) => sum + (Number(o.total_amount) || 0), 0);

    return Math.max(txIn, orderRev);
  };

  // 1. TAB HÔM NAY: Chia làm 7 mốc giờ trong ngày
  if (timeRange === "DAY") {
    const hourBuckets = [
      { label: "06h", start: 0, end: 6 },
      { label: "09h", start: 7, end: 9 },
      { label: "12h", start: 10, end: 12 },
      { label: "15h", start: 13, end: 15 },
      { label: "18h", start: 16, end: 18 },
      { label: "21h", start: 19, end: 21 },
      { label: "24h", start: 22, end: 23 },
    ];
    const currentHour = now.getHours();

    return hourBuckets.map((b) => {
      const txIn = (transactions || [])
        .filter((t: any) => {
          if (!t.created_at || t.type !== "IN") return false;
          const dt = new Date(t.created_at);
          const h = dt.getHours();
          return (
            dt.getFullYear() === currentYear &&
            dt.getMonth() === currentMonth &&
            dt.getDate() === currentDate &&
            h >= b.start &&
            h <= b.end
          );
        })
        .reduce((sum: number, t: any) => sum + (Number(t.amount) || 0), 0);

      const orderRev = (orders || [])
        .filter((o: any) => {
          if (!o.created_at) return false;
          const dt = new Date(o.created_at);
          const h = dt.getHours();
          return (
            dt.getFullYear() === currentYear &&
            dt.getMonth() === currentMonth &&
            dt.getDate() === currentDate &&
            h >= b.start &&
            h <= b.end
          );
        })
        .reduce((sum: number, o: any) => sum + (Number(o.total_amount) || 0), 0);

      return {
        day: b.label,
        value: Math.max(txIn, orderRev),
        isToday: currentHour >= b.start && currentHour <= b.end,
      };
    });
  }

  // 2. TAB THÁNG NÀY: Chia tháng thành 7 giai đoạn ngày để hiển thị trọn vẹn doanh thu cả tháng
  if (timeRange === "MONTH") {
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const monthBuckets = [
      { label: "1-4", start: 1, end: 4 },
      { label: "5-9", start: 5, end: 9 },
      { label: "10-13", start: 10, end: 13 },
      { label: "14-18", start: 14, end: 18 },
      { label: "19-22", start: 19, end: 22 },
      { label: "23-26", start: 23, end: 26 },
      { label: `27-${daysInMonth}`, start: 27, end: daysInMonth },
    ];

    return monthBuckets.map((b) => {
      let bucketTotal = 0;
      for (let d = b.start; d <= b.end; d++) {
        bucketTotal += getDayRevenue(new Date(currentYear, currentMonth, d));
      }
      return {
        day: b.label,
        value: bucketTotal,
        isToday: currentDate >= b.start && currentDate <= b.end,
      };
    });
  }

  // 3. TAB TUẦN NÀY: Hiển thị từ T2 -> CN của tuần hiện tại
  const dayOfWeek = now.getDay(); // 0 là CN, 1..6 là T2..T7
  const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const monday = new Date(now);
  monday.setDate(now.getDate() + diffToMonday);

  const weekLabels = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];
  return weekLabels.map((label, idx) => {
    const target = new Date(monday);
    target.setDate(monday.getDate() + idx);
    const isToday =
      target.getDate() === currentDate &&
      target.getMonth() === currentMonth &&
      target.getFullYear() === currentYear;

    return {
      day: label,
      value: getDayRevenue(target),
      isToday,
    };
  });
};

export default function BaoCao({ onBack }: { onBack: () => void }) {
  const [timeRange, setTimeRange] = useState<"DAY" | "WEEK" | "MONTH">("WEEK");
  const [rawData, setRawData] = useState({ transactions: [], orders: [] });
  const [isLoading, setIsLoading] = useState(false);

  const [chartWidth, setChartWidth] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      const data = await TaiChinhService.getRawReportData();
      setRawData(data);
      setIsLoading(false);
    };
    fetchData();
  }, []);

  const stats = TaiChinhService.calculateReport(rawData.transactions, rawData.orders, timeRange);

  // Sử dụng dữ liệu biểu đồ động theo đúng Tab Ngày / Tuần / Tháng
  const dynamicChartData = buildDynamicChartData(
    rawData.transactions,
    rawData.orders,
    timeRange
  );

  const CHART_HEIGHT = 140;
  const PADDING_X = 15;
  const maxVal = Math.max(...dynamicChartData.map((d) => d.value), stats.maxChartValue || 0, 1);
  const drawableWidth = chartWidth - PADDING_X * 2;

  const points = dynamicChartData.map((item, index) => {
    const x = PADDING_X + (drawableWidth > 0 ? index * (drawableWidth / 6) : 0);
    const y = CHART_HEIGHT - (item.value / maxVal) * CHART_HEIGHT;
    return { x, y, value: item.value, day: item.day, isToday: item.isToday };
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.moduleHeaderTop}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack}>
          <Text style={styles.backBtnText}>Quay lại</Text>
        </TouchableOpacity>
        <Text style={styles.moduleTitle}>Báo Cáo Doanh Thu</Text>
        <View style={{ width: 60 }} />
      </View>

      {isLoading ? (
        <ActivityIndicator size="large" color="#1E3A8A" style={styles.loadingSpinner} />
      ) : (
        <ScrollView
          style={styles.body}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }}
        >
          <View style={styles.bcTabRow}>
            {[
              { id: "DAY", label: "Hôm nay" },
              { id: "WEEK", label: "Tuần này" },
              { id: "MONTH", label: "Tháng này" },
            ].map((tab: any) => (
              <TouchableOpacity
                key={tab.id}
                style={[
                  styles.bcTabBtnBase,
                  timeRange === tab.id ? styles.bcTabBtnActive : styles.bcTabBtnInactive,
                ]}
                onPress={() => setTimeRange(tab.id)}
              >
                <Text
                  style={[
                    styles.bcTabTextBase,
                    timeRange === tab.id ? styles.bcTabTextActive : styles.bcTabTextInactive,
                  ]}
                >
                  {tab.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.bcSummaryCard}>
            <View style={styles.bcSummaryHeaderRow}>
              <View style={styles.bcProfitLabelRow}>
                <View
                  style={[
                    styles.bcProfitDot,
                    stats.profit >= 0 ? styles.bcProfitDotPos : styles.bcProfitDotNeg,
                  ]}
                />
                <Text style={styles.bcProfitLabelText}>Lợi nhuận ròng</Text>
              </View>
              <View style={styles.bcOrderCountBadge}>
                <Text style={styles.bcOrderCountText}>{stats.orderCount} ĐƠN</Text>
              </View>
            </View>
            <Text
              style={[
                styles.bcProfitValueText,
                stats.profit >= 0 ? styles.bcProfitValuePos : styles.bcProfitValueNeg,
              ]}
            >
              {stats.profit >= 0 ? "" : "-"}
              {Math.abs(stats.profit).toLocaleString("vi-VN")}{" "}
              <Text style={styles.bcProfitCurrency}>VND</Text>
            </Text>
            <View style={styles.bcDivider} />
            <View style={styles.bcInOutRow}>
              <View style={styles.bcInCol}>
                <Text style={styles.bcInOutLabel}>TỔNG THU (IN)</Text>
                <Text style={styles.bcInValue}>+{stats.revenue.toLocaleString("vi-VN")}</Text>
              </View>
              <View style={styles.bcVerticalDivider} />
              <View style={styles.bcOutCol}>
                <Text style={styles.bcInOutLabel}>TỔNG CHI (OUT)</Text>
                <Text style={styles.bcOutValue}>-{stats.expense.toLocaleString("vi-VN")}</Text>
              </View>
            </View>
          </View>

          <View style={styles.bcChartCard}>
            <Text style={styles.bcChartTitle}>Biến động dòng tiền</Text>

            <View
              style={styles.bcChartContainer}
              onLayout={(e) => setChartWidth(e.nativeEvent.layout.width)}
            >
              <View style={styles.bcGridLinesBox}>
                {[1, 2, 3, 4].map((_, i) => (
                  <View key={i} style={styles.bcGridLine} />
                ))}
              </View>

              {chartWidth > 0 &&
                points.map((p, i) => {
                  if (i === points.length - 1) return null;
                  const nextP = points[i + 1];

                  const distance = Math.sqrt(
                    Math.pow(nextP.x - p.x, 2) + Math.pow(nextP.y - p.y, 2)
                  );
                  const angle = (Math.atan2(nextP.y - p.y, nextP.x - p.x) * 180) / Math.PI;
                  const midX = (p.x + nextP.x) / 2;
                  const midY = (p.y + nextP.y) / 2;

                  return (
                    <View
                      key={`line-${i}`}
                      style={[
                        styles.bcChartLineSegment,
                        {
                          left: midX - distance / 2,
                          top: midY - 1.5,
                          width: distance,
                          transform: [{ rotate: `${angle}deg` }],
                        },
                      ]}
                    />
                  );
                })}

              {chartWidth > 0 &&
                points.map((p, i) => (
                  <View
                    key={`dot-${i}`}
                    style={[styles.bcChartDotWrap, { left: p.x - 25, top: p.y - 25 }]}
                  >
                    <Text
                      style={[
                        styles.bcChartValueText,
                        p.isToday
                          ? styles.bcChartValueTextToday
                          : styles.bcChartValueTextNormal,
                      ]}
                    >
                      {p.value > 0
                        ? p.value >= 1000000
                          ? `${(p.value / 1000000).toFixed(1)}tr`
                          : `${(p.value / 1000).toFixed(0)}k`
                        : ""}
                    </Text>
                    <View
                      style={[
                        styles.bcChartDot,
                        p.isToday ? styles.bcChartDotToday : styles.bcChartDotNormal,
                      ]}
                    />
                  </View>
                ))}
            </View>

            <View style={styles.bcXAxisWrap}>
              {chartWidth > 0 &&
                points.map((p, i) => (
                  <Text
                    key={`day-${i}`}
                    style={[
                      styles.bcXAxisLabel,
                      p.isToday ? styles.bcXAxisLabelToday : styles.bcXAxisLabelNormal,
                      { left: p.x - 25 },
                    ]}
                  >
                    {p.day}
                  </Text>
                ))}
            </View>
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}