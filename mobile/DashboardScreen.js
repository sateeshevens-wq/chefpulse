import React, { useState } from 'react';
import {
  FlatList,
  Image,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

const COLORS = {
  charcoal: '#0B0F0A',
  primary: '#39FF14',
  white: '#FFFFFF',
  muted: '#9BA39A',
  card: '#111511',
  input: '#171B17',
  border: '#283028',
};

const categories = ['Italian', 'Healthy', 'Indian', 'Desserts'];

const chefs = [
  { id: '1', name: 'Chef Arjun', rating: '4.9', specialty: 'Indian & North Indian', image: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=320&q=80' },
  { id: '2', name: 'Chef Marco', rating: '4.8', specialty: 'Italian Cuisine', image: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=320&q=80' },
  { id: '3', name: 'Chef Priya', rating: '4.9', specialty: 'Healthy & Vegetarian', image: 'https://images.unsplash.com/photo-1600565193348-f74bd3c7ccdf?auto=format&fit=crop&w=320&q=80' },
];

function DashboardScreen() {
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('Home');

  const renderChef = ({ item }) => (
    <Pressable style={({ pressed }) => [styles.chefCard, pressed && styles.pressed]}>
      <Image source={{ uri: item.image }} style={styles.chefImage} />
      <View style={styles.chefInfo}>
        <Text style={styles.chefName}>{item.name}</Text>
        <View style={styles.ratingRow}>
          <Text style={styles.star}>★</Text>
          <Text style={styles.rating}>{item.rating}</Text>
          <Text style={styles.ratingScale}> / 5</Text>
        </View>
        <Text style={styles.specialty}>{item.specialty}</Text>
      </View>
    </Pressable>
  );

  const navItems = [
    { label: 'Home', icon: '⌂' },
    { label: 'Bookings', icon: '▣' },
    { label: 'Favorites', icon: '♡' },
    { label: 'Profile', icon: '○' },
  ];

  return (
    <SafeAreaView style={styles.screen}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.charcoal} />
      <View style={styles.content}>
        <View style={styles.headerRow}>
          <Text style={styles.greeting}>Hello, Guest</Text>
          <Image source={{ uri: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=160&q=80' }} style={styles.avatar} />
        </View>

        <View style={styles.searchBar}>
          <Text style={styles.searchIcon}>⌕</Text>
          <TextInput value={search} onChangeText={setSearch} placeholder="Search for chefs or cuisines" placeholderTextColor={COLORS.muted} style={styles.searchInput} returnKeyType="search" />
        </View>

        <View style={styles.sectionHeader}><Text style={styles.sectionTitle}>Top Categories</Text></View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoriesContent}>
          {categories.map((category) => (
            <Pressable key={category} style={({ pressed }) => [styles.categoryPill, pressed && styles.pressed]}>
              <Text style={styles.categoryText}>{category}</Text>
            </Pressable>
          ))}
        </ScrollView>

        <View style={styles.sectionHeader}><Text style={styles.sectionTitle}>Nearby Top Chefs</Text></View>
        <FlatList data={chefs} keyExtractor={(item) => item.id} renderItem={renderChef} showsVerticalScrollIndicator={false} contentContainerStyle={styles.chefList} />
      </View>

      <View style={styles.bottomNav}>
        {navItems.map((item) => {
          const active = activeTab === item.label;
          return (
            <Pressable key={item.label} onPress={() => setActiveTab(item.label)} style={({ pressed }) => [styles.navItem, pressed && styles.pressed]}>
              <Text style={[styles.navIcon, active && styles.navIconActive]}>{item.icon}</Text>
              <Text style={[styles.navLabel, active && styles.navLabelActive]}>{item.label}</Text>
            </Pressable>
          );
        })}
      </View>
    </SafeAreaView>
  );
}

export default DashboardScreen;

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.charcoal },
  content: { flex: 1, paddingHorizontal: 18 },
  pressed: { opacity: 0.78 },
  headerRow: { minHeight: 68, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  greeting: { color: COLORS.white, fontSize: 22, fontWeight: '700' },
  avatar: { width: 42, height: 42, borderRadius: 21, borderWidth: 1, borderColor: COLORS.border },
  searchBar: { height: 52, borderRadius: 14, backgroundColor: COLORS.input, borderWidth: 1, borderColor: COLORS.border, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14 },
  searchIcon: { color: COLORS.white, fontSize: 26, marginRight: 9, lineHeight: 26 },
  searchInput: { flex: 1, color: COLORS.white, fontSize: 15 },
  sectionHeader: { marginTop: 24, marginBottom: 12 },
  sectionTitle: { color: COLORS.white, fontSize: 18, fontWeight: '700' },
  categoriesContent: { gap: 10, paddingBottom: 2 },
  categoryPill: { minHeight: 38, paddingHorizontal: 17, borderRadius: 20, borderWidth: 1, borderColor: COLORS.primary, alignItems: 'center', justifyContent: 'center' },
  categoryText: { color: COLORS.white, fontSize: 14, fontWeight: '600' },
  chefList: { paddingBottom: 16 },
  chefCard: { minHeight: 104, backgroundColor: COLORS.card, borderRadius: 16, marginBottom: 12, padding: 12, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#1D231D' },
  chefImage: { width: 80, height: 80, borderRadius: 13, backgroundColor: '#202620' },
  chefInfo: { flex: 1, marginLeft: 14 },
  chefName: { color: COLORS.white, fontSize: 16, fontWeight: '700', marginBottom: 7 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 5 },
  star: { color: COLORS.primary, fontSize: 15, marginRight: 5 },
  rating: { color: COLORS.white, fontSize: 14, fontWeight: '700' },
  ratingScale: { color: COLORS.muted, fontSize: 13 },
  specialty: { color: COLORS.muted, fontSize: 13 },
  bottomNav: { minHeight: 72, backgroundColor: '#0E120E', borderTopWidth: 1, borderTopColor: COLORS.border, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', paddingBottom: 5 },
  navItem: { minWidth: 72, alignItems: 'center', justifyContent: 'center', paddingVertical: 6 },
  navIcon: { color: COLORS.muted, fontSize: 22, lineHeight: 25 },
  navIconActive: { color: COLORS.primary },
  navLabel: { color: COLORS.muted, fontSize: 11, marginTop: 3 },
  navLabelActive: { color: COLORS.primary, fontWeight: '700' },
});
