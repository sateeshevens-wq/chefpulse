import React, { useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, StatusBar } from 'react-native';

export default function ChefTrackingScreen({ navigation }) {
  useEffect(() => {
    const timer = setTimeout(() => navigation.replace('ChefArrived'), 4000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#E8F5E9" />
      <View style={styles.mapSimulation}>
        <Text style={styles.pinIcon}>👨‍🍳</Text>
        <View style={styles.routeLine} />
        <Text style={styles.pinIcon}>📍</Text>
      </View>
      <View style={styles.bottomSheet}>
        <Text style={styles.title}>Chef is on the way</Text>
        <Text style={styles.eta}>Arriving in 12 min</Text>
        <View style={styles.partnerCard}>
          <View style={styles.avatarPlaceholder}><Text style={styles.avatarTxt}>👨‍🍳</Text></View>
          <View style={styles.partnerInfo}>
            <Text style={styles.partnerName}>Rohit Sharma</Text>
            <Text style={styles.partnerRating}>⭐ 4.8</Text>
          </View>
          <TouchableOpacity style={styles.callBtn}><Text style={styles.callIcon}>📞</Text></TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#E8F5E9', justifyContent: 'space-between' },
  mapSimulation: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  routeLine: { width: 4, height: 60, backgroundColor: '#00C853', marginVertical: 5 },
  pinIcon: { fontSize: 32 },
  bottomSheet: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 25, elevation: 10, shadowColor: '#000', shadowOffset: {width: 0, height: -3}, shadowOpacity: 0.1, shadowRadius: 5 },
  title: { fontSize: 18, fontWeight: 'bold', color: '#000000', marginBottom: 5 },
  eta: { fontSize: 14, color: '#00C853', fontWeight: '600', marginBottom: 20 },
  partnerCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8F9F8', padding: 15, borderRadius: 16 },
  avatarPlaceholder: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#E0F2F1', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  avatarTxt: { fontSize: 24 },
  partnerInfo: { flex: 1 },
  partnerName: { fontSize: 16, fontWeight: 'bold', color: '#000' },
  partnerRating: { fontSize: 13, color: '#666', marginTop: 2 },
  callBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#E8F5E9', justifyContent: 'center', alignItems: 'center' },
  callIcon: { fontSize: 18 }
});