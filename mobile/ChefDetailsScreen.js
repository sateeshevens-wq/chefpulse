import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Image, ScrollView, StatusBar } from 'react-native';

export default function ChefDetailsScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      <ScrollView bounces={false} showsVerticalScrollIndicator={false}>
        <View style={styles.imgBox}>
          <Image source={{ uri: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=600&q=80' }} style={styles.heroImg} />
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.backTxt}>‹</Text>
          </TouchableOpacity>
          <View style={styles.badge}><Text style={styles.badgeTxt}>🟢 Online</Text></View>
        </View>
        <View style={styles.content}>
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.name}>Rohit Sharma</Text>
              <Text style={styles.rating}>⭐ 4.8 (320 reviews) • 2 km</Text>
            </View>
            <View style={styles.shield}><Text style={styles.shieldTxt}>🛡️ Verified</Text></View>
          </View>
          <Text style={styles.secTitle}>About</Text>
          <Text style={styles.desc}>Specializing in authentic South Indian and North Indian cuisine. With over 8 years of culinary experience, Chef Rohit brings restaurant-quality flavors directly to your home kitchen.</Text>
          <Text style={styles.secTitle}>Specialties</Text>
          <View style={styles.tags}>
            <View style={styles.tag}><Text style={styles.tagTxt}>South Indian</Text></View>
            <View style={styles.tag}><Text style={styles.tagTxt}>North Indian</Text></View>
            <View style={styles.tag}><Text style={styles.tagTxt}>Snacks</Text></View>
          </View>
        </View>
      </ScrollView>
      <View style={styles.footer}>
        <TouchableOpacity style={styles.reqBtn} onPress={() => navigation.navigate('RequestStatus')}>
          <Text style={styles.reqTxt}>Request Chef</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  imgBox: { position: 'relative', height: 350 },
  heroImg: { width: '100%', height: '100%' },
  backBtn: { position: 'absolute', top: 40, left: 20, width: 40, height: 40, backgroundColor: 'rgba(255,255,255,0.8)', borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  backTxt: { fontSize: 32, color: '#000', marginTop: -5 },
  badge: { position: 'absolute', bottom: 20, left: 20, backgroundColor: '#FFFFFF', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, elevation: 4 },
  badgeTxt: { fontSize: 12, fontWeight: 'bold', color: '#000' },
  content: { padding: 20 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  name: { fontSize: 24, fontWeight: 'bold', color: '#000', marginBottom: 4 },
  rating: { fontSize: 14, color: '#666' },
  shield: { backgroundColor: '#F2FFF6', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12, borderWidth: 1, borderColor: '#00C853' },
  shieldTxt: { fontSize: 12, color: '#00C853', fontWeight: 'bold' },
  secTitle: { fontSize: 18, fontWeight: 'bold', color: '#000', marginBottom: 10, marginTop: 10 },
  desc: { fontSize: 15, color: '#666', lineHeight: 22, marginBottom: 20 },
  tags: { flexDirection: 'row', flexWrap: 'wrap' },
  tag: { backgroundColor: '#F5F5F5', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20, marginRight: 10, marginBottom: 10 },
  tagTxt: { color: '#333', fontSize: 13 },
  footer: { padding: 20, backgroundColor: '#FFF', borderTopWidth: 1, borderTopColor: '#EEE' },
  reqBtn: { backgroundColor: '#00C853', borderRadius: 25, height: 54, justifyContent: 'center', alignItems: 'center' },
  reqTxt: { color: '#FFF', fontSize: 16, fontWeight: 'bold' }
});