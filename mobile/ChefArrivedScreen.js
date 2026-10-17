import React from 'react';
import { Image, SafeAreaView, StatusBar, StyleSheet, Text, View, Pressable } from 'react-native';
import { useBooking } from './BookingContext';

const COLORS = { charcoal: '#0B0F0A', primary: '#39FF14', white: '#FFFFFF', muted: '#9BA39A' };

export default function ChefArrivedScreen({ navigation }) {
  const { selectedChef } = useBooking();
  const chefName = selectedChef?.name || 'Your chef';

  return (
    <SafeAreaView style={styles.screen}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.charcoal} />
      <Image
        source={{ uri: selectedChef?.image || 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=900&q=80' }}
        style={styles.image}
      />
      <Text style={styles.title}>{chefName} arrived at your location!</Text>
      <Text style={styles.sub}>Your chef is ready to prepare your meal.</Text>
      <View style={styles.row}>
        <Pressable style={styles.outline}><Text style={styles.green}>Chat</Text></Pressable>
        <Pressable style={styles.outline}><Text style={styles.green}>Call</Text></Pressable>
      </View>
      <Pressable style={styles.button} onPress={() => navigation.navigate('CookingInProgress')}>
        <Text style={styles.buttonText}>Start Cooking</Text>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.charcoal, padding: 22 },
  image: { width: '100%', height: 320, borderRadius: 24, backgroundColor: '#172018' },
  title: { color: COLORS.white, fontSize: 25, fontWeight: '800', marginTop: 24 },
  sub: { color: COLORS.muted, marginTop: 8 },
  row: { flexDirection: 'row', gap: 12, marginTop: 22 },
  outline: { flex: 1, borderWidth: 1, borderColor: COLORS.primary, borderRadius: 14, padding: 15, alignItems: 'center' },
  green: { color: COLORS.primary, fontWeight: '800' },
  button: { marginTop: 18, backgroundColor: COLORS.primary, borderRadius: 14, padding: 17, alignItems: 'center' },
  buttonText: { color: '#000', fontWeight: '900', fontSize: 16 },
});
