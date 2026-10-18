import React from 'react';
import { Pressable, SafeAreaView, StatusBar, StyleSheet, Text, View } from 'react-native';

export default function CateringScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.screen}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()}><Text style={styles.back}>‹</Text></Pressable>
        <Text style={styles.title}>CATERING</Text><View style={styles.spacer} />
      </View>
      <View style={styles.content}>
        <Text style={styles.heading}>Catering for your event</Text>
        <Text style={styles.sub}>Tell us what you need and browse available chefs for your catering service.</Text>
        <Pressable style={styles.button} onPress={() => navigation.navigate('AvailableChefs', { serviceType: 'catering' })}>
          <Text style={styles.buttonText}>Find Catering Chefs</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({ screen: { flex: 1, backgroundColor: '#FFFFFF' }, header: { height: 64, paddingHorizontal: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: '#EEEEEE' }, back: { color: '#000000', fontSize: 38, width: 28 }, title: { color: '#000000', fontSize: 20, fontWeight: '800' }, spacer: { width: 28 }, content: { padding: 24 }, heading: { color: '#000000', fontSize: 28, fontWeight: '800' }, sub: { color: '#666666', fontSize: 15, lineHeight: 22, marginTop: 10 }, button: { marginTop: 28, height: 54, borderRadius: 27, backgroundColor: '#00C853', alignItems: 'center', justifyContent: 'center' }, buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '800' } });
