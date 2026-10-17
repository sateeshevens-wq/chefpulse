import React from 'react';
import { SafeAreaView, StatusBar, StyleSheet, Text, View } from 'react-native';

const COLORS = {
  charcoal: '#0B0F0A',
  primary: '#39FF14',
  white: '#FFFFFF',
  muted: '#9BA39A',
};

export default function DeliveryTrackingScreen() {
  return (
    <SafeAreaView style={styles.screen}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.charcoal} />
      <View style={styles.content}>
        <View style={styles.iconCircle}>
          <Text style={styles.check}>✓</Text>
        </View>
        <Text style={styles.title}>Delivery Tracking</Text>
        <Text style={styles.subtitle}>Your grocery order is being prepared for delivery.</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.charcoal },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 28 },
  iconCircle: {
    width: 82,
    height: 82,
    borderRadius: 41,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 22,
  },
  check: { color: '#000000', fontSize: 42, fontWeight: '900' },
  title: { color: COLORS.white, fontSize: 26, fontWeight: '800' },
  subtitle: { color: COLORS.muted, fontSize: 15, lineHeight: 22, textAlign: 'center', marginTop: 10 },
});
