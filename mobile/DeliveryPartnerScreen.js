import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, StatusBar } from 'react-native';

export default function DeliveryPartnerScreen({ navigation }) {
  const [partner, setPartner] = useState(null);
  
  const partners = [
    { id: '1', name: 'Zepto', time: '10-30 min', fee: '₹40' },
    { id: '2', name: 'Blinkit', time: '15-30 min', fee: '₹40' },
    { id: '3', name: 'bigbasket', time: '30-60 min', fee: '₹35' }
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.back}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Select Delivery Partner</Text>
        <View style={{width: 30}} />
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        {partners.map(p => (
          <TouchableOpacity 
            key={p.id} 
            style={[styles.card, partner === p.id && styles.activeCard]} 
            onPress={() => setPartner(p.id)}
          >
            <View style={styles.info}>
              <Text style={styles.name}>{p.name}</Text>
              <Text style={styles.time}>⏱ {p.time}</Text>
            </View>
            <Text style={styles.fee}>{p.fee}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      <View style={styles.footer}>
        <TouchableOpacity 
          style={[styles.btn, !partner && styles.btnDisabled]} 
          disabled={!partner} 
          onPress={() => navigation.navigate('OrderSummary')}
        >
          <Text style={styles.btnTxt}>Continue</Text>
        </TouchableOpacity>
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
  card: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, marginBottom: 15, borderRadius: 16, borderWidth: 1, borderColor: '#EEEEEE', backgroundColor: '#FFFFFF', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3 },
  activeCard: { borderColor: '#00C853', backgroundColor: '#F2FFF6', borderWidth: 1.5 },
  info: { flex: 1 },
  name: { fontSize: 18, fontWeight: 'bold', color: '#000000', marginBottom: 5 },
  time: { fontSize: 13, color: '#666666' },
  fee: { fontSize: 16, fontWeight: 'bold', color: '#000000' },
  footer: { padding: 20, borderTopWidth: 1, borderTopColor: '#EEEEEE' },
  btn: { backgroundColor: '#00C853', height: 54, borderRadius: 25, justifyContent: 'center', alignItems: 'center' },
  btnDisabled: { backgroundColor: '#A5D6A7' },
  btnTxt: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' }
});