import React, { useEffect, useState, useRef } from "react";
import { Animated, View, Text, StyleSheet, Easing } from "react-native";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";

SplashScreen.preventAutoHideAsync(); // Ngăn Splash Screen tự động ẩn khi ứng dụng khởi chạy

export default function RootLayout() {
  const [appReady, setAppReady] = useState(false); // Trạng thái ứng dụng đã sẵn sàng hay chưa
  const [showAnimatedSplash, setShowAnimatedSplash] = useState(true); // Trạng thái hiển thị Splash Screen có hiệu ứng hay không

  const logoDropY = useRef(new Animated.Value(-500)).current; // 1. Vị trí rơi xuống của giỏ chăn (để làm hiệu ứng rơi)
  const logoRotate = useRef(new Animated.Value(0)).current; // 2. Góc xoay của giỏ chăn (để làm hiệu ứng lắc lư)
  const textOpacity = useRef(new Animated.Value(0)).current; // 3. Độ mờ của dòng chữ (để làm hiệu ứng mờ dần ra)
  const textSlideY = useRef(new Animated.Value(50)).current; // 4. Vị trí trượt lên của dòng chữ (để làm hiệu ứng trượt lên)
  const exitY = useRef(new Animated.Value(0)).current; // 5. Vị trí trượt lên của cụm Logo + Text khi thoát (để làm hiệu ứng vút bay lên trời)
  const bgOpacity = useRef(new Animated.Value(1)).current; // 6. Độ mờ của nền (để làm hiệu ứng mờ dần ra khi thoát)

  // Quy đổi giá trị số thành góc xoay (Từ -1, 0, 1 thành -20 độ đến 20 độ)
  const spin = logoRotate.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: ["-20deg", "0deg", "20deg"],
  });

  useEffect(() => {
    async function prepareApp() {
      await new Promise((resolve) => setTimeout(resolve, 300)); // Giả lập thời gian load dữ liệu hoặc thực hiện các tác vụ khởi tạo
      setAppReady(true);
      await SplashScreen.hideAsync(); // Ẩn Splash Screen mặc định của Expo

      Animated.sequence([
        // Rơi xuống từ trên cao
        Animated.spring(logoDropY, {
          toValue: 0,
          tension: 60,
          friction: 4,
          useNativeDriver: true,
        }),

        // Lắc lư và hiện dòng chữ
        Animated.parallel([
          Animated.sequence([
            Animated.timing(logoRotate, {
              toValue: 1,
              duration: 150,
              useNativeDriver: true,
            }),
            Animated.timing(logoRotate, {
              toValue: -1,
              duration: 150,
              useNativeDriver: true,
            }),
            Animated.timing(logoRotate, {
              toValue: 0,
              duration: 150,
              useNativeDriver: true,
            }),
          ]),
          Animated.parallel([
            Animated.timing(textOpacity, {
              toValue: 1,
              duration: 400,
              useNativeDriver: true,
            }),
            Animated.spring(textSlideY, {
              toValue: 0,
              tension: 50,
              friction: 5,
              useNativeDriver: true,
            }),
          ]),
        ]),

        // Giữ nguyên trạng thái hiển thị trong 800ms trước khi thoát
        Animated.delay(800),

        // Thoát Splash Screen với hiệu ứng vút bay lên trời và mờ dần ra
        Animated.parallel([
          Animated.timing(exitY, {
            toValue: -800,
            duration: 400,
            easing: Easing.in(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.timing(bgOpacity, {
            toValue: 0,
            duration: 400,
            delay: 100,
            useNativeDriver: true,
          }),
        ]),
      ]).start(() => {
        setShowAnimatedSplash(false); // Ẩn Splash Screen có hiệu ứng sau khi hoàn tất
      });
    }

    prepareApp();
  }, [bgOpacity, exitY, logoDropY, logoRotate, textOpacity, textSlideY]); // Chỉ chạy một lần khi component được mount

  if (!appReady) return null; 

  return (
    <View style={{ flex: 1 }}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
      </Stack>
 
      {showAnimatedSplash && (
        <Animated.View style={[ StyleSheet.absoluteFill, { backgroundColor: "#1E3A8A", justifyContent: "center", alignItems: "center", opacity: bgOpacity, zIndex: 999,}, ]} >
          {/* Cụm chứa cả Logo và Text để lúc thoát thì bay cả cụm */}
          <Animated.View style={{ transform: [{ translateY: exitY }], alignItems: "center" }} >
            {/* Logo Giỏ chăn (Rơi và Xoay) */}
            <Animated.View style={{ transform: [{ translateY: logoDropY }, { rotate: spin }], }} >
              <Text style={{ fontSize: 100 }}>🧺</Text>
            </Animated.View>

            {/* Dòng chữ (Mờ dần ra và Trượt từ dưới lên) */}
            <Animated.View style={{ opacity: textOpacity, transform: [{ translateY: textSlideY }], }} >
              <Text style={{
                  color: "#FFF",
                  fontSize: 32,
                  fontWeight: "900",
                  marginTop: 15,
                  letterSpacing: 2,
                  textShadowColor: "rgba(0,0,0,0.3)",
                  textShadowOffset: { width: 0, height: 4 },
                  textShadowRadius: 10,
                }} >
                Tươi Duynh
              </Text>
              <Text
                style={{
                  color: "#93C5FD",
                  fontSize: 13,
                  fontWeight: "bold",
                  textAlign: "center",
                  marginTop: 5,
                  letterSpacing: 3,
                }}
              >
                HỆ THỐNG QUẢN LÝ
              </Text>
            </Animated.View>
          </Animated.View>
        </Animated.View>
      )}
    </View>
  );
}
