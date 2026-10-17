import React, { useState } from 'react';
import { FlatList, Pressable, SafeAreaView, StatusBar, StyleSheet, Text, View } from 'react-native';

const COLORS = { charcoal: '#0B0F0A', primary: '#39FF14', lime: '#A8FF3F', white: '#FFFFFF', muted: '#9BA39A' };
const slides = [
  { key: '1', title: 'Authentic Home-Cooked Food Just for You', kind: 'home' },
  { key: '2', title: 'Trusted & Vetted Chefs', kind: 'chef' },
  { key: '3', title: 'Fresh Ingredients & Custom Menus', kind: 'fresh' },
];

function Artwork({ kind }) {
  if (kind === 'chef') return <View style={styles.art}><View style={styles.chefHead} /><View style={styles.chefBody} /><View style={styles.chefHat} /><View style={styles.badge}><Text style={styles.badgeText}>✓ Verified</Text></View></View>;
  if (kind === 'fresh') return <View style={styles.art}><View style={styles.plate}><View style={styles.food} /><View style={[styles.leaf, styles.l1]} /><View style={[styles.leaf, styles.l2]} /><View style={[styles.leaf, styles.l3]} /></View></View>;
  return <View style={styles.art}><View style={styles.roof} /><View style={styles.house}><View style={styles.window} /><View style={styles.door} /></View><View style={styles.bowl}><View style={styles.steam} /></View></View>;
}

function Logo() { return <Text style={styles.logo}><Text style={{ color: COLORS.white }}>Chef</Text><Text style={{ color: COLORS.primary }}>Pulse</Text></Text>; }

export default function OnboardingScreen({ navigation }) {
  const [index, setIndex] = useState(0);
  const next = () => index === slides.length - 1 ? navigation.navigate('LocationPermissionScreen') : setIndex(index + 1);
  const back = () => index === 0 ? navigation.goBack() : setIndex(index - 1);
  return (
    <SafeAreaView style={styles.screen}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.charcoal} />
      <View style={styles.header}><Pressable onPress={back} hitSlop={12}><Text style={styles.back}>‹</Text></Pressable><Logo /><View style={{ width: 28 }} /></View>
      <FlatList data={slides} horizontal pagingEnabled showsHorizontalScrollIndicator={false} scrollEnabled={false} keyExtractor={(item) => item.key} renderItem={({ item }) => <View style={styles.slide}><Artwork kind={item.kind} /><Text style={styles.title}>{item.title}</Text></View>} />
      <View style={styles.bottom}><View style={styles.pagination}>{slides.map((item, i) => <View key={item.key} style={[styles.dot, i === index ? styles.active : styles.inactive]} />)}</View><Pressable onPress={next} style={styles.next}><Text style={styles.nextText}>›</Text></Pressable></View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.charcoal }, header: { height: 64, paddingHorizontal: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, back: { color: COLORS.white, fontSize: 38, lineHeight: 38, width: 28 }, logo: { fontSize: 22, fontWeight: '800' }, slide: { width: 360, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 }, title: { color: COLORS.white, fontSize: 28, fontWeight: '800', textAlign: 'center', lineHeight: 35, marginTop: 28 }, art: { width: 300, height: 300, borderRadius: 32, backgroundColor: '#121812', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }, bottom: { paddingHorizontal: 24, paddingBottom: 22, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, pagination: { flexDirection: 'row', gap: 8 }, dot: { height: 8, borderRadius: 8 }, active: { width: 28, backgroundColor: COLORS.primary }, inactive: { width: 8, backgroundColor: '#384038' }, next: { width: 56, height: 56, borderRadius: 28, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center' }, nextText: { color: '#000', fontSize: 36, lineHeight: 38 }, chefHead: { width: 72, height: 72, borderRadius: 36, backgroundColor: '#B98A68' }, chefBody: { width: 140, height: 100, borderRadius: 30, backgroundColor: '#F2F2F2', marginTop: 8 }, chefHat: { position: 'absolute', top: 72, width: 110, height: 34, borderRadius: 30, backgroundColor: COLORS.white }, badge: { position: 'absolute', top: 22, right: 18, backgroundColor: COLORS.primary, borderRadius: 18, paddingHorizontal: 12, paddingVertical: 8 }, badgeText: { color: '#000', fontWeight: '800' }, plate: { width: 190, height: 190, borderRadius: 95, borderWidth: 12, borderColor: '#303830', alignItems: 'center', justifyContent: 'center' }, food: { width: 125, height: 80, borderRadius: 60, backgroundColor: '#6C8B35' }, leaf: { position: 'absolute', width: 32, height: 12, borderRadius: 12, backgroundColor: COLORS.primary }, l1: { top: 38, left: 38, transform: [{ rotate: '-25deg' }] }, l2: { top: 74, right: 34, transform: [{ rotate: '35deg' }] }, l3: { bottom: 38, left: 72, transform: [{ rotate: '-10deg' }] }, roof: { width: 0, height: 0, borderLeftWidth: 100, borderRightWidth: 100, borderBottomWidth: 80, borderLeftColor: 'transparent', borderRightColor: 'transparent', borderBottomColor: COLORS.darkGreen }, house: { width: 150, height: 100, backgroundColor: '#D5D9D2', alignItems: 'center', justifyContent: 'center' }, window: { width: 34, height: 30, backgroundColor: COLORS.charcoal }, door: { position: 'absolute', bottom: 0, right: 16, width: 34, height: 56, backgroundColor: '#5A6658' }, bowl: { position: 'absolute', bottom: 38, width: 100, height: 45, borderRadius: 50, backgroundColor: '#C5A65B' }, steam: { width: 3, height: 34, backgroundColor: COLORS.white, opacity: 0.7, marginTop: -28 }, muted: { color: COLORS.muted }
});
