import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ScrollView, SafeAreaView, ActivityIndicator } from "react-native";
import { styles } from "../styles/globalStyles";
import { TaiChinhService } from "../services/TaiChinh";

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

  const CHART_HEIGHT = 140; 
  const PADDING_X = 15;     
  const maxVal = Math.max(stats.maxChartValue, 1);
  const drawableWidth = chartWidth - PADDING_X * 2; 

  const points = stats.chartData.map((item, index) => {
    const x = PADDING_X + (drawableWidth > 0 ? index * (drawableWidth / 6) : 0);
    const y = CHART_HEIGHT - (item.value / maxVal) * CHART_HEIGHT;
    return { x, y, value: item.value, day: item.day, isToday: index === 6 };
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
        <ScrollView style={styles.body} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
          
          <View style={styles.bcTabRow}>
            {[{ id: "DAY", label: "Hôm nay" }, { id: "WEEK", label: "Tuần này" }, { id: "MONTH", label: "Tháng này" }].map((tab: any) => (
              <TouchableOpacity 
                key={tab.id} 
                style={[
                  styles.bcTabBtnBase,
                  timeRange === tab.id ? styles.bcTabBtnActive : styles.bcTabBtnInactive
                ]} 
                onPress={() => setTimeRange(tab.id)}
              >
                <Text style={[
                  styles.bcTabTextBase,
                  timeRange === tab.id ? styles.bcTabTextActive : styles.bcTabTextInactive
                ]}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          
          <View style={styles.bcSummaryCard}>
            <View style={styles.bcSummaryHeaderRow}>
              <View style={styles.bcProfitLabelRow}>
                <View style={[styles.bcProfitDot, stats.profit >= 0 ? styles.bcProfitDotPos : styles.bcProfitDotNeg]} />
                <Text style={styles.bcProfitLabelText}>Lợi nhuận ròng</Text>
              </View>
              <View style={styles.bcOrderCountBadge}>
                <Text style={styles.bcOrderCountText}>{stats.orderCount} ĐƠN</Text>
              </View>
            </View>
            <Text style={[styles.bcProfitValueText, stats.profit >= 0 ? styles.bcProfitValuePos : styles.bcProfitValueNeg]}>
              {stats.profit >= 0 ? "" : "-"}{Math.abs(stats.profit).toLocaleString("vi-VN")} <Text style={styles.bcProfitCurrency}>VND</Text>
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
            
            <View style={styles.bcChartContainer} onLayout={(e) => setChartWidth(e.nativeEvent.layout.width)}>
              
              <View style={styles.bcGridLinesBox}>
                {[1, 2, 3, 4].map((_, i) => (
                  <View key={i} style={styles.bcGridLine} />
                ))}
              </View>

              {chartWidth > 0 && points.map((p, i) => {
                if (i === points.length - 1) return null;
                const nextP = points[i + 1];
                
                const distance = Math.sqrt(Math.pow(nextP.x - p.x, 2) + Math.pow(nextP.y - p.y, 2));
                const angle = Math.atan2(nextP.y - p.y, nextP.x - p.x) * 180 / Math.PI;
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
                        transform: [{ rotate: `${angle}deg` }]
                      }
                    ]}
                  />
                );
              })}

              {chartWidth > 0 && points.map((p, i) => (
                <View key={`dot-${i}`} style={[styles.bcChartDotWrap, { left: p.x - 25, top: p.y - 25 }]}>
                  <Text style={[styles.bcChartValueText, p.isToday ? styles.bcChartValueTextToday : styles.bcChartValueTextNormal]}>
                    {p.value > 0 ? `${(p.value / 1000).toFixed(0)}k` : ''}
                  </Text>
                  <View style={[styles.bcChartDot, p.isToday ? styles.bcChartDotToday : styles.bcChartDotNormal]} />
                </View>
              ))}
            </View>

            <View style={styles.bcXAxisWrap}>
              {chartWidth > 0 && points.map((p, i) => (
                <Text key={`day-${i}`} style={[
                  styles.bcXAxisLabel,
                  p.isToday ? styles.bcXAxisLabelToday : styles.bcXAxisLabelNormal,
                  { left: p.x - 25 }
                ]}>
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