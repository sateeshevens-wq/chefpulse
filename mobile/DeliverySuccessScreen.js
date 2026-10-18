import React, { useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, StatusBar } from 'react-native';

export default function DeliverySuccessScreen({ navigation }) {
  useEffect(() => {
    const timer = setTimeout(() => navigation.replace('ChefTracking'), 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#00C853" />
      <View style={styles.content}>
        <View style={styles.circle}>
          <Text style={styles.boxIcon}>📦</Text>
        </View>
        <Text style={styles.title}>Groceries Delivered!</Text>
        <Text style={styles.subtitle}>All ingredients have arrived safely.</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#00C853' },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  circle: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center', marginBottom: 30, elevation: 5 },
  boxIcon: { fontSize: 50 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 10 },
  subtitle: { fontSize: 16, color: '#FFFFFF', opacity: 0.9 }
});