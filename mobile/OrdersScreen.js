import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList, StatusBar } from 'react-native';

export default function OrdersScreen() {
  const orders = [
    { id: '1', chef: 'Rohit Sharma', date: 'Oct 18, 2026', status: 'Completed', cost: '₹1450' },
    { id: '2', chef: 'Priya Patel', date: 'Oct 12, 2026', status: 'Completed', cost: '₹950' }
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <View style={styles.header}><Text style={styles.title}>My Orders</Text></View>
      <FlatList
        data={orders}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.row}><Text style={styles.chefName}>{item.chef}</Text><Text style={styles.cost}>{item.cost}</Text></View>
            <View style={styles.row}><Text style={styles.date}>{item.date}</Text><Text style={styles.status}>{item.status}</Text></View>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: { padding: 20, borderBottomWidth: 1, borderBottomColor: '#EEEEEE' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#000000' },
  list: { padding: 20 },
  card: { padding: 15, marginBottom: 15, borderRadius: 12, backgroundColor: '#F8F9F8', borderWidth: 1, borderColor: '#EEEEEE' },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
  chefName: { fontSize: 16, fontWeight: 'bold', color: '#000000' },
  cost: { fontSize: 16, fontWeight: 'bold', color: '#00C853' },
  date: { fontSize: 14, color: '#666666' },
  status: { fontSize: 14, color: '#00C853', fontWeight: '500' }
});
