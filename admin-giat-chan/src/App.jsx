import { useState, useEffect } from "react";

// ==========================================
// 1. CẤU HÌNH TRẠNG THÁI
// ==========================================
const STATUS_CONFIG = {
  NEED_PICKUP: { label: "🧺 Chưa trả", color: "#B45309", bg: "#FEF3C7" },
  COMPLETED: { label: "✅ Đã trả", color: "#047857", bg: "#D1FAE5" },
  PROCESSING: { label: "🌀 Đang xử lý", color: "#1D4ED8", bg: "#DBEAFE" }, 
};

const generateCode = (prefix) => prefix + new Date().getTime().toString().slice(-4);

const parseItems = (rawItems) => {
  let isAgent = false;
  let str = rawItems || "";
  if (str.includes("[ĐIỂM THU]")) {
    isAgent = true;
    str = str.replace(/\[ĐIỂM THU\]\s*/g, "");
  } else if (str.includes("[KHÁCH LẺ]")) {
    str = str.replace(/\[KHÁCH LẺ\]\s*/g, "");
  }
  let note = "";
  if (str.includes(" - Ghi chú: ")) {
    const parts = str.split(" - Ghi chú: ");
    str = parts[0].trim();
    note = parts[1].trim();
  }
  return { isAgent, service: str, note };
};

