import React from 'react';
import { SafeAreaView, StatusBar, StyleSheet, Text, View } from 'react-native';

export default function ChatScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#07130D" />
      <View style={styles.content}>
        <Text style={styles.eyebrow}>CHEFPULSE</Text>
        <Text style={styles.title}>Chat</Text>
        <Text style={styles.subtitle}>Your chef and catering conversations will appear here.</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#07130D' },
  content: { flex: 1, paddingHorizontal: 24, paddingTop: 56 },
  eyebrow: { color: '#FF9F0A', fontSize: 11, fontWeight: '800', letterSpacing: 2 },
  title: { color: '#FFFFFF', fontSize: 36, fontWeight: '800', marginTop: 8 },
  subtitle: { color: '#A7B5AE', fontSize: 15, lineHeight: 22, marginTop: 12, maxWidth: 320 },
});
