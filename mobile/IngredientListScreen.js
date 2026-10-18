import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, FlatList, StatusBar } from 'react-native';

export default function IngredientListScreen({ navigation }) {
  const ingredients = [
    { id: '1', name: 'Fresh Vegetables (1 kg)', price: '₹210' },
    { id: '2', name: 'Paneer (500g)', price: '₹130' },
    { id: '3', name: 'Basmati Rice (1 kg)', price: '₹160' },
    { id: '4', name: 'Spices & Oils', price: '₹200' }
  ];

  const renderItem = ({ item }) => (
    <View style={styles.itemRow}>
      <Text style={styles.itemName}>{item.name}</Text>
      <Text style={styles.itemPrice}>{item.price}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.back}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Ingredients Required</Text>
        <View style={{width: 30}} />
      </View>
      <Text style={styles.subtitle}>From Chef Rohit Sharma</Text>
      
      <FlatList 
        data={ingredients} 
        renderItem={renderItem} 
        keyExtractor={i => i.id} 
        contentContainerStyle={styles.list} 
        showsVerticalScrollIndicator={false} 
      />

      <View style={styles.footer}>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total Amount</Text>
          <Text style={styles.totalValue}>₹700</Text>
        </View>
        <TouchableOpacity style={styles.btn} onPress={() => navigation.navigate('DeliveryPartner')}>
          <Text style={styles.btnTxt}>Order Ingredients</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 10 },
  backBtn: { padding: 5 },
  back: { fontSize: 32, color: '#000000', marginTop: -5 },
  title: { fontSize: 18, fontWeight: 'bold', color: '#000000' },
  subtitle: { fontSize: 14, color: '#666666', textAlign: 'center', marginTop: 5, marginBottom: 15 },
  list: { paddingHorizontal: 20 },
  itemRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#EEEEEE' },
  itemName: { fontSize: 16, color: '#000000' },
  itemPrice: { fontSize: 16, fontWeight: 'bold', color: '#000000' },
  footer: { padding: 20, borderTopWidth: 1, borderTopColor: '#EEEEEE', backgroundColor: '#FFFFFF' },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
  totalLabel: { fontSize: 18, color: '#666666' },
  totalValue: { fontSize: 22, fontWeight: 'bold', color: '#000000' },
  btn: { backgroundColor: '#00C853', height: 54, borderRadius: 25, justifyContent: 'center', alignItems: 'center' },
  btnTxt: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' }
});