import React, { useEffect, useState } from 'react';
import { ActivityIndicator, SafeAreaView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import * as Location from 'expo-location';

export default function HomeScreen({ navigation }) {
  const [locationName, setLocationName] = useState('Location unavailable');
  const [locationLoading, setLocationLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    let watcher;

    const updateLocation = async ({ coords }) => {
      try {
        const places = await Location.reverseGeocodeAsync({ latitude: coords.latitude, longitude: coords.longitude });
        if (!mounted) return;
        const place = places?.[0];
        setLocationName(place?.city || place?.district || place?.region || `${coords.latitude.toFixed(4)}, ${coords.longitude.toFixed(4)}`);
      } catch {
        if (mounted) setLocationName(`${coords.latitude.toFixed(4)}, ${coords.longitude.toFixed(4)}`);
      } finally {
        if (mounted) setLocationLoading(false);
      }
    };

    const startLocation = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          if (mounted) { setLocationName('Location permission denied'); setLocationLoading(false); }
          return;
        }
        const current = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        await updateLocation(current);
        watcher = await Location.watchPositionAsync(
          { accuracy: Location.Accuracy.Balanced, distanceInterval: 100, timeInterval: 10000 },
          updateLocation,
        );
      } catch {
        if (mounted) { setLocationName('Location unavailable'); setLocationLoading(false); }
      }
    };

    startLocation();
    return () => { mounted = false; watcher?.remove?.(); };
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <View style={styles.header}>
        <View style={styles.locationRow}>
          <Text style={styles.pin}>📍</Text>
          {locationLoading ? <ActivityIndicator size="small" color="#00C853" /> : <Text style={styles.locationText}>{locationName}</Text>}
        </View>
      </View>

      <View style={styles.content}>
        <Text style={styles.heading}>What do you need today?</Text>
        <TouchableOpacity style={styles.primaryCard} onPress={() => navigation.navigate('SelectService')}>
          <Text style={styles.primaryText}>Home Chef</Text><Text style={styles.arrow}>›</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.secondaryCard} onPress={() => navigation.navigate('Catering')}>
          <Text style={styles.secondaryText}>CATERING</Text><Text style={styles.greenArrow}>›</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.secondaryCard} onPress={() => navigation.navigate('B2BJobBoard')}>
          <Text style={styles.secondaryText}>Hire a Chef</Text><Text style={styles.greenArrow}>›</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' }, header: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 18, borderBottomWidth: 1, borderBottomColor: '#EEEEEE' },
  locationRow: { flexDirection: 'row', alignItems: 'center', minHeight: 24 }, pin: { fontSize: 18, marginRight: 8 }, locationText: { fontSize: 16, fontWeight: '700', color: '#000000' },
  content: { flex: 1, padding: 20, paddingTop: 28 }, heading: { color: '#000000', fontSize: 24, fontWeight: '800', marginBottom: 24 },
  primaryCard: { backgroundColor: '#00C853', borderRadius: 16, minHeight: 72, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }, primaryText: { color: '#FFFFFF', fontSize: 19, fontWeight: '800' }, arrow: { color: '#FFFFFF', fontSize: 32 },
  secondaryCard: { backgroundColor: '#FFFFFF', borderRadius: 16, minHeight: 72, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, borderWidth: 1, borderColor: '#E0E0E0' }, secondaryText: { color: '#000000', fontSize: 18, fontWeight: '800' }, greenArrow: { color: '#00C853', fontSize: 32 },
});
