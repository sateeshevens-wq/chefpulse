import React, { useEffect } from 'react';
import { Image, SafeAreaView, StatusBar, StyleSheet } from 'react-native';

const SPLASH_DURATION_MS = 2500;

export default function SplashScreen({ navigation }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.replace('Home');
    }, SPLASH_DURATION_MS);

    return () => clearTimeout(timer);
  }, [navigation]);

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
  },
  logo: {
    width: '100%',
    height: '100%',
  },
});
