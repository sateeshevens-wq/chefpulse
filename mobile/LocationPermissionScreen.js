import React, { useState } from 'react';
import { Alert, Pressable, SafeAreaView, StatusBar, StyleSheet, Text, View } from 'react-native';
import * as Location from 'expo-location';
import { LinearGradient } from 'expo-linear-gradient';

const COLORS = { charcoal: '#0B0F0A', primary: '#39FF14', lime: '#A8FF3F', white: '#FFFFFF', muted: '#9BA39A' };

export default function LocationPermissionScreen({ navigation }) {
  const [loading, setLoading] = useState(false);
  const allow = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') Alert.alert('Location not enabled', 'You can continue without location for now.');
    } catch (_) {
      Alert.alert('Location unavailable', 'You can continue without location for now.');
    } finally {
      setLoading(false);
      navigation.navigate('LoginScreen');
    }
  };
  return (
    <SafeAreaView style={styles.screen}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.charcoal} />
      <View style={styles.content}><View style={styles.radar}><View style={styles.r1} /><View style={styles.r2} /><View style={styles.r3} /><View style={styles.pin}><Text style={styles.pinDot}>•</Text></View></View><Text style={styles.title}>Enable Location</Text><Text style={styles.subtitle}>Help us find the best chefs near you.</Text></View>
      <View style={styles.bottom}><Pressable onPress={allow} style={styles.button}><LinearGradient colors={[COLORS.primary, COLORS.lime]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.gradient}><Text style={styles.buttonText}>{loading ? 'Requesting…' : 'Allow Location'}</Text></LinearGradient></Pressable><Pressable onPress={() => navigation.navigate('LoginScreen')} style={styles.notNow}><Text style={styles.notNowText}>Not Now</Text></Pressable></View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({ screen: { flex: 1, backgroundColor: COLORS.charcoal }, content: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 28 }, radar: { width: 220, height: 220, alignItems: 'center', justifyContent: 'center' }, r1: { position: 'absolute', width: 210, height: 210, borderRadius: 105, borderWidth: 1, borderColor: '#2C492A' }, r2: { position: 'absolute', width: 150, height: 150, borderRadius: 75, borderWidth: 1, borderColor: '#386536' }, r3: { position: 'absolute', width: 90, height: 90, borderRadius: 45, borderWidth: 1, borderColor: COLORS.primary }, pin: { width: 54, height: 54, borderRadius: 27, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center' }, pinDot: { color: '#000', fontSize: 32, lineHeight: 34 }, title: { color: COLORS.white, fontSize: 30, fontWeight: '800', marginTop: 24 }, subtitle: { color: COLORS.muted, fontSize: 16, marginTop: 10, textAlign: 'center' }, bottom: { padding: 20 }, button: { borderRadius: 14, overflow: 'hidden' }, gradient: { minHeight: 54, alignItems: 'center', justifyContent: 'center' }, buttonText: { color: '#000', fontSize: 16, fontWeight: '800' }, notNow: { alignItems: 'center', paddingVertical: 16 }, notNowText: { color: COLORS.white, fontSize: 15, fontWeight: '600' }
});
