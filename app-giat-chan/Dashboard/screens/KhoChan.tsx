import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ScrollView, TextInput, Platform, Modal, FlatList, ActivityIndicator } from "react-native";
import { DonHangService } from "../services/DonHang";
import { TaiChinhService } from "../services/TaiChinh";
import { styles } from "../styles/globalStyles";
import BeautifulPopup from "../components/Popup";

export default function KhoChan() {
  const [statusTab, setStatusTab] = useState<"NEED_PICKUP" | "COMPLETED">("NEED_PICKUP");
  const [dateFilter, setDateFilter] = useState("ALL");
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [popup, setPopup] = useState<any>({ visible: false });
  const [selectedOrderDetail, setSelectedOrderDetail] = useState<any>(null);
  const [confirmPopup, setConfirmPopup] = useState<{ visible: boolean; orderData: any; }>({ visible: false, orderData: null });

  const fetchOrders = async () => {
    setIsLoading(true);
    const data = await DonHangService.getAllOrders(); 
    setOrders(data);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleCompleteOrder = async (orderIds: number[], totalAmount: number, customerName: string, customerPhone: string) => {
    try {
      await DonHangService.markOrdersAsCompleted(orderIds);
      await TaiChinhService.createTransaction("IN", totalAmount, `${customerName} ${customerPhone ? `(${customerPhone})` : ""}`);
      setPopup({ visible: true, type: "SUCCESS", title: "Đã Xong", message: "Đã thu tiền và trả đồ!" });
      setSearchQuery("");
      fetchOrders();
    } catch {
      setPopup({ visible: true, type: "ERROR", title: "Lỗi", message: "Có lỗi mạng khi trả hàng." });
    }
  };

  const sortedOrders = DonHangService.processOrdersForKho(orders, statusTab, dateFilter, searchQuery);

  const renderOrder = ({ item: order }: { item: any }) => {
    const { isAgent, itemArr, combinedNotesText, isUrgent } = DonHangService.parseOrderItems(order.itemsArr);

    return (
      <View style={styles.khoOrderWrapper}>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => setSelectedOrderDetail(order)}
          // Bọc style động cho viền màu Đại lý
          style={[styles.khoOrderCard, { borderColor: isAgent ? "#FDE68A" : "#E2E8F0" }]}
        >
          {/* DÒNG 1: TÊN, GIÁ & GHI CHÚ */}
          <View style={styles.khoOrderRow1}>
            <View style={styles.khoOrderInfoCol}>
              <View style={styles.khoOrderNameRow}>
                {isAgent && (
                  <View style={styles.khoAgentBadge}>
                    <Text style={styles.khoAgentBadgeText}>ĐẠI LÝ</Text>
                  </View>
                )}
                <Text style={styles.khoCustomerName} numberOfLines={1}>
                  {isAgent ? "" : "👤 "}{order.customer_name}
                </Text>
              </View>
              <Text style={styles.khoOrderDate} numberOfLines={1}>
                {`⏱ ${new Date(order.created_at).toLocaleDateString("vi-VN")}${combinedNotesText ? `  •  ${isUrgent ? "🔥 " : "📝 "}${combinedNotesText}` : ""}`}
              </Text>
            </View>
            <Text style={[styles.khoOrderPrice, { fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace" }]}>
              {`${order.total_amount.toLocaleString("vi-VN")}đ`}
            </Text>
          </View>

          <View style={styles.khoDivider} />

          {/* DÒNG 2: GIAO DIỆN TAGS 1 DÒNG */}
          <View style={styles.khoTagsRow}>
            {itemArr.slice(0, 2).map((item: string, idx: number) => (
              <View key={idx} style={styles.khoTagItem}>
                <Text style={styles.khoTagText} numberOfLines={1}>{item}</Text>
              </View>
            ))}
            {itemArr.length > 2 && (
              <View style={styles.khoTagMore}>
                <Text style={styles.khoTagMoreText}>{`+ ${itemArr.length - 2} món`}</Text>
              </View>
            )}
          </View>

          {/* DÒNG 3: ĐỊA CHỈ & NÚT TRẢ HÀNG */}
          <View style={styles.khoAddressRow}>
            <View style={styles.khoAddressCol}>
              {order.customer_phone || (order.address && !order.address.includes("mang tới")) ? (
                <Text style={styles.khoAddressText} numberOfLines={2}>
                  {order.customer_phone ? `📞 ${order.customer_phone}\n` : ""}
                  {order.address && !order.address.includes("mang tới") ? `📍 ${order.address}` : ""}
                </Text>
              ) : (
                <Text style={styles.khoAddressEmpty}>Chạm thẻ xem chi tiết</Text>
              )}
            </View>

            <View style={styles.khoActionCol}>
              {order.status !== "COMPLETED" ? (
                <TouchableOpacity
                  style={styles.khoReturnBtn}
                  onPress={(e) => {
                    e.stopPropagation();
                    setConfirmPopup({ visible: true, orderData: { ids: order.originalIds, amount: order.total_amount, name: order.customer_name, phone: order.customer_phone } });
                  }}
                >
                  <Text style={styles.khoReturnBtnText}>Trả Hàng</Text>
                </TouchableOpacity>
              ) : (
                <View style={styles.khoCompletedBtn}>
                  <Text style={styles.khoCompletedBtnText}>Đã xong</Text>
                </View>
              )}
            </View>
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.khoContainer}>
      <View style={styles.moduleHeaderTop}>
        <Text style={styles.moduleTitle}>Quản lý Kho Chăn</Text>
        <TouchableOpacity onPress={fetchOrders} style={styles.refreshBtn}>
          <Text style={{ fontSize: 18 }}>🔄</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.khoSearchWrapper}>
        <View style={styles.khoSearchBox}>
          <Text style={styles.khoSearchIcon}>🔍</Text>
          <TextInput style={styles.khoSearchInput} placeholder="Nhập SĐT, tên khách..." placeholderTextColor="#9CA3AF" value={searchQuery} onChangeText={setSearchQuery} />
          {searchQuery !== "" && (
            <TouchableOpacity onPress={() => setSearchQuery("")}><Text style={styles.khoSearchClear}>✖</Text></TouchableOpacity>
          )}
        </View>
      </View>

      {searchQuery === "" && (
        <View style={styles.khoFilterWrapper}>
          <View style={styles.khoStatusRow}>
            <TouchableOpacity style={[ styles.statusTab, { flex: 1, alignItems: "center", marginRight: 6 }, statusTab === "NEED_PICKUP" && { backgroundColor: "#DBEAFE", borderColor: "#2563EB" } ]} onPress={() => setStatusTab("NEED_PICKUP")}>
              <Text style={[ styles.statusTabText, statusTab === "NEED_PICKUP" && { color: "#2563EB" } ]}>Chưa trả khách</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[ styles.statusTab, { flex: 1, alignItems: "center", marginLeft: 6 }, statusTab === "COMPLETED" && { backgroundColor: "#F3F4F6", borderColor: "#6B7280" } ]} onPress={() => setStatusTab("COMPLETED")}>
              <Text style={[ styles.statusTabText, statusTab === "COMPLETED" && { color: "#4B5563" } ]}>Lịch sử Đã trả</Text>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.khoDateFilterContent}>
            {[ { id: "ALL", label: "Tất cả" }, { id: "TODAY", label: "Hôm nay" }, { id: "WEEK", label: "Tuần này" } ].map((t) => (
              <TouchableOpacity key={t.id} style={[styles.khoDateFilterBtn, { backgroundColor: dateFilter === t.id ? "#1F2937" : "#F3F4F6" }]} onPress={() => setDateFilter(t.id)}>
                <Text style={[styles.khoDateFilterText, { color: dateFilter === t.id ? "#FFF" : "#6B7280" }]}>{t.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {isLoading ? (
        <View style={styles.khoLoading}><ActivityIndicator size="large" color="#3B82F6" /></View>
      ) : (
        <FlatList
          style={styles.khoFlatList}
          showsVerticalScrollIndicator={false}
          data={sortedOrders}
          keyExtractor={(item, idx) => idx.toString()}
          renderItem={renderOrder}
          contentContainerStyle={styles.khoListContent}
          ListEmptyComponent={
            <View style={styles.khoListEmpty}>
              <Text style={styles.khoListEmptyIcon}>📭</Text>
              <Text style={styles.khoListEmptyText}>Không tìm thấy đồ của khách.</Text>
            </View>
          }
        />
      )}

      {/* POPUP 1: CHI TIẾT TỜ SỚ */}
      <Modal visible={!!selectedOrderDetail} animationType="slide" transparent={true} statusBarTranslucent={true}>
        <View style={styles.khoPopupOverlayBottom}>
          <TouchableOpacity style={{ position: "absolute", top: 0, bottom: 0, left: 0, right: 0 }} activeOpacity={1} onPress={() => setSelectedOrderDetail(null)} />
          <View style={styles.khoPopupBoxBottom}>
            <View style={styles.khoPopupHeader}>
              <Text style={styles.khoPopupTitle}>📄 Chi tiết lô hàng</Text>
              <TouchableOpacity onPress={() => setSelectedOrderDetail(null)} style={styles.khoPopupCloseBtn}>
                <Text style={styles.khoPopupCloseIcon}>✕</Text>
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
              {selectedOrderDetail?.itemsArr?.map((raw: string, idx: number) => {
                const cleanedText = raw.replace(/\[ĐIỂM THU\] /g, "").replace(/\[KHÁCH LẺ\] /g, "");
                return (
                  <View key={idx} style={[styles.khoPopupItemRow, { borderBottomWidth: idx === selectedOrderDetail.itemsArr.length - 1 ? 0 : 1, borderBottomColor: "#E2E8F0" }]}>
                    <Text style={styles.khoPopupItemText}>{cleanedText}</Text>
                  </View>
                );
              })}
            </ScrollView>
            <TouchableOpacity style={styles.khoPopupActionBtn} onPress={() => setSelectedOrderDetail(null)}>
              <Text style={styles.khoPopupActionText}>Đóng lại</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* POPUP 2: XÁC NHẬN TRẢ HÀNG */}
      <Modal visible={confirmPopup.visible} animationType="fade" transparent={true} statusBarTranslucent={true}>
        <View style={styles.khoConfirmOverlay}>
          <View style={styles.khoConfirmBox}>
            <Text style={styles.khoConfirmIcon}>📦</Text>
            <Text style={styles.khoConfirmTitle}>Xác nhận Trả Hàng?</Text>
            <Text style={styles.khoConfirmDesc}>Bạn có chắc chắn muốn trả lô hàng này và thu tiền không?</Text>
            <View style={styles.khoConfirmActionRow}>
              <TouchableOpacity style={styles.khoConfirmBtnNo} onPress={() => setConfirmPopup({ visible: false, orderData: null })}>
                <Text style={styles.khoConfirmBtnNoText}>Không</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.khoConfirmBtnYes}
                onPress={() => {
                  const { ids, amount, name, phone } = confirmPopup.orderData;
                  handleCompleteOrder(ids, amount, name, phone);
                  setConfirmPopup({ visible: false, orderData: null });
                }}
              >
                <Text style={styles.khoConfirmBtnYesText}>Có, Trả luôn</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <BeautifulPopup {...popup} onClose={() => setPopup({ ...popup, visible: false })} />
    </View>
  );
}