import React from 'react';
import { Pressable, SafeAreaView, StatusBar, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const COLORS = { charcoal: '#0B0F0A', primary: '#39FF14', lime: '#A8FF3F', darkGreen: '#00C853', white: '#FFFFFF' };

function ChefPulseLogo() {
  return (
    <View style={styles.logoWrap}>
      <View style={styles.clocheArea}>
        <View style={styles.speedOne} />
        <View style={styles.speedTwo} />
        <View style={styles.cloche}><View style={styles.knob} /></View>
        <View style={styles.base} />
      </View>
      <Text style={styles.logoText}><Text style={styles.chef}>Chef</Text><Text style={styles.pulse}>Pulse</Text></Text>
      <Text style={styles.tagline}>Great Food. At Your Place.</Text>
    </View>
  );
}

function PrimaryButton({ title, onPress, outline = false }) {
  if (outline) {
    return <Pressable onPress={onPress} style={({ pressed }) => [styles.outline, pressed && styles.pressed]}><Text style={styles.outlineText}>{title}</Text></Pressable>;
  }
  return <Pressable onPress={onPress} style={({ pressed }) => [pressed && styles.pressed]}><LinearGradient colors={[COLORS.primary, COLORS.lime]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.primary}><Text style={styles.primaryText}>{title}</Text></LinearGradient></Pressable>;
}

export default function SplashScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.screen}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.charcoal} />
      <View style={styles.content}><ChefPulseLogo /><Text style={styles.subtitle}>Fresh Ingredients. Real Chefs. Home-Cooked Goodness.</Text></View>
      <View style={styles.bottom}>
        <View style={styles.waveOne} /><View style={styles.waveTwo} />
        <PrimaryButton title="Get Started" onPress={() => navigation.navigate('OnboardingScreen')} />
        <View style={styles.gap} />
        <PrimaryButton title="Login" outline onPress={() => navigation.navigate('LoginScreen')} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.charcoal },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 28 },
  subtitle: { color: COLORS.white, textAlign: 'center', fontSize: 15, lineHeight: 22, marginTop: 18, maxWidth: 310 },
  bottom: { paddingHorizontal: 20, paddingBottom: 18, position: 'relative' },
  gap: { height: 12 },
  primary: { minHeight: 54, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  primaryText: { color: '#000000', fontSize: 16, fontWeight: '800' },
  outline: { minHeight: 54, borderRadius: 14, borderWidth: 1, borderColor: COLORS.white, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.charcoal },
  outlineText: { color: COLORS.white, fontSize: 16, fontWeight: '700' },
  pressed: { opacity: 0.78 },
  waveOne: { position: 'absolute', left: -30, bottom: 116, width: 180, height: 70, borderTopWidth: 2, borderColor: COLORS.darkGreen, borderRadius: 100, transform: [{ rotate: '-10deg' }], opacity: 0.55 },
  waveTwo: { position: 'absolute', left: -50, bottom: 98, width: 220, height: 70, borderTopWidth: 2, borderColor: COLORS.primary, borderRadius: 100, transform: [{ rotate: '-10deg' }], opacity: 0.28 },
  logoWrap: { alignItems: 'center', justifyContent: 'center' },
  clocheArea: { width: 74, height: 58, alignItems: 'center', justifyContent: 'flex-end', marginBottom: 4 },
  speedOne: { position: 'absolute', left: 2, top: 18, width: 17, height: 3, borderRadius: 3, backgroundColor: COLORS.primary, transform: [{ rotate: '-12deg' }] },
  speedTwo: { position: 'absolute', left: 9, top: 30, width: 12, height: 3, borderRadius: 3, backgroundColor: COLORS.lime, transform: [{ rotate: '-12deg' }] },
  cloche: { width: 46, height: 32, borderTopLeftRadius: 46, borderTopRightRadius: 46, backgroundColor: COLORS.primary, alignItems: 'center' },
  knob: { width: 10, height: 6, borderRadius: 6, backgroundColor: COLORS.primary, marginTop: -3 },
  base: { width: 54, height: 6, borderRadius: 6, backgroundColor: COLORS.lime, marginTop: -2 },
  logoText: { fontSize: 38, fontWeight: '800', letterSpacing: -1.5 },
  chef: { color: COLORS.white }, pulse: { color: COLORS.primary },
  tagline: { color: COLORS.white, fontSize: 13, marginTop: 7, letterSpacing: 0.2 },
});
