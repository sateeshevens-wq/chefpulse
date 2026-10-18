import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, StatusBar } from 'react-native';

export default function CookingInProgressScreen({ navigation }) {
  const [time, setTime] = useState(0);
  
  useEffect(() => {
    const timer = setInterval(() => setTime(t => t + 1), 1000);
    return () => clearInterval(timer);
  }, []);
  
  const formatTime = (s) => `${Math.floor(s/60).toString().padStart(2,'0')}:${(s%60).toString().padStart(2,'0')}`;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <View style={styles.center}>
        <Text style={styles.icon}>🍳</Text>
        <Text style={styles.title}>Cooking in Progress</Text>
        <Text style={styles.subtitle}>Chef Rohit is preparing your meal</Text>
        <View style={styles.timerBox}>
          <Text style={styles.timer}>{formatTime(time)}</Text>
        </View>
      </View>
      <View style={styles.footer}>
        <TouchableOpacity style={styles.btn} onPress={() => navigation.replace('JobCompleted')}>
          <Text style={styles.btnTxt}>Finish Cooking (Test)</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF', justifyContent: 'space-between' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  icon: { fontSize: 60, marginBottom: 20 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#000000', marginBottom: 10 },
  subtitle: { fontSize: 16, color: '#666666', marginBottom: 40 },
  timerBox: { paddingHorizontal: 30, paddingVertical: 15, borderRadius: 20, backgroundColor: '#F2FFF6', borderWidth: 1, borderColor: '#00C853' },
  timer: { fontSize: 36, fontWeight: 'bold', color: '#00C853', fontVariant: ['tabular-nums'] },
  footer: { padding: 20 },
  btn: { backgroundColor: '#00C853', height: 54, borderRadius: 25, justifyContent: 'center', alignItems: 'center' },
  btnTxt: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' }
});