// ==========================================
// 2. COMPONENT CHÍNH (WEB ADMIN)
// ==========================================
export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("DASHBOARD");

  const [orders, setOrders] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [priceList, setPriceList] = useState([]); 

  const [searchQuery, setSearchQuery] = useState("");
  const [toastMsg, setToastMsg] = useState("");

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 3500);
  };

  const [selectedDate, setSelectedDate] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  });

  const [newOrder, setNewOrder] = useState({
    name: "", phone: "", address: "", customerType: "LE", serviceName: "", qty: 1, total: 0, note: "",
  });
  const [newExpense, setNewExpense] = useState({ amount: "", desc: "" });

  const formatDate = (dateString) => {
    const d = new Date(dateString);
    return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
  };
  const getFormattedDate = (dateStr) => {
    if (!dateStr) return null;
    const [y, m, d] = dateStr.split("-");
    return `${d}/${m}/${y}`;
  };

  // ==========================================
  // 3. KẾT NỐI MÁY CHỦ (API FETCH)
  // ==========================================
  const loadData = () => {
    fetch("https://backend-giat-chan.onrender.com/api/orders")
      .then((res) => res.json())
      .then((data) => {
        const formatted = data.map((o) => ({
          db_id: o.id, id: o.order_code, name: o.customer_name, phone: o.customer_phone, address: o.address,
          items: o.items, total: new Intl.NumberFormat("vi-VN").format(o.total_amount) + "đ", rawTotal: o.total_amount,
          status: o.status, date: formatDate(o.created_at), rawCreatedAt: o.created_at,
        }));
        setOrders(formatted);
      }).catch(() => {});

    fetch("https://backend-giat-chan.onrender.com/api/transactions")
      .then((res) => res.json())
      .then((data) => {
        const formatted = data.map((t) => ({
          id: t.trans_code, type: t.type, amount: t.amount, desc: t.description, date: formatDate(t.created_at),
        }));
        setTransactions(formatted);
      }).catch(() => {});

    fetch("https://backend-giat-chan.onrender.com/api/prices")
      .then((res) => res.json())
      .then((data) => setPriceList(data)).catch(() => {});
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Đã fix lỗi vàng missing dependency

  // ==========================================
  // 4. CÁC HÀM XỬ LÝ SỰ KIỆN
  // ==========================================
  const handleProductOrQtyChange = (field, value) => {
    const updated = { ...newOrder, [field]: value };
    if (field === "serviceName" || field === "qty") {
      const selectedItem = priceList.find(p => p.name === updated.serviceName);
      const price = selectedItem ? parseInt(selectedItem.price) : 0;
      const quantity = parseInt(updated.qty) || 1;
      updated.total = price * quantity;
    }
    setNewOrder(updated);
  };

  const handleCreateOrder = (e) => {
    e.preventDefault();
    if (!newOrder.name) return showToast("⚠️ Vui lòng nhập Tên khách hàng!");
    if (!newOrder.serviceName || newOrder.qty <= 0) return showToast("⚠️ Chọn sản phẩm và nhập SL!");

    const typePrefix = newOrder.customerType === "AGENT" ? "[ĐIỂM THU] " : "[KHÁCH LẺ] ";
    const notePart = newOrder.note ? ` - Ghi chú: ${newOrder.note}` : "";
    const itemsFormatted = `${typePrefix}${newOrder.qty} ${newOrder.serviceName}${notePart}`;

    const payload = {
      order_code: generateCode("DH"), customer_name: newOrder.name, customer_phone: newOrder.phone.replace(/\D/g, ""),
      address: newOrder.address, items: itemsFormatted, total_amount: parseInt(newOrder.total) || 0,
    };

    fetch("https://backend-giat-chan.onrender.com/api/orders", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload),
    }).then((res) => {
        if (!res.ok) throw new Error();
        showToast("✅ Đã nhận đơn thành công!");
        loadData();
        setNewOrder({ name: "", phone: "", address: "", customerType: "LE", serviceName: "", qty: 1, total: 0, note: "" });
        setActiveTab("WAREHOUSE");
      }).catch(() => showToast("❌ Lỗi lưu đơn hàng."));
  };

  const changeStatus = (dbId, orderId, newStatus) => {
    fetch(`https://backend-giat-chan.onrender.com/api/orders/${dbId}/status`, {
      method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ newStatus }),
    }).then(() => {
      if (newStatus === "COMPLETED") {
        const order = orders.find((o) => o.db_id === dbId);
        if (order && order.rawTotal > 0) {
          handleAddTransaction("IN", order.rawTotal, `${order.name} - ${order.phone}`);
        }
      }
      loadData();
      showToast("✅ Đã trả chăn cho khách!");
    });
  };

  const handleAddTransaction = (type, amount, desc) => {
    const payload = {
      trans_code: generateCode(type === "IN" ? "THU" : "CHI"), type: type,
      amount: parseInt(amount.toString().replace(/\D/g, "")) || 0, description: desc,
    };
    fetch("https://backend-giat-chan.onrender.com/api/transactions", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload),
    }).then(() => loadData());
  };

  const handleCreateExpense = (e) => {
    e.preventDefault();
    if (!newExpense.amount || !newExpense.desc) return showToast("⚠️ Vui lòng nhập thông tin chi!");
    handleAddTransaction("OUT", newExpense.amount, newExpense.desc);
    setNewExpense({ amount: "", desc: "" });
    showToast("💸 Đã ghi nhận khoản chi!");
  };

  const formatMoney = (amount) => new Intl.NumberFormat("vi-VN").format(amount) + "đ";

  // ==========================================
  // 5. THỐNG KÊ DASHBOARD (ĐÃ SỬA LỖI UNUSED)
  // ==========================================
  const todayFormattedDate = getFormattedDate(selectedDate);
  const filteredTransactions = transactions.filter((t) => t.date === todayFormattedDate);

  const totalInToday = filteredTransactions.filter((t) => t.type === "IN").reduce((sum, t) => sum + t.amount, 0);
  const totalOutToday = filteredTransactions.filter((t) => t.type === "OUT").reduce((sum, t) => sum + t.amount, 0);
  
  // Đã sử dụng profitToday
  const profitToday = totalInToday - totalOutToday;

  const pendingOrders = orders.filter((o) => o.status === "NEED_PICKUP" || o.status === "PROCESSING").length;
  const completedOrders = orders.filter((o) => o.status === "COMPLETED").length;

  // Xử lý Top Khách VIP (Đã sử dụng topCustomers)
  const customerMap = new Map();
  orders.forEach((o) => {
    let key = o.phone ? o.phone : o.name;
    if (!customerMap.has(key)) customerMap.set(key, { name: o.name, phone: o.phone, spent: o.rawTotal });
    else customerMap.get(key).spent += o.rawTotal;
  });
  const topCustomers = Array.from(customerMap.values()).sort((a, b) => b.spent - a.spent).slice(0, 5);

  const last7Days = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (6 - i));
    return {
      displayStr: `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`,
      filterDate: getFormattedDate(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`),
    };
  });
  const chartData = last7Days.map((day) => {
    const dayTxs = transactions.filter((t) => t.date === day.filterDate && t.type === "IN");
    return { label: day.displayStr, value: dayTxs.reduce((sum, t) => sum + t.amount, 0) };
  });
  const maxChartValue = Math.max(...chartData.map((d) => d.value), 500000);

  const sortedOrdersForTable = [...orders].sort((a, b) => {
    const aUrgent = a.items ? a.items.toLowerCase().includes("lấy ngay") : false;
    const bUrgent = b.items ? b.items.toLowerCase().includes("lấy ngay") : false;
    if (aUrgent && !bUrgent) return -1;
    if (!aUrgent && bUrgent) return 1;

    const aDelayed = a.items ? a.items.toLowerCase().includes("cuối năm") : false;
    const bDelayed = b.items ? b.items.toLowerCase().includes("cuối năm") : false;
    if (aDelayed && !bDelayed) return 1;
    if (!aDelayed && bDelayed) return -1;

    if (a.status !== "COMPLETED" && b.status === "COMPLETED") return -1;
    if (a.status === "COMPLETED" && b.status !== "COMPLETED") return 1;

    return new Date(a.rawCreatedAt).getTime() - new Date(b.rawCreatedAt).getTime();
  });

  return (
    <>
      <style>{`
        body, html { margin: 0; padding: 0; width: 100%; height: 100%; font-family: 'Inter', system-ui, sans-serif; background-color: #F1F5F9; }
        #root { width: 100%; height: 100%; display: flex; }
        * { box-sizing: border-box; }
        input:focus, select:focus { outline: 2px solid #3B82F6; border-color: transparent; }
        ::-webkit-scrollbar { width: 8px; height: 8px; }
        ::-webkit-scrollbar-thumb { background: #CBD5E1; border-radius: 4px; }
        ::-webkit-scrollbar-thumb:hover { background: #94A3B8; }
      `}</style>

      {toastMsg && <div style={styles.toast}>{toastMsg}</div>}

      <div style={styles.container}>
        {/* === SIDEBAR (DARK MODE CHUYÊN NGHIỆP) === */}
        <div style={styles.sidebar}>
          <div style={styles.logoContainer}>
            <div style={styles.logoBox}>🫧</div>
            <h2 style={styles.logoText}>Tổng Kho Chăn</h2>
          </div>
          <div style={styles.navMenu}>
            <div style={{ ...styles.navItem, ...(activeTab === "DASHBOARD" ? styles.navItemActive : {}) }} onClick={() => setActiveTab("DASHBOARD")}>
              <span style={styles.navIcon}>📊</span><span>Tổng Quan</span>
            </div>
            <div style={{ ...styles.navItem, ...(activeTab === "WAREHOUSE" ? styles.navItemActive : {}) }} onClick={() => setActiveTab("WAREHOUSE")}>
              <span style={styles.navIcon}>📦</span><span>Kho & Đơn Hàng</span>
            </div>
            <div style={{ ...styles.navItem, ...(activeTab === "CREATE" ? styles.navItemActive : {}) }} onClick={() => setActiveTab("CREATE")}>
              <span style={styles.navIcon}>✍️</span><span>Tạo Đơn Nhanh</span>
            </div>
          </div>
          <div style={styles.sidebarFooter}>
            <div style={styles.userProfile}>
              <div style={styles.avatar}>S</div>
              <div>
                <div style={{fontSize: '14px', fontWeight: 'bold', color: '#FFF'}}>Sếp Quản Lý</div>
                <div style={{fontSize: '12px', color: '#94A3B8'}}>Admin</div>
              </div>
            </div>
          </div>
        </div>

        {/* === MAIN CONTENT === */}
        <div style={styles.mainContent}>
          {/* HEADER TRÊN CÙNG */}
          <div style={styles.topHeader}>
            <h2 style={styles.headerTitle}>
              {activeTab === "DASHBOARD" && "Phân tích Kinh Doanh"}
              {activeTab === "WAREHOUSE" && "Quản lý Hàng Hóa"}
              {activeTab === "CREATE" && "Quầy Tiếp Nhận"}
            </h2>
            <div style={{display: 'flex', alignItems: 'center', gap: '16px'}}>
              <span style={{fontSize: '14px', fontWeight: '600', color: '#475569'}}>{todayFormattedDate}</span>
              <div style={styles.notificationBell}>🔔</div>
            </div>
          </div>

          <div style={styles.pageInner}>
            {/* TAB 1: DASHBOARD CHUYÊN NGHIỆP */}
            {activeTab === "DASHBOARD" && (
              <div>
                <div style={styles.flexBetween}>
                  <p style={{ color: "#64748B", margin: 0, fontSize: "14px" }}>Báo cáo hiệu quả kinh doanh theo thời gian thực.</p>
                  <div style={styles.filterGroup}>
                    <span style={{ fontWeight: "600", color: "#475569", fontSize: '14px' }}>Bộ lọc ngày:</span>
                    <input type="date" style={styles.dateInput} value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} />
                  </div>
                </div>

                {/* 5 CARD THỐNG KÊ (CÓ LỢI NHUẬN) */}
                <div style={styles.dashboardGrid}>
                  <div style={styles.dashCard}>
                    <div style={styles.dashCardHeader}><span style={styles.dashIconBox}>🧺</span><span style={styles.dashTitle}>Đang xử lý</span></div>
                    <h2 style={styles.dashValue}>{pendingOrders} <span style={styles.dashUnit}>đơn</span></h2>
                  </div>
                  <div style={styles.dashCard}>
                    <div style={styles.dashCardHeader}><span style={{...styles.dashIconBox, background: '#D1FAE5'}}>✅</span><span style={styles.dashTitle}>Hoàn thành</span></div>
                    <h2 style={styles.dashValue}>{completedOrders} <span style={styles.dashUnit}>đơn</span></h2>
                  </div>
                  <div style={styles.dashCard}>
                    <div style={styles.dashCardHeader}><span style={{...styles.dashIconBox, background: '#DBEAFE'}}>💰</span><span style={styles.dashTitle}>Doanh thu</span></div>
                    <h2 style={{ ...styles.dashValue, color: "#2563EB" }}>{formatMoney(totalInToday)}</h2>
                  </div>
                  <div style={styles.dashCard}>
                    <div style={styles.dashCardHeader}><span style={{...styles.dashIconBox, background: '#FEE2E2'}}>📉</span><span style={styles.dashTitle}>Chi phí</span></div>
                    <h2 style={{ ...styles.dashValue, color: "#E11D48" }}>{formatMoney(totalOutToday)}</h2>
                  </div>
                  {/* SỬ DỤNG BIẾN LỢI NHUẬN Ở ĐÂY */}
                  <div style={{...styles.dashCard, background: profitToday >= 0 ? '#F0FDF4' : '#FFF1F2', borderColor: profitToday >= 0 ? '#BBF7D0' : '#FECDD3'}}>
                    <div style={styles.dashCardHeader}><span style={{...styles.dashIconBox, background: '#FFF'}}>💎</span><span style={{...styles.dashTitle, color: '#111827'}}>Lợi Nhuận</span></div>
                    <h2 style={{ ...styles.dashValue, color: profitToday >= 0 ? "#059669" : "#E11D48" }}>{formatMoney(profitToday)}</h2>
                  </div>
                </div>

                {/* BIỂU ĐỒ & TOP KHÁCH HÀNG */}
                <div style={styles.middleRowGrid}>
                  {/* Biểu đồ */}
                  <div style={{ ...styles.cardView, gridColumn: 'span 2' }}>
                    <h3 style={styles.cardSectionTitle}>Biểu đồ Doanh thu (7 Ngày)</h3>
                    <div style={styles.chartContainer}>
                      <div style={styles.yAxis}>
                        <span>{formatMoney(maxChartValue)}</span>
                        <span>{formatMoney(maxChartValue / 2)}</span>
                        <span>0đ</span>
                      </div>
                      <div style={styles.barsArea}>
                        {chartData.map((d, idx) => (
                          <div key={idx} style={styles.barGroup}>
                            <div style={styles.barTrack}>
                              <div style={{ ...styles.barFill, height: `${(d.value / maxChartValue) * 100}%` }} title={formatMoney(d.value)}></div>
                            </div>
                            <span style={styles.barLabel}>{d.label}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* SỬ DỤNG BIẾN TOP CUSTOMERS Ở ĐÂY */}
                  <div style={styles.cardView}>
                    <h3 style={styles.cardSectionTitle}>👑 Top Khách VIP</h3>
                    <div style={{display: 'flex', flexDirection: 'column', gap: '12px'}}>
                      {topCustomers.length === 0 && <p style={{color: '#94A3B8', fontSize: '14px', fontStyle: 'italic'}}>Chưa có dữ liệu</p>}
                      {topCustomers.map((c, idx) => (
                        <div key={idx} style={styles.vipRow}>
                          <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                            <div style={styles.vipRank}>{idx + 1}</div>
                            <div>
                              <div style={{fontWeight: '700', fontSize: '14px', color: '#1E293B'}}>{c.name}</div>
                              <div style={{fontSize: '12px', color: '#64748B'}}>{c.phone || "Ẩn danh"}</div>
                            </div>
                          </div>
                          <div style={{fontWeight: '900', color: '#059669', fontSize: '14px'}}>{formatMoney(c.spent)}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: KHO CHĂN GIAO DIỆN BẢNG SIÊU ĐẸP */}
            {activeTab === "WAREHOUSE" && (
              <div>
                <div style={{...styles.flexBetween, marginBottom: '16px'}}>
                  <input type="text" placeholder="🔍 Tìm kiếm mã, tên, sđt..." style={styles.searchBar} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                  <div style={{display: 'flex', gap: '10px'}}>
                    <button style={styles.btnSecondary}>Lọc nâng cao</button>
                    <button style={styles.btnPrimary} onClick={() => setActiveTab("CREATE")}>+ Tạo Đơn Mới</button>
                  </div>
                </div>

                <div style={styles.tableCard}>
                  <table style={styles.table}>
                    <thead>
                      <tr>
                        <th style={styles.th}>Mã / Ngày</th>
                        <th style={styles.th}>Khách hàng</th>
                        <th style={styles.th}>Chi tiết Dịch vụ</th>
                        <th style={styles.th}>Thành tiền</th>
                        <th style={styles.th}>Trạng thái</th>
                        <th style={styles.th}>Hành động</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortedOrdersForTable.length === 0 && (
                        <tr><td colSpan="6" style={styles.emptyTableTd}>Chưa có đơn hàng nào trong kho.</td></tr>
                      )}
                      {sortedOrdersForTable
                        .filter((o) => (o.name.toLowerCase().includes(searchQuery.toLowerCase()) || o.phone.includes(searchQuery)))
                        .map((order) => {
                          const parsed = parseItems(order.items);
                          return (
                            <tr key={order.id} style={styles.tr}>
                              <td style={styles.td}>
                                <div style={{fontWeight: '700', color: '#0F172A'}}>{order.id}</div>
                                <div style={styles.smallText}>{order.date}</div>
                              </td>
                              <td style={styles.td}>
                                <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                                  <div style={{...styles.avatarSmall, background: parsed.isAgent ? '#FEF3C7' : '#E0F2FE', color: parsed.isAgent ? '#D97706' : '#2563EB'}}>
                                    {parsed.isAgent ? 'ĐL' : order.name.charAt(0)}
                                  </div>
                                  <div>
                                    <div style={{fontWeight: '700', color: '#1E293B'}}>{order.name}</div>
                                    <div style={styles.smallText}>{order.phone || "---"}</div>
                                  </div>
                                </div>
                              </td>
                              <td style={styles.td}>
                                <div style={{fontWeight: '600', color: '#334155'}}>{parsed.service}</div>
                                {parsed.note && <div style={styles.inlineNote}>📝 {parsed.note}</div>}
                              </td>
                              <td style={styles.td}>
                                <div style={{fontWeight: '800', color: '#E11D48'}}>{order.total}</div>
                              </td>
                              <td style={styles.td}>
                                <span style={{ ...styles.statusBadge, backgroundColor: STATUS_CONFIG[order.status]?.bg || '#F1F5F9', color: STATUS_CONFIG[order.status]?.color || '#475569' }}>
                                  {STATUS_CONFIG[order.status]?.label || order.status}
                                </span>
                              </td>
                              <td style={styles.td}>
                                {order.status !== "COMPLETED" ? (
                                  <button style={styles.btnActionGreen} onClick={() => changeStatus(order.db_id, order.id, "COMPLETED")}>
                                    ✔ Trả Hàng
                                  </button>
                                ) : (
                                  <span style={{color: '#94A3B8', fontSize: '13px', fontWeight: '600'}}>Đã xong</span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB 3: TẠO ĐƠN & GHI CHI TIÊU NẰM CHUNG 1 MÀN */}
            {activeTab === "CREATE" && (
              <div style={styles.middleRowGrid}>
                {/* Form Tạo Đơn */}
                <div style={{...styles.cardView, gridColumn: 'span 2'}}>
                  <h3 style={styles.cardSectionTitle}>Tạo Đơn Hàng Mới</h3>
                  <form onSubmit={handleCreateOrder}>
                    <div style={styles.formRow}>
                      <div style={styles.formGroup}>
                        <label style={styles.label}>Số điện thoại</label>
                        <input type="text" style={styles.input} placeholder="Bỏ trống nếu không có..." value={newOrder.phone} onChange={(e) => setNewOrder({ ...newOrder, phone: e.target.value })} />
                      </div>
                      <div style={styles.formGroup}>
                        <label style={styles.label}>Tên Khách Hàng (*)</label>
                        <input type="text" style={styles.input} placeholder="VD: Cô Mười..." value={newOrder.name} onChange={(e) => setNewOrder({ ...newOrder, name: e.target.value })} required />
                      </div>
                    </div>

                    <div style={styles.formRow}>
                      <div style={styles.formGroup}>
                        <label style={styles.label}>Loại Khách Hàng</label>
                        <select style={styles.input} value={newOrder.customerType} onChange={(e) => setNewOrder({ ...newOrder, customerType: e.target.value })}>
                          <option value="LE">👤 Khách Lẻ</option>
                          <option value="AGENT">🚚 Điểm Thu / Đại Lý</option>
                        </select>
                      </div>
                      <div style={styles.formGroup}>
                        <label style={styles.label}>Địa chỉ (Tùy chọn)</label>
                        <input type="text" style={styles.input} placeholder="VD: Xóm 1..." value={newOrder.address} onChange={(e) => setNewOrder({ ...newOrder, address: e.target.value })} />
                      </div>
                    </div>

                    <div style={styles.formRow}>
                      <div style={{ flex: 2, ...styles.formGroup }}>
                        <label style={styles.label}>Dịch Vụ (* Đồng bộ App)</label>
                        <select style={{ ...styles.input, fontWeight: "bold", color: "#1D4ED8" }} value={newOrder.serviceName} onChange={(e) => handleProductOrQtyChange("serviceName", e.target.value)}>
                          <option value="">--- Chọn dịch vụ ---</option>
                          {priceList.map((p) => (
                            <option key={p.id || p.name} value={p.name}>{p.name} - {formatMoney(p.price)}</option>
                          ))}
                        </select>
                      </div>
                      <div style={{ flex: 1, ...styles.formGroup }}>
                        <label style={styles.label}>Số lượng</label>
                        <input type="number" min="1" style={{ ...styles.input, textAlign: "center", fontWeight: "bold" }} value={newOrder.qty} onChange={(e) => handleProductOrQtyChange("qty", e.target.value)} />
                      </div>
                    </div>

                    <div style={styles.formRow}>
                      <div style={styles.formGroup}>
                        <label style={styles.label}>Ghi chú thêm</label>
                        <input type="text" style={styles.input} placeholder="VD: Lấy ngay..." value={newOrder.note} onChange={(e) => setNewOrder({ ...newOrder, note: e.target.value })} />
                      </div>
                      <div style={styles.formGroup}>
                        <label style={styles.label}>Tổng tiền (VNĐ)</label>
                        <input type="number" style={{ ...styles.input, fontWeight: "900", color: "#E11D48", fontSize: "16px", background: '#FFF1F2', borderColor: '#FECDD3' }} value={newOrder.total} onChange={(e) => setNewOrder({ ...newOrder, total: e.target.value })} />
                      </div>
                    </div>

                    <button type="submit" style={{...styles.btnPrimary, width: '100%', padding: '14px', fontSize: '15px'}}>LƯU ĐƠN HÀNG</button>
                  </form>
                </div>

                {/* Form Chi Tiền Nhanh */}
                <div style={{...styles.cardView, backgroundColor: '#FFF1F2', borderColor: '#FECDD3', height: 'max-content'}}>
                  <h3 style={{ ...styles.cardSectionTitle, color: '#BE123C' }}>Ghi Sổ Chi Tiền Nhanh</h3>
                  <form onSubmit={handleCreateExpense}>
                    <div style={styles.formGroup}>
                      <label style={styles.label}>Số tiền chi (VNĐ)</label>
                      <input type="number" style={{...styles.input, background: '#FFF'}} placeholder="VD: 50000" value={newExpense.amount} onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })} />
                    </div>
                    <div style={styles.formGroup}>
                      <label style={styles.label}>Lý do chi</label>
                      <input type="text" style={{...styles.input, background: '#FFF'}} placeholder="VD: Mua nước giặt" value={newExpense.desc} onChange={(e) => setNewExpense({ ...newExpense, desc: e.target.value })} />
                    </div>
                    <button type="submit" style={{ ...styles.btnPrimary, backgroundColor: "#E11D48", width: '100%' }}>LƯU KHOẢN CHI</button>
                  </form>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

// ==========================================
// 6. GIAO DIỆN CHUẨN SAAS ADMIN (KIOTVIET STYLE)
// ==========================================
const styles = {
  toast: { position: "fixed", top: "20px", right: "20px", backgroundColor: "#111827", color: "#FFF", padding: "14px 24px", borderRadius: "8px", zIndex: 9999, boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)", fontWeight: "600", fontSize: "14px", animation: "fadeIn 0.3s ease" },
  container: { display: "flex", width: "100%", height: "100vh", overflow: 'hidden' },
  
  // SIDEBAR TỐI MÀU CHUYÊN NGHIỆP
  sidebar: { width: "260px", backgroundColor: "#1C2434", color: "#F1F5F9", display: "flex", flexDirection: "column" },
  logoContainer: { padding: "24px 20px", borderBottom: "1px solid #333A48", display: "flex", alignItems: "center", gap: '12px' },
  logoBox: { width: '32px', height: '32px', background: '#3B82F6', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' },
  logoText: { fontSize: "18px", fontWeight: "800", margin: 0, letterSpacing: '0.5px' },
  navMenu: { padding: "20px 12px", flex: 1 },
  navItem: { display: "flex", alignItems: "center", padding: "12px 16px", borderRadius: "8px", marginBottom: "8px", cursor: "pointer", color: "#8A99AF", fontWeight: "600", fontSize: "14px", transition: "all 0.2s" },
  navItemActive: { backgroundColor: "#333A48", color: "#FFFFFF" },
  navIcon: { marginRight: "12px", fontSize: "18px" },
  sidebarFooter: { padding: '20px', borderTop: '1px solid #333A48' },
  userProfile: { display: 'flex', alignItems: 'center', gap: '12px' },
  avatar: { width: '36px', height: '36px', borderRadius: '50%', background: '#3B82F6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' },

  // MAIN CONTENT & HEADER
  mainContent: { flex: 1, display: 'flex', flexDirection: 'column' },
  topHeader: { height: '70px', background: '#FFFFFF', borderBottom: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 32px' },
  headerTitle: { fontSize: '20px', fontWeight: '800', color: '#1E293B', margin: 0 },
  notificationBell: { width: '36px', height: '36px', borderRadius: '50%', background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', cursor: 'pointer' },
  
  pageInner: { padding: "32px", overflowY: "auto", flex: 1 },
  flexBetween: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" },
  
  // DASHBOARD GRID
  dashboardGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "20px", marginTop: "10px" },
  dashCard: { backgroundColor: "#FFFFFF", borderRadius: "12px", padding: "20px", border: "1px solid #E2E8F0", boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)" },
  dashCardHeader: { display: "flex", alignItems: "center", marginBottom: "16px" },
  dashIconBox: { width: '32px', height: '32px', borderRadius: '8px', background: '#FEF3C7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', marginRight: '10px' },
  dashTitle: { fontSize: "14px", fontWeight: "600", color: "#64748B" },
  dashValue: { margin: "0", fontSize: "26px", fontWeight: "800", color: "#0F172A" },
  dashUnit: { fontSize: '14px', color: '#94A3B8', fontWeight: '600', marginLeft: '4px' },

  middleRowGrid: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px", marginTop: "20px" },
  cardView: { backgroundColor: "#FFFFFF", borderRadius: "12px", padding: "24px", border: "1px solid #E2E8F0", boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)" },
  cardSectionTitle: { margin: "0 0 20px 0", color: "#0F172A", fontSize: "16px", fontWeight: '700' },

  // BIỂU ĐỒ
  chartContainer: { display: "flex", height: "240px", gap: "16px" },
  yAxis: { display: "flex", flexDirection: "column", justifyContent: "space-between", color: "#94A3B8", fontSize: "12px", paddingRight: "16px", borderRight: "1px dashed #E2E8F0", textAlign: "right", minWidth: "70px", fontWeight: "500" },
  barsArea: { display: "flex", flex: 1, justifyContent: "space-around", alignItems: "flex-end", paddingTop: "10px" },
  barGroup: { display: "flex", flexDirection: "column", alignItems: "center", height: "100%", width: "12%" },
  barTrack: { flex: 1, width: "100%", display: "flex", alignItems: "flex-end", justifyContent: "center", backgroundColor: "#F8FAFC", borderRadius: "6px 6px 0 0" },
  barFill: { width: "70%", backgroundColor: "#3B82F6", borderRadius: "4px 4px 0 0", minHeight: "4px", transition: 'height 0.5s ease' },
  barLabel: { marginTop: "8px", fontSize: "11px", color: "#64748B", fontWeight: "600" },

  // VIP LIST
  vipRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: '#F8FAFC', borderRadius: '8px', border: '1px solid #F1F5F9' },
  vipRank: { width: '24px', height: '24px', borderRadius: '50%', background: '#FDE68A', color: '#B45309', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 'bold' },

  // INPUTS & BUTTONS
  dateInput: { padding: "8px 12px", borderRadius: "6px", border: "1px solid #CBD5E1", fontSize: "13px", outline: "none", width: "140px", fontWeight: '500' },
  searchBar: { padding: "10px 16px", borderRadius: "8px", border: "1px solid #CBD5E1", fontSize: "14px", outline: "none", width: "300px", boxShadow: '0 1px 2px rgba(0,0,0,0.05)' },
  btnPrimary: { padding: '10px 16px', background: '#2563EB', color: '#FFF', borderRadius: '8px', border: 'none', fontWeight: '600', fontSize: '14px', cursor: 'pointer', boxShadow: '0 1px 2px rgba(0,0,0,0.1)' },
  btnSecondary: { padding: '10px 16px', background: '#FFFFFF', color: '#334155', borderRadius: '8px', border: '1px solid #CBD5E1', fontWeight: '600', fontSize: '14px', cursor: 'pointer' },
  btnActionGreen: { padding: "6px 12px", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "700", fontSize: "12px", background: '#10B981', color: '#FFF', boxShadow: "0 1px 2px rgba(16, 185, 129, 0.2)" },

  // BẢNG (TABLE) CHUYÊN NGHIỆP
  tableCard: { backgroundColor: "#FFFFFF", borderRadius: "12px", overflow: "hidden", border: "1px solid #E2E8F0", boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)" },
  table: { width: "100%", borderCollapse: "collapse", textAlign: "left" },
  th: { padding: "14px 20px", backgroundColor: "#F8FAFC", color: "#475569", fontSize: "12px", textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: "1px solid #E2E8F0", fontWeight: '700' },
  tr: { borderBottom: "1px solid #F1F5F9", transition: 'background-color 0.1s' },
  td: { padding: "16px 20px", fontSize: "14px", color: "#1E293B", verticalAlign: "middle" },
  emptyTableTd: { textAlign: "center", padding: "60px", color: "#94A3B8", fontStyle: "italic", fontSize: '14px' },
  smallText: { fontSize: "12px", color: "#64748B", marginTop: '4px' },
  avatarSmall: { width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 'bold' },
  inlineNote: { display: 'inline-block', background: '#FEF2F2', color: '#BE123C', padding: '2px 6px', borderRadius: '4px', fontSize: '11px', fontWeight: '600', marginTop: '6px' },
  statusBadge: { padding: "4px 8px", borderRadius: "6px", fontSize: "12px", fontWeight: "700", display: "inline-block" },

  // FORM TẠO ĐƠN
  formRow: { display: "flex", gap: "20px", marginBottom: "20px" },
  formGroup: { flex: 1, display: "flex", flexDirection: "column" },
  label: { fontSize: "13px", fontWeight: "600", color: "#475569", marginBottom: "8px" },
  input: { padding: "12px", borderRadius: "8px", border: "1px solid #CBD5E1", fontSize: "14px", outline: "none", backgroundColor: '#FFFFFF', transition: 'border 0.2s' },
};