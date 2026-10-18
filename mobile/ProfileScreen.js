import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, StatusBar } from 'react-native';

export default function ProfileScreen() {
  const options = ['Edit Profile', 'Payment Methods', 'Saved Addresses', 'Help & Support', 'Terms of Service'];
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <View style={styles.header}><Text style={styles.title}>Profile</Text></View>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.userCard}>
          <View style={styles.avatar}><Text style={styles.avatarTxt}>JD</Text></View>
          <View><Text style={styles.name}>John Doe</Text><Text style={styles.phone}>+91 98765 43210</Text></View>
        </View>
        <Text style={styles.sectionTitle}>Settings</Text>
        {options.map((opt, i) => (
          <TouchableOpacity key={i} style={styles.optionRow}>
            <Text style={styles.optionTxt}>{opt}</Text>
            <Text style={styles.arrow}>›</Text>
          </TouchableOpacity>
        ))}
        <TouchableOpacity style={styles.logoutBtn}><Text style={styles.logoutTxt}>Log Out</Text></TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: { padding: 20, borderBottomWidth: 1, borderBottomColor: '#EEEEEE' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#000000' },
  content: { padding: 20 },
  userCard: { flexDirection: 'row', alignItems: 'center', marginBottom: 30, padding: 15, backgroundColor: '#F8F9F8', borderRadius: 16, borderWidth: 1, borderColor: '#EEEEEE' },
  avatar: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#E0F2F1', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  avatarTxt: { fontSize: 24, fontWeight: 'bold', color: '#00C853' },
  name: { fontSize: 18, fontWeight: 'bold', color: '#000000', marginBottom: 4 },
  phone: { fontSize: 14, color: '#666666' },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#000000', marginBottom: 15 },
  optionRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#EEEEEE' },
  optionTxt: { fontSize: 16, color: '#333333' },
  arrow: { fontSize: 20, color: '#999999' },
  logoutBtn: { marginTop: 30, paddingVertical: 15, alignItems: 'center' },
  logoutTxt: { color: '#FF3B30', fontSize: 16, fontWeight: 'bold' }
});