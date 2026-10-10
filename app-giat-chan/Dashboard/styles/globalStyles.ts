import { StyleSheet, Platform, Dimensions } from "react-native";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const isSmallScreen = SCREEN_WIDTH < 375; 

export const styles = StyleSheet.create({
  // ==========================================
  // 1. CÁC STYLE DÙNG CHUNG (GLOBAL/COMMON)
  // ==========================================
  
  // --- Khung bố cục cơ bản ---
  container: { flex: 1, backgroundColor: "#F4F6F9" },
  body: { flex: 1, paddingHorizontal: 15 },
  section: { marginBottom: 25 },
  sectionTitle: { fontSize: isSmallScreen ? 16 : 18, fontWeight: "bold", color: "#111827", marginBottom: 15 },
  
  // --- Form & Ô nhập liệu (Input) chung ---
  inputGroup: { width: "100%", marginBottom: 15 },
  inputLabel: { fontSize: 13, fontWeight: "bold", color: "#4B5563", marginBottom: 8, marginLeft: 4 },
  input: { backgroundColor: "#F9FAFB", borderWidth: 1, borderColor: "#E5E7EB", borderRadius: 6, padding: isSmallScreen ? 12 : 15, fontSize: isSmallScreen ? 14 : 15, color: "#1F2937", marginBottom: 10 },
  formCard: { backgroundColor: "#FFF", padding: isSmallScreen ? 15 : 20, borderRadius: 10, marginBottom: 15, elevation: 2 },
  formTitle: { fontSize: 16, fontWeight: "bold", color: "#111827", marginBottom: 15 },
  
  // --- Header chung của các màn hình con ---
  moduleHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: "#FFF", paddingTop: Platform.OS === "ios" ? 50 : 40, paddingBottom: 15, paddingHorizontal: 20, borderBottomWidth: 1, borderBottomColor: "#E5E7EB" },
  moduleHeaderTop: { backgroundColor: "#FFF", paddingTop: Platform.OS === "ios" ? 50 : 40, paddingBottom: 15, paddingHorizontal: 20, borderBottomWidth: 1, borderBottomColor: "#E5E7EB", flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  moduleTitle: { fontSize: isSmallScreen ? 16 : 18, fontWeight: "bold", color: "#111827" },
  backBtn: { padding: 10, backgroundColor: "#F3F4F6", borderRadius: 6 }, 
  backBtnText: { color: "#1F2937", fontWeight: "700", fontSize: 14 },
  refreshBtn: { padding: 8, backgroundColor: "#F3F4F6", borderRadius: 6 },

  // --- Nút bấm (Button) chung ---
  submitBtn: { flex: 1, backgroundColor: "#10B981", paddingVertical: 15, paddingHorizontal: 30, borderRadius: 8, alignItems: "center" },
  submitBtnText: { color: "#FFF", fontSize: 16, fontWeight: "900" },
  
  // --- Component Đếm Số Lượng (+ / -) chung ---
  qtyBox: { flexDirection: "row", alignItems: "center", backgroundColor: "#F3F4F6", borderRadius: 6 },
  qtyBtn: { paddingHorizontal: 15, paddingVertical: 10 },
  qtyIcon: { fontSize: 18, fontWeight: "bold", color: "#3B82F6" },
  qtyNumber: { fontSize: 18, fontWeight: "900", color: "#111827", minWidth: 30, textAlign: "center" },
  
  // --- Thanh chứa Nút Lưu/Thanh Toán dính đáy chung ---
  bottomCheckout: { flexDirection: "row", alignItems: "center", padding: 20, backgroundColor: "#FFF", borderTopWidth: 1, borderTopColor: "#E5E7EB", paddingBottom: Platform.OS === "ios" ? 30 : 20 },

  // ==========================================
  // 2. MODAL & POPUP (LỚP PHỦ MÀN HÌNH CHUNG)
  // ==========================================

  // --- Nền mờ phía sau Popup ---
  modalOverlayFull: { flex: 1, backgroundColor: "rgba(15, 23, 42, 0.75)", justifyContent: "center", alignItems: "center", padding: 20 },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0, 0, 0, 0.6)", justifyContent: "center", alignItems: "center", padding: 20 },
  
  // --- Khung Popup Trắng ở giữa ---
  modalContentForm: { backgroundColor: "#FFF", borderRadius: 16, padding: isSmallScreen ? 20 : 25, width: "100%", maxWidth: 420, alignItems: "center", shadowColor: "#000", shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.25, shadowRadius: 20, elevation: 15 },
  simplePopupBox: { backgroundColor: "#FFF", borderRadius: 12, padding: isSmallScreen ? 20 : 25, width: isSmallScreen ? "95%" : "85%", alignItems: "center", elevation: 10 },
  
  // --- Các chi tiết bên trong Popup ---
  modalHeaderIcon: { width: 80, height: 80, borderRadius: 16, justifyContent: "center", alignItems: "center", marginBottom: 15, borderWidth: 6, borderColor: "#FFF", marginTop: -60, shadowColor: "#000", shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.15, shadowRadius: 10, elevation: 6 },
  modalTitle: { fontSize: isSmallScreen ? 20 : 24, fontWeight: "900", color: "#111827", marginBottom: 5, textAlign: "center" },
  modalSubTitle: { fontSize: 14, color: "#6B7280", marginBottom: 25, textAlign: "center" },
  popupTitle: { fontSize: isSmallScreen ? 18 : 20, fontWeight: "bold", color: "#111827", marginBottom: 10, textAlign: "center" },
  popupSubTitle: { fontSize: isSmallScreen ? 13 : 15, color: "#4B5563", marginBottom: 25, textAlign: "center", lineHeight: 22 },
  modalInput: { backgroundColor: "#F9FAFB", borderWidth: 1, borderColor: "#E5E7EB", borderRadius: 8, padding: isSmallScreen ? 12 : 16, fontSize: isSmallScreen ? 14 : 16, color: "#1F2937", fontWeight: "600" },
  modalActionBtn: { flex: 1, paddingVertical: isSmallScreen ? 15 : 18, borderRadius: 8, alignItems: "center" },
  popupBtn: { width: "100%", paddingVertical: isSmallScreen ? 12 : 15,  borderRadius: 8, alignItems: "center" },
  popupBtnText: { color: "#FFF", fontSize: 16, fontWeight: "bold" },
  
  // --- Các Tab Nút (Button Tabs) trong Popup ---
  typeBtn: { flex: 1, paddingVertical: 12, alignItems: "center", borderRadius: 6, backgroundColor: "#F3F4F6", borderWidth: 1, borderColor: "transparent" },
  typeBtnActive: { backgroundColor: "#EFF6FF", borderColor: "#BFDBFE" },
  typeBtnInactive: { flex: 1, paddingVertical: 14, alignItems: "center", borderRadius: 8, backgroundColor: "#F9FAFB", borderWidth: 2, borderColor: "#F3F4F6" },
  typeBtnIn: { backgroundColor: "#D1FAE5", borderColor: "#10B981" },
  typeBtnOut: { backgroundColor: "#FEE2E2", borderColor: "#EF4444" },
  typeText: { fontWeight: "bold", color: "#6B7280" },

  // ==========================================
  // 3. ĐĂNG NHẬP (DangNhap.tsx)
  // ==========================================
  
  // --- Bố cục tổng ---
  dnSafeArea: { flex: 1, backgroundColor: "#F8FAFC" },
  dnKeyboardContainer: { flex: 1, justifyContent: "center", paddingHorizontal: 24 },
  
  // --- Khối Logo và Tiêu đề ---
  dnHeaderContainer: { alignItems: "center", marginBottom: 40 },
  dnLogoCircle: { width: 80, height: 80, backgroundColor: "#DBEAFE", borderRadius: 40, justifyContent: "center", alignItems: "center", marginBottom: 16 },
  dnLogoIcon: { fontSize: 40 },
  dnTitle: { fontSize: 28, fontWeight: "900", color: "#0F172A", marginBottom: 8 },
  dnSubTitle: { fontSize: 15, color: "#64748B" },
  
  // --- Khung chứa Form Đăng nhập ---
  dnFormCard: { backgroundColor: "#FFF", padding: 24, borderRadius: 24, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 12, elevation: 2 },
  dnErrorBox: { backgroundColor: "#FEE2E2", padding: 12, borderRadius: 8, marginBottom: 16 },
  dnErrorText: { color: "#EF4444", fontSize: 13, fontWeight: "600", textAlign: "center" },
  dnInputLabel: { fontSize: 13, fontWeight: "700", color: "#334155", marginBottom: 8 },
  dnInputStandard: { backgroundColor: "#F1F5F9", borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, fontSize: 15, color: "#0F172A", marginBottom: 20 },
  dnInputGroup: { flexDirection: "row", alignItems: "center", backgroundColor: "#F1F5F9", borderRadius: 12, marginBottom: 16 },
  dnInputFlex: { flex: 1, paddingHorizontal: 16, paddingVertical: 14, fontSize: 15, color: "#0F172A" },
  dnEyeBtn: { paddingHorizontal: 15 },
  dnRememberRow: { flexDirection: "row", alignItems: "center", marginBottom: 24, alignSelf: "flex-start" },
  dnRememberText: { marginLeft: 8, fontSize: 14, color: "#475569", fontWeight: "600" },
  dnLoginBtn: { backgroundColor: "#2563EB", borderRadius: 14, paddingVertical: 16, alignItems: "center", flexDirection: "row", justifyContent: "center" },
  dnLoginBtnText: { color: "#FFF", fontSize: 16, fontWeight: "800" },

  // ==========================================
  // 4. TRANG CHỦ (TrangChu.tsx)
  // ==========================================

  // --- Thanh Header xanh biển ---
  header: { backgroundColor: "#1E3A8A", paddingTop: Platform.OS === "ios" ? 50 : 40, paddingHorizontal: 20, paddingBottom: 40, borderBottomLeftRadius: 16, borderBottomRightRadius: 16 },
  headerTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  userInfo: { flexDirection: "row", alignItems: "center" },
  avatar: { width: 45, height: 45, borderRadius: 12, backgroundColor: "#FFF", justifyContent: "center", alignItems: "center", marginRight: 12 },
  avatarText: { color: "#1E3A8A", fontSize: 20, fontWeight: "bold" },
  greeting: { color: "#93C5FD", fontSize: 13, marginBottom: 2 },
  userName: { color: "#FFF", fontSize: 18, fontWeight: "bold" },
  
  // --- 2 Thẻ Tổng quan (Đơn/Doanh thu) lơ lửng ---
  statsContainer: { flexDirection: "row", gap: 15, marginBottom: 25, marginTop: 15, zIndex: 10, elevation: 5 },
  statCard: { flex: 1, backgroundColor: "#FFF", padding: isSmallScreen ? 12 : 15, borderRadius: 10, shadowColor: "#000", shadowOpacity: 0.08, shadowRadius: 8, elevation: 3 },
  statLabel: { color: "#6B7280", fontSize: isSmallScreen ? 11 : 13, fontWeight: "600", marginBottom: 8 },
  statValue: { color: "#1F2937", fontSize: isSmallScreen ? 20 : 24, fontWeight: "900" },
  
  // --- Lưới 6 nút chức năng chính ---
  gridItemWrapper: { flexBasis: '33.3%', padding: 5 },
  gridButton: { backgroundColor: "#FFF", paddingVertical: 16, borderRadius: 16, alignItems: "center", elevation: 2, borderWidth: 1, borderColor: '#F3F4F6' },
  iconContainer: { width: 45, height: 45, borderRadius: 8, justifyContent: "center", alignItems: "center", marginBottom: 8 },
  gridIcon: { fontSize: 24 },
  gridText: { fontSize: 11, color: "#4B5563", textAlign: "center", fontWeight: "bold" },
  
  // --- Báo cáo Số lượng sản phẩm (Progress Bar) ---
  qtyHeaderBox: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, paddingHorizontal: 4 },
  qtyBadge: { backgroundColor: '#DBEAFE', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
  qtyBadgeText: { fontSize: 13, color: '#1D4ED8', fontWeight: '900' },
  qtyEmptyText: { width: '100%', textAlign: 'center', paddingVertical: 10, color: '#94A3B8', fontStyle: 'italic' },
  progressBarWrapper: { flexDirection: 'row', height: 16, borderRadius: 8, overflow: 'hidden', marginBottom: 24, backgroundColor: '#F8FAFC' },
  legendContainer: { flexDirection: 'row', flexWrap: 'wrap' },
  legendItem: { flexDirection: 'row', alignItems: 'flex-start', width: '50%', marginBottom: 16 },
  legendColorBox: { width: 14, height: 14, borderRadius: 4, marginRight: 10, marginTop: 2 },
  legendTextContainer: { flex: 1, paddingRight: 8 },
  legendName: { fontSize: 13, color: '#475569', fontWeight: 'bold', marginBottom: 2 },
  legendQtyValue: { fontSize: 16, color: '#0F172A', fontWeight: '900' },
  legendQtyLabel: { fontSize: 12, color: '#94A3B8', fontWeight: '600' },
  
  // --- Menu 3 Gạch & Thông Báo (Góc phải trên) ---
  menuButtonContainer: { flexDirection: 'row', alignItems: 'center' },
  menuButton: { position: 'relative', padding: 5 },
  urgentBadgeContainer: { position: 'absolute', top: 2, right: 2, backgroundColor: '#EF4444', minWidth: 20, height: 20, borderRadius: 10, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#1E3A8A', paddingHorizontal: 4 },
  urgentBadgeText: { color: '#FFF', fontSize: 10, fontWeight: 'bold' },
  dropdownMenu: { position: 'absolute', top: 85, right: 20, width: 110, backgroundColor: '#FFF', borderRadius: 12, elevation: 8, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10, shadowOffset: { width: 0, height: 4 } },
  dropdownItemNoti: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  dropdownItemTextNoti: { fontSize: 14, color: '#0F172A', fontWeight: 'bold', flex: 1 },
  dropdownNotiBadge: { backgroundColor: '#EF4444', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 10 },
  dropdownLogoutBtn: { paddingVertical: 14, paddingHorizontal: 16 },
  dropdownLogoutText: { fontSize: 14, color: '#EF4444', fontWeight: 'bold' },

  // --- Thanh Điều Hướng Dưới Cùng (Bottom Tab Bar) ---
  bottomBar: { flexDirection: "row", justifyContent: "space-around", backgroundColor: "#FFF", paddingBottom: Platform.OS === "ios" ? 25 : 15, paddingTop: 10, borderTopWidth: 1, borderTopColor: "#E5E7EB", position: "absolute", bottom: 0, width: "100%", alignItems: "center", elevation: 15, shadowColor: "#000", shadowOffset: { width: 0, height: -3 }, shadowOpacity: 0.1, shadowRadius: 5 },
  tabItem: { alignItems: "center", justifyContent: "center", flex: 1 },
  tabIcon: { fontSize: 24, opacity: 0.4 },
  tabIconActive: { opacity: 1 },
  tabText: { fontSize: 11, color: "#9CA3AF", marginTop: 4, fontWeight: "600" },
  tabTextActive: { color: "#1E3A8A" },

  // ==========================================
  // 5. KHO CHĂN (KhoChan.tsx)
  // ==========================================

  khoContainer: { flex: 1, backgroundColor: "#F4F6F9", width: "100%" },
  
  // --- Thẻ Đơn Hàng (Order Card) ---
  khoOrderWrapper: { width: "100%", paddingHorizontal: 16, marginBottom: 14 },
  khoOrderCard: { width: "100%", backgroundColor: "#FFFFFF", borderRadius: 12, padding: 12, borderWidth: 1, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 2 },
  khoOrderRow1: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 },
  khoOrderInfoCol: { flex: 1, paddingRight: 8 },
  khoOrderNameRow: { flexDirection: "row", alignItems: "center", marginBottom: 2 },
  khoAgentBadge: { backgroundColor: "#FEF3C7", paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, marginRight: 6 },
  khoAgentBadgeText: { fontSize: 9, fontWeight: "900", color: "#D97706" },
  khoCustomerName: { flexShrink: 1, fontWeight: "900", color: "#0F172A", fontSize: 15, letterSpacing: -0.2 },
  khoOrderDate: { fontSize: 11, color: "#94A3B8", fontWeight: "600" },
  khoOrderPrice: { fontSize: 16, fontWeight: "900", color: "#E11D48", textAlign: "right" },
  khoDivider: { height: 1, backgroundColor: "#F1F5F9", marginBottom: 6 },
  khoTagsRow: { flexDirection: "row", alignItems: "center", overflow: "hidden" },
  khoTagItem: { backgroundColor: "#F8FAFC", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, borderWidth: 1, borderColor: "#E2E8F0", marginRight: 6 },
  khoTagText: { fontSize: 12, color: "#334155", fontWeight: "700" },
  khoTagMore: { backgroundColor: "#DBEAFE", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, borderWidth: 1, borderColor: "#BFDBFE" },
  khoTagMoreText: { fontSize: 12, color: "#1D4ED8", fontWeight: "900" },
  khoAddressRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end", marginTop: 6, paddingTop: 8, borderTopWidth: 1, borderTopColor: "#F8FAFC" },
  khoAddressCol: { flex: 1, paddingRight: 10 },
  khoAddressText: { fontSize: 12, color: "#64748B", fontWeight: "600", lineHeight: 18 },
  khoAddressEmpty: { fontSize: 11, color: "#94A3B8", fontStyle: "italic" },
  khoActionCol: { minWidth: 80 },
  khoReturnBtn: { backgroundColor: "#0F172A", paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8, alignItems: "center" },
  khoReturnBtnText: { color: "#FFF", fontSize: 12, fontWeight: "900" },
  khoCompletedBtn: { backgroundColor: "#F1F5F9", paddingVertical: 6, paddingHorizontal: 12, borderRadius: 8, alignItems: "center" },
  khoCompletedBtnText: { color: "#94A3B8", fontSize: 12, fontWeight: "900" },

  // --- Khung Ô Tìm Kiếm ---
  khoSearchWrapper: { width: "100%", paddingHorizontal: 16, paddingVertical: 12, backgroundColor: "#FFF", borderBottomWidth: 1, borderColor: "#E5E7EB" },
  khoSearchBox: { flexDirection: "row", alignItems: "center", backgroundColor: "#F3F4F6", borderRadius: 12, paddingHorizontal: 12 },
  khoSearchIcon: { fontSize: 18, marginRight: 10 },
  khoSearchInput: { flex: 1, paddingVertical: 10, fontSize: 15 },
  khoSearchClear: { color: "#9CA3AF", fontSize: 18, padding: 5 },
  
  // --- Bộ lọc (Trạng thái, Ngày tháng) ---
  khoFilterWrapper: { width: "100%", backgroundColor: "#FFF", paddingBottom: 10 },
  khoStatusRow: { flexDirection: "row", paddingHorizontal: 16, marginTop: 12, justifyContent: "space-between" },
  khoDateFilterContent: { paddingHorizontal: 16, marginTop: 14 },
  khoDateFilterBtn: { marginRight: 10, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  khoDateFilterText: { fontSize: 13, fontWeight: "bold" },

  // --- Danh Sách Cuộn (FlatList) ---
  khoLoading: { flex: 1, justifyContent: "center", alignItems: "center" },
  khoFlatList: { flex: 1, width: "100%" },
  khoListContent: { paddingTop: 14, paddingBottom: 100 },
  khoListEmpty: { alignItems: "center", marginTop: 50 },
  khoListEmptyIcon: { fontSize: 60, opacity: 0.5 },
  khoListEmptyText: { color: "#9CA3AF", marginTop: 15, fontSize: 16 },

  // --- Popup 1: Chi Tiết Đơn Hàng Mở Từ Đáy ---
  khoPopupOverlayBottom: { flex: 1, backgroundColor: "rgba(15, 23, 42, 0.65)", justifyContent: "flex-end" },
  khoPopupBoxBottom: { backgroundColor: "#FFF", borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, maxHeight: "85%", zIndex: 10 },
  khoPopupHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
  khoPopupTitle: { fontSize: 20, fontWeight: "900", color: "#0F172A" },
  khoPopupCloseBtn: { backgroundColor: "#F1F5F9", width: 34, height: 34, borderRadius: 17, alignItems: "center", justifyContent: "center" },
  khoPopupCloseIcon: { fontSize: 14, color: "#64748B", fontWeight: "bold" },
  khoPopupItemRow: { marginBottom: 16, paddingBottom: 16 },
  khoPopupItemText: { fontSize: 15, color: "#334155", lineHeight: 26, fontWeight: "600" },
  khoPopupActionBtn: { backgroundColor: "#0F172A", paddingVertical: 16, borderRadius: 16, alignItems: "center", marginTop: 10 },
  khoPopupActionText: { color: "#FFF", fontSize: 16, fontWeight: "900" },

  // --- Popup 2: Xác Nhận Trả Hàng (Giữa màn hình) ---
  khoConfirmOverlay: { flex: 1, backgroundColor: "rgba(0, 0, 0, 0.6)", justifyContent: "center", alignItems: "center", padding: 20 },
  khoConfirmBox: { backgroundColor: "#FFF", borderRadius: 24, padding: 25, width: "100%", maxWidth: 340, alignItems: "center", elevation: 10 },
  khoConfirmIcon: { fontSize: 50, marginBottom: 15 },
  khoConfirmTitle: { fontSize: 20, fontWeight: "900", color: "#111827", marginBottom: 10, textAlign: "center" },
  khoConfirmDesc: { fontSize: 15, color: "#4B5563", textAlign: "center", marginBottom: 25, lineHeight: 22 },
  khoConfirmActionRow: { flexDirection: "row", gap: 12, width: "100%" },
  khoConfirmBtnNo: { flex: 1, backgroundColor: "#F3F4F6", paddingVertical: 14, borderRadius: 12, alignItems: "center" },
  khoConfirmBtnNoText: { color: "#4B5563", fontWeight: "bold", fontSize: 16 },
  khoConfirmBtnYes: { flex: 1, backgroundColor: "#10B981", paddingVertical: 14, borderRadius: 12, alignItems: "center" },
  khoConfirmBtnYesText: { color: "#FFF", fontWeight: "bold", fontSize: 16 },

  // ==========================================
  // 6. KHÁCH LẺ (KhachLe.tsx)
  // ==========================================

  // --- Form Thông Tin & Danh sách Khách gợi ý ---
  khachLeInputGroup: { zIndex: 100, elevation: 100, position: 'relative' },
  khachLeInputRelative: { position: 'relative', zIndex: 2 },
  khachLeInputName: { height: 42, paddingVertical: 8, paddingRight: 40, marginBottom: 12 },
  khachLeClearBtn: { position: 'absolute', right: 0, top: 0, bottom: 12, width: 45, justifyContent: 'center', alignItems: 'center' },
  khachLeSuggestionOverlay: { position: 'absolute', top: -500, bottom: -500, left: -500, right: -500, zIndex: 1 },
  khachLeSuggestionBox: { backgroundColor: '#FFF', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 8, maxHeight: 200, position: 'absolute', top: 45, left: 0, right: 0, zIndex: 3, elevation: 20 },
  khachLeSuggestionList: { maxHeight: 200 },
  khachLeSuggestionItem: { padding: 12 },
  khachLeSuggestionName: { fontWeight: "bold", color: "#1F2937" },
  khachLeSuggestionSub: { fontSize: 12, color: "#6B7280", marginTop: 4 },
  
  // --- Khu Vực Thêm Dịch Vụ ---
  khachLeServiceHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  khachLeAddProductBtn: { backgroundColor: '#DBEAFE', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  khachLeAddProductText: { color: '#1D4ED8', fontWeight: 'bold', fontSize: 13 },
  khachLeLoadingText: { color: "#9CA3AF", fontStyle: "italic", marginBottom: 10 },
  khachLeServiceGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  khachLeEmptyServiceBox: { alignItems: 'center', padding: 20, backgroundColor: '#F9FAFB', borderRadius: 12, borderWidth: 1, borderColor: '#E5E7EB', borderStyle: 'dashed' },
  khachLeEmptyServiceText: { color: '#6B7280', fontWeight: '600' },
  
  // --- Ghi Chú Thông Minh ---
  khachLeNoteCard: { backgroundColor: '#FFF', borderRadius: 20, padding: 20, marginBottom: 20, elevation: 2, zIndex: 20 },
  khachLeNoteTitle: { fontSize: 16, fontWeight: 'bold', color: '#0F172A', marginBottom: 15 },
  khachLeNoteInputWrapper: { position: 'relative', zIndex: 100 },
  khachLeNoteInput: { backgroundColor: '#F8FAFC', borderWidth: 1, borderRadius: 12, padding: 15, minHeight: 80, textAlignVertical: 'top', fontSize: 15 },
  khachLeNoteSuggestBox: { position: 'absolute', top: '100%', left: 0, right: 0, backgroundColor: '#FFF', borderRadius: 12, marginTop: 5, elevation: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, borderWidth: 1, borderColor: '#E2E8F0' },
  khachLeNoteSuggestItem: { paddingVertical: 12, paddingHorizontal: 15, flexDirection: 'row', alignItems: 'center' },
  khachLeNoteSuggestIcon: { fontSize: 16, marginRight: 10 },
  khachLeNoteSuggestText: { color: '#1E40AF', fontSize: 15, fontWeight: 'bold' },
  
  // --- Popup Lọc Sản Phẩm (Picker) ---
  khachLePickerOverlay: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.65)', justifyContent: 'flex-end' },
  khachLePickerBox: { backgroundColor: '#FFF', borderTopLeftRadius: 28, borderTopRightRadius: 28, height: '85%', padding: 20, paddingBottom: 40, zIndex: 10 },
  khachLePickerHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15, paddingBottom: 15, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  khachLePickerTitle: { fontSize: 18, fontWeight: '900', color: '#0F172A' },
  khachLePickerDoneBtn: { backgroundColor: '#10B981', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 12 },
  khachLePickerDoneText: { color: '#FFF', fontWeight: 'bold', fontSize: 15 },
  khachLePickerSearchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', borderRadius: 12, paddingHorizontal: 15, paddingVertical: 10, marginBottom: 15, borderWidth: 1, borderColor: '#E2E8F0' },
  khachLePickerSearchIcon: { fontSize: 16, marginRight: 10 },
  khachLePickerSearchInput: { flex: 1, fontSize: 15, color: '#0F172A', padding: 0 },
  khachLePickerSearchClearWrap: { padding: 4 },
  khachLePickerSearchClearIcon: { fontSize: 16, color: '#94A3B8', fontWeight: 'bold' },
  khachLePickerScrollContent: { paddingBottom: 50 },

  // ==========================================
  // 7. ĐẠI LÝ (DaiLy.tsx)
  // ==========================================

  // --- Form & Danh sách Khách gợi ý ---
  dlInputGroup: { zIndex: 100, elevation: 100, position: 'relative' },
  dlInputRelative: { position: 'relative', zIndex: 2 },
  dlInputName: { height: 42, paddingVertical: 8, paddingRight: 40, marginBottom: 12 },
  dlClearBtn: { position: 'absolute', right: 0, top: 0, bottom: 10, width: 45, justifyContent: 'center', alignItems: 'center' },
  dlSuggestionOverlay: { position: 'absolute', top: -500, bottom: -500, left: -500, right: -500, zIndex: 1 },
  dlSuggestionBox: { backgroundColor: '#FFF', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 8, maxHeight: 200, position: 'absolute', top: 55, left: 0, right: 0, zIndex: 3, elevation: 20 },
  dlSuggestionList: { maxHeight: 200 },
  dlSuggestionItem: { padding: 12 },
  dlSuggestionName: { fontWeight: 'bold', color: '#1F2937' },
  dlSuggestionSub: { fontSize: 12, color: '#6B7280', marginTop: 4 },
  
  // --- Thẻ Thông tin từng Khách hàng bên trong Lô ---
  dlHouseCard: { backgroundColor: "#FFF", padding: 15, borderRadius: 16, marginBottom: 15, elevation: 2, borderWidth: 1, borderColor: '#E5E7EB' },
  dlHouseHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  dlHouseTitle: { fontSize: 16, fontWeight: '900', color: '#1E3A8A' },
  dlHouseActionRow: { flexDirection: 'row', alignItems: 'center', gap: 15 },
  dlHouseAddProductBtn: { backgroundColor: '#DBEAFE', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6 },
  dlHouseAddProductText: { color: '#1D4ED8', fontWeight: 'bold', fontSize: 12 },
  dlHouseDeleteText: { color: '#EF4444', fontWeight: 'bold', fontSize: 12 },
  dlHouseNoteInput: { backgroundColor: '#F9FAFB', padding: 10, borderRadius: 8, borderWidth: 1, borderColor: '#D1D5DB', marginBottom: 15, fontSize: 14 },
  dlLoadingText: { color: '#9CA3AF', fontStyle: 'italic', marginBottom: 10 },
  dlServiceGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  dlEmptyServiceBox: { alignItems: 'center', padding: 15, backgroundColor: '#F9FAFB', borderRadius: 12, borderWidth: 1, borderColor: '#E5E7EB', borderStyle: 'dashed' },
  dlEmptyServiceText: { color: '#9CA3AF', fontWeight: '600' },
  
  // --- Nút Thêm Khách Hàng (Tạo thẻ House mới) ---
  dlAddHouseBtn: { backgroundColor: '#DBEAFE', padding: 15, borderRadius: 12, alignItems: 'center', marginBottom: 20, borderWidth: 1, borderColor: '#BFDBFE', borderStyle: 'dashed' },
  dlAddHouseText: { color: '#1D4ED8', fontWeight: '900', fontSize: 15 },
  
  // --- Component Đếm Số Lượng Sản Phẩm (+ / -) ---
  dlItemCounterContainer: { width: '48%', padding: 10, borderRadius: 12, marginBottom: 12, borderWidth: 1 },
  dlItemCounterLabel: { fontSize: 13, fontWeight: "bold", marginBottom: 8, minHeight: 36 },
  dlItemCounterControl: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: "#FFF", borderRadius: 8, borderWidth: 1 },
  dlItemCounterBtn: { paddingHorizontal: 12, paddingVertical: 6 },
  dlItemCounterMinusText: { fontSize: 16, fontWeight: 'bold' },
  dlItemCounterPlusText: { fontSize: 16, color: "#2563EB", fontWeight: 'bold' },
  dlItemCounterValueText: { fontSize: 15, fontWeight: "900" },
  
  // --- Ghi chú chung (Toàn Lô) ---
  dlNoteCard: { backgroundColor: '#FFF', borderRadius: 20, padding: 20, marginBottom: 20, elevation: 2 },
  dlNoteTitle: { fontSize: 16, fontWeight: 'bold', color: '#0F172A', marginBottom: 15 },
  dlNoteInputWrapper: { position: 'relative', zIndex: 100 },
  dlNoteInput: { backgroundColor: '#F8FAFC', borderWidth: 1, borderRadius: 12, padding: 15, minHeight: 80, textAlignVertical: 'top', fontSize: 15 },
  dlNoteSuggestBox: { position: 'absolute', top: '100%', left: 0, right: 0, backgroundColor: '#FFF', borderRadius: 12, marginTop: 5, elevation: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, borderWidth: 1, borderColor: '#E2E8F0' },
  dlNoteSuggestItem: { paddingVertical: 12, paddingHorizontal: 15, flexDirection: 'row', alignItems: 'center' },
  dlNoteSuggestIcon: { fontSize: 16, marginRight: 10 },
  dlNoteSuggestText: { color: '#1E40AF', fontSize: 15, fontWeight: 'bold' },
  
  // --- Thanh Thanh Toán Tổng ---
  dlCheckoutBar: { flexDirection: "row", alignItems: "center", paddingHorizontal: 15, paddingTop: 15, backgroundColor: "#FFF", borderTopWidth: 1, borderTopColor: "#E5E7EB" },
  dlCheckoutCol: { flex: 1, paddingRight: 10 },
  dlCheckoutLabel: { color: "#6B7280", fontSize: 12, fontWeight: "bold" },
  dlCheckoutTotal: { color: "#D97706", fontSize: 22, fontWeight: "900" },
  dlSubmitBtn: { flex: 1.2, backgroundColor: "#D97706", paddingVertical: 14, paddingHorizontal: 10, borderRadius: 12, alignItems: "center", justifyContent: 'center' },
  dlSubmitBtnText: { color: "#FFF", fontSize: 15, fontWeight: "900" },
  
  // --- Popup Chọn Đồ Cho Từng Khách ---
  dlPickerOverlay: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.65)', justifyContent: 'flex-end' },
  dlPickerBox: { backgroundColor: '#FFF', borderTopLeftRadius: 28, borderTopRightRadius: 28, height: '85%', padding: 20, paddingBottom: 40, zIndex: 10 },
  dlPickerHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15, paddingBottom: 15, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  dlPickerTitle: { fontSize: 18, fontWeight: '900', color: '#0F172A' },
  dlPickerDoneBtn: { backgroundColor: '#10B981', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 12 },
  dlPickerDoneText: { color: '#FFF', fontWeight: 'bold', fontSize: 15 },
  dlPickerSearchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', borderRadius: 12, paddingHorizontal: 15, paddingVertical: 10, marginBottom: 15, borderWidth: 1, borderColor: '#E2E8F0' },
  dlPickerSearchIcon: { fontSize: 16, marginRight: 10 },
  dlPickerSearchInput: { flex: 1, fontSize: 15, color: '#0F172A', padding: 0 },
  dlPickerSearchClearWrap: { padding: 4 },
  dlPickerSearchClearIcon: { fontSize: 16, color: '#94A3B8', fontWeight: 'bold' },
  dlPickerGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', paddingBottom: 50 },

  // ==========================================
  // 8. CRM (CRM.tsx)
  // ==========================================
  
  // --- Ô Tìm Kiếm Khách Hàng Cơ Bản ---
  crmSearchWrapper: { paddingHorizontal: 15, paddingTop: 15, paddingBottom: 5 },
  crmSearchBoxMain: { paddingVertical: 8, minHeight: 45, borderRadius: 25 },
  crmSearchIconMain: { fontSize: 16, marginRight: 8 },
  crmSearchInputMain: { flex: 1, fontSize: 14, color: "#1F2937", padding: 0 },
  crmSearchBox: { flexDirection: "row", alignItems: "center", backgroundColor: "#FFF", paddingHorizontal: 15, paddingVertical: 12, borderRadius: 8, borderWidth: 1, borderColor: "#E5E7EB" },

  // --- Danh Sách Khách Hàng (FlatList) ---
  crmListContent: { padding: 15, paddingBottom: 100 },
  crmListHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15, paddingHorizontal: 5 },
  crmTotalText: { color: "#6B7280", fontWeight: "bold", flex: 1 },
  crmLocFilterBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#E2E8F0', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  crmLocFilterText: { fontSize: 12, color: '#334155', fontWeight: 'bold', marginRight: 4 },
  crmLocFilterIcon: { fontSize: 10 },
  
  // --- Thẻ Khách Hàng (Từng Item) ---
  crmCard: { backgroundColor: "#FFF", borderRadius: 10, padding: isSmallScreen ? 12 : 16, marginBottom: 15, elevation: 3 },
  crmCardItem: { paddingBottom: 15 },
  crmHeader: { flexDirection: "row", alignItems: "center" },
  crmAvatar: { width: 50, height: 50, borderRadius: 12, backgroundColor: "#DBEAFE", justifyContent: "center", alignItems: "center", marginRight: 15 },
  crmAvatarText: { fontSize: 22, fontWeight: "900", color: "#1D4ED8" },
  crmAgentAvatar: { backgroundColor: "#FEF3C7" },
  crmAgentAvatarText: { color: "#D97706" },
  crmCusInfoCol: { flex: 1, paddingRight: 8 },
  crmCusNameRow: { flexDirection: "row", alignItems: "center", flexWrap: "wrap", rowGap: 4, columnGap: 8 },
  crmName: { fontSize: isSmallScreen ? 14 : 16, fontWeight: "900", color: "#111827" },
  crmCusNameText: { flexShrink: 1 },
  crmBadgeAgent: { backgroundColor: "#FEF3C7", paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4, borderWidth: 1, borderColor: "#FDE68A" },
  crmBadgeTextAgent: { color: "#D97706", fontSize: 10, fontWeight: "900" },
  crmBadgeVip: { backgroundColor: "#FEE2E2", paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4, borderWidth: 1, borderColor: "#FECACA" },
  crmBadgeTextVip: { color: "#EF4444", fontSize: 10, fontWeight: "900" },
  crmPhone: { fontSize: isSmallScreen ? 12 : 14, color: "#6B7280", marginTop: 4, fontWeight: "500" },
  crmPhoneTouch: { alignSelf: 'flex-start', marginTop: 4 },
  crmPhoneLinkText: { color: "#2563EB", fontWeight: "800", marginTop: 0 },
  crmPhoneEmptyText: { color: "#6B7280" },
  crmDetailBtn: { backgroundColor: '#EFF6FF', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, marginLeft: 10 },
  crmDetailBtnText: { color: '#2563EB', fontSize: 12, fontWeight: 'bold' },
  crmDivider: { height: 1, backgroundColor: "#F3F4F6", marginVertical: 15 },
  crmStatsRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  crmStatLabel: { fontSize: 12, color: "#9CA3AF", fontWeight: "600", marginBottom: 4 },
  crmStatValue: { fontSize: 15, fontWeight: "900", color: "#1F2937" },
  
  // --- Popup Lọc Địa Điểm ---
  locModalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  locModalBox: { backgroundColor: '#FFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, flexShrink: 1 },
  locModalHeader: { padding: 20, borderBottomWidth: 1, borderBottomColor: '#F1F5F9', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  locModalTitle: { fontSize: 18, fontWeight: '900', color: '#0F172A' },
  locModalCloseBtn: { backgroundColor: '#F1F5F9', width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  locModalCloseIcon: { fontSize: 16, color: '#64748B', fontWeight: 'bold', marginTop: -2 },
  locSearchWrapper: { paddingHorizontal: 20, paddingTop: 15, paddingBottom: 10 },
  locSearchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', borderRadius: 12, paddingHorizontal: 15, paddingVertical: 10, borderWidth: 1, borderColor: '#E2E8F0' },
  locSearchIcon: { fontSize: 16, marginRight: 10 },
  locSearchInput: { flex: 1, fontSize: 15, color: '#0F172A', padding: 0 },
  locSearchClearWrap: { padding: 4 },
  locSearchClearIcon: { fontSize: 16, color: '#94A3B8', fontWeight: 'bold' },
  locListScroll: { paddingHorizontal: 15 },
  locListContent: { paddingBottom: 20 },
  locEmptyText: { textAlign: 'center', color: '#94A3B8', fontStyle: 'italic', marginTop: 20 },
  locItemBtn: { padding: 16, borderRadius: 12, marginBottom: 6, borderWidth: 1 },

  // --- Popup Chi Tiết Khách Hàng ---
  cusModalOverlay: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.6)', justifyContent: 'center', alignItems: 'center' },
  cusModalKeyboardAvoid: { width: '100%', alignItems: 'center' },
  cusModalBox: { backgroundColor: '#FFF', width: '100%', borderRadius: 24, padding: 24, elevation: 10 },
  cusModalHeader: { alignItems: 'center', marginBottom: 25 },
  cusModalAvatarWrap: { width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center', marginBottom: 15 },
  cusModalAvatarText: { fontSize: 24, fontWeight: '900' },
  cusModalName: { fontSize: 20, fontWeight: '900', color: '#0F172A', textAlign: 'center' },
  cusModalPhone: { fontSize: 14, color: '#64748B', marginTop: 4 },
  cusStatsBox: { flexDirection: 'row', backgroundColor: '#F8FAFC', borderRadius: 16, padding: 12, borderWidth: 1, borderColor: '#F1F5F9' },
  cusStatCol: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  cusStatLabel: { fontSize: 11, color: '#64748B', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: 6, textAlign: 'center' },
  cusStatValueVal: { fontSize: 20, fontWeight: '900', color: '#0F172A' },
  cusStatValueMoney: { fontSize: 20, fontWeight: '900', color: '#10B981' },
  cusStatDivider: { width: 1, backgroundColor: '#E2E8F0', marginHorizontal: 8 },
  cusModalCloseBtn: { backgroundColor: '#F1F5F9', paddingVertical: 14, borderRadius: 12, alignItems: 'center', marginTop: 25 },
  cusModalCloseText: { color: '#475569', fontSize: 15, fontWeight: 'bold' },

  // ==========================================
  // 9. THU CHI (ThuChi.tsx)
  // ==========================================
  
  // --- Nút Lập Phiếu ---
  addTransBtn: { backgroundColor: "#10B981", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 },
  addTransBtnText: { color: "#FFF", fontWeight: "bold" },
  
  // --- Khối Hiển Thị Tổng Doanh Thu ---
  financeSummaryCard: { backgroundColor: "#1E3A8A", margin: 15, padding: 20, borderRadius: 12, elevation: 4 },
  financeSumLabel: { color: "#93C5FD", fontSize: 12, fontWeight: "bold", marginBottom: 5 },
  financeSumValue: { color: "#FFF", fontSize: isSmallScreen ? 26 : 32, fontWeight: "900", marginBottom: 15 },
  financeSubRow: { flexDirection: "row", backgroundColor: "rgba(255,255,255,0.1)", padding: 12, borderRadius: 8, alignItems: "center" },
  financeSubRowContent: { flex: 1 },
  financeSubRowLabel: { color: "#9CA3AF", fontSize: 12 },
  financeSubRowValue: { color: "#10B981", fontSize: 16, fontWeight: "bold" },
  
  // --- Danh Sách Giao Dịch ---
  listContentContainer: { paddingHorizontal: 15, paddingBottom: 100 },
  transCard: { flexDirection: "row", alignItems: "center", backgroundColor: "#FFF", padding: 15, borderRadius: 10, marginBottom: 10, elevation: 2 },
  transIconBox: { width: 42, height: 42, borderRadius: 8, justifyContent: "center", alignItems: "center" },
  transIconText: { fontSize: 20 },
  transInfoContainer: { flex: 1, marginHorizontal: 12 },
  transDesc: { fontSize: 14, fontWeight: "bold", color: "#1F2937", marginBottom: 3 },
  transCode: { fontSize: 11, color: "#9CA3AF" },
  transAmount: { fontSize: 16, fontWeight: "900" },
  
  // --- Form Lập Phiếu Thu/Chi ---
  keyboardAvoidingContainer: { width: "100%", alignItems: "center" },
  typeBtnContainer: { flexDirection: "row", gap: 10, marginBottom: 20 },
  modalInputMultiline: { height: 80, textAlignVertical: "top" },
  modalActionRow: { flexDirection: "row", gap: 12, marginTop: 10, width: "100%" },
  cancelBtn: { backgroundColor: "#F3F4F6" },
  cancelBtnText: { color: "#4B5563", fontWeight: "bold", fontSize: 16 },
  saveBtnText: { color: "#FFF", fontWeight: "bold", fontSize: 16 },

  // ==========================================
  // 10. MÃ QR (MaQR.tsx)
  // ==========================================

  // --- Layout Chính Mã QR ---
  qrContainer: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
  qrCard: { backgroundColor: "#FFF", padding: 25, borderRadius: 24, elevation: 5, shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 10, alignItems: "center", width: "100%", maxWidth: 350, borderWidth: 1, borderColor: "#E5E7EB" },
  qrBadgeTop: { backgroundColor: "#EFF6FF", paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20, marginBottom: 15 },
  qrBadgeTopText: { fontSize: 14, fontWeight: "900", color: "#1D4ED8" },
  qrBankName: { fontSize: 18, fontWeight: "900", color: "#111827", marginBottom: 5 },
  qrBankNumber: { fontSize: 24, color: "#10B981", fontWeight: "900", marginBottom: 20, letterSpacing: 1 },
  
  // --- Khung Hình Ảnh QR ---
  qrImageWrapper: { padding: 10, backgroundColor: "#FFF", borderRadius: 16, borderWidth: 2, borderColor: "#F3F4F6", borderStyle: "dashed" },
  qrImage: { width: 220, height: 260 },
  
  // --- Ghi chú Màn Hình QR ---
  qrFooterNote: { marginTop: 25, backgroundColor: "#FEF3C7", paddingHorizontal: 16, paddingVertical: 12, borderRadius: 12, width: '100%' },
  qrFooterNoteText: { color: "#D97706", fontWeight: "bold", textAlign: "center", fontSize: 13 },

  // ==========================================
  // 11. LỊCH SỬ SẢN PHẨM (LichSuDonHang.tsx)
  // ==========================================
  
  loadingSpinner: { marginTop: 50 },
  historyScrollView: { flex: 1, padding: 15 },
  historyScrollContent: { paddingBottom: 100 },
  
  // --- Biểu đồ cột 7 ngày (Sản Lượng) ---
  chartCard: { backgroundColor: "#FFF", borderRadius: 20, padding: 20, marginBottom: 20, elevation: 2 },
  chartTitle: { fontSize: 16, color: "#6B7280", fontWeight: "bold", marginBottom: 25 },
  chartBarsRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end", height: 160, borderBottomWidth: 2, borderBottomColor: "#E5E7EB" },
  chartBarContainer: { alignItems: "center", flex: 1 },
  chartBarValueText: { fontSize: 12, fontWeight: 'bold', color: '#3B82F6', marginBottom: 4 },
  chartLabelsRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 10 },
  chartLabelText: { flex: 1, textAlign: "center", fontSize: 12, color: "#9CA3AF", fontWeight: 'bold' },
  
  // --- Tiêu đề và Nút lọc chọn ngày ---
  filterHeaderRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 15, paddingHorizontal: 5 },
  filterTitle: { fontSize: 16, color: "#6B7280", fontWeight: "bold" },
  datePickerBtn: { flexDirection: "row", alignItems: "center", backgroundColor: "#FFF", borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1, borderColor: "#E5E7EB", elevation: 1 },
  dateIcon: { fontSize: 14, marginRight: 6 },
  clearDateBtn: { marginLeft: 8, paddingLeft: 8, borderLeftWidth: 1, borderLeftColor: '#E5E7EB' },
  clearDateIcon: { color: "#EF4444", fontSize: 14, fontWeight: '900' },
  
  // --- Thẻ Chi tiết của từng Ngày ---
  dailyDetailCard: { backgroundColor: "#FFFFFF", borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: "#E2E8F0", elevation: 2 },
  dailyDetailHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  dailyDetailDateText: { fontSize: 15, fontWeight: "900", color: "#0F172A" },
  dailyDetailStatsBadge: { backgroundColor: "#EFF6FF", paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, borderWidth: 1, borderColor: "#BFDBFE" },
  dailyDetailStatsText: { fontSize: 13, fontWeight: "800", color: "#1D4ED8" },
  dailyDetailDivider: { height: 1, backgroundColor: '#F1F5F9', marginBottom: 10 },
  dailyDetailContentText: { fontSize: 14, color: "#475569", lineHeight: 24, fontWeight: "700" },
  
  // --- Popup Chọn Ngày Khác ---
  dateModalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  dateModalContainer: { backgroundColor: '#FFF', borderRadius: 20, width: '100%', maxWidth: 350, maxHeight: '70%', overflow: 'hidden' },
  dateModalHeader: { backgroundColor: '#1E3A8A', padding: 16, alignItems: 'center' },
  dateModalHeaderText: { fontSize: 16, fontWeight: 'bold', color: '#FFF' },
  dateModalScrollContent: { padding: 10 },
  dateModalAllDaysBtn: { paddingVertical: 14, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: '#F3F4F6', flexDirection: 'row', alignItems: 'center' },
  dateModalAllDaysText: { fontSize: 15, color: '#3B82F6', fontWeight: '900' },
  dateModalItemRow: { paddingVertical: 14, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: '#F3F4F6', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  dateModalItemBadge: { backgroundColor: '#F3F4F6', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  dateModalItemBadgeText: { fontSize: 11, color: '#6B7280', fontWeight: 'bold' },
  dateModalCloseBtn: { backgroundColor: '#F1F5F9', paddingVertical: 15, alignItems: 'center' },
  dateModalCloseText: { color: '#64748B', fontSize: 15, fontWeight: '900' },

  // ==========================================
  // 12. CÁ NHÂN (CaNhan.tsx)
  // ==========================================
  
  // --- Khối Avatar và Info Chính ---
  cnProfileCard: { backgroundColor: "#FFF", borderRadius: 20, padding: 20, alignItems: "center", marginBottom: 20, elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10 },
  cnAvatarBox: { backgroundColor: "#E0F2FE", justifyContent: "center", alignItems: "center", marginBottom: 15, borderWidth: 3, borderColor: "#BAE6FD" },
  cnAvatarText: { fontSize: 32, fontWeight: "900", color: "#2563EB" },
  cnUserName: { fontSize: 22, fontWeight: "900", color: "#0F172A", marginBottom: 5 },
  cnUserPhone: { fontSize: 14, color: "#64748B", marginBottom: 10, fontWeight: "500" },
  cnRoleBadge: { backgroundColor: "#FEF3C7", paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
  cnRoleText: { color: "#D97706", fontWeight: "bold", fontSize: 12, textTransform: 'uppercase' },
  
  // --- Menu Cài Đặt Khác ---
  cnSectionTitle: { fontSize: 13, fontWeight: "bold", color: "#94A3B8", marginLeft: 5, marginBottom: 8, textTransform: 'uppercase' },
  cnMenuCard: { backgroundColor: "#FFF", borderRadius: 20, paddingHorizontal: 20, marginBottom: 20, elevation: 1 },
  cnMenuItemRow: { flexDirection: "row", alignItems: "center", paddingVertical: 16 },
  cnMenuIconBox: { width: 36, height: 36, borderRadius: 12, justifyContent: "center", alignItems: "center", marginRight: 15 },
  cnMenuTextCol: { flex: 1 },
  cnMenuTitle: { fontSize: 15, color: "#1E293B", fontWeight: "600" },
  cnMenuSubTitle: { fontSize: 12, color: "#94A3B8", marginTop: 2 },
  
  // --- Nút Đăng Xuất Đỏ ---
  cnLogoutBtn: { backgroundColor: '#FEF2F2', paddingVertical: 16, borderRadius: 20, alignItems: 'center', borderWidth: 1, borderColor: '#FCA5A5' },
  cnLogoutText: { color: '#EF4444', fontSize: 16, fontWeight: 'bold' },
  
  // --- Popup Sửa Thông Tin Cá Nhân ---
  cnModalOverlay: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.6)', justifyContent: 'flex-end' },
  cnModalBox: { backgroundColor: '#FFF', borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24 },
  cnModalHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25 },
  cnModalTitle: { fontSize: 20, fontWeight: '900', color: '#0F172A' },
  cnModalCloseBtn: { backgroundColor: '#F1F5F9', padding: 8, borderRadius: 20 },
  cnInputLabel: { fontSize: 13, color: '#64748B', fontWeight: 'bold', marginBottom: 8, marginLeft: 5 },
  cnInputStandard: { backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0', padding: 15, borderRadius: 12, marginBottom: 15, fontSize: 15, color: '#0F172A' },
  cnInputLast: { marginBottom: 25 }, 
  cnSaveBtnBase: { padding: 16, borderRadius: 16, alignItems: 'center', elevation: 2 },
  cnSaveBtnText: { color: '#FFF', fontWeight: '900', fontSize: 15 },

  // ==========================================
  // 13. CÀI ĐẶT BẢNG GIÁ (CaiDat.tsx)
  // ==========================================
  cdContainer: { flex: 1, backgroundColor: "#F4F6F9" },
  cdSaveBtn: { backgroundColor: "#10B981", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  cdSaveBtnText: { color: "#FFF", fontWeight: "bold" },
  cdScrollContent: { padding: 15, paddingBottom: 100 },
  
  // --- Khu Vực Thêm Dịch Vụ Mới ---
  cdAddBox: { backgroundColor: "#EFF6FF", padding: 15, borderRadius: 12, marginBottom: 20, borderWidth: 2, borderColor: '#BFDBFE', borderStyle: 'dashed' },
  cdAddTitle: { fontWeight: 'bold', color: '#1E3A8A', marginBottom: 10, fontSize: 16 },
  cdAddInputFull: { backgroundColor: '#FFF', padding: 12, borderRadius: 8, marginBottom: 10, borderWidth: 1, borderColor: '#DBEAFE' },
  cdPriceRow: { flexDirection: 'row', gap: 10, marginBottom: 10 },
  cdAddInputHalf: { flex: 1, backgroundColor: '#FFF', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#DBEAFE' },
  cdAddBtn: { backgroundColor: '#3B82F6', paddingVertical: 12, borderRadius: 8, alignItems: 'center' },
  cdAddBtnText: { color: '#FFF', fontWeight: 'bold' },
  
  // --- Danh Sách Dịch Vụ Đang Có ---
  cdListTitle: { fontWeight: 'bold', color: '#6B7280', marginBottom: 10 },
  cdItemCard: { backgroundColor: "#FFF", padding: 15, borderRadius: 12, marginBottom: 10, elevation: 1 },
  cdItemHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  cdItemName: { flex: 1, fontSize: 16, fontWeight: "bold", color: '#111827' },
  cdItemDelIcon: { fontSize: 18 },
  cdItemPriceRow: { flexDirection: 'row', gap: 10 },
  cdItemPriceBoxBase: { flex: 1, borderRadius: 8, padding: 8 },
  cdItemPriceBoxRetail: { backgroundColor: "#F3F4F6" },
  cdItemPriceBoxAgent: { backgroundColor: "#FFFBEB", borderWidth: 1, borderColor: '#FEF3C7' },
  cdItemPriceLabel: { fontSize: 11, marginBottom: 2 },
  cdItemPriceLabelRetail: { color: '#6B7280' },
  cdItemPriceLabelAgent: { color: '#D97706' },
  cdItemPriceInputRow: { flexDirection: 'row', alignItems: 'center' },
  cdItemPriceInputBase: { flex: 1, fontSize: 15, fontWeight: "bold", padding: 0 },
  cdItemPriceInputRetail: { color: "#2563EB" },
  cdItemPriceInputAgent: { color: "#D97706" },
  cdItemPriceUnit: { fontSize: 14 },
  cdItemPriceUnitRetail: { color: "#6B7280" },
  cdItemPriceUnitAgent: { color: "#D97706" },
  
  // --- Nút Dọn Dẹp (Clear Cache) ---
  cdClearCacheBtn: { backgroundColor: "#FFF", padding: 16, borderRadius: 16, marginTop: 20, marginBottom: 40, flexDirection: "row", alignItems: "center" },
  cdClearCacheIcon: { fontSize: 20, marginRight: 15 },
  cdClearCacheText: { flex: 1, fontWeight: "bold", color: "#EF4444" },

  // ==========================================
  // 14. BÁO CÁO DOANH THU (BaoCao.tsx)
  // ==========================================
  
  // --- Tab Điều Hướng (Hôm Nay / Tuần / Tháng) ---
  bcTabRow: { flexDirection: "row", backgroundColor: "#E2E8F0", borderRadius: 10, padding: 4, marginBottom: 25, width: '100%' },
  bcTabBtnBase: { flex: 1, paddingVertical: 10, alignItems: "center", borderRadius: 8 },
  bcTabBtnActive: { backgroundColor: "#FFFFFF", shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 },
  bcTabBtnInactive: { backgroundColor: "transparent", shadowColor: "transparent", elevation: 0 },
  bcTabTextBase: { fontSize: 14 },
  bcTabTextActive: { fontWeight: "900", color: "#0F172A" },
  bcTabTextInactive: { fontWeight: "600", color: "#64748B" },
  
  // --- Thẻ Hiển Thị Tiền Lời / Lỗ ---
  bcSummaryCard: { backgroundColor: "#FFFFFF", borderRadius: 24, padding: 24, marginBottom: 25, shadowColor: "#94A3B8", shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.1, shadowRadius: 20, elevation: 4 },
  bcSummaryHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  bcProfitLabelRow: { flexDirection: 'row', alignItems: 'center' },
  bcProfitDot: { width: 8, height: 8, borderRadius: 4, marginRight: 8 },
  bcProfitDotPos: { backgroundColor: '#10B981' },
  bcProfitDotNeg: { backgroundColor: '#EF4444' },
  bcProfitLabelText: { fontSize: 13, color: "#64748B", fontWeight: "bold", textTransform: 'uppercase', letterSpacing: 1 },
  bcOrderCountBadge: { backgroundColor: '#F1F5F9', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  bcOrderCountText: { fontSize: 12, fontWeight: '900', color: '#475569' },
  bcProfitValueText: { fontSize: 36, fontWeight: "900", marginBottom: 30, letterSpacing: -1 },
  bcProfitValuePos: { color: "#0F172A" },
  bcProfitValueNeg: { color: "#EF4444" },
  bcProfitCurrency: { fontSize: 24, fontWeight: '600', color: '#94A3B8' },
  bcDivider: { height: 1, backgroundColor: '#F1F5F9', marginBottom: 20 },
  bcInOutRow: { flexDirection: "row", justifyContent: "space-between" },
  bcInCol: { flex: 1 },
  bcInOutLabel: { fontSize: 12, color: "#94A3B8", fontWeight: '600', marginBottom: 6 },
  bcInValue: { fontSize: 18, fontWeight: "800", color: "#10B981" },
  bcVerticalDivider: { width: 1, backgroundColor: '#F1F5F9', marginHorizontal: 15 },
  bcOutCol: { flex: 1, alignItems: 'flex-start' },
  bcOutValue: { fontSize: 18, fontWeight: "800", color: "#EF4444" },
  
  // --- Vùng Vẽ Biểu Đồ Đường Dòng Tiền ---
  bcChartCard: { backgroundColor: "#FFFFFF", borderRadius: 24, padding: 24, marginBottom: 30, shadowColor: "#94A3B8", shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.1, shadowRadius: 20, elevation: 4 },
  bcChartTitle: { fontSize: 15, color: "#0F172A", fontWeight: "900", marginBottom: 15 },
  bcChartContainer: { position: 'relative', height: 140, marginTop: 35 },
  bcGridLinesBox: { position: 'absolute', top: 0, left: 0, right: 0, height: 140, justifyContent: 'space-between' },
  bcGridLine: { height: 1, backgroundColor: '#F1F5F9', width: '100%' },
  bcChartLineSegment: { position: 'absolute', height: 3, backgroundColor: '#3B82F6', zIndex: 10 },
  
  // --- Các Dấu Chấm & Nhãn trên Biểu Đồ ---
  bcChartDotWrap: { position: 'absolute', width: 50, alignItems: 'center', zIndex: 20 },
  bcChartValueText: { fontSize: 10, marginBottom: 4 },
  bcChartValueTextToday: { color: '#2563EB', fontWeight: 'bold' },
  bcChartValueTextNormal: { color: '#94A3B8', fontWeight: '600' },
  bcChartDot: { width: 12, height: 12, borderRadius: 6, borderWidth: 2, borderColor: '#3B82F6' },
  bcChartDotToday: { backgroundColor: '#2563EB' },
  bcChartDotNormal: { backgroundColor: '#FFFFFF' },
  bcXAxisWrap: { height: 20, marginTop: 15, position: 'relative' },
  bcXAxisLabel: { position: 'absolute', width: 50, textAlign: 'center', fontSize: 12 },
  bcXAxisLabelToday: { color: '#2563EB', fontWeight: '900' },
  bcXAxisLabelNormal: { color: "#64748B", fontWeight: '600' }
});