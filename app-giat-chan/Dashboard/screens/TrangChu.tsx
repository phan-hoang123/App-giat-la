import React, { useState, useEffect, useRef } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SafeAreaView, View, Text, TouchableOpacity, ScrollView, LayoutAnimation, Platform, UIManager, Modal, Animated } from "react-native";
import { styles } from "../styles/globalStyles";
import { ThongKeService } from "../services/ThongKe"; 
import { Ionicons } from '@expo/vector-icons';

import NotificationModal from "../components/NotificationModal"; 
import KhachLe from "./KhachLe";
import DaiLy from "./DaiLy";
import KhoChan from "./KhoChan";
import CRM from "./CRM";
import ThuChi from "./ThuChi";
import BaoCao from "./BaoCao";
import LichSuDonHang from "./LichSuDonHang"; 
import CaiDat from "./CaiDat";
import CaNhan from "./CaNhan";
import MaQR from "./MaQR";

if (
  Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function TrangChu({ onLogout }: any) {
  const [activeTab, setActiveTab] = useState("HOME");
  const [activeModalScreen, setActiveModalScreen] = useState<string | null>(null);
  const [adminName, setAdminName] = useState("Sếp");
  
  const [urgentOrders, setUrgentOrders] = useState<any[]>([]); 
  const [showNoti, setShowNoti] = useState(false); 
  const [showMenu, setShowMenu] = useState(false);
  const slideAnim = useRef(new Animated.Value(-20)).current; 
  const fadeAnim = useRef(new Animated.Value(0)).current; 

  const openMenu = () => {
    setShowMenu(true);
    Animated.parallel ([
      Animated.timing (
        slideAnim, 
        { 
          toValue: 0, 
          duration: 200, 
          useNativeDriver: true 
        }),
      Animated.timing (
        fadeAnim, 
        { 
          toValue: 1, 
          duration: 200, 
          useNativeDriver: true 
        })
    ]).start();
  };

  const closeMenu = (action?: () => void) => {
    Animated.parallel([
      Animated.timing (
        slideAnim, 
        { 
          toValue: -20, 
          duration: 150, 
          useNativeDriver: true 
        }),
      Animated.timing (
        fadeAnim, 
        { 
          toValue: 0, 
          duration: 150, 
          useNativeDriver: true 
        })
    ]).start(() => {
      setShowMenu(false);
      if(action) 
        action(); 
    });
  };
  
  const [todayStats, setTodayStats] = useState({ 
    orders: 0, 
    revenue: 0, 
    totalItems: 0, 
    itemsSummary: [] as {
      name: string, 
      qty: number
    }[] 
  });

  const changeTab = (tabName: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setActiveTab(tabName);
  };

  const openScreen = (screenName: string | null) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setActiveModalScreen(screenName);
  };

  useEffect(() => {
    AsyncStorage.getItem("user_name").then(name => { 
        if (name) setAdminName(name); 
      });
    
    if (!activeModalScreen) {
      const fetchData = async () => {
        const data = await ThongKeService.getDashboardStats();
        if (data) {
          setTodayStats(data.todayStats);
          setUrgentOrders(data.urgentStats.urgentOrders); 
        }
      };
      fetchData();
    }
  }, [activeModalScreen, activeTab]);

  if (activeModalScreen === "CREATE_RETAIL") 
    return <KhachLe onBack={
      () => openScreen(null)
    } />;
  if (activeModalScreen === "CREATE_AGENT") 
    return <DaiLy onBack={
      () => openScreen(null)
    } />;
  if (activeModalScreen === "SETTINGS") 
    return <CaiDat onBack={
      () => openScreen(null)
    } />;
  if (activeModalScreen === "REPORTS") 
    return <BaoCao onBack={
      () => openScreen(null)
    } />;
  if (activeModalScreen === "PRODUCTION_HISTORY") 
    return <LichSuDonHang onBack={
      () => openScreen(null)
    } />;
  if (activeModalScreen === "QR_CODE") 
    return <MaQR onBack={
      () => openScreen(null)
    } />;

  const renderTabContent = () => {
    switch (activeTab) {
      case "HOME":
        return (
          <ScrollView style={styles.body} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
            
            <View style={styles.statsContainer}>
              <TouchableOpacity style={styles.statCard}>
                <Text style={styles.statLabel}>Đơn hôm nay</Text>
                <Text style={styles.statValue}>{todayStats.orders.toString()}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.statCard}>
                <Text style={styles.statLabel}>Doanh thu (VNĐ)</Text>
                <Text style={[styles.statValue, { color: "#10B981" }]}>{todayStats.revenue.toLocaleString("vi-VN")}</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Chức năng</Text>
              <View style={
                { 
                  flexDirection: "row", 
                  flexWrap: "wrap", 
                  marginHorizontal: -5 
                }}>
                {[
                  { id: "CREATE_RETAIL", name: "Khách lẻ", icon: "👤", color: "#E0F2FE" },
                  { id: "CREATE_AGENT", name: "Đại lý", icon: "🚚", color: "#FEF3C7" },
                  { id: "PRODUCTION_HISTORY", name: "Lịch sử", icon: "📦", color: "#E0E7FF" },
                  { id: "REPORTS", name: "Chi tiêu", icon: "💰", color: "#FCE7F3" },
                  { id: "SETTINGS", name: "Bảng giá", icon: "⚙️", color: "#DCFCE7" },
                  { id: "QR_CODE", name: "Mã QR", icon: "📱", color: "#D1FAE5" }
                ].map((item) => (
                  <View key={item.id} style={styles.gridItemWrapper}>
                    <TouchableOpacity style={styles.gridButton} onPress={() => openScreen(item.id)}>
                      {/* Màu nền truyền động nên giữ lại inline */}
                      <View style={[ styles.iconContainer, { backgroundColor: item.color } ]}>
                        <Text style={styles.gridIcon}>{item.icon}</Text>
                      </View>
                      <Text style={styles.gridText}>{item.name}</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            </View>

            <View style={styles.section}>
              <View style={styles.qtyHeaderBox}>
                <Text style={[styles.sectionTitle, { marginBottom: 0, marginTop: 0 }]}>Số lượng</Text>
                <View style={styles.qtyBadge}>
                  <Text style={styles.qtyBadgeText}>{todayStats.totalItems} sản phẩm</Text>
                </View>
              </View>

              <View style={styles.formCard}>
                {todayStats.itemsSummary.length === 0 ? (
                  <Text style={styles.qtyEmptyText}>Chưa có sản phẩm nào...</Text>
                ) : (
                  <View>
                    {(() => {
                      const sorted = [...todayStats.itemsSummary].sort((a, b) => b.qty - a.qty);
                      const top4 = sorted.slice(0, 4);
                      const others = sorted.slice(4);
                      const otherQty = others.reduce((sum, item) => sum + item.qty, 0);
                      const displayData = otherQty > 0 ? [...top4, { name: 'Các món khác', qty: otherQty }] : top4;
                      
                      const colors = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#64748B']; 

                      return (
                        <View>
                          <View style={styles.progressBarWrapper}>
                            {displayData.map((item, index) => {
                              return (
                                <View 
                                  key={index} 
                                  style={{ 
                                    flex: item.qty, // Tham số động bắt buộc dùng inline
                                    backgroundColor: colors[index], // Tham số động bắt buộc dùng inline
                                    borderRightWidth: index === displayData.length - 1 ? 0 : 2, 
                                    borderRightColor: '#FFF'
                                  }} 
                                />
                              );
                            })}
                          </View>

                          <View style={styles.legendContainer}>
                            {displayData.map((item, index) => (
                              <View key={index} style={styles.legendItem}>
                                <View style={[styles.legendColorBox, { backgroundColor: colors[index] }]} />
                                <View style={styles.legendTextContainer}>
                                  <Text style={styles.legendName} numberOfLines={2}>{item.name}</Text>
                                  <Text style={styles.legendQtyValue}>{item.qty} <Text style={styles.legendQtyLabel}>món</Text></Text>
                                </View>
                              </View>
                            ))}
                          </View>
                        </View>
                      );
                    })()}
                  </View>
                )}
              </View>
            </View>
          </ScrollView>
        );
      case "ORDERS": return <KhoChan />;
      case "CRM": return <CRM />;
      case "FINANCE": return <ThuChi />;
      case "ACCOUNT": return <CaNhan onLogout={onLogout} />;
      default: return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {activeTab === "HOME" && (
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View style={styles.userInfo}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{adminName ? adminName.charAt(0).toUpperCase() : "S"}</Text>
              </View>
              <View style={{ justifyContent: "center" }}>
                <Text style={styles.greeting}>Xin chào!</Text>
                <Text style={styles.userName}>{adminName}</Text>
              </View>
            </View>
            
            <View style={styles.menuButtonContainer}>
              <TouchableOpacity onPress={openMenu} style={styles.menuButton}>
                <Ionicons name="menu" size={32} color="#FFF" />
                {urgentOrders.length > 0 && (
                  <View style={styles.urgentBadgeContainer}>
                    <Text style={styles.urgentBadgeText}>{urgentOrders.length}</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      <View style={{ flex: 1 }}>{renderTabContent()}</View>

      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.tabItem} onPress={() => changeTab("HOME")}><Text style={[ styles.tabIcon, activeTab === "HOME" && styles.tabIconActive ]}>🏠</Text><Text style={[ styles.tabText, activeTab === "HOME" && styles.tabTextActive ]}>Trang chủ</Text></TouchableOpacity>
        <TouchableOpacity style={styles.tabItem} onPress={() => changeTab("ORDERS")}><Text style={[ styles.tabIcon, activeTab === "ORDERS" && styles.tabIconActive ]}>📋</Text><Text style={[ styles.tabText, activeTab === "ORDERS" && styles.tabTextActive ]}>Kho Chăn</Text></TouchableOpacity>
        <TouchableOpacity style={styles.tabItem} onPress={() => changeTab("CRM")}><Text style={[ styles.tabIcon, activeTab === "CRM" && styles.tabIconActive ]}>👥</Text><Text style={[ styles.tabText, activeTab === "CRM" && styles.tabTextActive ]}>Khách</Text></TouchableOpacity>
        <TouchableOpacity style={styles.tabItem} onPress={() => changeTab("FINANCE")}><Text style={[ styles.tabIcon, activeTab === "FINANCE" && styles.tabIconActive ]}>💰</Text><Text style={[ styles.tabText, activeTab === "FINANCE" && styles.tabTextActive ]}>Doanh thu</Text></TouchableOpacity>
        <TouchableOpacity style={styles.tabItem} onPress={() => changeTab("ACCOUNT")}><Text style={[ styles.tabIcon, activeTab === "ACCOUNT" && styles.tabIconActive ]}>👤</Text><Text style={[ styles.tabText, activeTab === "ACCOUNT" && styles.tabTextActive ]}>Cá nhân</Text></TouchableOpacity>
      </View>

      <Modal visible={showMenu} transparent={true} animationType="none" statusBarTranslucent={true}>
        <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={() => closeMenu()}>
          <Animated.View style={[styles.dropdownMenu, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
            
            <TouchableOpacity style={styles.dropdownItemNoti} onPress={() => closeMenu(() => setShowNoti(true))}>
              <Text style={styles.dropdownItemTextNoti}>Thông báo</Text>
              {urgentOrders.length > 0 && (
                <View style={styles.dropdownNotiBadge}>
                  <Text style={styles.urgentBadgeText}>{urgentOrders.length}</Text>
                </View>
              )}
            </TouchableOpacity>

            <TouchableOpacity style={styles.dropdownLogoutBtn} onPress={() => closeMenu(() => { if(onLogout) onLogout(); })}>
              <Text style={styles.dropdownLogoutText}>Đăng xuất</Text>
            </TouchableOpacity>

          </Animated.View>
        </TouchableOpacity>
      </Modal>

      <NotificationModal visible={showNoti} onClose={() => setShowNoti(false)} urgentOrders={urgentOrders} />
    </SafeAreaView>
  );
}