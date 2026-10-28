import React, { useState, useEffect, useRef } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  LayoutAnimation,
  Platform,
  UIManager,
  Modal,
  Animated,
  Alert,
  Keyboard,
} from "react-native";
import { styles } from "../styles/globalStyles";
import { ThongKeService } from "../services/ThongKe";
import { Ionicons } from "@expo/vector-icons";

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
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// Lưu các hàm gốc của hệ thống
const originalFetch = global.fetch;
const originalSetItem = AsyncStorage.setItem;
const originalRemoveItem = AsyncStorage.removeItem;

export default function TrangChu({ onLogout }: any) {
  const [activeTab, setActiveTab] = useState("HOME");
  const [activeModalScreen, setActiveModalScreen] = useState<string | null>(null);
  const [adminName, setAdminName] = useState("Sếp");
  const [userRole, setUserRole] = useState("ADMIN");

  // Khóa làm mới màn hình để xóa sạch mọi thay đổi tạm (useState) nếu Nhân viên cố tình bấm sửa
  const [resetKey, setResetKey] = useState(0);

  const activeScreenRef = useRef<string | null>(null);
  const activeTabRef = useRef<string>("HOME");
  const roleRef = useRef<string>("ADMIN");

  const [urgentOrders, setUrgentOrders] = useState<any[]>([]);
  const [showNoti, setShowNoti] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const slideAnim = useRef(new Animated.Value(-20)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const openMenu = () => {
    setShowMenu(true);
    Animated.parallel([
      Animated.timing(slideAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
      Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
    ]).start();
  };

  const closeMenu = (action?: () => void) => {
    Animated.parallel([
      Animated.timing(slideAnim, { toValue: -20, duration: 150, useNativeDriver: true }),
      Animated.timing(fadeAnim, { toValue: 0, duration: 150, useNativeDriver: true }),
    ]).start(() => {
      setShowMenu(false);
      if (action) action();
    });
  };

  const [todayStats, setTodayStats] = useState({
    orders: 0,
    revenue: 0,
    totalItems: 0,
    itemsSummary: [] as { name: string; qty: number }[],
  });

  const changeTab = (tabName: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    activeTabRef.current = tabName;
    setActiveTab(tabName);
  };

  const openScreen = (screenName: string | null) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    activeScreenRef.current = screenName;
    setActiveModalScreen(screenName);
  };

  // Hàm kiểm tra xem Nhân viên có đang ở màn hình được phép nhập/thêm đơn hay không
  const isAllowedToEdit = () => {
    if (roleRef.current.toUpperCase() === "ADMIN") return true;
    return (
      activeTabRef.current === "HOME" &&
      (activeScreenRef.current === "CREATE_RETAIL" ||
        activeScreenRef.current === "CREATE_AGENT")
    );
  };

  const triggerStaffBlockAlert = () => {
    Keyboard.dismiss();
    setResetKey((prev) => prev + 1); // Reset lại màn hình con về dữ liệu gốc
    Alert.alert(
      "Chế độ Chỉ Xem (Nhân viên) 🔒",
      "Tài khoản Nhân viên chỉ được phép xem dữ liệu và tạo đơn tại mục Khách lẻ / Đại lý, không có quyền chỉnh sửa mục này!"
    );
  };

  // LỚP BẢO VỆ 1: CHẶN GÕ BÀN PHÍM SỬA DỮ LIỆU Ở CÁC MÀN HÌNH CHỈ XEM
  useEffect(() => {
    const keyboardSub = Keyboard.addListener("keyboardDidShow", () => {
      if (!isAllowedToEdit()) {
        triggerStaffBlockAlert();
      }
    });
    return () => keyboardSub.remove();
  }, []);

  // LỚP BẢO VỆ 2 & 3: CHẶN TRIỆT ĐỂ API (PUT/POST/DELETE) VÀ LƯU BỘ NHỚ MÁY (ASYNCSTORAGE)
  useEffect(() => {
    const interceptedFetch = async (input: RequestInfo | URL, init?: RequestInit) => {
      const method = (init?.method || "GET").toUpperCase();
      const url = typeof input === "string" ? input : input.toString();

      if (roleRef.current.toUpperCase() !== "ADMIN" && method !== "GET") {
        const isCreatingOrder =
          method === "POST" &&
          (url.includes("/api/orders") || url.includes("/api/addresses")) &&
          isAllowedToEdit();

        if (!isCreatingOrder && !url.includes("/api/login")) {
          triggerStaffBlockAlert();
          // Bắt buộc REJECT Promise để màn hình con nhảy vào catch và dừng ngay lập tức
          return Promise.reject(new Error("STAFF_READ_ONLY_BLOCKED"));
        }
      }

      return originalFetch(input, init);
    };

    global.fetch = interceptedFetch;
    (globalThis as any).fetch = interceptedFetch;

    // Chặn các màn hình như Mã QR / Bảng giá tự lưu vào AsyncStorage
    const systemAuthKeys = [
      "user_name",
      "user_role",
      "user_token",
      "saved_phone",
      "saved_password",
    ];

    AsyncStorage.setItem = async (key: string, value: string) => {
      if (
        roleRef.current.toUpperCase() !== "ADMIN" &&
        !systemAuthKeys.includes(key) &&
        !isAllowedToEdit()
      ) {
        triggerStaffBlockAlert();
        return Promise.reject(new Error("STAFF_STORAGE_BLOCKED"));
      }
      return originalSetItem(key, value);
    };

    AsyncStorage.removeItem = async (key: string) => {
      if (
        roleRef.current.toUpperCase() !== "ADMIN" &&
        !systemAuthKeys.includes(key) &&
        !isAllowedToEdit()
      ) {
        triggerStaffBlockAlert();
        return Promise.reject(new Error("STAFF_STORAGE_BLOCKED"));
      }
      return originalRemoveItem(key);
    };

    return () => {
      global.fetch = originalFetch;
      (globalThis as any).fetch = originalFetch;
      AsyncStorage.setItem = originalSetItem;
      AsyncStorage.removeItem = originalRemoveItem;
    };
  }, []);

  // Đồng bộ quyền mới nhất từ bảng users trên máy chủ
  useEffect(() => {
    const syncUserInfo = async () => {
      const savedName = await AsyncStorage.getItem("user_name");
      const savedRole = await AsyncStorage.getItem("user_role");
      const savedPhone = await AsyncStorage.getItem("saved_phone");

      if (savedName) setAdminName(savedName);
      if (savedRole) {
        const norm = savedRole.toUpperCase();
        roleRef.current = norm;
        setUserRole(norm);
      }

      try {
        const res = await originalFetch("http://20.48.3.215:5001/api/staff");
        if (res.ok) {
          const usersList = await res.json();
          const currentUser = usersList.find(
            (u: any) => u.phone === savedPhone || u.name === savedName
          );
          if (currentUser && currentUser.role) {
            const latestRole = currentUser.role.toUpperCase();
            roleRef.current = latestRole;
            setUserRole(latestRole);
            await originalSetItem("user_role", latestRole);
          }
        }
      } catch {}
    };

    syncUserInfo();

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
    return <KhachLe onBack={() => openScreen(null)} />;
  if (activeModalScreen === "CREATE_AGENT")
    return <DaiLy onBack={() => openScreen(null)} />;
  if (activeModalScreen === "SETTINGS")
    return <CaiDat key={`settings-${resetKey}`} onBack={() => openScreen(null)} />;
  if (activeModalScreen === "REPORTS")
    return <BaoCao key={`reports-${resetKey}`} onBack={() => openScreen(null)} />;
  if (activeModalScreen === "PRODUCTION_HISTORY")
    return <LichSuDonHang key={`history-${resetKey}`} onBack={() => openScreen(null)} />;
  if (activeModalScreen === "QR_CODE")
    return <MaQR key={`qr-${resetKey}`} onBack={() => openScreen(null)} />;

  const renderTabContent = () => {
    switch (activeTab) {
      case "HOME":
        return (
          <ScrollView
            style={styles.body}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 100 }}
          >
            <View style={styles.statsContainer}>
              <TouchableOpacity style={styles.statCard}>
                <Text style={styles.statLabel}>Đơn hôm nay</Text>
                <Text style={styles.statValue}>{todayStats.orders.toString()}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.statCard}>
                <Text style={styles.statLabel}>Doanh thu (VNĐ)</Text>
                <Text style={[styles.statValue, { color: "#10B981" }]}>
                  {todayStats.revenue.toLocaleString("vi-VN")}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Chức năng</Text>
              <View style={{ flexDirection: "row", flexWrap: "wrap", marginHorizontal: -5 }}>
                {[
                  { id: "CREATE_RETAIL", name: "Khách lẻ", icon: "👤", color: "#E0F2FE" },
                  { id: "CREATE_AGENT", name: "Đại lý", icon: "🚚", color: "#FEF3C7" },
                  { id: "PRODUCTION_HISTORY", name: "Lịch sử", icon: "📦", color: "#E0E7FF" },
                  { id: "REPORTS", name: "Chi tiêu", icon: "💰", color: "#FCE7F3" },
                  { id: "SETTINGS", name: "Bảng giá", icon: "⚙️", color: "#DCFCE7" },
                  { id: "QR_CODE", name: "Mã QR", icon: "📱", color: "#D1FAE5" },
                ].map((item) => (
                  <View key={item.id} style={styles.gridItemWrapper}>
                    <TouchableOpacity
                      style={styles.gridButton}
                      onPress={() => openScreen(item.id)}
                    >
                      <View style={[styles.iconContainer, { backgroundColor: item.color }]}>
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
                <Text style={[styles.sectionTitle, { marginBottom: 0, marginTop: 0 }]}>
                  Số lượng
                </Text>
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
                      const displayData =
                        otherQty > 0
                          ? [...top4, { name: "Các món khác", qty: otherQty }]
                          : top4;

                      const colors = ["#3B82F6", "#EF4444", "#10B981", "#F59E0B", "#64748B"];

                      return (
                        <View>
                          <View style={styles.progressBarWrapper}>
                            {displayData.map((item, index) => (
                              <View
                                key={index}
                                style={{
                                  flex: item.qty,
                                  backgroundColor: colors[index],
                                  borderRightWidth: index === displayData.length - 1 ? 0 : 2,
                                  borderRightColor: "#FFF",
                                }}
                              />
                            ))}
                          </View>

                          <View style={styles.legendContainer}>
                            {displayData.map((item, index) => (
                              <View key={index} style={styles.legendItem}>
                                <View
                                  style={[
                                    styles.legendColorBox,
                                    { backgroundColor: colors[index] },
                                  ]}
                                />
                                <View style={styles.legendTextContainer}>
                                  <Text style={styles.legendName} numberOfLines={2}>
                                    {item.name}
                                  </Text>
                                  <Text style={styles.legendQtyValue}>
                                    {item.qty} <Text style={styles.legendQtyLabel}>món</Text>
                                  </Text>
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
      case "ORDERS":
        return <KhoChan key={`orders-${resetKey}`} />;
      case "CRM":
        return <CRM key={`crm-${resetKey}`} />;
      case "FINANCE":
        return <ThuChi key={`finance-${resetKey}`} />;
      case "ACCOUNT":
        return <CaNhan key={`account-${resetKey}`} onLogout={onLogout} />;
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {activeTab === "HOME" && (
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View style={styles.userInfo}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {adminName ? adminName.charAt(0).toUpperCase() : "S"}
                </Text>
              </View>
              <View style={{ justifyContent: "center" }}>
                <Text style={styles.greeting}>
                  Xin chào! ({userRole === "ADMIN" ? "Quản lý" : "Nhân viên - Chỉ xem & Thêm đơn"})
                </Text>
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
        <TouchableOpacity style={styles.tabItem} onPress={() => changeTab("HOME")}>
          <Text style={[styles.tabIcon, activeTab === "HOME" && styles.tabIconActive]}>🏠</Text>
          <Text style={[styles.tabText, activeTab === "HOME" && styles.tabTextActive]}>
            Trang chủ
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem} onPress={() => changeTab("ORDERS")}>
          <Text style={[styles.tabIcon, activeTab === "ORDERS" && styles.tabIconActive]}>📋</Text>
          <Text style={[styles.tabText, activeTab === "ORDERS" && styles.tabTextActive]}>
            Kho Chăn
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem} onPress={() => changeTab("CRM")}>
          <Text style={[styles.tabIcon, activeTab === "CRM" && styles.tabIconActive]}>👥</Text>
          <Text style={[styles.tabText, activeTab === "CRM" && styles.tabTextActive]}>
            Khách
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem} onPress={() => changeTab("FINANCE")}>
          <Text style={[styles.tabIcon, activeTab === "FINANCE" && styles.tabIconActive]}>💰</Text>
          <Text style={[styles.tabText, activeTab === "FINANCE" && styles.tabTextActive]}>
            Doanh thu
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem} onPress={() => changeTab("ACCOUNT")}>
          <Text style={[styles.tabIcon, activeTab === "ACCOUNT" && styles.tabIconActive]}>👤</Text>
          <Text style={[styles.tabText, activeTab === "ACCOUNT" && styles.tabTextActive]}>
            Cá nhân
          </Text>
        </TouchableOpacity>
      </View>

      <Modal visible={showMenu} transparent={true} animationType="none" statusBarTranslucent={true}>
        <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={() => closeMenu()}>
          <Animated.View
            style={[
              styles.dropdownMenu,
              { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
            ]}
          >
            <TouchableOpacity
              style={styles.dropdownItemNoti}
              onPress={() => closeMenu(() => setShowNoti(true))}
            >
              <Text style={styles.dropdownItemTextNoti}>Thông báo</Text>
              {urgentOrders.length > 0 && (
                <View style={styles.dropdownNotiBadge}>
                  <Text style={styles.urgentBadgeText}>{urgentOrders.length}</Text>
                </View>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.dropdownLogoutBtn}
              onPress={() =>
                closeMenu(() => {
                  if (onLogout) onLogout();
                })
              }
            >
              <Text style={styles.dropdownLogoutText}>Đăng xuất</Text>
            </TouchableOpacity>
          </Animated.View>
        </TouchableOpacity>
      </Modal>

      <NotificationModal
        visible={showNoti}
        onClose={() => setShowNoti(false)}
        urgentOrders={urgentOrders}
      />
    </SafeAreaView>
  );
}