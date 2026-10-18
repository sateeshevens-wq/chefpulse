import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, StatusBar } from 'react-native';

export default function JobCompletedScreen({ navigation }) {
  const [rating, setRating] = useState(0);
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <View style={styles.center}>
        <Text style={styles.icon}>✨</Text>
        <Text style={styles.title}>Meal is Ready!</Text>
        <Text style={styles.subtitle}>We hope you enjoy your food.</Text>
        <View style={styles.card}>
          <Text style={styles.rateTitle}>Rate Chef Rohit</Text>
          <View style={styles.stars}>
            {[1, 2, 3, 4, 5].map(i => (
              <TouchableOpacity key={i} onPress={() => setRating(i)}>
                <Text style={[styles.star, rating >= i && styles.starActive]}>★</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
      <View style={styles.footer}>
        <TouchableOpacity style={styles.btn} onPress={() => navigation.popToTop()}>
          <Text style={styles.btnTxt}>Submit & Go Home</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF', justifyContent: 'space-between' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  icon: { fontSize: 60, marginBottom: 20 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#000000', marginBottom: 10 },
  subtitle: { fontSize: 16, color: '#666666', marginBottom: 40 },
  card: { backgroundColor: '#F8F9F8', padding: 25, borderRadius: 16, width: '100%', alignItems: 'center', borderWidth: 1, borderColor: '#EEEEEE' },
  rateTitle: { fontSize: 18, fontWeight: 'bold', color: '#000000', marginBottom: 15 },
  stars: { flexDirection: 'row', gap: 10 },
  star: { fontSize: 40, color: '#E0E0E0' },
  starActive: { color: '#FFC107' },
  footer: { padding: 20, borderTopWidth: 1, borderTopColor: '#EEEEEE' },
  btn: { backgroundColor: '#00C853', height: 54, borderRadius: 25, justifyContent: 'center', alignItems: 'center' },
  btnTxt: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' }
});