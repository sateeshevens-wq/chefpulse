import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, SafeAreaView, StatusBar, StyleSheet, Text, View } from 'react-native';
import { supabase } from './supabaseClient';

const statusLabels = {
  pending: 'Pending',
  accepted: 'Accepted',
  confirmed: 'Confirmed',
  in_progress: 'In Progress',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

export default function CustomerOrdersScreen({ navigation }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadOrders = useCallback(async () => {
    setLoading(true);
    setError('');

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setOrders([]);
      setError('Please log in to view your bookings.');
      setLoading(false);
      return;
    }

    const { data, error: fetchError } = await supabase
      .from('orders')
      .select('id, chef_id, status, grocery_total, delivery_fee, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (fetchError) {
      setOrders([]);
      setError('Unable to load your bookings right now.');
    } else {
      setOrders(data || []);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const renderOrder = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.row}>
        <Text style={styles.chef}>Chef Booking</Text>
        <View style={styles.status}><Text style={styles.statusText}>{statusLabels[item.status] || item.status}</Text></View>
      </View>
      <Text style={styles.orderId}>Order #{String(item.id).slice(-8)}</Text>
      <Text style={styles.date}>{new Date(item.created_at).toLocaleString()}</Text>
      <View style={styles.totalRow}>
        <Text style={styles.muted}>Groceries</Text>
        <Text style={styles.amount}>₹{Number(item.grocery_total).toLocaleString('en-IN')}</Text>
      </View>
      <View style={styles.totalRow}>
        <Text style={styles.muted}>Delivery fee</Text>
        <Text style={styles.amount}>₹{Number(item.delivery_fee).toLocaleString('en-IN')}</Text>
      </View>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.screen}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <View style={styles.center}><ActivityIndicator size="large" color="#00C853" /></View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screen}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={12}><Text style={styles.back}>‹</Text></Pressable>
        <Text style={styles.title}>My Bookings</Text>
        <View style={styles.spacer} />
      </View>

      {error ? (
        <View style={styles.center}>
          <Text style={styles.error}>{error}</Text>
          <Pressable style={styles.retry} onPress={loadOrders}><Text style={styles.retryText}>Try Again</Text></Pressable>
        </View>
      ) : orders.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyTitle}>No bookings yet</Text>
          <Text style={styles.mutedCenter}>Your chef bookings will appear here.</Text>
        </View>
      ) : (
        <FlatList
          data={orders}
          renderItem={renderOrder}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshing={loading}
          onRefresh={loadOrders}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#FFFFFF' },
  header: { height: 64, paddingHorizontal: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: '#EEEEEE' },
  back: { color: '#000000', fontSize: 38, width: 28 },
  title: { color: '#000000', fontSize: 20, fontWeight: '800' },
  spacer: { width: 28 },
  list: { padding: 20 },
  card: { backgroundColor: '#F8F9F8', borderWidth: 1, borderColor: '#EEEEEE', borderRadius: 16, padding: 16, marginBottom: 14 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  chef: { color: '#000000', fontSize: 17, fontWeight: '800' },
  status: { backgroundColor: '#E8F5E9', borderRadius: 14, paddingHorizontal: 10, paddingVertical: 5 },
  statusText: { color: '#00C853', fontSize: 12, fontWeight: '800' },
  orderId: { color: '#333333', fontSize: 13, marginTop: 10 },
  date: { color: '#777777', fontSize: 12, marginTop: 4, marginBottom: 14 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 5 },
  muted: { color: '#666666', fontSize: 13 },
  amount: { color: '#000000', fontSize: 13, fontWeight: '700' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 30 },
  error: { color: '#D32F2F', textAlign: 'center', fontSize: 14 },
  emptyTitle: { color: '#000000', fontSize: 20, fontWeight: '800' },
  mutedCenter: { color: '#666666', fontSize: 14, marginTop: 8, textAlign: 'center' },
  retry: { marginTop: 18, backgroundColor: '#00C853', paddingHorizontal: 22, paddingVertical: 10, borderRadius: 22 },
  retryText: { color: '#FFFFFF', fontWeight: '800' },
});
