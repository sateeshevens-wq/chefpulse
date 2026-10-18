import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Image, StatusBar } from 'react-native';

export default function ChefArrivedScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      <Image source={{ uri: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=400&q=80' }} style={styles.image} />
      <View style={styles.sheet}>
        <Text style={styles.title}>Chef Rohit has arrived!</Text>
        <Text style={styles.subtitle}>Please open the door and guide the chef to your kitchen.</Text>
        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.btnOutline}><Text style={styles.btnOutlineTxt}>💬 Chat</Text></TouchableOpacity>
          <TouchableOpacity style={styles.btnOutline}><Text style={styles.btnOutlineTxt}>📞 Call</Text></TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.btnMain} onPress={() => navigation.replace('CookingInProgress')}>
          <Text style={styles.btnMainTxt}>Start Cooking Phase</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000000' },
  image: { flex: 1, width: '100%', opacity: 0.8 },
  sheet: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 25, position: 'absolute', bottom: 0, width: '100%' },
  title: { fontSize: 22, fontWeight: 'bold', color: '#000000', marginBottom: 10, textAlign: 'center' },
  subtitle: { fontSize: 15, color: '#666666', textAlign: 'center', marginBottom: 25 },
  actionRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  btnOutline: { flex: 0.48, paddingVertical: 12, borderRadius: 25, borderWidth: 1, borderColor: '#E0E0E0', alignItems: 'center' },
  btnOutlineTxt: { fontSize: 16, fontWeight: 'bold', color: '#000000' },
  btnMain: { backgroundColor: '#00C853', height: 54, borderRadius: 25, justifyContent: 'center', alignItems: 'center' },
  btnMainTxt: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' }
});