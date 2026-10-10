import React from "react";
import { View, Text, TouchableOpacity, SafeAreaView, Image } from "react-native";
import { styles } from "../styles/globalStyles";

export default function MaQR({ onBack }: { onBack: () => void }) {
  const qrUrl = "https://img.vietqr.io/image/MB-0367393784-print.png?accountName=PHAN%20DUY%20HOANG";
  
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.moduleHeaderTop}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack}>
          <Text style={styles.backBtnText}>Quay lại</Text>
        </TouchableOpacity>
        <Text style={styles.moduleTitle}>Mã Nhận Tiền</Text>
        <View style={{ width: 60 }} />
      </View>

      <View style={styles.qrContainer}>
        <View style={styles.qrCard}>
          
          <View style={styles.qrBadgeTop}>
            <Text style={styles.qrBadgeTopText}>QUÉT ĐỂ THANH TOÁN</Text>
          </View>

          <Text style={styles.qrBankName}>Ngân hàng MB Bank</Text>
          <Text style={styles.qrBankNumber}>0367393784</Text>

          <View style={styles.qrImageWrapper}>
            <Image
              source={{ uri: qrUrl }}
              style={styles.qrImage}
              resizeMode="contain"
            />
          </View>

          <View style={styles.qrFooterNote}>
            <Text style={styles.qrFooterNoteText}>📱 Đưa mã này cho khách để quét</Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}