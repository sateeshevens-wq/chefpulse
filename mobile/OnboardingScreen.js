import React, { useState } from 'react';
import { Pressable, SafeAreaView, StatusBar, StyleSheet, Text, View } from 'react-native';

const C = { bg: '#0B0F0A', g: '#39FF14', lime: '#A8FF3F', white: '#FFFFFF', muted: '#9BA39A' };
const slides = [
  { title: 'Authentic Home-Cooked Food Just for You', body: 'Book trusted chefs to prepare fresh meals in your own kitchen.', icon: '⌂' },
  { title: 'Trusted & Vetted Chefs', body: 'Discover chefs with clear profiles, ratings, specialties, and availability.', icon: '♨' },
  { title: 'Fresh Ingredients & Custom Menus', body: 'Choose your service and enjoy meals built around what you want to eat.', icon: '✦' },
];

export default function OnboardingScreen({ onFinish }) {
  const [index, setIndex] = useState(0);
  const next = () => index === slides.length - 1 ? onFinish?.() : setIndex(index + 1);
  const back = () => index > 0 && setIndex(index - 1);
  const slide = slides[index];

  return (
    <SafeAreaView style={s.screen}>
      <StatusBar barStyle="light-content" backgroundColor={C.bg} />
      <View style={s.header}>
        <Pressable onPress={back} disabled={index === 0}><Text style={[s.back, index === 0 && s.hidden]}>‹</Text></Pressable>
        <Text style={s.logo}><Text style={{ color: C.white }}>Chef</Text><Text style={{ color: C.g }}>Pulse</Text></Text>
        <View style={{ width: 28 }} />
      </View>
      <View style={s.main}>
        <View style={s.art}><Text style={s.artIcon}>{slide.icon}</Text></View>
        <Text style={s.title}>{slide.title}</Text>
        <Text style={s.body}>{slide.body}</Text>
      </View>
      <View style={s.bottom}>
        <View style={s.dots}>{slides.map((item, i) => <View key={item.title} style={[s.dot, i === index ? s.active : s.inactive]} />)}</View>
        <Pressable onPress={next} style={s.next}><Text style={s.nextText}>{index === slides.length - 1 ? '✓' : '›'}</Text></Pressable>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bg }, header: { height: 64, paddingHorizontal: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, back: { color: C.white, fontSize: 38, width: 28 }, hidden: { opacity: 0 }, logo: { fontSize: 22, fontWeight: '800' }, main: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 },
  art: { width: '100%', maxWidth: 340, height: 300, borderRadius: 32, backgroundColor: '#121812', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#243024' }, artIcon: { color: C.g, fontSize: 92 }, title: { color: C.white, fontSize: 28, fontWeight: '800', textAlign: 'center', lineHeight: 35, marginTop: 28 }, body: { color: C.muted, fontSize: 15, lineHeight: 22, textAlign: 'center', marginTop: 12, maxWidth: 320 },
  bottom: { padding: 24, paddingBottom: 22, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, dots: { flexDirection: 'row', gap: 8 }, dot: { height: 8, borderRadius: 8 }, active: { width: 28, backgroundColor: C.g }, inactive: { width: 8, backgroundColor: '#384038' }, next: { width: 56, height: 56, borderRadius: 28, backgroundColor: C.g, alignItems: 'center', justifyContent: 'center' }, nextText: { color: '#000', fontSize: 30, fontWeight: '800' },
});
