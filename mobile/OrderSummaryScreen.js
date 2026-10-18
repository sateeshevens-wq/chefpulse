import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, StatusBar } from 'react-native';

export default function OrderSummaryScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.back}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Order Summary</Text>
        <View style={{width: 30}} />
      </View>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.receipt}>
          <Text style={styles.sectionTitle}>Ingredients</Text>
          <View style={styles.row}><Text style={styles.item}>Fresh Vegetables (1 kg)</Text><Text style={styles.price}>₹210</Text></View>
          <View style={styles.row}><Text style={styles.item}>Paneer (500g)</Text><Text style={styles.price}>₹130</Text></View>
          <View style={styles.row}><Text style={styles.item}>Basmati Rice (1 kg)</Text><Text style={styles.price}>₹160</Text></View>
          <View style={styles.row}><Text style={styles.item}>Spices & Oils</Text><Text style={styles.price}>₹200</Text></View>
          <View style={styles.divider} />
          <View style={styles.row}><Text style={styles.item}>Subtotal</Text><Text style={styles.price}>₹700</Text></View>
          <View style={styles.row}><Text style={styles.item}>Partner Delivery Fee</Text><Text style={styles.price}>₹40</Text></View>
          <View style={styles.divider} />
          <View style={styles.totalRow}><Text style={styles.totalLbl}>Total Amount</Text><Text style={styles.totalVal}>₹740</Text></View>
        </View>
      </ScrollView>
      <View style={styles.footer}>
        <TouchableOpacity style={styles.btn} onPress={() => navigation.navigate('DeliveryTracking')}>
          <Text style={styles.btnTxt}>🔒 Pay Now</Text>
        </TouchableOpacity>
        <Text style={styles.secure}>Secure Payment</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 10, paddingBottom: 20 },
  backBtn: { padding: 5 },
  back: { fontSize: 32, color: '#000000', marginTop: -5 },
  title: { fontSize: 18, fontWeight: 'bold', color: '#000000' },
  content: { paddingHorizontal: 20 },
  receipt: { backgroundColor: '#F8F9F8', padding: 20, borderRadius: 16, borderWidth: 1, borderColor: '#EEEEEE' },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#000000', marginBottom: 15 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  item: { fontSize: 14, color: '#666666' },
  price: { fontSize: 14, color: '#000000', fontWeight: '500' },
  divider: { height: 1, backgroundColor: '#E0E0E0', marginVertical: 10 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 5 },
  totalLbl: { fontSize: 16, fontWeight: 'bold', color: '#000000' },
  totalVal: { fontSize: 18, fontWeight: 'bold', color: '#00C853' },
  footer: { padding: 20, borderTopWidth: 1, borderTopColor: '#EEEEEE', backgroundColor: '#FFFFFF' },
  btn: { backgroundColor: '#00C853', height: 54, borderRadius: 25, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  btnTxt: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
  secure: { textAlign: 'center', fontSize: 12, color: '#9BA39A' }
});