import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Image, StatusBar } from 'react-native';

export default function RequestStatusScreen({ navigation }) {
  const [accepted, setAccepted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setAccepted(true), 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <View style={styles.content}>
        <Image source={{ uri: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=200&q=80' }} style={styles.avatar} />
        <Text style={styles.title}>{accepted ? 'Chef Rohit Sharma accepted!' : 'Chef request sent!'}</Text>
        <Text style={styles.subtitle}>{accepted ? 'Preparing to head to your location' : 'Waiting for chef to confirm'}</Text>
        
        <View style={styles.tracker}>
          <View style={styles.step}>
            <View style={[styles.circle, styles.circleActive]}><Text style={styles.check}>✓</Text></View>
            <Text style={styles.stepTxtActive}>Request Sent</Text>
          </View>
          <View style={[styles.line, accepted && styles.lineActive]} />
          <View style={styles.step}>
            <View style={[styles.circle, accepted && styles.circleActive]}>{accepted && <Text style={styles.check}>✓</Text>}</View>
            <Text style={accepted ? styles.stepTxtActive : styles.stepTxt}>Chef Accepts</Text>
          </View>
          <View style={styles.line} />
          <View style={styles.step}>
            <View style={styles.circle} />
            <Text style={styles.stepTxt}>On the Way</Text>
          </View>
        </View>
      </View>
      <View style={styles.footer}>
        <TouchableOpacity style={styles.btn} onPress={() => navigation.navigate('IngredientList')}>
          <Text style={styles.btnTxt}>{accepted ? 'View Live Tracking' : 'View Details'}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  content: { flex: 1, alignItems: 'center', paddingTop: 60, paddingHorizontal: 20 },
  avatar: { width: 100, height: 100, borderRadius: 50, marginBottom: 20 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#000000', textAlign: 'center', marginBottom: 8 },
  subtitle: { fontSize: 15, color: '#666666', marginBottom: 40 },
  tracker: { width: '100%', paddingLeft: 40 },
  step: { flexDirection: 'row', alignItems: 'center' },
  circle: { width: 30, height: 30, borderRadius: 15, backgroundColor: '#F0F0F0', justifyContent: 'center', alignItems: 'center' },
  circleActive: { backgroundColor: '#00C853' },
  check: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
  stepTxt: { fontSize: 16, color: '#999999', marginLeft: 15, fontWeight: '500' },
  stepTxtActive: { fontSize: 16, color: '#000000', marginLeft: 15, fontWeight: 'bold' },
  line: { width: 3, height: 40, backgroundColor: '#F0F0F0', marginLeft: 13, marginVertical: 4 },
  lineActive: { backgroundColor: '#00C853' },
  footer: { padding: 20, borderTopWidth: 1, borderTopColor: '#EEEEEE' },
  btn: { backgroundColor: '#00C853', height: 54, borderRadius: 25, justifyContent: 'center', alignItems: 'center' },
  btnTxt: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' }
});