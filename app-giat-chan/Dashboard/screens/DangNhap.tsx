import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator, SafeAreaView } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from '@expo/vector-icons';
import { styles } from "../styles/globalStyles";

const SERVER_IP = "https://backend-giat-chan.onrender.com";

export default function DangNhap({ onAuthSuccess }: { onAuthSuccess: () => void }) {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  useEffect(() => {
    const loadSavedCredentials = async () => {
      const savedPhone = await AsyncStorage.getItem("saved_phone");
      const savedPass = await AsyncStorage.getItem("saved_password");
      if (savedPhone && savedPass) {
        setPhone(savedPhone);
        setPassword(savedPass);
        setRememberMe(true);
      }
    };
    loadSavedCredentials();
  }, []);

  const handleLogin = async () => {
    if (!phone.trim() || !password.trim()) {
      setErrorMessage("Vui lòng nhập số điện thoại và mật khẩu!");
      return;
    }
    
    setErrorMessage("");
    setIsLoading(true);

    try {
      const res = await fetch(`${SERVER_IP}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, password })
      });

      const data = await res.json();

      if (res.ok) {
        await AsyncStorage.setItem("user_name", data.name || "Sếp");
        if (data.token) await AsyncStorage.setItem("user_token", data.token);

        if (rememberMe) {
          await AsyncStorage.setItem("saved_phone", phone);
          await AsyncStorage.setItem("saved_password", password);
        } else {
          await AsyncStorage.removeItem("saved_phone");
          await AsyncStorage.removeItem("saved_password");
        }
        
        onAuthSuccess();
      } else {
        setErrorMessage(data.message || "Sai số điện thoại hoặc mật khẩu!");
      }
    } catch {
      setErrorMessage("Không thể kết nối đến máy chủ. Vui lòng kiểm tra mạng!");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.dnSafeArea}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"} 
        style={styles.dnKeyboardContainer}
      >
        <View style={styles.dnHeaderContainer}>
          <View style={styles.dnLogoCircle}>
            <Text style={styles.dnLogoIcon}>🫧</Text>
          </View>
          <Text style={styles.dnTitle}>
            Quản Lý Giặt Chăn
          </Text>
          <Text style={styles.dnSubTitle}>
            Đăng nhập tài khoản nội bộ
          </Text>
        </View>

        <View style={styles.dnFormCard}>
          {errorMessage !== "" && (
            <View style={styles.dnErrorBox}>
              <Text style={styles.dnErrorText}>{errorMessage}</Text>
            </View>
          )}

          <Text style={styles.dnInputLabel}>SỐ ĐIỆN THOẠI</Text>
          <TextInput
            style={styles.dnInputStandard}
            placeholder="Ví dụ: 0333041030"
            placeholderTextColor="#94A3B8"
            keyboardType="phone-pad"
            value={phone}
            onChangeText={setPhone}
          />

          <Text style={styles.dnInputLabel}>MẬT KHẨU</Text>
          
          <View style={styles.dnInputGroup}>
            <TextInput
              style={styles.dnInputFlex}
              placeholder="••••••••"
              placeholderTextColor="#94A3B8"
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.dnEyeBtn}>
              <Ionicons name={showPassword ? "eye-outline" : "eye-off-outline"} size={22} color="#94A3B8" />
            </TouchableOpacity>
          </View>

          <TouchableOpacity 
            style={styles.dnRememberRow}
            onPress={() => setRememberMe(!rememberMe)}
            activeOpacity={0.7}
          >
            <Ionicons 
              name={rememberMe ? "checkbox" : "square-outline"} 
              size={22} 
              color={rememberMe ? "#2563EB" : "#94A3B8"} 
            />
            <Text style={styles.dnRememberText}>Ghi nhớ tài khoản</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.dnLoginBtn}
            onPress={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.dnLoginBtnText}>
                ĐĂNG NHẬP
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}