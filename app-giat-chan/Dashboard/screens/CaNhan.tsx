import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity, Alert, Modal, TextInput, KeyboardAvoidingView, Platform, Linking, Dimensions } from "react-native";
import { styles } from "../styles/globalStyles";
import { HeThongService } from "../services/HeThong"; 
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from "@react-native-async-storage/async-storage";
const { width } = Dimensions.get('window');
const avatarSize = width * 0.2; 

export default function CaNhan({ onLogout }: any) {
  const [userInfo, setUserInfo] = useState({
    name: "Đang tải...",
    phone: "Đang tải...",
    role: "admin",
  });

  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ 
    name: "", phone: "", oldPass: "", newPass: "", storeName: "Giặt là Duynh Tươi" 
  });

  useEffect(() => {
    HeThongService.getUserProfile().then((data) => {
      setUserInfo(data);
      setEditForm(prev => ({ ...prev, name: data.name, phone: data.phone }));
    });
  }, []);

  const handleSaveProfile = () => {
    if (!editForm.name) return Alert.alert("Lỗi", "Tên không được để trống!");
    setUserInfo({ ...userInfo, name: editForm.name, phone: editForm.phone });
    setActiveModal(null);
    Alert.alert("Thành công", "Đã cập nhật thông tin cá nhân!");
  };

  const handleChangePassword = () => {
    if (!editForm.oldPass || !editForm.newPass) return Alert.alert("Lỗi", "Vui lòng nhập đủ mật khẩu!");
    setActiveModal(null);
    setEditForm({ ...editForm, oldPass: "", newPass: "" }); 
    Alert.alert("Thành công", "Mật khẩu đã được đổi an toàn!");
  };

  const handleLogout = () => {
    Alert.alert("Xác nhận", "Bạn có chắc chắn muốn đăng xuất?", [
      { text: "Hủy", style: "cancel" },
      { text: "Đăng xuất", style: "destructive", onPress: async () => {
          await AsyncStorage.removeItem("user_name");
          if (onLogout) onLogout(); 
          else Alert.alert("Đăng xuất thành công", "Vui lòng khởi động lại app!");
      }}
    ]);
  };

  const MenuItem = ({ icon, title, color, onPress, isLast = false, subtitle }: any) => (
    <TouchableOpacity onPress={onPress} style={[styles.cnMenuItemRow, { borderBottomWidth: isLast ? 0 : 1, borderBottomColor: "#F1F5F9" }]}>
      {/* Background Icon cần ghép độ mờ '20' (Hex) nên phải inline */}
      <View style={[styles.cnMenuIconBox, { backgroundColor: color + "20" }]}>
        <Ionicons name={icon} size={20} color={color} />
      </View>
      <View style={styles.cnMenuTextCol}>
        <Text style={styles.cnMenuTitle}>{title}</Text>
        {subtitle && <Text style={styles.cnMenuSubTitle}>{subtitle}</Text>}
      </View>
      <Ionicons name="chevron-forward" size={20} color="#CBD5E1" />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.moduleHeaderTop}>
        <Text style={styles.moduleTitle}>Tài Khoản Của Tôi</Text>
      </View>
      
      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 15, paddingBottom: 100 }}>
        
        {/* KHỐI HEADER: AVATAR VÀ THÔNG TIN CƠ BẢN */}
        <View style={styles.cnProfileCard}>
          <View style={[styles.cnAvatarBox, { width: avatarSize, height: avatarSize, borderRadius: avatarSize / 2 }]}>
            <Text style={styles.cnAvatarText}>
              {userInfo.name !== "Chưa cập nhật" && userInfo.name ? userInfo.name.charAt(0).toUpperCase() : "👤"}
            </Text>
          </View>
          <Text style={styles.cnUserName}>{userInfo.name}</Text>
          <Text style={styles.cnUserPhone}>{userInfo.phone}</Text>
          <View style={styles.cnRoleBadge}>
            <Text style={styles.cnRoleText}>
              {userInfo.role === "admin" ? "Quản trị viên" : "Nhân viên"}
            </Text>
          </View>
        </View>

        {/* KHỐI QUẢN LÝ TÀI KHOẢN */}
        <Text style={styles.cnSectionTitle}>Quản lý tài khoản</Text>
        <View style={styles.cnMenuCard}>
          <MenuItem icon="person-outline" title="Chỉnh sửa thông tin" color="#3B82F6" onPress={() => setActiveModal('EDIT_PROFILE')} />
          <MenuItem icon="lock-closed-outline" title="Đổi mật khẩu" color="#F59E0B" onPress={() => setActiveModal('CHANGE_PASS')} />
          <MenuItem icon="business-outline" title="Cấu hình cửa hàng" subtitle={editForm.storeName} color="#10B981" isLast={true} onPress={() => setActiveModal('STORE_CONFIG')} />
        </View>

        {/* KHỐI CÀI ĐẶT ỨNG DỤNG */}
        <Text style={styles.cnSectionTitle}>Cài đặt & Hỗ trợ</Text>
        <View style={styles.cnMenuCard}>
          <MenuItem icon="notifications-outline" title="Cài đặt thông báo" color="#8B5CF6" onPress={() => Linking.openSettings()} />
          <MenuItem icon="headset-outline" title="Trung tâm hỗ trợ" subtitle="Gọi tổng đài (Miễn phí)" color="#06B6D4" onPress={() => Linking.openURL('tel:0333041030')} />
          <MenuItem icon="information-circle-outline" title="Phiên bản ứng dụng" subtitle="Version 1.0.0" color="#64748B" isLast={true} onPress={() => Alert.alert("Thông tin", "Bạn đang sử dụng phiên bản mới nhất!")} />
        </View>

        {/* NÚT ĐĂNG XUẤT */}
        <TouchableOpacity style={styles.cnLogoutBtn} onPress={handleLogout}>
          <Text style={styles.cnLogoutText}>Đăng xuất tài khoản</Text>
        </TouchableOpacity>

      </ScrollView>

      {/* MULTI-MODAL: XỬ LÝ CHUNG 3 FORM BẰNG 1 POPUP */}
      <Modal visible={activeModal !== null} animationType="slide" transparent={true} statusBarTranslucent>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.cnModalOverlay}>
          
          <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={() => setActiveModal(null)} />
          
          <View style={[styles.cnModalBox, { paddingBottom: Platform.OS === 'ios' ? 40 : 24 }]}>
            <View style={styles.cnModalHeaderRow}>
              <Text style={styles.cnModalTitle}>
                {activeModal === 'EDIT_PROFILE' ? 'Chỉnh sửa thông tin' : activeModal === 'CHANGE_PASS' ? 'Đổi mật khẩu' : 'Cấu hình cửa hàng'}
              </Text>
              <TouchableOpacity onPress={() => setActiveModal(null)} style={styles.cnModalCloseBtn}>
                <Ionicons name="close" size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            {/* FORM 1: SỬA HỒ SƠ */}
            {activeModal === 'EDIT_PROFILE' && (
              <View>
                <Text style={styles.cnInputLabel}>Họ và tên</Text>
                <TextInput style={styles.cnInputStandard} value={editForm.name} onChangeText={(t) => setEditForm({...editForm, name: t})} />
                
                <Text style={styles.cnInputLabel}>Số điện thoại</Text>
                <TextInput style={[styles.cnInputStandard, styles.cnInputLast]} value={editForm.phone} onChangeText={(t) => setEditForm({...editForm, phone: t})} keyboardType="phone-pad" />
                
                <TouchableOpacity onPress={handleSaveProfile} style={[styles.cnSaveBtnBase, { backgroundColor: '#3B82F6' }]}>
                  <Text style={styles.cnSaveBtnText}>LƯU THAY ĐỔI</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* FORM 2: ĐỔI MẬT KHẨU */}
            {activeModal === 'CHANGE_PASS' && (
              <View>
                <Text style={styles.cnInputLabel}>Mật khẩu hiện tại</Text>
                <TextInput secureTextEntry style={styles.cnInputStandard} placeholder="Nhập mật khẩu cũ..." placeholderTextColor="#94A3B8" value={editForm.oldPass} onChangeText={(t) => setEditForm({...editForm, oldPass: t})} />
                
                <Text style={styles.cnInputLabel}>Mật khẩu mới</Text>
                <TextInput secureTextEntry style={[styles.cnInputStandard, styles.cnInputLast]} placeholder="Nhập mật khẩu mới..." placeholderTextColor="#94A3B8" value={editForm.newPass} onChangeText={(t) => setEditForm({...editForm, newPass: t})} />
                
                <TouchableOpacity onPress={handleChangePassword} style={[styles.cnSaveBtnBase, { backgroundColor: '#F59E0B' }]}>
                  <Text style={styles.cnSaveBtnText}>XÁC NHẬN ĐỔI</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* FORM 3: ĐỔI TÊN CỬA HÀNG */}
            {activeModal === 'STORE_CONFIG' && (
              <View>
                <Text style={styles.cnInputLabel}>Tên cửa hàng (Hiển thị trên hóa đơn)</Text>
                <TextInput style={[styles.cnInputStandard, styles.cnInputLast]} value={editForm.storeName} onChangeText={(t) => setEditForm({...editForm, storeName: t})} />
                
                <TouchableOpacity onPress={() => { setActiveModal(null); Alert.alert("Thành công", "Cấu hình cửa hàng đã được lưu!"); }} style={[styles.cnSaveBtnBase, { backgroundColor: '#10B981' }]}>
                  <Text style={styles.cnSaveBtnText}>LƯU CẤU HÌNH</Text>
                </TouchableOpacity>
              </View>
            )}

          </View>
        </KeyboardAvoidingView>
      </Modal>

    </View>
  );
}