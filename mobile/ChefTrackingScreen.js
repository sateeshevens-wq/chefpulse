import React from 'react';
import { Image, SafeAreaView, StatusBar, StyleSheet, Text, View } from 'react-native';
import { useBooking } from './BookingContext';

const COLORS = { charcoal: '#0B0F0A', primary: '#39FF14', white: '#FFFFFF', muted: '#9BA39A', road: '#3B463B' };

export default function ChefTrackingScreen({ navigation }) {
  const { selectedChef, setBookingStatus } = useBooking();

  React.useEffect(() => {
    setBookingStatus('chef_on_way');
    const timer = setTimeout(() => navigation.replace('ChefArrived'), 12000);
    return () => clearTimeout(timer);
  }, [navigation, setBookingStatus]);

  const chefName = selectedChef?.name || 'Your chef';
  const chefImage = selectedChef?.image || 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=320&q=80';
  const rating = selectedChef?.rating || '—';

  return (
    <SafeAreaView style={styles.screen}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.charcoal} />
      <View style={styles.map}>
        <View style={styles.gridOne} /><View style={styles.gridTwo} /><View style={styles.route} />
        <Image source={{ uri: chefImage }} style={[styles.marker, styles.chefMarker]} />
        <View style={[styles.marker, styles.homeMarker]}><Text>⌂</Text></View>
      </View>
      <View style={styles.sheet}>
        <Text style={styles.title}>Chef is on the way (Arriving in 12 min)</Text>
        <View style={styles.profile}>
          <Image source={{ uri: chefImage }} style={styles.avatar} />
          <View><Text style={styles.name}>{chefName}</Text><Text style={styles.detail}>Verified Home Chef • ★ {rating}</Text></View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.charcoal },
  map: { flex: 1, backgroundColor: '#182019', overflow: 'hidden' },
  gridOne: { position: 'absolute', width: 500, height: 70, backgroundColor: COLORS.road, top: '35%', left: -80, transform: [{ rotate: '22deg' }] },
  gridTwo: { position: 'absolute', width: 500, height: 60, backgroundColor: COLORS.road, top: '62%', left: -80, transform: [{ rotate: '-20deg' }] },
  route: { position: 'absolute', width: '82%', height: 8, borderRadius: 8, backgroundColor: COLORS.primary, top: '50%', left: '9%', transform: [{ rotate: '-24deg' }] },
  marker: { position: 'absolute', width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.white },
  chefMarker: { top: '31%', left: '17%' },
  homeMarker: { bottom: '31%', right: '17%', backgroundColor: COLORS.primary },
  sheet: { backgroundColor: COLORS.charcoal, borderTopLeftRadius: 26, borderTopRightRadius: 26, padding: 22, paddingBottom: 28 },
  title: { color: COLORS.white, fontSize: 20, fontWeight: '800', marginBottom: 18 },
  profile: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 54, height: 54, borderRadius: 27, backgroundColor: COLORS.primary, marginRight: 14 },
  name: { color: COLORS.white, fontSize: 16, fontWeight: '800' },
  detail: { color: COLORS.muted, marginTop: 5 },
});
