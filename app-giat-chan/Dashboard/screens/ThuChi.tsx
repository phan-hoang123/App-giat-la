import React, { useState } from "react";
import { View, Text, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, Modal, ActivityIndicator, FlatList } from "react-native";
import { styles } from "../styles/globalStyles";
import BeautifulPopup from "../components/Popup";
import { TaiChinhService } from "../services/TaiChinh";

export default function ThuChi() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [type, setType] = useState<"IN" | "OUT">("IN");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [popup, setPopup] = useState<any>({ visible: false });

  const fetchTransactions = async () => {
    setIsLoading(true);
    setTransactions(await TaiChinhService.getAllTransactions());
    setIsLoading(false);
  };

  React.useEffect(() => { fetchTransactions(); }, []);

  const handleAddTransaction = async () => {
    if (!amount || !description) return setPopup({ visible: true, type: "ERROR", title: "Thiếu thông tin", message: "Sếp điền đủ số tiền và lý do nhé!" });
    
    const isSuccess = await TaiChinhService.createTransaction(type, parseFloat(amount), description);
    
    if (isSuccess) {
      setModalVisible(false);
      setAmount("");
      setDescription("");
      fetchTransactions();
      setPopup({ visible: true, type: "SUCCESS", title: "Đã Ghi Sổ", message: "Đã lưu số tiền vào hệ thống an toàn!" });
    }
  };

  const totalIn = transactions.filter((t) => t.type === "IN").reduce((sum, t) => sum + t.amount, 0);
  const totalOut = transactions.filter((t) => t.type === "OUT").reduce((sum, t) => sum + t.amount, 0);
  const balance = totalIn - totalOut;

  return (
    <View style={styles.container}>
      <View style={styles.moduleHeaderTop}>
        <Text style={styles.moduleTitle}>Lịch Sử Giao Dịch</Text>
        <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.addTransBtn}>
          <Text style={styles.addTransBtnText}>+ Lập phiếu</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.financeSummaryCard}>
        <Text style={styles.financeSumLabel}>DOANH THU</Text>
        {/* Style đổi màu theo biến nên phải giữ inline */}
        <Text style={[ styles.financeSumValue, { color: balance >= 0 ? "#10B981" : "#EF4444" } ]}>
          {balance.toLocaleString("vi-VN")} đ
        </Text>
        <View style={styles.financeSubRow}>
          <View style={styles.financeSubRowContent}>
            <Text style={styles.financeSubRowLabel}>Tổng doanh thu</Text>
            <Text style={styles.financeSubRowValue}>+{totalIn.toLocaleString("vi-VN")}đ</Text>
          </View>
        </View>
      </View>
      
      {isLoading ? (
        <ActivityIndicator size="large" color="#3B82F6" />
      ) : (
        <FlatList
          data={transactions}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContentContainer}
          renderItem={({ item }) => (
            <View style={styles.transCard}>
              {/* Dynamic bg color */}
              <View style={[ styles.transIconBox, { backgroundColor: item.type === "IN" ? "#D1FAE5" : "#FEE2E2" } ]}>
                <Text style={styles.transIconText}>{item.type === "IN" ? "📥" : "📤"}</Text>
              </View>
              <View style={styles.transInfoContainer}>
                <Text style={styles.transDesc} numberOfLines={2}>{item.description}</Text>
                <Text style={styles.transCode}>{new Date(item.created_at).toLocaleString("vi-VN")}</Text>
              </View>
              {/* Dynamic text color */}
              <Text style={[ styles.transAmount, { color: item.type === "IN" ? "#10B981" : "#EF4444" } ]}>
                {item.type === "IN" ? "+" : "-"}{item.amount.toLocaleString("vi-VN")}đ
              </Text>
            </View>
          )}
        />
      )}

      <Modal visible={modalVisible} animationType="fade" transparent={true} statusBarTranslucent={true}>
        <View style={styles.modalOverlayFull}>
          <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.keyboardAvoidingContainer}>
            <View style={styles.modalContentForm}>
              <Text style={styles.modalTitle}>Lập Phiếu {type === "IN" ? "Thu" : "Chi"}</Text>
              <View style={styles.typeBtnContainer}>
                <TouchableOpacity style={[ styles.typeBtnInactive, type === "IN" && styles.typeBtnIn ]} onPress={() => setType("IN")}>
                  <Text style={[ styles.typeText, type === "IN" ? { color: "#059669" } : { color: "#9CA3AF" } ]}>📥 Thu Tiền</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[ styles.typeBtnInactive, type === "OUT" && styles.typeBtnOut ]} onPress={() => setType("OUT")}>
                  <Text style={[ styles.typeText, type === "OUT" ? { color: "#DC2626" } : { color: "#9CA3AF" } ]}>📤 Chi Tiền</Text>
                </TouchableOpacity>
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Số tiền (VNĐ)</Text>
                <TextInput style={styles.modalInput} placeholder="VD: 500000..." placeholderTextColor="#9CA3AF" keyboardType="numeric" value={amount} onChangeText={setAmount} />
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Lý do thu / chi</Text>
                <TextInput style={[ styles.modalInput, styles.modalInputMultiline ]} placeholder="Khách trả nợ..." placeholderTextColor="#9CA3AF" multiline value={description} onChangeText={setDescription} />
              </View>
              
              <View style={styles.modalActionRow}>
                <TouchableOpacity style={[ styles.modalActionBtn, styles.cancelBtn ]} onPress={() => setModalVisible(false)}>
                  <Text style={styles.cancelBtnText}>Hủy bỏ</Text>
                </TouchableOpacity>
                {/* Dynamic bg color */}
                <TouchableOpacity style={[ styles.modalActionBtn, { backgroundColor: type === "IN" ? "#10B981" : "#EF4444", elevation: 3 } ]} onPress={handleAddTransaction}>
                  <Text style={styles.saveBtnText}>Lưu Sổ Quỹ</Text>
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
      <BeautifulPopup {...popup} onClose={() => setPopup({ ...popup, visible: false })} />
    </View>
  );
}