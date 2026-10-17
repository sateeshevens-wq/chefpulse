import React, { useEffect, useState } from 'react';
import { Image, SafeAreaView, StatusBar, StyleSheet, Text, View, Pressable } from 'react-native';
import { useBooking } from './BookingContext';

const COLORS = { charcoal: '#0B0F0A', primary: '#39FF14', lime: '#A8FF3F', white: '#FFFFFF', muted: '#9BA39A' };

export default function CookingInProgressScreen({ navigation }) {
  const { selectedChef, setBookingStatus } = useBooking();
  const [seconds, setSeconds] = useState(4200);

  useEffect(() => {
    setBookingStatus('cooking');
    const id = setInterval(() => setSeconds((value) => Math.max(0, value - 1)), 1000);
    return () => clearInterval(id);
  }, [setBookingStatus]);

  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);

  return (
    <SafeAreaView style={styles.screen}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.charcoal} />
      <Image
        source={{ uri: selectedChef?.image || 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=900&q=80' }}
        style={styles.image}
      />
      <Text style={styles.title}>Enjoy your fresh, home-cooked meal!</Text>
      <Text style={styles.timer}>{h} hr {String(m).padStart(2, '0')} min</Text>
      <View style={styles.progress}><View style={styles.fill} /></View>
      <View style={styles.labels}><Text style={styles.label}>Arrived</Text><Text style={styles.label}>Cooking</Text><Text style={styles.label}>Complete</Text></View>
      <Pressable
        style={styles.button}
        onPress={() => {
          setBookingStatus('completed');
          navigation.navigate('ServiceCompleted');
        }}
      >
        <Text style={styles.buttonText}>Complete Service</Text>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.charcoal, padding: 22 },
  image: { width: '100%', height: 300, borderRadius: 24, backgroundColor: '#172018' },
  title: { color: COLORS.white, fontSize: 24, fontWeight: '800', marginTop: 24 },
  timer: { color: COLORS.primary, fontSize: 30, fontWeight: '900', marginTop: 18 },
  progress: { height: 10, borderRadius: 10, backgroundColor: '#293129', marginTop: 24, overflow: 'hidden' },
  fill: { width: '62%', height: '100%', backgroundColor: COLORS.primary },
  labels: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  label: { color: COLORS.muted },
  button: { marginTop: 'auto', backgroundColor: COLORS.primary, borderRadius: 14, padding: 17, alignItems: 'center' },
  buttonText: { color: '#000', fontWeight: '900', fontSize: 16 },
});
