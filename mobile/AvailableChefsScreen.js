import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, SafeAreaView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import * as Location from 'expo-location';
import { supabase } from './supabaseClient';

const DISCOVERY_RADIUS_KM = 50;

function distanceKm(lat1, lon1, lat2, lon2) {
  const toRad = value => (value * Math.PI) / 180;
  const earthRadius = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return earthRadius * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export default function AvailableChefsScreen({ navigation, route }) {
  const serviceType = route?.params?.serviceType || 'home_chef';
  const [chefs, setChefs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [locationText, setLocationText] = useState('Finding your area...');

  const loadChefs = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') throw new Error('Location permission is required to find chefs in your area.');

      const position = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const { latitude, longitude } = position.coords;
      const places = await Location.reverseGeocodeAsync({ latitude, longitude });
      const place = places?.[0];
      setLocationText(place?.city || place?.district || place?.region || 'Your area');

      const { data, error: fetchError } = await supabase
        .from('chefs')
        .select('id, name, specialty, hourly_rate, rating, latitude, longitude, is_online, background_verified')
        .eq('is_online', true)
        .not('latitude', 'is', null)
        .not('longitude', 'is', null);

      if (fetchError) throw fetchError;

      const nearby = (data || [])
        .map(chef => ({ ...chef, distanceKm: distanceKm(latitude, longitude, Number(chef.latitude), Number(chef.longitude)) }))
        .filter(chef => chef.distanceKm <= DISCOVERY_RADIUS_KM)
        .sort((a, b) => a.distanceKm - b.distanceKm);

      setChefs(nearby);
    } catch (e) {
      setChefs([]);
      setError(e?.message || 'Unable to load chefs right now. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadChefs(); }, [loadChefs]);

  const renderChef = ({ item }) => {
    const initials = (item.name || 'Chef').split(' ').filter(Boolean).slice(0, 2).map(part => part[0].toUpperCase()).join('');
    return (
      <View style={styles.card}>
        <View style={styles.avatar}><Text style={styles.avatarText}>{initials || 'C'}</Text></View>
        <View style={styles.info}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.rating}>⭐ {Number(item.rating || 0).toFixed(1)} • {item.distanceKm.toFixed(1)} km away</Text>
          <Text style={styles.tags}>{item.specialty || 'Chef'}</Text>
          <Text style={styles.price}>₹{Number(item.hourly_rate || 0).toLocaleString('en-IN')} / hr</Text>
        </View>
        <TouchableOpacity style={styles.bookBtn} onPress={() => navigation.navigate('ChefDetails', { chefId: item.id, serviceType })}>
          <Text style={styles.bookText}>Book</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}><Text style={styles.back}>‹</Text></TouchableOpacity>
        <View style={styles.headerText}>
          <Text style={styles.title}>{serviceType === 'catering' ? 'Catering chefs' : 'Home chefs'}</Text>
          <Text style={styles.sub}>📍 {locationText} • within {DISCOVERY_RADIUS_KM} km</Text>
        </View>
        <View style={{ width: 30 }} />
      </View>

      {loading ? (
        <View style={styles.stateContainer}><ActivityIndicator size="large" color="#00C853" /><Text style={styles.stateText}>Finding chefs near you...</Text></View>
      ) : error ? (
        <View style={styles.stateContainer}><Text style={styles.stateText}>{error}</Text><TouchableOpacity style={styles.retryBtn} onPress={loadChefs}><Text style={styles.retryText}>Try Again</Text></TouchableOpacity></View>
      ) : chefs.length === 0 ? (
        <View style={styles.stateContainer}><Text style={styles.emptyTitle}>No active chefs found nearby</Text><Text style={styles.stateText}>Try again later or expand your search area.</Text></View>
      ) : (
        <FlatList data={chefs} renderItem={renderChef} keyExtractor={item => item.id} contentContainerStyle={styles.list} showsVerticalScrollIndicator={false} refreshing={loading} onRefresh={loadChefs} />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 10, paddingBottom: 15, borderBottomWidth: 1, borderBottomColor: '#EEEEEE' },
  backBtn: { padding: 5 },
  back: { fontSize: 32, color: '#000000', marginTop: -5 },
  headerText: { alignItems: 'center' },
  title: { fontSize: 16, fontWeight: 'bold', color: '#000000' },
  sub: { fontSize: 11, color: '#666666', marginTop: 2 },
  list: { padding: 20 },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 16, padding: 15, marginBottom: 15, borderWidth: 1, borderColor: '#EEEEEE', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3 },
  avatar: { width: 60, height: 60, borderRadius: 30, marginRight: 15, backgroundColor: '#E0F2F1', justifyContent: 'center', alignItems: 'center' },
  avatarText: { fontSize: 20, fontWeight: 'bold', color: '#00C853' },
  info: { flex: 1 },
  name: { fontSize: 16, fontWeight: 'bold', color: '#000000', marginBottom: 4 },
  rating: { fontSize: 12, color: '#666666', marginBottom: 2 },
  tags: { fontSize: 12, color: '#666666', marginBottom: 4 },
  price: { fontSize: 14, fontWeight: 'bold', color: '#00C853' },
  bookBtn: { backgroundColor: '#00C853', paddingVertical: 8, paddingHorizontal: 20, borderRadius: 25 },
  bookText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 14 },
  stateContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 30 },
  stateText: { marginTop: 12, fontSize: 14, color: '#666666', textAlign: 'center' },
  emptyTitle: { fontSize: 18, fontWeight: 'bold', color: '#000000', textAlign: 'center' },
  retryBtn: { marginTop: 18, backgroundColor: '#00C853', paddingVertical: 10, paddingHorizontal: 22, borderRadius: 25 },
  retryText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 14 },
});
