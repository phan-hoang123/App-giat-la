import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, TextInput, KeyboardAvoidingView, Platform, Modal } from "react-native";
import { styles } from "../styles/globalStyles";
import BeautifulPopup from "../components/Popup";
import { KhachHangService } from "../services/KhachHang";
import { DonHangService } from "../services/DonHang";
import { GHI_CHU_SUGGESTIONS } from "../constants/GhiChu";

export default function DaiLy({ onBack }: { onBack: () => void }) {
  const [form, setForm] = useState({ phone: "", name: "", address: "", note: "" });
  const [houses, setHouses] = useState([{ id: Date.now(), name: "", items: {} as { [key: string]: number } }]);
  const [isLoading, setIsLoading] = useState(false);
  const [priceList, setPriceList] = useState<any[]>([]);
  const [customerDb, setCustomerDb] = useState(new Map());
  const [popup, setPopup] = useState<any>({ visible: false });
  const [customerList, setCustomerList] = useState<any[]>([]);
  const [nameSuggestions, setNameSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [pickingHouseId, setPickingHouseId] = useState<number | null>(null);
  const [searchItemQuery, setSearchItemQuery] = useState("");  
  
  const [isNoteFocused, setIsNoteFocused] = useState(false);

  const filteredSuggestions = GHI_CHU_SUGGESTIONS.filter(
    (s) => form.note.trim() !== "" && s.toLowerCase().includes(form.note.toLowerCase()) && s !== form.note
  );
  
  const activeHouse = houses.find(h => h.id === pickingHouseId);

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
      const filtered = customerList.filter(c => c.name.toLowerCase().includes(text.toLowerCase()));
      setNameSuggestions(filtered); setShowSuggestions(true);
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

  const addHouse = () => setHouses([...houses, { id: Date.now(), name: "", items: {} }]);
  const removeHouse = (id: number) => setHouses(houses.filter(h => h.id !== id));
  const updateHouseItem = (houseId: number, itemName: string, qty: number) => {
    setHouses(houses.map(h => h.id === houseId ? { ...h, items: { ...h.items, [itemName]: qty } } : h));
  };
  const updateHouseName = (houseId: number, name: string) => {
    setHouses(houses.map(h => h.id === houseId ? { ...h, name } : h));
  };

  const getAggregatedItems = () => {
    const totals: { [key: string]: number } = {};
    houses.forEach(h => {
      Object.keys(h.items).forEach(itemName => {
        if (h.items[itemName] > 0) totals[itemName] = (totals[itemName] || 0) + h.items[itemName];
      });
    });
    return totals;
  };

  const calculateTotal = () => {
    let total = 0;
    const aggregated = getAggregatedItems();
    Object.keys(aggregated).forEach((itemName) => {
      const qty = aggregated[itemName];
      const found = priceList.find(p => p.name === itemName);
      if (found) {
        const unitPrice = found.agentPrice !== undefined && found.agentPrice !== "" 
              ? parseInt(found.agentPrice) : Math.max(0, parseInt(found.price || 0) - 5000);
        total += qty * unitPrice;
      }
    });
    return total;
  };

  const handleSubmit = async () => {
    if (!form.name) return setPopup({ visible: true, type: "ERROR", title: "Thiếu thông tin", message: "Nhập Tên Đại Lý nhé!" });
    
    const aggregated = getAggregatedItems();
    let summaryArr: string[] = [];
    Object.keys(aggregated).forEach(key => summaryArr.push(`${aggregated[key]} ${key}`));

    if (summaryArr.length === 0) return setPopup({ visible: true, type: "ERROR", title: "Chưa có đồ", message: "Đại lý chưa mang món nào tới à sếp?" });

    const cleanPhone = form.phone.replace(/\D/g, "");
    if (cleanPhone !== "" && cleanPhone.length !== 10) return setPopup({ visible: true, type: "ERROR", title: "Sai SĐT", message: "Số điện thoại đại lý phải đúng 10 số." });

    setIsLoading(true);
    try {
      let itemsString = `[ĐIỂM THU] ` + summaryArr.join(" + ");
      let detailString = houses.map((h, i) => {
        let hItems: string[] = [];
        Object.keys(h.items).forEach(k => { if (h.items[k] > 0) hItems.push(`${h.items[k]} ${k}`); });
        if (hItems.length === 0) return null;
        const houseName = h.name.trim() || `Khách ${i + 1}`;
        return `- ${houseName}: ${hItems.join(", ")}`;
      }).filter(Boolean).join("\n");

      if (detailString) itemsString += `\n📦 Chi tiết lô:\n${detailString}`;
      if (form.note) itemsString += `\n📝 Ghi chú chung: ${form.note}`;

      const payload = {
        order_code: "DH" + Date.now().toString().slice(-6),
        customer_name: form.name,
        customer_phone: cleanPhone,
        address: form.address.trim() === "" ? `Đại lý tự mang tới (${form.name})` : form.address,
        items: itemsString,
        total_amount: calculateTotal(),
      };
      
      const isSuccess = await DonHangService.createOrder(payload);
      if (isSuccess) setPopup({ visible: true, type: "SUCCESS", title: "Nhận Lô Hàng Xong", message: `Đã lưu toàn bộ chăn của Đại Lý!`, onConfirm: onBack });
      else setPopup({ visible: true, type: "ERROR", title: "Lỗi Máy Chủ", message: "Không thể lưu đơn." });
    } catch {
      setPopup({ visible: true, type: "ERROR", title: "Lỗi Mạng", message: "Kiểm tra lại Wifi." });
    }
    setIsLoading(false);
  };

  const ItemCounter = ({ label, value, onChange }: any) => (
    <View style={[styles.dlItemCounterContainer, { backgroundColor: value > 0 ? "#EFF6FF" : "#F9FAFB", borderColor: value > 0 ? '#BFDBFE' : '#F3F4F6' }]}>
      <Text style={[styles.dlItemCounterLabel, { color: value > 0 ? "#1D4ED8" : "#4B5563" }]} numberOfLines={2}>{label}</Text>
      <View style={[styles.dlItemCounterControl, { borderColor: value > 0 ? '#93C5FD' : '#E5E7EB' }]}>
        <TouchableOpacity onPress={() => onChange(Math.max(0, value - 1))} style={styles.dlItemCounterBtn}>
          <Text style={[styles.dlItemCounterMinusText, { color: value > 0 ? "#2563EB" : "#9CA3AF" }]}>-</Text>
        </TouchableOpacity>
        <Text style={[styles.dlItemCounterValueText, { color: value > 0 ? "#1D4ED8" : "#111827" }]}>{value}</Text>
        <TouchableOpacity onPress={() => onChange(value + 1)} style={styles.dlItemCounterBtn}>
          <Text style={styles.dlItemCounterPlusText}>+</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <View style={styles.moduleHeader}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack}><Text style={styles.backBtnText}>Quay lại</Text></TouchableOpacity>
        <Text style={styles.moduleTitle}>Nhận Lô Đại Lý</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView style={styles.body} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <View style={[styles.formCard, { zIndex: 50, elevation: 3 }]}>
          <Text style={styles.formTitle}>Thông tin Đại lý</Text>
          <TextInput
             style={[styles.input, { height: 42, paddingVertical: 8, marginBottom: 12 }]} placeholder="Số điện thoại..." keyboardType="phone-pad" value={form.phone} onChangeText={handlePhoneChange} onFocus={() => setShowSuggestions(false)} />
          <View style={styles.dlInputGroup}>
            {showSuggestions && nameSuggestions.length > 0 && <TouchableOpacity activeOpacity={1} onPress={() => setShowSuggestions(false)} style={styles.dlSuggestionOverlay} />}
            <View style={styles.dlInputRelative}>
              <TextInput style={[styles.input, styles.dlInputName]} placeholder="Tên đại lý..." value={form.name} onChangeText={handleNameChange} onFocus={() => { if (form.name.length > 0) setShowSuggestions(true); }} />
              {form.name.length > 0 && (
                <TouchableOpacity style={styles.dlClearBtn} onPress={() => { if (showSuggestions) setShowSuggestions(false); else { setForm({ ...form, name: "" }); setShowSuggestions(false); } }}>
                  <Text style={{ fontSize: 18, color: showSuggestions ? '#3B82F6' : '#9CA3AF' }}>{showSuggestions ? '▲' : '✖'}</Text>
                </TouchableOpacity>
              )}
            </View>
            {showSuggestions && nameSuggestions.length > 0 && (
              <View style={styles.dlSuggestionBox}>
                <ScrollView keyboardShouldPersistTaps="handled" style={styles.dlSuggestionList}>
                  {nameSuggestions.map((c, idx) => (
                    <TouchableOpacity key={idx} style={[styles.dlSuggestionItem, { borderBottomWidth: idx === nameSuggestions.length - 1 ? 0 : 1, borderBottomColor: '#F3F4F6' }]} onPress={() => selectCustomer(c)}>
                      <Text style={styles.dlSuggestionName}>{c.name}</Text>
                      {(c.phone || c.address) ? <Text style={styles.dlSuggestionSub}>{c.phone ? `📞 ${c.phone}   ` : ''}{c.address ? `📍 ${c.address}` : ''}</Text> : null}
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}
          </View>
          <TextInput style={[styles.input, { height: 42, paddingVertical: 8, marginBottom: 0 }]} placeholder="Địa chỉ..." value={form.address} onChangeText={(t) => setForm({ ...form, address: t })} onFocus={() => setShowSuggestions(false)} />
        </View>

        {houses.map((house, index) => (
          <View key={house.id} style={styles.dlHouseCard}>
            <View style={styles.dlHouseHeader}>
              <Text style={styles.dlHouseTitle}>Khách hàng {index + 1}</Text>
              
              <View style={styles.dlHouseActionRow}>
                <TouchableOpacity onPress={() => setPickingHouseId(house.id)} style={styles.dlHouseAddProductBtn}>
                  <Text style={styles.dlHouseAddProductText}>+ Thêm sản phẩm</Text>
                </TouchableOpacity>

                {houses.length > 1 && (
                  <TouchableOpacity onPress={() => removeHouse(house.id)}>
                    <Text style={styles.dlHouseDeleteText}>XÓA</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
            
            <TextInput style={styles.dlHouseNoteInput} placeholder="Ghi chú tên nhà..." value={house.name} onChangeText={(t) => updateHouseName(house.id, t)} />

            {priceList.length === 0 && <Text style={styles.dlLoadingText}>Đang tải bảng giá...</Text>}
            
            <View style={styles.dlServiceGrid}>
              {priceList.filter(p => house.items[p.name] > 0).map((item, idx) => (
                <ItemCounter key={idx} label={item.name} value={house.items[item.name]} onChange={(v: number) => updateHouseItem(house.id, item.name, v)} />
              ))}
            </View>

            {Object.keys(house.items).every(k => !house.items[k] || house.items[k] === 0) && (
              <TouchableOpacity style={styles.dlEmptyServiceBox} onPress={() => setPickingHouseId(house.id)}>
                <Text style={styles.dlEmptyServiceText}>Bấm vào đây để chọn dịch vụ</Text>
              </TouchableOpacity>
            )}
          </View>
        ))}

        <TouchableOpacity style={styles.dlAddHouseBtn} onPress={addHouse}>
          <Text style={styles.dlAddHouseText}>+ Thêm khách hàng</Text>
        </TouchableOpacity>

        {/* KHỐI GHI CHÚ CHUNG THÔNG MINH */}
        <View style={styles.dlNoteCard}>
          <Text style={styles.dlNoteTitle}>Ghi chú</Text>
          
          <View style={styles.dlNoteInputWrapper}>
            <TextInput
              style={[styles.dlNoteInput, { borderColor: isNoteFocused ? '#3B82F6' : '#E2E8F0' }]}
              placeholder="Nhập ghi chú..."
              placeholderTextColor="#94A3B8"
              multiline
              value={form.note} 
              onChangeText={(text) => setForm({ ...form, note: text })}
              onFocus={() => setIsNoteFocused(true)}
              onBlur={() => setTimeout(() => setIsNoteFocused(false), 200)} 
            />

            {isNoteFocused && filteredSuggestions.length > 0 && (
              <View style={styles.dlNoteSuggestBox}>
                {filteredSuggestions.map((item, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[styles.dlNoteSuggestItem, { borderBottomWidth: index === filteredSuggestions.length - 1 ? 0 : 1, borderBottomColor: '#F1F5F9' }]}
                    onPress={() => { setForm({ ...form, note: item }); setIsNoteFocused(false); }}
                  >
                    <Text style={styles.dlNoteSuggestIcon}>✨</Text>
                    <Text style={styles.dlNoteSuggestText}>{item}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        </View>
        <View style={{ height: 50 }} />
      </ScrollView>

      {/* THANH THANH TOÁN */}
      <View style={[styles.dlCheckoutBar, { paddingBottom: Platform.OS === "ios" ? 30 : 25 }]}>
        <View style={styles.dlCheckoutCol}>
          <Text style={styles.dlCheckoutLabel}>Tổng tiền:</Text>
          <Text style={styles.dlCheckoutTotal} adjustsFontSizeToFit numberOfLines={1}>
            {calculateTotal().toLocaleString("vi-VN")} đ
          </Text>
        </View>
        
        <TouchableOpacity style={styles.dlSubmitBtn} onPress={handleSubmit} disabled={isLoading}>
          <Text style={styles.dlSubmitBtnText} adjustsFontSizeToFit numberOfLines={1}>
            {isLoading ? "ĐANG LƯU..." : "Thêm đơn hàng"}
          </Text>
        </TouchableOpacity>
      </View>

      <Modal visible={pickingHouseId !== null} animationType="slide" transparent={true} statusBarTranslucent={true}>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.dlPickerOverlay}>
          <TouchableOpacity style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0 }} activeOpacity={1} onPress={() => setPickingHouseId(null)} />
          
          <View style={styles.dlPickerBox}>
            <View style={styles.dlPickerHeader}>
              <Text style={styles.dlPickerTitle}>Chọn sản phẩm: {activeHouse?.name || "Khách"}</Text>
              <TouchableOpacity onPress={() => { setPickingHouseId(null); setSearchItemQuery(""); }} style={styles.dlPickerDoneBtn}>
                <Text style={styles.dlPickerDoneText}>Xong</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.dlPickerSearchBox}>
              <Text style={styles.dlPickerSearchIcon}>🔍</Text>
              <TextInput style={styles.dlPickerSearchInput} placeholder="Tìm chăn, đệm, quần áo..." placeholderTextColor="#94A3B8" value={searchItemQuery} onChangeText={setSearchItemQuery} />
              {searchItemQuery.length > 0 && (
                 <TouchableOpacity onPress={() => setSearchItemQuery('')} style={styles.dlPickerSearchClearWrap}>
                   <Text style={styles.dlPickerSearchClearIcon}>✖</Text>
                 </TouchableOpacity>
              )}
            </View>

            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              <View style={styles.dlPickerGrid}>
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
                    <ItemCounter key={idx} label={item.name} value={activeHouse?.items[item.name] || 0} onChange={(v: number) => updateHouseItem(pickingHouseId!, item.name, v)} />
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