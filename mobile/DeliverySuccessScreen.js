import React from 'react';
import { SafeAreaView, StatusBar, StyleSheet, Text, View } from 'react-native';

const COLORS = { charcoal: '#0B0F0A', primary: '#39FF14', lime: '#A8FF3F', white: '#FFFFFF', muted: '#9BA39A' };

export default function DeliverySuccessScreen({ navigation }) {
  React.useEffect(() => {
    const timer = setTimeout(() => navigation.replace('ChefTracking'), 3000);
    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <SafeAreaView style={styles.screen}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.charcoal} />
      <View style={styles.content}>
        <View style={styles.box}><View style={styles.boxTop} /><Text style={styles.boxLabel}>CP</Text></View>
        <Text style={styles.title}>Groceries delivered!</Text>
        <Text style={styles.subtitle}>Your ingredients have arrived safely.</Text>
        <View style={styles.button}><Text style={styles.buttonText}>View Order Details</Text></View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.charcoal }, content: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 28 },
  box: { width: 150, height: 120, backgroundColor: '#A56A36', borderRadius: 12, alignItems: 'center', justifyContent: 'center', transform: [{ rotate: '-2deg' }] },
  boxTop: { position: 'absolute', top: -12, width: 128, height: 26, backgroundColor: '#C28A52', borderRadius: 8 }, boxLabel: { color: COLORS.primary, fontSize: 28, fontWeight: '900' },
  title: { color: COLORS.white, fontSize: 28, fontWeight: '800', marginTop: 30 }, subtitle: { color: COLORS.muted, marginTop: 10, fontSize: 15 },
  button: { marginTop: 28, borderWidth: 1, borderColor: COLORS.primary, borderRadius: 14, paddingVertical: 15, paddingHorizontal: 28 }, buttonText: { color: COLORS.primary, fontWeight: '800' },
});
