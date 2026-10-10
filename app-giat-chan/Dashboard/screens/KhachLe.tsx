import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, TextInput, KeyboardAvoidingView, Platform, Modal } from "react-native";
import { styles } from "../styles/globalStyles";
import BeautifulPopup from "../components/Popup";
import { KhachHangService } from "../services/KhachHang";
import { DonHangService } from "../services/DonHang";
import { GHI_CHU_SUGGESTIONS } from "../constants/GhiChu";

export default function KhachLe({ onBack }: { onBack: () => void }) {
  const [form, setForm] = useState({ phone: "", name: "", address: "", note: "" });
  const [items, setItems] = useState<{ [key: string]: number }>({});
  const [isPickerVisible, setIsPickerVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [priceList, setPriceList] = useState<any[]>([]);
  const [customerDb, setCustomerDb] = useState(new Map());
  const [popup, setPopup] = useState<any>({ visible: false });
  const [customerList, setCustomerList] = useState<any[]>([]);
  const [nameSuggestions, setNameSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchItemQuery, setSearchItemQuery] = useState("");
  const [isNoteFocused, setIsNoteFocused] = useState(false);

  const filteredSuggestions = GHI_CHU_SUGGESTIONS.filter(
    (s) => form.note.trim() !== "" && s.toLowerCase().includes(form.note.toLowerCase()) && s !== form.note
  );

  React.useEffect(() => {
    DonHangService.getPrices().then(setPriceList);
    KhachHangService.getCustomerSuggestions().then(({ db, list }) => {
      setCustomerDb(db);
      setCustomerList(list);
    });
  }, []);

  const handleNameChange = (text: string) => {
    setForm({ ...form, name: text });
    if (text.length > 0) {
      const filtered = customerList.filter((c) => c.name.toLowerCase().includes(text.toLowerCase()));
      setNameSuggestions(filtered);
      setShowSuggestions(true);
    } else setShowSuggestions(false);
  };

  const selectCustomer = (customer: any) => {
    setForm({ ...form, name: customer.name, phone: customer.phone, address: customer.address });
    setShowSuggestions(false);
  };

  const handlePhoneChange = (text: string) => {
    const cleanPhone = text.replace(/\D/g, "");
    if (cleanPhone.length === 10 && customerDb.has(cleanPhone)) {
      const pastCustomer = customerDb.get(cleanPhone);
      setForm({ ...form, phone: text, name: pastCustomer.name, address: pastCustomer.address });
    } else setForm({ ...form, phone: text });
  };

  const calculateTotal = () => {
    let total = 0;
    Object.keys(items).forEach((itemName) => {
      const qty = items[itemName];
      if (qty > 0) {
        const found = priceList.find((p) => p.name === itemName);
        const unitPrice = found ? parseInt(found.price || 0) : 35000;
        total += qty * unitPrice;
      }
    });
    return total;
  };

  const handleSubmit = async () => {
    if (!form.name) return setPopup({ visible: true, type: "ERROR", title: "Thiếu thông tin", message: "Vui lòng nhập Tên khách hàng!" });

    let itemsArr: string[] = [];
    Object.keys(items).forEach((key) => {
      if (items[key] > 0) itemsArr.push(`${items[key]} ${key}`);
    });

    if (itemsArr.length === 0) return setPopup({ visible: true, type: "ERROR", title: "Chưa có đồ", message: "Sếp phải chọn ít nhất 1 món đồ chứ!" });

    const cleanPhone = form.phone.replace(/\D/g, "");
    if (cleanPhone !== "" && cleanPhone.length !== 10) return setPopup({ visible: true, type: "ERROR", title: "Sai SĐT", message: "Số điện thoại phải có đúng 10 số." });

    setIsLoading(true);
    try {
      let itemsString = `[KHÁCH LẺ] ` + itemsArr.join(" + ");
      if (form.note) itemsString += `\n📝 Ghi chú: ${form.note}`;

      const payload = {
        order_code: "DH" + Date.now().toString().slice(-6),
        customer_name: form.name,
        customer_phone: cleanPhone,
        address: form.address.trim() === "" ? `Khách mang tới (${form.name})` : form.address,
        items: itemsString,
        total_amount: calculateTotal(),
      };
      
      const isSuccess = await DonHangService.createOrder(payload);
      if (isSuccess) setPopup({ visible: true, type: "SUCCESS", title: "Lưu Đơn Xong", message: `Đã nhận đơn!`, onConfirm: onBack });
      else setPopup({ visible: true, type: "ERROR", title: "Lỗi Máy Chủ", message: "Không thể lưu đơn." });
    } catch {
      setPopup({ visible: true, type: "ERROR", title: "Lỗi Mạng", message: "Kiểm tra lại Wifi." });
    }
    setIsLoading(false);
  };

  const ItemCounter = ({ label, value, onChange }: any) => (
    <View style={[styles.itemCounterContainer, { backgroundColor: value > 0 ? "#EFF6FF" : "#F9FAFB", borderColor: value > 0 ? '#BFDBFE' : '#F3F4F6' }]}>
      <Text style={[styles.itemCounterLabel, { color: value > 0 ? "#1D4ED8" : "#4B5563" }]} numberOfLines={2}>{label}</Text>
      <View style={[styles.itemCounterControl, { borderColor: value > 0 ? '#93C5FD' : '#E5E7EB' }]}>
        <TouchableOpacity onPress={() => onChange(Math.max(0, value - 1))} style={styles.itemCounterBtn}>
            <Text style={[styles.itemCounterMinusText, { color: value > 0 ? "#2563EB" : "#9CA3AF" }]}>-</Text>
        </TouchableOpacity>
        <Text style={[styles.itemCounterValueText, { color: value > 0 ? "#1D4ED8" : "#111827" }]}>{value}</Text>
        <TouchableOpacity onPress={() => onChange(value + 1)} style={styles.itemCounterBtn}>
            <Text style={styles.itemCounterPlusText}>+</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <View style={styles.moduleHeader}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack}><Text style={styles.backBtnText}>Quay lại</Text></TouchableOpacity>
        <Text style={styles.moduleTitle}>Khách Lẻ</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView style={styles.body} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        
        {/* KHỐI 1: THÔNG TIN KHÁCH HÀNG */}
        <View style={[styles.formCard, { zIndex: 50, elevation: 3 }]}>
          <Text style={styles.formTitle}>Thông tin khách hàng</Text>
          
          <TextInput 
            style={[styles.input, { height: 42, paddingVertical: 8, marginBottom: 12 }]} 
            placeholder="Số điện thoại..." 
            keyboardType="phone-pad" 
            value={form.phone} 
            onChangeText={handlePhoneChange} 
            onFocus={() => setShowSuggestions(false)} 
          />
          
          <View style={styles.khachLeInputGroup}>
            {showSuggestions && nameSuggestions.length > 0 && (
              <TouchableOpacity activeOpacity={1} onPress={() => setShowSuggestions(false)} style={styles.khachLeSuggestionOverlay} />
            )}
            <View style={styles.khachLeInputRelative}>
              <TextInput 
                style={[styles.input, styles.khachLeInputName]} 
                placeholder="Tên khách hàng..." 
                value={form.name} 
                onChangeText={handleNameChange} 
                onFocus={() => { if (form.name.length > 0) setShowSuggestions(true); }} 
              />
              {form.name.length > 0 && (
                <TouchableOpacity style={styles.khachLeClearBtn} onPress={() => { if (showSuggestions) setShowSuggestions(false); else { setForm({ ...form, name: "" }); setShowSuggestions(false); } }}>
                  <Text style={{ fontSize: 18, color: showSuggestions ? '#3B82F6' : '#9CA3AF' }}>{showSuggestions ? '▲' : '✖'}</Text>
                </TouchableOpacity>
              )}
            </View>
            
            {showSuggestions && nameSuggestions.length > 0 && (
              <View style={styles.khachLeSuggestionBox}>
                <ScrollView keyboardShouldPersistTaps="handled" style={styles.khachLeSuggestionList}>
                  {nameSuggestions.map((c, idx) => (
                    <TouchableOpacity key={idx} style={[styles.khachLeSuggestionItem, { borderBottomWidth: idx === nameSuggestions.length - 1 ? 0 : 1, borderBottomColor: '#F3F4F6' }]} onPress={() => selectCustomer(c)}>
                      <Text style={styles.khachLeSuggestionName}>{c.name}</Text>
                      {c.phone || c.address ? <Text style={styles.khachLeSuggestionSub}>{c.phone ? `📞 ${c.phone}   ` : ""}{c.address ? `📍 ${c.address}` : ""}</Text> : null}
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}
          </View>
          
          <TextInput 
            style={[styles.input, { height: 42, paddingVertical: 8, marginBottom: 0 }]} 
            placeholder="Địa chỉ..." 
            value={form.address} 
            onChangeText={(t) => setForm({ ...form, address: t })} 
            onFocus={() => setShowSuggestions(false)} 
          />
        </View>

        {/* KHỐI 2: DỊCH VỤ KHÁCH ĐẶT */}
        <View style={[styles.formCard, { zIndex: 10 }]}>
          <View style={styles.khachLeServiceHeader}>
            <Text style={styles.formTitle}>Dịch vụ</Text>
            <TouchableOpacity onPress={() => setIsPickerVisible(true)} style={styles.khachLeAddProductBtn}>
              <Text style={styles.khachLeAddProductText}>+ Thêm sản phẩm</Text>
            </TouchableOpacity>
          </View>

          {priceList.length === 0 && <Text style={styles.khachLeLoadingText}>Đang tải bảng giá...</Text>}
          
          <View style={styles.khachLeServiceGrid}>
            {priceList.filter(item => items[item.name] > 0).map((item, idx) => (
              <ItemCounter key={idx} label={item.name} value={items[item.name]} onChange={(v: number) => setItems({ ...items, [item.name]: v })} />
            ))}
          </View>

          {Object.keys(items).every(k => !items[k] || items[k] === 0) && (
            <TouchableOpacity style={styles.khachLeEmptyServiceBox} onPress={() => setIsPickerVisible(true)}>
              <Text style={styles.khachLeEmptyServiceText}>Bấm vào đây để chọn dịch vụ</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* KHỐI 3: GHI CHÚ CHUNG THÔNG MINH */}
        <View style={styles.khachLeNoteCard}>
          <Text style={styles.khachLeNoteTitle}>Ghi chú thêm</Text>
          <View style={styles.khachLeNoteInputWrapper}>
            <TextInput
              style={[styles.khachLeNoteInput, { borderColor: isNoteFocused ? '#3B82F6' : '#E2E8F0' }]}
              placeholder="Nhập ghi chú..."
              placeholderTextColor="#94A3B8"
              multiline
              value={form.note} 
              onChangeText={(text) => setForm({ ...form, note: text })}
              onFocus={() => setIsNoteFocused(true)}
              onBlur={() => setTimeout(() => setIsNoteFocused(false), 200)} 
            />

            {isNoteFocused && filteredSuggestions.length > 0 && (
              <View style={styles.khachLeNoteSuggestBox}>
                {filteredSuggestions.map((item, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[styles.khachLeNoteSuggestItem, { borderBottomWidth: index === filteredSuggestions.length - 1 ? 0 : 1, borderBottomColor: '#F1F5F9' }]}
                    onPress={() => { setForm({ ...form, note: item }); setIsNoteFocused(false); }}
                  >
                    <Text style={styles.khachLeNoteSuggestIcon}>✨</Text>
                    <Text style={styles.khachLeNoteSuggestText}>{item}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        </View>

        <View style={{ height: 50 }} />
      </ScrollView>

      {/* THANH THANH TOÁN */}
      <View style={[styles.bottomCheckout, { paddingHorizontal: 15, paddingBottom: Platform.OS === 'ios' ? 30 : 25 }]}>
        <View style={{ flex: 1, paddingRight: 10 }}>
          <Text style={{ color: "#6B7280", fontSize: 12, fontWeight: "bold" }}>Tổng tiền:</Text>
          <Text style={{ color: "#EF4444", fontSize: 22, fontWeight: "700" }} adjustsFontSizeToFit numberOfLines={1}>
            {calculateTotal().toLocaleString("vi-VN")} đ
          </Text>
        </View>
        
        <TouchableOpacity style={[styles.submitBtn, { flex: 1.2, paddingHorizontal: 10, justifyContent: 'center' }]} onPress={handleSubmit} disabled={isLoading}>
          <Text style={styles.submitBtnText} adjustsFontSizeToFit numberOfLines={1}>
            {isLoading ? "Đang lưu..." : "Thêm đơn hàng"}
          </Text>
        </TouchableOpacity>
      </View>

      <Modal visible={isPickerVisible} animationType="slide" transparent={true} statusBarTranslucent={true}>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.khachLePickerOverlay}>
          <TouchableOpacity style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0 }} activeOpacity={1} onPress={() => setIsPickerVisible(false)} />
          
          <View style={styles.khachLePickerBox}>
            <View style={styles.khachLePickerHeader}>
              <Text style={styles.khachLePickerTitle}>Chọn sản phẩm</Text>
              <TouchableOpacity onPress={() => { setIsPickerVisible(false); setSearchItemQuery(""); }} style={styles.khachLePickerDoneBtn}>
                <Text style={styles.khachLePickerDoneText}>Xong</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.khachLePickerSearchBox}>
              <Text style={styles.khachLePickerSearchIcon}>🔍</Text>
              <TextInput style={styles.khachLePickerSearchInput} placeholder="Tìm chăn, đệm, quần áo..." placeholderTextColor="#94A3B8" value={searchItemQuery} onChangeText={setSearchItemQuery} />
              {searchItemQuery.length > 0 && (
                 <TouchableOpacity onPress={() => setSearchItemQuery('')} style={styles.khachLePickerSearchClearWrap}>
                   <Text style={styles.khachLePickerSearchClearIcon}>✖</Text>
                 </TouchableOpacity>
              )}
            </View>

            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" contentContainerStyle={styles.khachLePickerScrollContent}>
              <View style={styles.khachLeServiceGrid}>
                {priceList
                  .filter(item => {
                    const query = searchItemQuery.toLowerCase().trim();
                    if (!query) return true;
                    const nameLower = item.name.toLowerCase();
                    const matchPrefix = nameLower.startsWith(query) || nameLower.includes(` ${query}`);
                    const initials = nameLower.split(" ").filter((word: string) => word.length > 0).map((word: string) => word.charAt(0)).join("");
                    const matchInitials = initials.includes(query.replace(/\s/g, ""));
                    return matchPrefix || matchInitials;
                  })
                  .map((item, idx) => (
                    <ItemCounter key={idx} label={item.name} value={items[item.name] || 0} onChange={(v: number) => setItems({ ...items, [item.name]: v })} />
                ))}
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <BeautifulPopup {...popup} onClose={() => setPopup({ ...popup, visible: false })} />
    </KeyboardAvoidingView>
  );
}