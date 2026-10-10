import React, { useState } from "react";
import { View, Text, TouchableOpacity, TextInput, FlatList, ActivityIndicator, Linking, Modal, KeyboardAvoidingView, ScrollView, Platform, Dimensions } from "react-native";
import { styles } from "../styles/globalStyles";
import { KhachHangService } from "../services/KhachHang"; 
import { DonHangService } from "../services/DonHang"; 

export default function CRM() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<any | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<string>("Tất cả");
  const [showLocationFilter, setShowLocationFilter] = useState(false);
  const [uniqueLocations, setUniqueLocations] = useState<string[]>(["Tất cả"]);
  const [searchLocQuery, setSearchLocQuery] = useState("");

  React.useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      
      try {
        const [customersData, ordersData] = await Promise.all([
          KhachHangService.getProcessedCustomers(),
          DonHangService.getAllOrders() 
        ]);
        
        const combinedCustomers = JSON.parse(JSON.stringify(customersData || []));
        const customerIndex = new Map();
        
        combinedCustomers.forEach((c: any) => {
          if (c.phone && c.phone !== "Chưa có SĐT") {
            customerIndex.set(c.phone, c);
          } else if (c.name) {
            customerIndex.set(c.name.toLowerCase(), c);
          }
        });

        if (ordersData && Array.isArray(ordersData)) {
          ordersData.forEach(order => {
            const phone = order.customer_phone || "";
            const name = order.customer_name || "Khách vãng lai";
            const address = order.address || "";
            
            let existingCustomer = null;
            if (phone && phone !== "Chưa có SĐT") {
              existingCustomer = customerIndex.get(phone);
            } else if (name) {
              existingCustomer = customerIndex.get(name.toLowerCase());
            }

            if (existingCustomer) {
              if (!existingCustomer.address && address) {
                existingCustomer.address = address;
              }
            } else {
              const newCustomer = {
                name: name,
                phone: phone || "Chưa có SĐT",
                address: address,
                totalOrders: 1, 
                totalSpent: order.total_amount || 0,
                isAgent: false
              };
              combinedCustomers.push(newCustomer);
              
              if (phone && phone !== "Chưa có SĐT") {
                customerIndex.set(phone, newCustomer);
              } else if (name) {
                customerIndex.set(name.toLowerCase(), newCustomer);
              }
            }
          });
        }
        
        setCustomers(combinedCustomers);
        
        const addressMap = new Map<string, string>();
        
        combinedCustomers.forEach((c: any) => {
          if (c.address && c.address.trim() !== "") {
            const cleanAddr = c.address.trim();
            const key = cleanAddr.toLowerCase();
            if (!addressMap.has(key)) {
              addressMap.set(key, cleanAddr);
            }
          }
        });
        
        setUniqueLocations(["Tất cả", ...Array.from(addressMap.values())].sort());

      } catch (error) {
        console.error("Lỗi tải dữ liệu:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const filteredCustomers = customers.filter((c) => {
    const query = searchQuery.toLowerCase().trim();
    let matchSearch = true;
    if (query) {
      const nameLower = (c.name || "").toLowerCase();
      const matchPrefix = nameLower.startsWith(query) || nameLower.includes(` ${query}`);
      const initials = nameLower.split(" ").filter((w: string) => w.length > 0).map((w: string) => w.charAt(0)).join("");
      const matchInitials = initials.includes(query.replace(/\s/g, ""));
      const safePhone = (c.phone && c.phone !== "Chưa có SĐT") ? c.phone.toLowerCase() : "";
      const matchPhone = safePhone.startsWith(query);
      matchSearch = matchPrefix || matchInitials || matchPhone;
    }

    let matchLocation = true;
    if (selectedLocation !== "Tất cả") {
      const cusAddress = (c.address || "").trim().toLowerCase();
      matchLocation = cusAddress === selectedLocation.toLowerCase();
    }

    return matchSearch && matchLocation;
  });

  return (
    <View style={styles.container}>
      <View style={styles.moduleHeaderTop}>
        <Text style={styles.moduleTitle}>Danh Sách Khách Hàng</Text>
      </View>
      
      <View style={styles.crmSearchWrapper}>
        <View style={[styles.crmSearchBox, styles.crmSearchBoxMain]}>
          <Text style={styles.crmSearchIconMain}>🔍</Text>
          <TextInput
            style={styles.crmSearchInputMain}
            placeholder="Tìm tên, số điện thoại..."
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {isLoading ? (
        <ActivityIndicator size="large" color="#3B82F6" style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={filteredCustomers}
          keyExtractor={(item, index) => index.toString()}
          contentContainerStyle={styles.crmListContent}
          ListHeaderComponent={
            <View style={styles.crmListHeader}>
              <Text style={styles.crmTotalText}>
                TỔNG: {filteredCustomers.length} KHÁCH
              </Text>

              <TouchableOpacity 
                style={styles.crmLocFilterBtn}
                onPress={() => setShowLocationFilter(true)}
              >
                <Text style={styles.crmLocFilterText} numberOfLines={1} ellipsizeMode="tail">
                  {selectedLocation.length > 10 ? selectedLocation.substring(0,10) + '...' : selectedLocation}
                </Text>
                <Text style={styles.crmLocFilterIcon}>▼</Text>
              </TouchableOpacity>
            </View>
          }
          renderItem={({ item: cus }) => (
            <View style={[styles.crmCard, styles.crmCardItem]}>
              <View style={styles.crmHeader}>
                <View style={[styles.crmAvatar, cus.isAgent && styles.crmAgentAvatar]}>
                  <Text style={[styles.crmAvatarText, cus.isAgent && styles.crmAgentAvatarText]}>
                    {cus.name ? cus.name.charAt(0).toUpperCase() : "👤"}
                  </Text>
                </View>
                
                <View style={styles.crmCusInfoCol}>
                  <View style={styles.crmCusNameRow}>
                    <Text style={[styles.crmName, styles.crmCusNameText]} numberOfLines={1}>{cus.name}</Text>
                    {cus.isAgent ? (
                      <View style={styles.crmBadgeAgent}><Text style={styles.crmBadgeTextAgent}>Đại lý</Text></View>
                    ) : (
                      cus.totalSpent > 1000000 && (
                        <View style={styles.crmBadgeVip}><Text style={styles.crmBadgeTextVip}>VIP</Text></View>
                      )
                    )}
                  </View>
                  
                  {cus.phone && cus.phone !== "Chưa có SĐT" ? (
                    <TouchableOpacity activeOpacity={0.5} style={styles.crmPhoneTouch} onPress={() => Linking.openURL(`tel:${cus.phone}`)}>
                      <Text style={[styles.crmPhone, styles.crmPhoneLinkText]}>📞 {cus.phone}</Text>
                    </TouchableOpacity>
                  ) : (
                    <Text style={[styles.crmPhone, styles.crmPhoneEmptyText]}>📞 Chưa có SĐT</Text>
                  )}
                </View>

                <TouchableOpacity 
                  style={styles.crmDetailBtn}
                  onPress={() => setSelectedCustomer(cus)}
                >
                  <Text style={styles.crmDetailBtnText}>Chi tiết</Text>
                </TouchableOpacity>

              </View>
            </View>
          )}
        />
      )}

      {/* POPUP LỌC ĐỊA ĐIỂM */}
      <Modal visible={showLocationFilter} transparent={true} animationType="slide" statusBarTranslucent={true}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={styles.locModalOverlay}
        >
          <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={() => setShowLocationFilter(false)} />
          
          <View style={[styles.locModalBox, { maxHeight: Dimensions.get('window').height * 0.85, paddingBottom: Platform.OS === 'ios' ? 35 : 25 }]}>
            
            <View style={styles.locModalHeader}>
              <Text style={styles.locModalTitle}>Địa điểm</Text>
              <TouchableOpacity onPress={() => setShowLocationFilter(false)} style={styles.locModalCloseBtn}>
                <Text style={styles.locModalCloseIcon}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.locSearchWrapper}>
              <View style={styles.locSearchBox}>
                <Text style={styles.locSearchIcon}>🔍</Text>
                <TextInput
                  style={styles.locSearchInput}
                  placeholder="Tìm tên thôn, xóm, phường..."
                  placeholderTextColor="#94A3B8"
                  value={searchLocQuery}
                  onChangeText={setSearchLocQuery}
                  autoCorrect={false}
                />
                {searchLocQuery.length > 0 && (
                   <TouchableOpacity onPress={() => setSearchLocQuery("")} style={styles.locSearchClearWrap}>
                     <Text style={styles.locSearchClearIcon}>✖</Text>
                   </TouchableOpacity>
                )}
              </View>
            </View>

            <ScrollView style={styles.locListScroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              <View style={styles.locListContent}>
                {(() => {
                  const allOption = "Tất cả";
                  
                  const otherLocations = uniqueLocations
                    .filter(loc => loc !== "Tất cả")
                    .filter(loc => searchLocQuery === "" || loc.toLowerCase().includes(searchLocQuery.toLowerCase().trim()))
                    .sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase(), 'vi'));

                  const sortedLocations = [allOption, ...otherLocations];

                  if (sortedLocations.length === 1 && searchLocQuery !== "") {
                    return (
                       <Text style={styles.locEmptyText}>
                         Không tìm thấy địa điểm {searchLocQuery}
                       </Text>
                    )
                  }

                  return sortedLocations.map((loc, idx) => (
                    <TouchableOpacity 
                      key={idx} 
                      style={[
                        styles.locItemBtn,
                        {
                          backgroundColor: selectedLocation === loc ? '#EFF6FF' : '#FFF',
                          borderColor: selectedLocation === loc ? '#BFDBFE' : 'transparent',
                          marginTop: loc === "Tất cả" ? 0 : 2
                        }
                      ]}
                      onPress={() => { setSelectedLocation(loc); setShowLocationFilter(false); }}
                    >
                      <Text style={{ 
                        color: selectedLocation === loc ? '#2563EB' : '#334155', 
                        fontWeight: selectedLocation === loc ? '900' : '600',
                        fontSize: 15
                      }}>
                        {loc === "Tất cả" ? "Tất cả" : `📍 ${loc}`}
                      </Text>
                    </TouchableOpacity>
                  ));
                })()}
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* POPUP CHI TIẾT KHÁCH HÀNG */}
      <Modal visible={!!selectedCustomer} transparent={true} animationType="fade" statusBarTranslucent={true}>
        <TouchableOpacity 
          style={styles.cusModalOverlay} 
          activeOpacity={1} 
          onPress={() => setSelectedCustomer(null)}
        >
          <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.cusModalKeyboardAvoid}>
            <ScrollView contentContainerStyle={{ padding: 20, width: Dimensions.get('window').width }} keyboardShouldPersistTaps="handled">
              <TouchableOpacity activeOpacity={1} style={styles.cusModalBox}>
                
                <View style={styles.cusModalHeader}>
                  <View style={[styles.cusModalAvatarWrap, { backgroundColor: selectedCustomer?.isAgent ? "#FEF3C7" : "#E0F2FE" }]}>
                    <Text style={[styles.cusModalAvatarText, { color: selectedCustomer?.isAgent ? "#D97706" : "#2563EB" }]}>
                      {selectedCustomer?.name ? selectedCustomer.name.charAt(0).toUpperCase() : "👤"}
                    </Text>
                  </View>
                  <Text style={styles.cusModalName}>{selectedCustomer?.name}</Text>
                  <Text style={styles.cusModalPhone}>{selectedCustomer?.phone || 'Chưa có SĐT'}</Text>
                </View>

                <View style={styles.cusStatsBox}>
                  <View style={styles.cusStatCol}>
                    <Text style={styles.cusStatLabel}>Tổng đơn</Text>
                    <Text style={styles.cusStatValueVal} adjustsFontSizeToFit numberOfLines={1}>
                      {selectedCustomer?.totalOrders}
                    </Text>
                  </View>
                  
                  <View style={styles.cusStatDivider} />
                  
                  <View style={styles.cusStatCol}>
                    <Text style={styles.cusStatLabel}>Đã chi tiêu</Text>
                    <Text style={styles.cusStatValueMoney} adjustsFontSizeToFit numberOfLines={1}>
                      {selectedCustomer?.totalSpent?.toLocaleString("vi-VN")} đ
                    </Text>
                  </View>
                </View>

                <TouchableOpacity 
                  style={styles.cusModalCloseBtn}
                  onPress={() => setSelectedCustomer(null)}
                >
                  <Text style={styles.cusModalCloseText}>Đóng lại</Text>
                </TouchableOpacity>

              </TouchableOpacity>
            </ScrollView>
          </KeyboardAvoidingView>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}