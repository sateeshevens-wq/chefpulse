import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TextInput, ScrollView, TouchableOpacity, Image, StatusBar } from 'react-native';

export default function HomeScreen({ navigation }) {
  const [search, setSearch] = useState('');

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      <View style={styles.header}>
        <View style={styles.locationRow}>
          <Text style={styles.pinIcon}>📍</Text>
          <Text style={styles.locationText}>Bengaluru</Text>
          <Text style={styles.chevronIcon}>⌄</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.searchContainer}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="What would you like to cook today?"
            placeholderTextColor="#9BA39A"
            value={search}
            onChangeText={setSearch}
          />
        </View>

        <TouchableOpacity style={styles.primaryCard} onPress={() => navigation.navigate('SelectService')}>
          <View style={styles.cardTextContainer}>
            <Text style={styles.primaryCardTitle}>Chef Now</Text>
            <Text style={styles.primaryCardSub}>Get a chef at your home in minutes</Text>
          </View>
          <Text style={styles.cardArrow}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.secondaryCard}>
          <View style={styles.cardTextContainer}>
            <Text style={styles.secondaryCardTitle}>Book a Chef</Text>
            <Text style={styles.secondaryCardSub}>For events & occasions</Text>
          </View>
          <Text style={styles.secondaryCardArrow}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.secondaryCard}>
          <View style={styles.cardTextContainer}>
            <Text style={styles.secondaryCardTitle}>Catering</Text>
            <Text style={styles.secondaryCardSub}>For parties & events</Text>
          </View>
          <Text style={styles.secondaryCardArrow}>›</Text>
        </TouchableOpacity>

        <View style={styles.promoBanner}>
          <View style={styles.promoTextContainer}>
            <Text style={styles.promoTitle}>Fresh Ingredients</Text>
            <Text style={styles.promoTitle}>Better Meals</Text>
            <Text style={styles.promoSub}>Order groceries with your chef</Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem}>
          <Text style={[styles.navIcon, styles.activeNav]}>⌂</Text>
          <Text style={[styles.navText, styles.activeNav]}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Text style={styles.navIcon}>📋</Text>
          <Text style={styles.navText}>Orders</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Text style={styles.navIcon}>💬</Text>
          <Text style={styles.navText}>Chat</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Text style={styles.navIcon}>👤</Text>
          <Text style={styles.navText}>Profile</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 15 },
  locationRow: { flexDirection: 'row', alignItems: 'center' },
  pinIcon: { fontSize: 18, color: '#00C853', marginRight: 5 },
  locationText: { fontSize: 16, fontWeight: '600', color: '#000000' },
  chevronIcon: { fontSize: 18, color: '#000000', marginLeft: 5, paddingBottom: 5 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 20 },
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F5F5F5', borderRadius: 12, paddingHorizontal: 15, height: 50, marginBottom: 25 },
  searchIcon: { fontSize: 18, marginRight: 10, color: '#9BA39A' },
  searchInput: { flex: 1, fontSize: 15, color: '#000000' },
  primaryCard: { backgroundColor: '#00C853', borderRadius: 16, padding: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 15 },
  primaryCardTitle: { color: '#FFFFFF', fontSize: 18, fontWeight: 'bold', marginBottom: 4 },
  primaryCardSub: { color: '#FFFFFF', fontSize: 13, opacity: 0.9 },
  cardArrow: { color: '#FFFFFF', fontSize: 28 },
  secondaryCard: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 15, borderWidth: 1, borderColor: '#E0E0E0' },
  secondaryCardTitle: { color: '#000000', fontSize: 18, fontWeight: 'bold', marginBottom: 4 },
  secondaryCardSub: { color: '#666666', fontSize: 13 },
  secondaryCardArrow: { color: '#00C853', fontSize: 28 },
  promoBanner: { backgroundColor: '#1A4314', borderRadius: 16, padding: 20, marginTop: 10, minHeight: 120, justifyContent: 'center' },
  promoTitle: { color: '#FFFFFF', fontSize: 18, fontWeight: 'bold' },
  promoSub: { color: '#FFFFFF', fontSize: 12, opacity: 0.8, marginTop: 8 },
  bottomNav: { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 12, borderTopWidth: 1, borderTopColor: '#EEEEEE', backgroundColor: '#FFFFFF' },
  navItem: { alignItems: 'center' },
  navIcon: { fontSize: 20, color: '#9BA39A', marginBottom: 4 },
  navText: { fontSize: 12, color: '#9BA39A', fontWeight: '500' },
  activeNav: { color: '#00C853' }
});