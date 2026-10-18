import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, FlatList, Image, StatusBar } from 'react-native';

export default function AvailableChefsScreen({ navigation }) {
  const chefs = [
    { id: '1', name: 'Rohit Sharma', rating: '4.8 (320)', tags: 'South Indian - North Indian', price: '₹800 / 3 hrs', img: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=200&q=80' },
    { id: '2', name: 'Vikram Singh', rating: '4.7 (245)', tags: 'Continental - Italian', price: '₹750 / 3 hrs', img: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=200&q=80' },
    { id: '3', name: 'Amit Kumar', rating: '4.6 (180)', tags: 'North Indian - Chinese', price: '₹750 / 3 hrs', img: 'https://images.unsplash.com/photo-1600565193348-f74bd3c7ccdf?w=200&q=80' }
  ];

  const renderChef = ({ item }) => (
    <View style={styles.card}>
      <Image source={{ uri: item.img }} style={styles.avatar} />
      <View style={styles.info}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.rating}>⭐ {item.rating}</Text>
        <Text style={styles.tags}>{item.tags}</Text>
        <Text style={styles.price}>{item.price}</Text>
      </View>
      <TouchableOpacity style={styles.acceptBtn} onPress={() => navigation.navigate('ChefDetails')}>
        <Text style={styles.acceptText}>Accept</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}><Text style={styles.back}>‹</Text></TouchableOpacity>
        <View style={styles.headerText}>
          <Text style={styles.title}>3 chefs available nearby</Text>
          <Text style={styles.sub}>📍 within 2 km • 15 min</Text>
        </View>
        <View style={{width: 30}}/>
      </View>
      <FlatList data={chefs} renderItem={renderChef} keyExtractor={i => i.id} contentContainerStyle={styles.list} showsVerticalScrollIndicator={false} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 10, paddingBottom: 15, borderBottomWidth: 1, borderBottomColor: '#EEEEEE' },
  backBtn: { padding: 5 },
  back: { fontSize: 32, color: '#000000', marginTop: -5 },
  headerText: { alignItems: 'center' },
  title: { fontSize: 16, fontWeight: 'bold', color: '#000000' },
  sub: { fontSize: 12, color: '#666666', marginTop: 2 },
  list: { padding: 20 },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 16, padding: 15, marginBottom: 15, borderWidth: 1, borderColor: '#EEEEEE', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3 },
  avatar: { width: 60, height: 60, borderRadius: 30, marginRight: 15 },
  info: { flex: 1 },
  name: { fontSize: 16, fontWeight: 'bold', color: '#000000', marginBottom: 4 },
  rating: { fontSize: 12, color: '#666666', marginBottom: 2 },
  tags: { fontSize: 12, color: '#666666', marginBottom: 4 },
  price: { fontSize: 14, fontWeight: 'bold', color: '#00C853' },
  acceptBtn: { backgroundColor: '#00C853', paddingVertical: 8, paddingHorizontal: 20, borderRadius: 25 },
  acceptText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 14 }
});