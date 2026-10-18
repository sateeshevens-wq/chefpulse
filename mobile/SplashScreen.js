import React, { useEffect } from 'react';
import { Image, SafeAreaView, StatusBar, StyleSheet, Text, View } from 'react-native';

const SPLASH_DURATION_MS = 2500;

export default function SplashScreen({ onFinish }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onFinish?.();
    }, SPLASH_DURATION_MS);

    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      <View style={styles.center}>
        <Image
          source={require('./assets/splash_logo.png')}
          style={styles.logo}
          resizeMode="contain"
          accessibilityLabel="ChefPulse logo"
        />
        <Text style={styles.subtitle}>Great Food. At Your Place.</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000000' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24 },
  logo: { width: '92%', height: 280 },
  subtitle: { marginTop: 16, color: '#FFFFFF', fontSize: 18, fontWeight: '600', textAlign: 'center' },
});
