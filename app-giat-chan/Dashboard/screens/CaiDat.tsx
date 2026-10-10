import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ScrollView, TextInput, KeyboardAvoidingView, Platform } from "react-native";
import { styles } from "../styles/globalStyles";
import BeautifulPopup from "../components/Popup";
import { HeThongService } from "../services/HeThong"; 
import { DonHangService } from "../services/DonHang"; 

export default function CaiDat({ onBack }: { onBack: () => void }) {
  const [prices, setPrices] = useState<any[]>([]);
  const [newItemName, setNewItemName] = useState("");
  const [newItemPrice, setNewItemPrice] = useState("");
  const [newAgentPrice, setNewAgentPrice] = useState(""); 
  const [popup, setPopup] = useState<any>({ visible: false });

  useEffect(() => {
    DonHangService.getPrices().then(setPrices);
  }, []);

  const handleSavePrices = async () => {
    const isSuccess = await HeThongService.updatePrices(prices);
    if (isSuccess) {
      setPopup({ visible: true, type: "SUCCESS", title: "Thành công", message: "Đã lưu bảng giá mới vào Đám mây!" });
    } else {
      setPopup({ visible: true, type: "ERROR", title: "Lỗi", message: "Có lỗi mạng khi lưu bảng giá." });
    }
  };

  const handleAddNewItem = () => {
    if (!newItemName.trim() || !newItemPrice || !newAgentPrice) {
      return setPopup({ visible: true, type: "ERROR", title: "Thiếu thông tin", message: "Sếp nhập đủ tên dịch vụ, giá lẻ và giá sỉ nhé!" });
    }
    const newPrices = [...prices, { 
      name: newItemName, 
      price: parseInt(newItemPrice) || 0,
      agentPrice: parseInt(newAgentPrice) || 0 
    }];
    setPrices(newPrices);
    setNewItemName("");
    setNewItemPrice("");
    setNewAgentPrice("");
  };

  const clearCache = async () => {
    await HeThongService.clearSystemCache();
    setPopup({ visible: true, type: "SUCCESS", title: "Dọn dẹp xong", message: "Đã xóa rác hệ thống!" });
  };

  return (
    <KeyboardAvoidingView style={styles.cdContainer} behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <View style={styles.moduleHeader}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack}>
          <Text style={styles.backBtnText}>Quay lại</Text>
        </TouchableOpacity>
        <Text style={styles.moduleTitle}>Cài đặt Bảng giá</Text>
        <TouchableOpacity onPress={handleSavePrices} style={styles.cdSaveBtn}>
          <Text style={styles.cdSaveBtnText}>Lưu Giá</Text>
        </TouchableOpacity>
      </View>

      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.cdScrollContent}>
        <View style={styles.cdAddBox}>
          <Text style={styles.cdAddTitle}>Thêm Dịch Vụ Mới</Text>
          <TextInput
            style={styles.cdAddInputFull}
            placeholder="Tên dịch vụ (VD: Giặt gấu bông)..." value={newItemName} onChangeText={setNewItemName}
          />
          <View style={styles.cdPriceRow}>
            <TextInput
              style={styles.cdAddInputHalf}
              placeholder="Giá Khách Lẻ..." keyboardType="numeric" value={newItemPrice} onChangeText={setNewItemPrice}
            />
            <TextInput
              style={styles.cdAddInputHalf}
              placeholder="Giá Đại Lý..." keyboardType="numeric" value={newAgentPrice} onChangeText={setNewAgentPrice}
            />
          </View>
          <TouchableOpacity style={styles.cdAddBtn} onPress={handleAddNewItem}>
            <Text style={styles.cdAddBtnText}>+ Thêm dịch vụ </Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.cdListTitle}>DANH SÁCH HIỆN TẠI</Text>

        {prices.map((item, index) => (
          <View key={index} style={styles.cdItemCard}>
            <View style={styles.cdItemHeader}>
              <Text style={styles.cdItemName}>{item.name}</Text>
              <TouchableOpacity onPress={() => { const newPrices = [...prices]; newPrices.splice(index, 1); setPrices(newPrices); }}>
                <Text style={styles.cdItemDelIcon}>❌</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.cdItemPriceRow}>
              <View style={[styles.cdItemPriceBoxBase, styles.cdItemPriceBoxRetail]}>
                <Text style={[styles.cdItemPriceLabel, styles.cdItemPriceLabelRetail]}>Giá Lẻ:</Text>
                <View style={styles.cdItemPriceInputRow}>
                  <TextInput
                    style={[styles.cdItemPriceInputBase, styles.cdItemPriceInputRetail]}
                    keyboardType="numeric" value={item.price ? item.price.toString() : "0"}
                    onChangeText={(text) => { const newP = [...prices]; newP[index].price = text; setPrices(newP); }}
                  />
                  <Text style={[styles.cdItemPriceUnit, styles.cdItemPriceUnitRetail]}>đ</Text>
                </View>
              </View>

              <View style={[styles.cdItemPriceBoxBase, styles.cdItemPriceBoxAgent]}>
                <Text style={[styles.cdItemPriceLabel, styles.cdItemPriceLabelAgent]}>Giá Đại Lý:</Text>
                <View style={styles.cdItemPriceInputRow}>
                  <TextInput
                    style={[styles.cdItemPriceInputBase, styles.cdItemPriceInputAgent]}
                    keyboardType="numeric" 
                    value={item.agentPrice ? item.agentPrice.toString() : (parseInt(item.price || 0) - 5000).toString()}
                    onChangeText={(text) => { const newP = [...prices]; newP[index].agentPrice = text; setPrices(newP); }}
                  />
                  <Text style={[styles.cdItemPriceUnit, styles.cdItemPriceUnitAgent]}>đ</Text>
                </View>
              </View>
            </View>
          </View>
        ))}

        <TouchableOpacity style={styles.cdClearCacheBtn} onPress={clearCache}>
          <Text style={styles.cdClearCacheIcon}>🧹</Text>
          <Text style={styles.cdClearCacheText}>Dọn dẹp bộ nhớ đệm (Cache)</Text>
        </TouchableOpacity>
      </ScrollView>
      <BeautifulPopup {...popup} onClose={() => setPopup({ ...popup, visible: false })} />
    </KeyboardAvoidingView>
  );
}