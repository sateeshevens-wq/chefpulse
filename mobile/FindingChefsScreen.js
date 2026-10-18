import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, Animated, StatusBar } from 'react-native';

export default function FindingChefsScreen({ navigation }) {
  const [step, setStep] = useState(0);
  const pulseAnim = new Animated.Value(1);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.5, duration: 1000, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1000, useNativeDriver: true })
      ])
    ).start();

    const timer1 = setTimeout(() => setStep(1), 1500);
    const timer2 = setTimeout(() => setStep(2), 3000);
    const timer3 = setTimeout(() => setStep(3), 4500);
    const timer4 = setTimeout(() => navigation.navigate('AvailableChefs'), 5500);

    return () => {
      clearTimeout(timer1); clearTimeout(timer2);
      clearTimeout(timer3); clearTimeout(timer4);
    };
  }, []);

  const CheckItem = ({ label, active }) => (
    <View style={styles.checkRow}>
      <Text style={[styles.checkIcon, active && styles.checkActive]}>{active ? '✓' : '○'}</Text>
      <Text style={[styles.checkText, active && styles.textActive]}>{label}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <View style={styles.header}>
        <Text style={styles.title}>Finding the best chef near you...</Text>
        <Text style={styles.subtitle}>We're checking availability in your area</Text>
      </View>

      <View style={styles.radarContainer}>
        <Animated.View style={[styles.radarCircle, { transform: [{ scale: pulseAnim }] }]} />
        <View style={styles.centerPin}>
          <Text style={styles.chefIcon}>👨‍🍳</Text>
        </View>
      </View>

      <View style={styles.checklistContainer}>
        <Text style={styles.listTitle}>Looking for available chefs...</Text>
        <CheckItem label="Checking nearby chefs" active={step >= 1} />
        <CheckItem label="Verifying ratings & reviews" active={step >= 2} />
        <CheckItem label="Matching your preferences" active={step >= 3} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF', justifyContent: 'space-between', paddingVertical: 40 },
  header: { paddingHorizontal: 20, alignItems: 'center' },
  title: { fontSize: 20, fontWeight: 'bold', color: '#000000', textAlign: 'center', marginBottom: 8 },
  subtitle: { fontSize: 14, color: '#666666', textAlign: 'center' },
  radarContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  radarCircle: { width: 150, height: 150, borderRadius: 75, backgroundColor: 'rgba(57, 255, 20, 0.2)', position: 'absolute' },
  centerPin: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#00C853', justifyContent: 'center', alignItems: 'center', elevation: 5, shadowColor: '#000', shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.2, shadowRadius: 4 },
  chefIcon: { fontSize: 28 },
  checklistContainer: { paddingHorizontal: 30, paddingBottom: 20 },
  listTitle: { fontSize: 16, fontWeight: 'bold', color: '#000000', marginBottom: 15 },
  checkRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  checkIcon: { fontSize: 18, color: '#CCCCCC', marginRight: 10, width: 20 },
  checkActive: { color: '#00C853' },
  checkText: { fontSize: 15, color: '#666666' },
  textActive: { color: '#000000', fontWeight: '500' }
});