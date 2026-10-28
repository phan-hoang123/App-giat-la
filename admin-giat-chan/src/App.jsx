import { useState, useEffect } from "react";
import logoImg from './assets/favicon.png'

// ==========================================
// 1. CẤU HÌNH KẾT NỐI & TRẠNG THÁI KHO MỚI
// ==========================================
const API_BASE = "";

const STATUS_CONFIG = {
  NEED_PICKUP: {
    label: "Đang giặt",
    color: "#C2410C",
    bg: "#FFF7ED",
    border: "#FED7AA",
    dot: "#F97316",
  },
  PROCESSING: {
    label: "Đang giặt sấy",
    color: "#1D4ED8",
    bg: "#EFF6FF",
    border: "#BFDBFE",
    dot: "#3B82F6",
  },
  COMPLETED: {
    label: "Đã trả khách",
    color: "#047857",
    bg: "#ECFDF5",
    border: "#A7F3D0",
    dot: "#10B981",
  },
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
// 2. COMPONENT CHÍNH (DASHBOARD V14 STYLE)
// ==========================================
export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("DASHBOARD");

  const [orders, setOrders] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [priceList, setPriceList] = useState([]);
  const [staffList, setStaffList] = useState([]);

  // Tài khoản đang đăng nhập trên Web (Đồng bộ trực tiếp với bảng users trong MySQL)
  const [selectedUserPhone, setSelectedUserPhone] = useState(() => {
    return localStorage.getItem("web_active_phone") || "0333041030";
  });
  const [showUserMenu, setShowUserMenu] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
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
  const [newStaff, setNewStaff] = useState({
    name: "", phone: "", password: "", role: "STAFF", position: "Nhân viên tiếp nhận",
  });

  // Tìm thông tin người dùng hiện tại từ danh sách MySQL trả về
  const currentUser =
    staffList.find((u) => u.phone === selectedUserPhone) ||
    staffList[0] || {
      name: "Sếp Quản Lý",
      phone: "0333041030",
      role: "ADMIN",
    };

  const isAdmin = (currentUser.role || "ADMIN").toUpperCase() === "ADMIN";

  const handleSelectUser = (user) => {
    setSelectedUserPhone(user.phone);
    localStorage.setItem("web_active_phone", user.phone);
    setShowUserMenu(false);
    showToast(`👤 Đã chuyển sang tài khoản: ${user.name} (${user.role})`);
  };

  const formatDate = (dateString) => {
    const d = new Date(dateString);
    return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
  };
  const getFormattedDate = (dateStr) => {
    if (!dateStr) return null;
    const [y, m, d] = dateStr.split("-");
    return `${d}/${m}/${y}`;
  };
  const formatMoney = (amount) => new Intl.NumberFormat("vi-VN").format(amount || 0) + "đ";

  // ==========================================
  // 3. KẾT NỐI MÁY CHỦ (API FETCH)
  // ==========================================
  const loadData = () => {
    fetch(`${API_BASE}/api/orders`)
      .then((res) => res.json())
      .then((data) => {
        if (!Array.isArray(data)) return;
        const formatted = data.map((o) => ({
          db_id: o.id,
          id: o.order_code,
          name: o.customer_name,
          phone: o.customer_phone || "",
          address: o.address || "",
          items: o.items,
          total: new Intl.NumberFormat("vi-VN").format(o.total_amount) + "đ",
          rawTotal: Number(o.total_amount) || 0,
          status: o.status,
          date: formatDate(o.created_at),
          rawCreatedAt: o.created_at,
        }));
        setOrders(formatted);
      })
      .catch(() => {});

    fetch(`${API_BASE}/api/transactions`)
      .then((res) => res.json())
      .then((data) => {
        if (!Array.isArray(data)) return;
        const formatted = data.map((t) => ({
          id: t.trans_code,
          type: t.type,
          amount: Number(t.amount) || 0,
          desc: t.description,
          date: formatDate(t.created_at),
        }));
        setTransactions(formatted);
      })
      .catch(() => {});

    fetch(`${API_BASE}/api/prices`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setPriceList(data);
      })
      .catch(() => {});

    fetch(`${API_BASE}/api/staff`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          const normalized = data.map((u) => ({
            ...u,
            role: (u.role || "STAFF").toUpperCase(),
          }));
          setStaffList(normalized);
        }
      })
      .catch(() => {});
  };

  useEffect(() => {
    loadData();
  }, []);

  // ==========================================
  // 4. CÁC HÀM XỬ LÝ NGHIỆP VỤ (CÓ KIỂM TRA QUYỀN)
  // ==========================================
  const handleProductOrQtyChange = (field, value) => {
    const updated = { ...newOrder, [field]: value };
    if (field === "serviceName" || field === "qty") {
      const selectedItem = priceList.find((p) => p.name === updated.serviceName);
      const price = selectedItem ? parseInt(selectedItem.price) : 0;
      const quantity = parseInt(updated.qty) || 1;
      updated.total = price * quantity;
    }
    setNewOrder(updated);
  };

  const handleCreateOrder = (e) => {
    e.preventDefault();
    if (!newOrder.name) return showToast("⚠️ Vui lòng nhập Tên khách hàng!");
    if (!newOrder.serviceName || newOrder.qty <= 0) return showToast("⚠️ Chọn dịch vụ và nhập số lượng!");

    const typePrefix = newOrder.customerType === "AGENT" ? "[ĐIỂM THU] " : "[KHÁCH LẺ] ";
    const notePart = newOrder.note ? ` - Ghi chú: ${newOrder.note}` : "";
    const itemsFormatted = `${typePrefix}${newOrder.qty} ${newOrder.serviceName}${notePart}`;

    const payload = {
      order_code: generateCode("DH"),
      customer_name: newOrder.name,
      customer_phone: newOrder.phone.replace(/\D/g, ""),
      address: newOrder.address,
      items: itemsFormatted,
      total_amount: parseInt(newOrder.total) || 0,
    };

    fetch(`${API_BASE}/api/orders`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
      .then((res) => {
        if (!res.ok) throw new Error();
        showToast("✅ Đã tiếp nhận đơn hàng thành công!");
        loadData();
        setNewOrder({ name: "", phone: "", address: "", customerType: "LE", serviceName: "", qty: 1, total: 0, note: "" });
        setActiveTab("WAREHOUSE");
      })
      .catch(() => showToast("❌ Lỗi lưu đơn hàng."));
  };

  const changeStatus = (dbId, orderId, newStatus) => {
    if (!isAdmin) {
      return showToast("🔒 Tài khoản Nhân viên (STAFF) chỉ được xem và thêm đơn, không có quyền trả hàng!");
    }
    fetch(`${API_BASE}/api/orders/${dbId}/status`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ newStatus }),
    }).then(() => {
      if (newStatus === "COMPLETED") {
        const order = orders.find((o) => o.db_id === dbId);
        if (order && order.rawTotal > 0) {
          handleAddTransaction("IN", order.rawTotal, `Thu tiền đơn ${order.id} - ${order.name}`);
        }
      }
      loadData();
      showToast("✅ Đã cập nhật trạng thái đơn hàng!");
    });
  };

  const handleAddTransaction = (type, amount, desc) => {
    const payload = {
      trans_code: generateCode(type === "IN" ? "THU" : "CHI"),
      type: type,
      amount: parseInt(amount.toString().replace(/\D/g, "")) || 0,
      description: desc,
    };
    fetch(`${API_BASE}/api/transactions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }).then(() => loadData());
  };

  const handleCreateExpense = (e) => {
    e.preventDefault();
    if (!isAdmin) {
      return showToast("🔒 Chỉ Quản lý (ADMIN) mới có quyền ghi phiếu chi tiền!");
    }
    if (!newExpense.amount || !newExpense.desc) return showToast("⚠️ Vui lòng nhập đủ số tiền và lý do chi!");
    handleAddTransaction("OUT", newExpense.amount, newExpense.desc);
    setNewExpense({ amount: "", desc: "" });
    showToast("💸 Đã ghi nhận khoản chi vào sổ quỹ!");
  };

  const handleCreateStaff = (e) => {
    e.preventDefault();
    if (!isAdmin) {
      return showToast("🔒 Chỉ Quản lý (ADMIN) mới có quyền thêm hoặc sửa nhân sự!");
    }
    if (!newStaff.name || !newStaff.phone || !newStaff.password) {
      return showToast("⚠️ Vui lòng nhập Tên, SĐT và Mật khẩu cấp cho nhân viên!");
    }

    fetch(`${API_BASE}/api/staff`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newStaff),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) return showToast(`❌ ${data.error}`);
        showToast("✅ Đã lưu thông tin nhân sự & phân quyền!");
        setNewStaff({ name: "", phone: "", password: "", role: "STAFF", position: "Nhân viên tiếp nhận" });
        loadData();
      })
      .catch(() => showToast("❌ Không thể lưu nhân viên."));
  };

  const handleToggleStaff = (id) => {
    if (!isAdmin) {
      return showToast("🔒 Tài khoản Nhân viên không có quyền thay đổi phân quyền!");
    }
    fetch(`${API_BASE}/api/staff/${id}/toggle`, { method: "PUT" })
      .then(() => {
        showToast("🔄 Đã chuyển đổi quyền ADMIN ⇄ STAFF trong MySQL!");
        loadData();
      })
      .catch(() => showToast("❌ Lỗi cập nhật quyền nhân sự."));
  };

  // ==========================================
  // 5. TÍNH TOÁN CHỈ SỐ DASHBOARD V14
  // ==========================================
  const todayFormattedDate = getFormattedDate(selectedDate);
  const filteredTransactions = transactions.filter((t) => t.date === todayFormattedDate);

  const totalInToday = filteredTransactions.filter((t) => t.type === "IN").reduce((sum, t) => sum + t.amount, 0);
  const totalOutToday = filteredTransactions.filter((t) => t.type === "OUT").reduce((sum, t) => sum + t.amount, 0);
  const profitToday = totalInToday - totalOutToday;

  const totalBalanceAllTime = transactions.reduce(
    (acc, t) => (t.type === "IN" ? acc + t.amount : acc - t.amount),
    0
  );

  const pendingOrders = orders.filter((o) => o.status !== "COMPLETED").length;
  const completedOrders = orders.filter((o) => o.status === "COMPLETED").length;

  const customerMap = new Map();
  orders.forEach((o) => {
    const parsed = parseItems(o.items);
    let key = o.phone ? o.phone : o.name;
    if (!customerMap.has(key)) {
      customerMap.set(key, { name: o.name, phone: o.phone, isAgent: parsed.isAgent, spent: o.rawTotal });
    } else {
      customerMap.get(key).spent += o.rawTotal;
      if (parsed.isAgent) customerMap.get(key).isAgent = true;
    }
  });
  const topCustomers = Array.from(customerMap.values()).sort((a, b) => b.spent - a.spent).slice(0, 3);

  const last7Days = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return {
      displayStr: `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`,
      filterDate: getFormattedDate(
        `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
      ),
    };
  });

  const chartData = last7Days.map((day) => {
    const dayIn = transactions
      .filter((t) => t.date === day.filterDate && t.type === "IN")
      .reduce((sum, t) => sum + t.amount, 0);
    const dayOut = transactions
      .filter((t) => t.date === day.filterDate && t.type === "OUT")
      .reduce((sum, t) => sum + t.amount, 0);
    return { label: day.displayStr, income: dayIn, expense: dayOut };
  });
  const maxChartValue = Math.max(...chartData.map((d) => Math.max(d.income, d.expense)), 500000);

  const sortedOrdersForTable = [...orders]
    .filter((o) => (statusFilter === "ALL" ? true : o.status === statusFilter))
    .filter(
      (o) =>
        o.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.phone.includes(searchQuery) ||
        o.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.id.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      if (a.status !== "COMPLETED" && b.status === "COMPLETED") return -1;
      if (a.status === "COMPLETED" && b.status !== "COMPLETED") return 1;
      return new Date(b.rawCreatedAt).getTime() - new Date(a.rawCreatedAt).getTime();
    });

  // Helper render viên thuốc Trạng thái kho gọn đẹp, không bao giờ rớt dòng
  const renderStatusBadge = (statusKey) => {
    const cfg = STATUS_CONFIG[statusKey] || {
      label: statusKey,
      color: "#475569",
      bg: "#F1F5F9",
      border: "#E2E8F0",
      dot: "#64748B",
    };
    return (
      <span
        style={{
          ...styles.statusPill,
          backgroundColor: cfg.bg,
          color: cfg.color,
          border: `1px solid ${cfg.border}`,
        }}
      >
        <span style={{ ...styles.statusDot, backgroundColor: cfg.dot }} />
        {cfg.label}
      </span>
    );
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        body, html { margin: 0; padding: 0; width: 100%; height: 100%; font-family: 'Plus Jakarta Sans', system-ui, sans-serif; background-color: #ECEEF4; color: #141619; }
        #root { width: 100%; height: 100%; display: flex; padding: 16px; box-sizing: border-box; }
        * { box-sizing: border-box; }
        input:focus, select:focus { outline: 2px solid #FF5B37; border-color: transparent !important; }
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-thumb { background: #CBD5E1; border-radius: 10px; }
      `}</style>

      {toastMsg && <div style={styles.toast}>{toastMsg}</div>}

      <div style={styles.appShell}>
        {/* === THANH ICON RAIL BÊN TRÁI === */}
        <div style={styles.leftRail}>
          <img src={logoImg} alt="Logo" style={{width: '42px', height: '42px', borderRadius: '50%'}} />

          <div style={styles.railMenu}>
            <button
              style={{ ...styles.railBtn, ...(activeTab === "DASHBOARD" ? styles.railBtnActive : {}) }}
              onClick={() => setActiveTab("DASHBOARD")}
              title="Tổng quan"
            >
              📊
            </button>
            <button
              style={{ ...styles.railBtn, ...(activeTab === "WAREHOUSE" ? styles.railBtnActive : {}) }}
              onClick={() => setActiveTab("WAREHOUSE")}
              title="Kho & Đơn hàng"
            >
              🧺
            </button>
            <button
              style={{ ...styles.railBtn, ...(activeTab === "CREATE" ? styles.railBtnActive : {}) }}
              onClick={() => setActiveTab("CREATE")}
              title="Quầy tiếp nhận"
            >
              ✍️
            </button>
            <button
              style={{ ...styles.railBtn, ...(activeTab === "STAFF" ? styles.railBtnActive : {}) }}
              onClick={() => setActiveTab("STAFF")}
              title="Quản lý nhân viên"
            >
              👥
            </button>
          </div>

          <div style={styles.railFooter}>
            <button style={styles.railBtn} onClick={loadData} title="Đồng bộ lại từ MySQL">🔄</button>
          </div>
        </div>

        {/* === KHU VỰC NỘI DUNG CHÍNH === */}
        <div style={styles.mainArea}>
          {/* TOP NAVIGATION PILL BAR */}
          <div style={styles.topBar}>
            <div style={styles.brandTitleWrap}>
              <span style={styles.brandDot}>V14</span>
              <span style={styles.brandName}>Hệ thống Quản lý Giặt Chăn</span>
            </div>

            <div style={styles.pillNavContainer}>
              {[
                { id: "DASHBOARD", label: "Overview" },
                { id: "WAREHOUSE", label: "Kho & Đơn Hàng" },
                { id: "CREATE", label: "Quầy Tiếp Nhận" },
                { id: "STAFF", label: "Nhân Sự & Phân Quyền" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    ...styles.pillNavItem,
                    ...(activeTab === tab.id ? styles.pillNavItemActive : {}),
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div style={styles.topRightActions}>
              <input
                type="date"
                style={styles.datePill}
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />

              {/* Ô TÀI KHOẢN ĐỘNG (LẤY TỪ BẢNG USERS TRONG MYSQL & CHO PHÉP CHUYỂN ĐỔI) */}
              <div style={{ position: "relative" }}>
                <div
                  style={styles.profilePill}
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  title="Bấm để đổi tài khoản kiểm tra phân quyền"
                >
                  <div
                    style={{
                      ...styles.profileAvatar,
                      backgroundColor: isAdmin ? "#141619" : "#2563EB",
                    }}
                  >
                    {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : "U"}
                  </div>
                  <div>
                    <div style={{ fontSize: "12px", fontWeight: "800", color: "#141619", whiteSpace: "nowrap" }}>
                      {currentUser.name} ▾
                    </div>
                    <div
                      style={{
                        fontSize: "10px",
                        fontWeight: "700",
                        color: isAdmin ? "#059669" : "#EA580C",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {isAdmin ? "👑 Toàn quyền (Admin)" : "🔒 Nhân viên (Staff)"}
                    </div>
                  </div>
                </div>

                {/* MENU CHỌN TÀI KHOẢN ĐỒNG BỘ TỪ MYSQL */}
                {showUserMenu && (
                  <div style={styles.userDropdown}>
                    <div style={styles.dropdownHeader}>
                      Đổi tài khoản (Đồng bộ MySQL)
                    </div>
                    {staffList.map((u) => {
                      const active = u.phone === currentUser.phone;
                      const uAdmin = (u.role || "").toUpperCase() === "ADMIN";
                      return (
                        <div
                          key={u.id}
                          style={{
                            ...styles.dropdownItem,
                            backgroundColor: active ? "#F8FAFC" : "transparent",
                          }}
                          onClick={() => handleSelectUser(u)}
                        >
                          <div>
                            <div style={{ fontSize: "13px", fontWeight: "700", color: "#141619" }}>
                              {u.name} {active && "✓"}
                            </div>
                            <div style={{ fontSize: "11px", color: "#64748B" }}>{u.phone}</div>
                          </div>
                          <span style={uAdmin ? styles.agentTag : styles.retailTag}>
                            {u.role}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* NỘI DUNG CUỘN */}
          <div style={styles.scrollContent}>
            {/* LỜI CHÀO HERO CẬP NHẬT THEO TÀI KHOẢN ĐANG CHỌN */}
            <div style={styles.greetingHeader}>
              <div>
                <h1 style={styles.greetingTitle}>Xin chào, {currentUser.name} 👋</h1>
                <p style={styles.greetingSub}>
                  Vai trò hiện tại:{" "}
                  <strong style={{ color: isAdmin ? "#059669" : "#EA580C" }}>
                    {isAdmin
                      ? "Quản lý"
                      : "Nhân viên"}
                  </strong>
                </p>
              </div>
              <div style={{ display: "flex", gap: "10px" }}>
                <button style={styles.darkPillBtn} onClick={() => setActiveTab("CREATE")}>
                  + Tạo Đơn Mới
                </button>
                <button style={styles.lightPillBtn} onClick={() => setActiveTab("STAFF")}>
                  👥 Quản Lý Nhân Viên ({staffList.length})
                </button>
              </div>
            </div>

            {/* ==========================================
                TAB 1: OVERVIEW (BENTO GRID V14)
               ========================================== */}
            {activeTab === "DASHBOARD" && (
              <>
                <div style={styles.bentoTopGrid}>
                  <div style={styles.balanceCard}>
                    <div style={styles.cardHeaderRow}>
                      <div>
                        <span style={styles.mutedLabel}>Tổng Quỹ Tiền Mặt (Lũy kế)</span>
                        <h2 style={styles.hugeBalance}>{formatMoney(totalBalanceAllTime)}</h2>
                      </div>
                      <span style={styles.currencyBadge}>VNĐ ▾</span>
                    </div>

                    <div style={styles.actionPillRow}>
                      <button style={styles.actionBtnDark} onClick={() => setActiveTab("CREATE")}>
                        ↗ Tiếp nhận đơn
                      </button>
                      <button style={styles.actionBtnLight} onClick={() => setActiveTab("WAREHOUSE")}>
                        📦 Xem kho chăn
                      </button>
                    </div>

                    <div style={{ marginTop: "18px" }}>
                      <div style={{ ...styles.mutedLabel, marginBottom: "10px" }}>👑 Top Khách Hàng Thân Thiết</div>
                      <div style={styles.miniWalletsGrid}>
                        {topCustomers.length === 0 && (
                          <div style={{ fontSize: "12px", color: "#94A3B8" }}>Chưa có dữ liệu khách hàng</div>
                        )}
                        {topCustomers.map((c, i) => (
                          <div key={i} style={styles.miniWalletBox}>
                            <div style={{ fontSize: "11px", fontWeight: "700", color: "#64748B", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                              #{i + 1} {c.name}
                            </div>
                            <div style={{ fontSize: "14px", fontWeight: "800", color: "#141619", marginTop: "4px" }}>
                              {formatMoney(c.spent)}
                            </div>
                            <div style={{ fontSize: "10px", color: "#10B981", marginTop: "2px" }}>
                              {c.phone || (c.isAgent ? "Đại lý" : "Khách lẻ")}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div style={styles.fourCardsGrid}>
                    <div style={styles.orangeHeroCard}>
                      <div style={styles.cardHeaderRow}>
                        <span style={{ fontSize: "13px", fontWeight: "600", color: "rgba(255,255,255,0.9)" }}>
                          Doanh Thu Ngày
                        </span>
                        <span style={styles.orangeCardIcon}>↗</span>
                      </div>
                      <h3 style={styles.orangeCardValue}>{formatMoney(totalInToday)}</h3>
                      <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.85)", marginTop: "8px" }}>
                        📅 Ngày {todayFormattedDate}
                      </div>
                    </div>

                    <div style={styles.smallStatCard}>
                      <div style={styles.cardHeaderRow}>
                        <span style={styles.mutedLabel}>Chi Phí Ngày</span>
                        <span style={styles.grayCardIcon}>↘</span>
                      </div>
                      <h3 style={styles.smallStatValue}>{formatMoney(totalOutToday)}</h3>
                      <div style={{ fontSize: "11px", color: "#EF4444", fontWeight: "600", marginTop: "8px" }}>
                        Khoản chi vận hành
                      </div>
                    </div>

                    <div style={styles.smallStatCard}>
                      <div style={styles.cardHeaderRow}>
                        <span style={styles.mutedLabel}>Lợi Nhuận Ngày</span>
                        <span style={styles.grayCardIcon}>💎</span>
                      </div>
                      <h3
                        style={{
                          ...styles.smallStatValue,
                          color: profitToday >= 0 ? "#059669" : "#E11D48",
                        }}
                      >
                        {formatMoney(profitToday)}
                      </h3>
                      <div style={{ fontSize: "11px", color: "#10B981", fontWeight: "600", marginTop: "8px" }}>
                        Thu - Chi thực tế
                      </div>
                    </div>

                    <div style={styles.smallStatCard}>
                      <div style={styles.cardHeaderRow}>
                        <span style={styles.mutedLabel}>Chăn Trong Kho</span>
                        <span style={styles.grayCardIcon}>🧺</span>
                      </div>
                      <h3 style={styles.smallStatValue}>
                        {pendingOrders} <span style={{ fontSize: "13px", color: "#64748B" }}>đơn</span>
                      </h3>
                      <div style={{ fontSize: "11px", color: "#2563EB", fontWeight: "600", marginTop: "8px" }}>
                        Đã trả: {completedOrders} đơn
                      </div>
                    </div>
                  </div>

                  <div style={styles.chartCard}>
                    <div style={styles.cardHeaderRow}>
                      <div>
                        <div style={{ fontSize: "15px", fontWeight: "800", color: "#141619" }}>
                          Biểu Đồ Thu & Chi
                        </div>
                        <div style={{ fontSize: "11px", color: "#64748B", marginTop: "2px" }}>
                          So sánh 7 ngày gần nhất
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: "10px", fontSize: "11px", fontWeight: "700" }}>
                        <span style={{ color: "#FF5B37" }}>● Thu</span>
                        <span style={{ color: "#141619" }}>● Chi</span>
                      </div>
                    </div>

                    <div style={styles.dualChartArea}>
                      {chartData.map((d, idx) => (
                        <div key={idx} style={styles.dualBarGroup}>
                          <div style={styles.dualBarTrack}>
                            <div
                              style={{
                                ...styles.barOrange,
                                height: `${Math.max((d.income / maxChartValue) * 100, 6)}%`,
                              }}
                              title={`Thu: ${formatMoney(d.income)}`}
                            />
                            <div
                              style={{
                                ...styles.barDark,
                                height: `${Math.max((d.expense / maxChartValue) * 100, 6)}%`,
                              }}
                              title={`Chi: ${formatMoney(d.expense)}`}
                            />
                          </div>
                          <span style={styles.dualBarLabel}>{d.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* DÒNG DƯỚI */}
                <div style={styles.bentoBottomGrid}>
                  <div style={styles.limitCard}>
                    <span style={styles.mutedLabel}>Tỷ Lệ Trả Chăn Hoàn Tất</span>
                    <div style={{ fontSize: "22px", fontWeight: "800", margin: "10px 0" }}>
                      {orders.length > 0 ? Math.round((completedOrders / orders.length) * 100) : 0}%
                    </div>
                    <div style={styles.progressTrack}>
                      <div
                        style={{
                          ...styles.progressFill,
                          width: `${orders.length > 0 ? (completedOrders / orders.length) * 100 : 0}%`,
                        }}
                      />
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "#64748B", marginTop: "10px" }}>
                      <span>Đang giặt: {pendingOrders} đơn</span>
                      <span>Tổng: {orders.length} đơn</span>
                    </div>

                    <div style={{ marginTop: "22px", paddingTop: "16px", borderTop: "1px solid #F1F5F9" }}>
                      <span style={styles.mutedLabel}>Tài Khoản Trong Hệ Thống</span>
                      <div style={{ fontSize: "18px", fontWeight: "800", marginTop: "6px", color: "#141619" }}>
                        {staffList.length} tài khoản (MySQL)
                      </div>
                    </div>
                  </div>

                  <div style={styles.recentTableCard}>
                    <div style={{ ...styles.cardHeaderRow, marginBottom: "14px" }}>
                      <div style={{ fontSize: "16px", fontWeight: "800" }}>Hoạt Động Đơn Hàng Gần Đây</div>
                      <div style={{ display: "flex", gap: "8px" }}>
                        <input
                          type="text"
                          placeholder="🔍 Tìm tên, SĐT, địa chỉ, mã đơn..."
                          style={styles.miniSearch}
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <button style={styles.lightPillBtn} onClick={() => setActiveTab("WAREHOUSE")}>
                          Xem tất cả ➔
                        </button>
                      </div>
                    </div>

                    <table style={styles.v14Table}>
                      <thead>
                        <tr>
                          <th style={styles.v14Th}>Mã Đơn</th>
                          <th style={styles.v14Th}>Khách Hàng</th>
                          <th style={styles.v14Th}>SĐT</th>
                          <th style={styles.v14Th}>Địa Chỉ</th>
                          <th style={styles.v14Th}>Dịch Vụ Giặt</th>
                          <th style={{ ...styles.v14Th, textAlign: "right" }}>Thành Tiền</th>
                          <th style={{ ...styles.v14Th, textAlign: "center" }}>Trạng Thái Kho</th>
                          <th style={{ ...styles.v14Th, textAlign: "right" }}>Hành Động</th>
                        </tr>
                      </thead>
                      <tbody>
                        {sortedOrdersForTable.slice(0, 5).map((order) => {
                          const parsed = parseItems(order.items);
                          return (
                            <tr key={order.id} style={styles.v14Tr}>
                              <td style={{ ...styles.v14Td, whiteSpace: "nowrap" }}>
                                <span style={{ fontWeight: "800" }}>#{order.id}</span>
                              </td>
                              <td style={styles.v14Td}>
                                <div style={{ fontWeight: "700", color: "#141619" }}>{order.name}</div>
                                <div
                                  style={{
                                    fontSize: "11px",
                                    color: parsed.isAgent ? "#B45309" : "#64748B",
                                    fontWeight: parsed.isAgent ? "700" : "500",
                                    marginTop: "2px",
                                  }}
                                >
                                  {parsed.isAgent ? "Đại lý" : "Khách lẻ"}
                                </div>
                              </td>
                              <td style={{ ...styles.v14Td, whiteSpace: "nowrap", color: "#334155", fontWeight: "600" }}>
                                {order.phone || "---"}
                              </td>
                              <td style={{ ...styles.v14Td, color: "#64748B" }}>
                                {order.address || "---"}
                              </td>
                              <td style={styles.v14Td}>
                                <span style={{ fontWeight: "600" }}>{parsed.service}</span>
                              </td>
                              <td style={{ ...styles.v14Td, fontWeight: "800", textAlign: "right", whiteSpace: "nowrap" }}>
                                {order.total}
                              </td>
                              <td style={{ ...styles.v14Td, textAlign: "center", whiteSpace: "nowrap" }}>
                                {renderStatusBadge(order.status)}
                              </td>
                              <td style={{ ...styles.v14Td, textAlign: "right", whiteSpace: "nowrap" }}>
                                {order.status !== "COMPLETED" ? (
                                  <button
                                    style={{
                                      ...styles.completeMiniBtn,
                                      opacity: isAdmin ? 1 : 0.55,
                                    }}
                                    onClick={() => changeStatus(order.db_id, order.id, "COMPLETED")}
                                  >
                                    ✔ Trả Hàng
                                  </button>
                                ) : (
                                  <span style={{ fontSize: "12px", color: "#10B981", fontWeight: "700" }}>✓ Đã giao</span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}

            {/* ==========================================
                TAB 2: KHO & ĐƠN HÀNG (TÁCH CỘT SĐT & ĐỊA CHỈ RÕ RÀNG)
               ========================================== */}
            {activeTab === "WAREHOUSE" && (
              <div style={styles.recentTableCard}>
                <div style={{ ...styles.cardHeaderRow, marginBottom: "18px" }}>
                  <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                    <input
                      type="text"
                      placeholder="🔍 Tìm mã đơn, tên khách, SĐT, địa chỉ..."
                      style={{ ...styles.miniSearch, width: "280px" }}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    {["ALL", "NEED_PICKUP", "COMPLETED"].map((st) => (
                      <button
                        key={st}
                        onClick={() => setStatusFilter(st)}
                        style={{
                          ...styles.filterChip,
                          ...(statusFilter === st ? styles.filterChipActive : {}),
                        }}
                      >
                        {st === "ALL" ? "Tất cả đơn" : STATUS_CONFIG[st]?.label}
                      </button>
                    ))}
                  </div>
                  <button style={styles.darkPillBtn} onClick={() => setActiveTab("CREATE")}>
                    + Tiếp Nhận Đơn Mới
                  </button>
                </div>

                <table style={styles.v14Table}>
                  <thead>
                    <tr>
                      <th style={{ ...styles.v14Th, width: "120px" }}>Mã / Ngày Nhận</th>
                      <th style={{ ...styles.v14Th, width: "160px" }}>Khách Hàng</th>
                      <th style={{ ...styles.v14Th, width: "120px" }}>Số Điện Thoại</th>
                      <th style={{ ...styles.v14Th, width: "150px" }}>Địa Chỉ</th>
                      <th style={styles.v14Th}>Chi Tiết Chăn & Ghi Chú</th>
                      <th style={{ ...styles.v14Th, width: "120px", textAlign: "right" }}>Tổng Tiền</th>
                      <th style={{ ...styles.v14Th, width: "140px", textAlign: "center" }}>Trạng Thái Kho</th>
                      <th style={{ ...styles.v14Th, width: "130px", textAlign: "right" }}>Hành Động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedOrdersForTable.length === 0 && (
                      <tr>
                        <td colSpan="8" style={{ textAlign: "center", padding: "48px", color: "#94A3B8" }}>
                          Không tìm thấy đơn hàng nào khớp bộ lọc.
                        </td>
                      </tr>
                    )}
                    {sortedOrdersForTable.map((order) => {
                      const parsed = parseItems(order.items);
                      return (
                        <tr key={order.id} style={styles.v14Tr}>
                          <td style={{ ...styles.v14Td, whiteSpace: "nowrap" }}>
                            <div style={{ fontWeight: "800", color: "#141619" }}>#{order.id}</div>
                            <div style={{ fontSize: "11px", color: "#64748B", marginTop: "2px" }}>{order.date}</div>
                          </td>
                          <td style={styles.v14Td}>
                            <div style={{ fontWeight: "700", color: "#141619" }}>{order.name}</div>
                            <div
                              style={{
                                fontSize: "11px",
                                color: parsed.isAgent ? "#B45309" : "#64748B",
                                fontWeight: parsed.isAgent ? "700" : "500",
                                marginTop: "2px",
                              }}
                            >
                              {parsed.isAgent ? "Đại lý" : "Khách lẻ"}
                            </div>
                          </td>
                          <td style={{ ...styles.v14Td, whiteSpace: "nowrap", fontWeight: "600", color: "#334155" }}>
                            {order.phone || "---"}
                          </td>
                          <td style={{ ...styles.v14Td, color: "#475569" }}>
                            {order.address || "---"}
                          </td>
                          <td style={styles.v14Td}>
                            <div style={{ fontWeight: "600", color: "#1E293B" }}>{parsed.service}</div>
                            {parsed.note && <div style={styles.noteBox}>📝 {parsed.note}</div>}
                          </td>
                          <td
                            style={{
                              ...styles.v14Td,
                              fontWeight: "800",
                              color: "#FF5B37",
                              textAlign: "right",
                              whiteSpace: "nowrap",
                              fontSize: "14px",
                            }}
                          >
                            {order.total}
                          </td>
                          <td style={{ ...styles.v14Td, textAlign: "center", whiteSpace: "nowrap" }}>
                            {renderStatusBadge(order.status)}
                          </td>
                          <td style={{ ...styles.v14Td, textAlign: "right", whiteSpace: "nowrap" }}>
                            {order.status !== "COMPLETED" ? (
                              <button
                                style={{
                                  ...styles.completeMiniBtn,
                                  opacity: isAdmin ? 1 : 0.55,
                                }}
                                onClick={() => changeStatus(order.db_id, order.id, "COMPLETED")}
                              >
                                ✔ Trả Hàng
                              </button>
                            ) : (
                              <span style={{ color: "#10B981", fontSize: "12px", fontWeight: "700" }}>✓ Đã giao</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* ==========================================
                TAB 3: QUẦY TIẾP NHẬN ĐƠN & GHI SỔ CHI
               ========================================== */}
            {activeTab === "CREATE" && (
              <div style={styles.bentoBottomGrid}>
                <div style={styles.recentTableCard}>
                  <h3 style={{ marginTop: 0, marginBottom: "18px", fontSize: "18px", fontWeight: "800" }}>
                    ✍️ Tiếp Nhận Đơn Giặt Chăn (Khách Lẻ & Đại Lý)
                  </h3>
                  <form onSubmit={handleCreateOrder}>
                    <div style={styles.formRow}>
                      <div style={styles.formGroup}>
                        <label style={styles.label}>Tên Khách Hàng / Đại Lý (*)</label>
                        <input
                          type="text"
                          style={styles.input}
                          placeholder="VD: Cô Mười / Đại lý Hòa Bình..."
                          value={newOrder.name}
                          onChange={(e) => setNewOrder({ ...newOrder, name: e.target.value })}
                          required
                        />
                      </div>
                      <div style={styles.formGroup}>
                        <label style={styles.label}>Số Điện Thoại</label>
                        <input
                          type="text"
                          style={styles.input}
                          placeholder="VD: 0912345678"
                          value={newOrder.phone}
                          onChange={(e) => setNewOrder({ ...newOrder, phone: e.target.value })}
                        />
                      </div>
                    </div>

                    <div style={styles.formRow}>
                      <div style={styles.formGroup}>
                        <label style={styles.label}>Phân Loại Khách</label>
                        <select
                          style={styles.input}
                          value={newOrder.customerType}
                          onChange={(e) => setNewOrder({ ...newOrder, customerType: e.target.value })}
                        >
                          <option value="LE">👤 Khách Lẻ</option>
                          <option value="AGENT">🏢 Đại Lý / Điểm Thu Gom</option>
                        </select>
                      </div>
                      <div style={styles.formGroup}>
                        <label style={styles.label}>Địa Chỉ Khách Hàng</label>
                        <input
                          type="text"
                          style={styles.input}
                          placeholder="VD: Khu 2, thị trấn..."
                          value={newOrder.address}
                          onChange={(e) => setNewOrder({ ...newOrder, address: e.target.value })}
                        />
                      </div>
                    </div>

                    <div style={styles.formRow}>
                      <div style={{ ...styles.formGroup, flex: 2 }}>
                        <label style={styles.label}>Chọn Loại Chăn / Dịch Vụ (*)</label>
                        <select
                          style={{ ...styles.input, fontWeight: "700" }}
                          value={newOrder.serviceName}
                          onChange={(e) => handleProductOrQtyChange("serviceName", e.target.value)}
                        >
                          <option value="">--- Chọn bảng giá dịch vụ ---</option>
                          {priceList.map((p) => (
                            <option key={p.id || p.name} value={p.name}>
                              {p.name} — {formatMoney(p.price)}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div style={{ ...styles.formGroup, flex: 1 }}>
                        <label style={styles.label}>Số Lượng</label>
                        <input
                          type="number"
                          min="1"
                          style={{ ...styles.input, textAlign: "center", fontWeight: "800" }}
                          value={newOrder.qty}
                          onChange={(e) => handleProductOrQtyChange("qty", e.target.value)}
                        />
                      </div>
                    </div>

                    <div style={styles.formRow}>
                      <div style={styles.formGroup}>
                        <label style={styles.label}>Ghi Chú Đơn Hàng</label>
                        <input
                          type="text"
                          style={styles.input}
                          placeholder="VD: Giặt riêng, lấy gấp..."
                          value={newOrder.note}
                          onChange={(e) => setNewOrder({ ...newOrder, note: e.target.value })}
                        />
                      </div>
                      <div style={styles.formGroup}>
                        <label style={styles.label}>Thành Tiền (VNĐ)</label>
                        <input
                          type="number"
                          style={{ ...styles.input, fontWeight: "800", color: "#FF5B37", background: "#FFF7ED" }}
                          value={newOrder.total}
                          onChange={(e) => setNewOrder({ ...newOrder, total: e.target.value })}
                        />
                      </div>
                    </div>

                    <button type="submit" style={{ ...styles.darkPillBtn, width: "100%", padding: "14px" }}>
                      LƯU ĐƠN HÀNG VÀO KHO
                    </button>
                  </form>
                </div>

                <div style={styles.limitCard}>
                  <h3 style={{ marginTop: 0, marginBottom: "16px", fontSize: "16px", fontWeight: "800", color: "#E11D48" }}>
                    💸 Ghi Phiếu Chi Vận Hành {!isAdmin && "(Chỉ Admin)"}
                  </h3>
                  <form onSubmit={handleCreateExpense}>
                    <div style={{ ...styles.formGroup, marginBottom: "14px" }}>
                      <label style={styles.label}>Số tiền chi (VNĐ)</label>
                      <input
                        type="number"
                        style={styles.input}
                        placeholder="VD: 120000"
                        value={newExpense.amount}
                        onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                      />
                    </div>
                    <div style={{ ...styles.formGroup, marginBottom: "18px" }}>
                      <label style={styles.label}>Nội dung chi tiêu</label>
                      <input
                        type="text"
                        style={styles.input}
                        placeholder="VD: Mua nước giặt, túi bóng..."
                        value={newExpense.desc}
                        onChange={(e) => setNewExpense({ ...newExpense, desc: e.target.value })}
                      />
                    </div>
                    <button
                      type="submit"
                      style={{
                        ...styles.darkPillBtn,
                        width: "100%",
                        backgroundColor: "#FF5B37",
                        opacity: isAdmin ? 1 : 0.55,
                      }}
                    >
                      XÁC NHẬN CHI TIỀN
                    </button>
                  </form>
                </div>
              </div>
            )}

            {/* ==========================================
                TAB 4: QUẢN LÝ NHÂN VIÊN & PHÂN QUYỀN APP
               ========================================== */}
            {activeTab === "STAFF" && (
              <div style={styles.bentoBottomGrid}>
                <div style={styles.limitCard}>
                  <h3 style={{ marginTop: 0, marginBottom: "6px", fontSize: "16px", fontWeight: "800" }}>
                    ➕ Thêm Nhân Viên & Cấp Quyền App
                  </h3>
                  <p style={{ fontSize: "12px", color: "#64748B", marginBottom: "16px" }}>
                    Tài khoản tạo tại đây lưu thẳng vào bảng `users` trong MySQL. Nhân viên (`STAFF`) chỉ được phép xem và tạo đơn Khách lẻ & Đại lý.
                  </p>

                  <form onSubmit={handleCreateStaff}>
                    <div style={{ ...styles.formGroup, marginBottom: "12px" }}>
                      <label style={styles.label}>Họ và Tên Nhân Viên (*)</label>
                      <input
                        type="text"
                        style={styles.input}
                        placeholder="VD: Nguyễn Văn A"
                        value={newStaff.name}
                        onChange={(e) => setNewStaff({ ...newStaff, name: e.target.value })}
                        required
                      />
                    </div>

                    <div style={{ ...styles.formGroup, marginBottom: "12px" }}>
                      <label style={styles.label}>Số Điện Thoại Đăng Nhập (*)</label>
                      <input
                        type="text"
                        style={styles.input}
                        placeholder="VD: 0988111222"
                        value={newStaff.phone}
                        onChange={(e) => setNewStaff({ ...newStaff, phone: e.target.value })}
                        required
                      />
                    </div>

                    <div style={{ ...styles.formGroup, marginBottom: "12px" }}>
                      <label style={styles.label}>Mật Khẩu Đăng Nhập App (*)</label>
                      <input
                        type="password"
                        style={styles.input}
                        placeholder="Nhập mật khẩu..."
                        value={newStaff.password}
                        onChange={(e) => setNewStaff({ ...newStaff, password: e.target.value })}
                        required
                      />
                    </div>

                    <div style={{ ...styles.formGroup, marginBottom: "18px" }}>
                      <label style={styles.label}>Phân Quyền Trên App & Web</label>
                      <select
                        style={{ ...styles.input, fontWeight: "700" }}
                        value={newStaff.role}
                        onChange={(e) => setNewStaff({ ...newStaff, role: e.target.value })}
                      >
                        <option value="STAFF">Nhân viên</option>
                        <option value="ADMIN">Quản lý</option>
                      </select>
                    </div>

                    <button
                      type="submit"
                      style={{
                        ...styles.darkPillBtn,
                        width: "100%",
                        padding: "12px",
                        opacity: isAdmin ? 1 : 0.55,
                      }}
                    >
                      TẠO NHÂN VIÊN & CẤP QUYỀN
                    </button>
                  </form>
                </div>

                <div style={styles.recentTableCard}>
                  <div style={{ ...styles.cardHeaderRow, marginBottom: "16px" }}>
                    <div>
                      <div style={{ fontSize: "16px", fontWeight: "800" }}>Danh Sách Tài Khoản Hệ Thống</div>
                      <div style={{ fontSize: "12px", color: "#64748B" }}>
                        Bấm nút "Đổi quyền" ở cột Thao tác để chuyển nhanh giữa ADMIN và STAFF
                      </div>
                    </div>
                  </div>

                  <table style={styles.v14Table}>
                    <thead>
                      <tr>
                        <th style={styles.v14Th}>Mã NV</th>
                        <th style={styles.v14Th}>Họ và Tên</th>
                        <th style={styles.v14Th}>Số Điện Thoại</th>
                        <th style={styles.v14Th}>Quyền Hiện Tại</th>
                        <th style={styles.v14Th}>Trạng Thái</th>
                        <th style={{ ...styles.v14Th, textAlign: "right" }}>Thao Tác</th>
                      </tr>
                    </thead>
                    <tbody>
                      {staffList.length === 0 && (
                        <tr>
                          <td colSpan="6" style={{ textAlign: "center", padding: "40px", color: "#94A3B8" }}>
                            Chưa có nhân viên nào trong danh sách.
                          </td>
                        </tr>
                      )}
                      {staffList.map((st) => (
                        <tr key={st.id} style={styles.v14Tr}>
                          <td style={{ ...styles.v14Td, fontWeight: "700", whiteSpace: "nowrap" }}>#NV0{st.id}</td>
                          <td style={{ ...styles.v14Td, fontWeight: "700", color: "#141619" }}>{st.name}</td>
                          <td style={{ ...styles.v14Td, whiteSpace: "nowrap" }}>{st.phone || "---"}</td>
                          <td style={{ ...styles.v14Td, whiteSpace: "nowrap" }}>
                            <span style={st.role === "ADMIN" ? styles.agentTag : styles.retailTag}>
                              {st.role === "ADMIN" ? "👑 Quản lý (ADMIN)" : "🔒 Nhân viên (STAFF)"}
                            </span>
                          </td>
                          <td style={{ ...styles.v14Td, whiteSpace: "nowrap" }}>
                            {renderStatusBadge("COMPLETED")}
                          </td>
                          <td style={{ ...styles.v14Td, textAlign: "right", whiteSpace: "nowrap" }}>
                            <button
                              style={{
                                ...styles.lightPillBtn,
                                opacity: isAdmin ? 1 : 0.55,
                              }}
                              onClick={() => handleToggleStaff(st.id)}
                            >
                              🔄 Đổi sang {st.role === "ADMIN" ? "STAFF" : "ADMIN"}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
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
// 6. BỘ STYLES CHUẨN DASHBOARD V14 (ĐÃ TỐI ƯU BẢNG & BADGE)
// ==========================================
const styles = {
  toast: {
    position: "fixed", top: "24px", right: "24px", backgroundColor: "#141619", color: "#FFF",
    padding: "14px 22px", borderRadius: "99px", zIndex: 9999, boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
    fontWeight: "700", fontSize: "13px",
  },
  appShell: {
    display: "flex", width: "100%", height: "100%", backgroundColor: "#F7F8FA",
    borderRadius: "28px", overflow: "hidden", boxShadow: "0 20px 50px rgba(0,0,0,0.06)",
    border: "1px solid #FFFFFF",
  },
  leftRail: {
    width: "74px", backgroundColor: "#FFFFFF", borderRight: "1px solid #EFEFEF",
    display: "flex", flexDirection: "column", alignItems: "center", padding: "20px 0", justifyContent: "space-between",
  },
  brandBadge: {
    width: "42px", height: "42px", borderRadius: "50%",
    background: "linear-gradient(135deg, #FF5B37 0%, #FF8057 100%)",
    display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px",
    boxShadow: "0 6px 16px rgba(255, 91, 55, 0.3)",
  },
  railMenu: { display: "flex", flexDirection: "column", gap: "14px" },
  railBtn: {
    width: "42px", height: "42px", borderRadius: "50%", border: "none", background: "transparent",
    cursor: "pointer", fontSize: "17px", display: "flex", alignItems: "center", justifyContent: "center",
    transition: "all 0.2s",
  },
  railBtnActive: {
    backgroundColor: "#141619", color: "#FFFFFF", boxShadow: "0 4px 12px rgba(20,22,25,0.2)",
  },
  railFooter: { display: "flex", flexDirection: "column", gap: "10px" },

  mainArea: { flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" },
  topBar: {
    height: "74px", padding: "0 32px", display: "flex", alignItems: "center",
    justifyContent: "space-between", borderBottom: "1px solid #EFEFEF", backgroundColor: "#FFFFFF",
  },
  brandTitleWrap: { display: "flex", alignItems: "center", gap: "10px" },
  brandDot: {
    background: "#FF5B37", color: "#FFF", fontSize: "11px", fontWeight: "800",
    padding: "4px 8px", borderRadius: "99px",
  },
  brandName: { fontSize: "16px", fontWeight: "800", color: "#141619" },
  pillNavContainer: {
    display: "flex", gap: "6px", backgroundColor: "#F3F4F6", padding: "5px", borderRadius: "99px",
  },
  pillNavItem: {
    padding: "8px 18px", borderRadius: "99px", border: "none", background: "transparent",
    fontSize: "13px", fontWeight: "700", color: "#64748B", cursor: "pointer", transition: "all 0.2s",
    whiteSpace: "nowrap",
  },
  pillNavItemActive: {
    backgroundColor: "#141619", color: "#FFFFFF", boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
  },
  topRightActions: { display: "flex", alignItems: "center", gap: "12px" },
  datePill: {
    padding: "8px 14px", borderRadius: "99px", border: "1px solid #E2E8F0",
    fontSize: "12px", fontWeight: "700", backgroundColor: "#FFF", cursor: "pointer",
  },
  profilePill: {
    display: "flex", alignItems: "center", gap: "10px", padding: "5px 14px 5px 6px",
    borderRadius: "99px", backgroundColor: "#F8FAFC", border: "1px solid #E2E8F0",
    cursor: "pointer", userSelect: "none", transition: "all 0.2s",
  },
  profileAvatar: {
    width: "32px", height: "32px", borderRadius: "50%", backgroundColor: "#141619",
    color: "#FFF", display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: "13px", fontWeight: "800",
  },
  userDropdown: {
    position: "absolute", top: "48px", right: 0, width: "260px", backgroundColor: "#FFFFFF",
    borderRadius: "16px", boxShadow: "0 12px 32px rgba(0,0,0,0.12)", border: "1px solid #E2E8F0",
    padding: "8px", zIndex: 1000,
  },
  dropdownHeader: {
    fontSize: "11px", fontWeight: "700", color: "#94A3B8", padding: "6px 10px",
    textTransform: "uppercase", borderBottom: "1px solid #F1F5F9", marginBottom: "4px",
  },
  dropdownItem: {
    display: "flex", justifyContent: "space-between", alignItems: "center",
    padding: "10px", borderRadius: "10px", cursor: "pointer",
  },

  scrollContent: { flex: 1, overflowY: "auto", padding: "24px 32px" },
  greetingHeader: {
    display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "22px",
  },
  greetingTitle: { fontSize: "26px", fontWeight: "800", margin: 0, letterSpacing: "-0.5px" },
  greetingSub: { fontSize: "13px", color: "#64748B", margin: "4px 0 0 0" },

  bentoTopGrid: {
    display: "grid", gridTemplateColumns: "1.25fr 1fr 1.15fr", gap: "18px", marginBottom: "18px",
  },
  balanceCard: {
    backgroundColor: "#FFFFFF", borderRadius: "24px", padding: "22px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.02)", border: "1px solid #F1F5F9",
    display: "flex", flexDirection: "column", justifyContent: "space-between",
  },
  cardHeaderRow: { display: "flex", justifyContent: "space-between", alignItems: "center" },
  mutedLabel: { fontSize: "12px", fontWeight: "600", color: "#64748B" },
  hugeBalance: { fontSize: "30px", fontWeight: "800", margin: "6px 0 14px 0", letterSpacing: "-0.8px" },
  currencyBadge: {
    padding: "6px 12px", borderRadius: "99px", backgroundColor: "#F8FAFC",
    border: "1px solid #E2E8F0", fontSize: "11px", fontWeight: "700",
  },
  actionPillRow: { display: "flex", gap: "10px" },
  actionBtnDark: {
    flex: 1, padding: "11px", borderRadius: "99px", border: "none",
    backgroundColor: "#141619", color: "#FFF", fontWeight: "700", fontSize: "12px", cursor: "pointer",
  },
  actionBtnLight: {
    flex: 1, padding: "11px", borderRadius: "99px", border: "1px solid #E2E8F0",
    backgroundColor: "#F8FAFC", color: "#141619", fontWeight: "700", fontSize: "12px", cursor: "pointer",
  },
  miniWalletsGrid: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px" },
  miniWalletBox: {
    backgroundColor: "#F8FAFC", padding: "10px", borderRadius: "14px", border: "1px solid #F1F5F9",
  },

  fourCardsGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" },
  orangeHeroCard: {
    background: "linear-gradient(135deg, #FF5B37 0%, #FF784E 100%)", color: "#FFFFFF",
    borderRadius: "22px", padding: "18px", display: "flex", flexDirection: "column",
    justifyContent: "space-between", boxShadow: "0 10px 24px rgba(255, 91, 55, 0.25)",
  },
  orangeCardIcon: {
    width: "28px", height: "28px", borderRadius: "50%", backgroundColor: "rgba(255,255,255,0.2)",
    display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px",
  },
  orangeCardValue: { fontSize: "22px", fontWeight: "800", margin: "12px 0 0 0" },
  smallStatCard: {
    backgroundColor: "#FFFFFF", borderRadius: "22px", padding: "18px",
    border: "1px solid #F1F5F9", display: "flex", flexDirection: "column", justifyContent: "space-between",
  },
  grayCardIcon: {
    width: "28px", height: "28px", borderRadius: "50%", backgroundColor: "#F8FAFC",
    display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px",
  },
  smallStatValue: { fontSize: "20px", fontWeight: "800", margin: "12px 0 0 0", color: "#141619" },

  chartCard: {
    backgroundColor: "#FFFFFF", borderRadius: "24px", padding: "22px",
    border: "1px solid #F1F5F9", display: "flex", flexDirection: "column", justifyContent: "space-between",
  },
  dualChartArea: {
    display: "flex", alignItems: "flex-end", justifyContent: "space-between",
    height: "190px", paddingTop: "20px", gap: "8px",
  },
  dualBarGroup: {
    flex: 1, height: "100%", display: "flex", flexDirection: "column", alignItems: "center",
  },
  dualBarTrack: {
    flex: 1, width: "100%", display: "flex", alignItems: "flex-end",
    justifyContent: "center", gap: "4px",
  },
  barOrange: {
    width: "12px", backgroundColor: "#FF6B4A", borderRadius: "6px 6px 3px 3px", transition: "height 0.4s ease",
  },
  barDark: {
    width: "12px", backgroundColor: "#141619", borderRadius: "6px 6px 3px 3px", transition: "height 0.4s ease",
  },
  dualBarLabel: { fontSize: "10px", fontWeight: "700", color: "#94A3B8", marginTop: "8px" },

  bentoBottomGrid: { display: "grid", gridTemplateColumns: "1fr 2.4fr", gap: "18px" },
  limitCard: {
    backgroundColor: "#FFFFFF", borderRadius: "24px", padding: "22px", border: "1px solid #F1F5F9",
    height: "max-content",
  },
  progressTrack: {
    width: "100%", height: "10px", backgroundColor: "#F1F5F9", borderRadius: "99px", overflow: "hidden",
  },
  progressFill: { height: "100%", backgroundColor: "#FF5B37", borderRadius: "99px" },

  recentTableCard: {
    backgroundColor: "#FFFFFF", borderRadius: "24px", padding: "22px", border: "1px solid #F1F5F9",
  },
  miniSearch: {
    padding: "8px 14px", borderRadius: "99px", border: "1px solid #E2E8F0",
    fontSize: "12px", backgroundColor: "#F8FAFC", width: "210px",
  },
  darkPillBtn: {
    padding: "9px 18px", borderRadius: "99px", border: "none",
    backgroundColor: "#141619", color: "#FFF", fontWeight: "700", fontSize: "12px",
    cursor: "pointer", whiteSpace: "nowrap",
  },
  lightPillBtn: {
    padding: "8px 14px", borderRadius: "99px", border: "1px solid #E2E8F0",
    backgroundColor: "#FFFFFF", color: "#141619", fontWeight: "700", fontSize: "12px",
    cursor: "pointer", whiteSpace: "nowrap",
  },
  filterChip: {
    padding: "7px 14px", borderRadius: "99px", border: "1px solid #E2E8F0",
    backgroundColor: "#FFF", fontSize: "12px", fontWeight: "700", color: "#64748B",
    cursor: "pointer", whiteSpace: "nowrap",
  },
  filterChipActive: { backgroundColor: "#FF5B37", color: "#FFF", borderColor: "#FF5B37" },

  // TABLE V14 & NHÃN TRẠNG THÁI KHO MỚI (KHÔNG BAO GIỜ RỚT DÒNG)
  v14Table: { width: "100%", borderCollapse: "collapse", textAlign: "left" },
  v14Th: {
    padding: "12px 14px", fontSize: "11px", fontWeight: "800", color: "#94A3B8",
    textTransform: "uppercase", borderBottom: "1px solid #F1F5F9", whiteSpace: "nowrap",
    letterSpacing: "0.3px",
  },
  v14Tr: { borderBottom: "1px solid #F8FAFC" },
  v14Td: { padding: "14px", fontSize: "13px", verticalAlign: "middle" },
  statusPill: {
    display: "inline-flex", alignItems: "center", gap: "6px",
    padding: "5px 12px", borderRadius: "99px", fontSize: "12px", fontWeight: "700",
    whiteSpace: "nowrap", lineHeight: 1.2,
  },
  statusDot: {
    width: "6px", height: "6px", borderRadius: "50%", display: "inline-block",
  },
  agentTag: {
    display: "inline-block", backgroundColor: "#FEF3C7", color: "#B45309",
    padding: "3px 8px", borderRadius: "6px", fontSize: "11px", fontWeight: "700",
    whiteSpace: "nowrap",
  },
  retailTag: {
    display: "inline-block", backgroundColor: "#E0F2FE", color: "#0369A1",
    padding: "3px 8px", borderRadius: "6px", fontSize: "11px", fontWeight: "700",
    whiteSpace: "nowrap",
  },
  noteBox: {
    marginTop: "6px", fontSize: "11px", color: "#BE123C", backgroundColor: "#FFF1F2",
    padding: "3px 8px", borderRadius: "6px", display: "inline-block",
  },
  completeMiniBtn: {
    display: "inline-flex", alignItems: "center", justifyContent: "center",
    padding: "7px 14px", borderRadius: "99px", border: "none",
    backgroundColor: "#10B981", color: "#FFF", fontWeight: "700", fontSize: "12px",
    cursor: "pointer", whiteSpace: "nowrap", boxShadow: "0 2px 6px rgba(16, 185, 129, 0.25)",
  },

  formRow: { display: "flex", gap: "16px", marginBottom: "16px" },
  formGroup: { flex: 1, display: "flex", flexDirection: "column" },
  label: { fontSize: "12px", fontWeight: "700", color: "#475569", marginBottom: "6px" },
  input: {
    padding: "11px 14px", borderRadius: "12px", border: "1px solid #E2E8F0",
    fontSize: "13px", backgroundColor: "#F8FAFC",
  },
};