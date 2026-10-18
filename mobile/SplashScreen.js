import React, { useEffect } from 'react';
import { Image, SafeAreaView, StatusBar, StyleSheet } from 'react-native';

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
      <Image
        source={require('./assets/image_0.png')}
        style={styles.logo}
        resizeMode="contain"
        accessibilityLabel="ChefPulse — Great Food. At Your Place."
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: '92%',
    height: '72%',
  },
});
