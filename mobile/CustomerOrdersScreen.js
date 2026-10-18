import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, SafeAreaView, StatusBar, StyleSheet, Text, View } from 'react-native';
import { supabase } from './supabaseClient';

const statusLabels = { pending_payment: 'Payment initiated', pending: 'Awaiting chef', accepted: 'Accepted', declined: 'Declined', in_progress: 'In Progress', completed: 'Completed', cancelled: 'Cancelled' };
const serviceLabels = { home_chef: 'Home Chef', catering: 'Catering' };

export default function CustomerOrdersScreen({ navigation }) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadBookings = useCallback(async () => {
    setLoading(true); setError('');
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setBookings([]); setError('Please log in to view your bookings.'); setLoading(false); return; }
    const { data, error: fetchError } = await supabase.from('bookings').select('id, chef_id, service_type, status, amount, platform_fee, created_at, updated_at').eq('user_id', user.id).order('created_at', { ascending: false });
    if (fetchError) { setBookings([]); setError('Unable to load your bookings right now.'); } else setBookings(data || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    let mounted = true;
    let channel;
    const start = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !mounted) return;
      await loadBookings();
      channel = supabase.channel(`customer-bookings-${user.id}`)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings', filter: `user_id=eq.${user.id}` }, payload => {
          if (!mounted) return;
          setBookings(current => {
            if (payload.eventType === 'DELETE') return current.filter(item => item.id !== payload.old.id);
            const next = payload.new;
            const exists = current.some(item => item.id === next.id);
            if (exists) return current.map(item => item.id === next.id ? { ...item, ...next } : item);
            return [next, ...current];
          });
        }).subscribe();
    };
    start();
    return () => { mounted = false; if (channel) supabase.removeChannel(channel); };
  }, [loadBookings]);

  const renderBooking = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.row}>
        <View><Text style={styles.kicker}>BOOKING</Text><Text style={styles.chef}>{serviceLabels[item.service_type] || 'Chef Booking'}</Text></View>
        <View style={styles.status}><Text style={styles.statusText}>{statusLabels[item.status] || item.status}</Text></View>
      </View>
      <Text style={styles.orderId}>#{String(item.id).slice(-8)}</Text>
      <Text style={styles.date}>{new Date(item.created_at).toLocaleString()}</Text>
      <View style={styles.divider} />
      <View style={styles.totalRow}><Text style={styles.muted}>Booking total</Text><Text style={styles.amount}>₹{Number(item.amount || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}</Text></View>
      <View style={styles.totalRow}><Text style={styles.muted}>Platform fee</Text><Text style={styles.fee}>₹{Number(item.platform_fee || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}</Text></View>
      <Text style={styles.live}>{item.status === 'accepted' ? '✓ Chef accepted your booking' : item.status === 'declined' ? 'Chef declined this booking' : '● Live status updates enabled'}</Text>
    </View>
  );

  if (loading) return <SafeAreaView style={styles.screen}><StatusBar barStyle="light-content" backgroundColor="#07130D" /><View style={styles.center}><ActivityIndicator size="large" color="#FF9F0A" /></View></SafeAreaView>;

  return (
    <SafeAreaView style={styles.screen}>
      <StatusBar barStyle="light-content" backgroundColor="#07130D" />
      <View style={styles.header}><Pressable onPress={() => navigation.goBack()} hitSlop={12}><Text style={styles.back}>‹</Text></Pressable><View><Text style={styles.eyebrow}>CHEFPULSE</Text><Text style={styles.title}>Bookings</Text></View><View style={styles.spacer} /></View>
      {error ? <View style={styles.center}><Text style={styles.error}>{error}</Text><Pressable style={styles.retry} onPress={loadBookings}><Text style={styles.retryText}>Try Again</Text></Pressable></View> : bookings.length === 0 ? <View style={styles.center}><Text style={styles.emptyTitle}>No bookings yet</Text><Text style={styles.mutedCenter}>Your chef bookings will appear here.</Text></View> : <FlatList data={bookings} renderItem={renderBooking} keyExtractor={item => item.id} contentContainerStyle={styles.list} showsVerticalScrollIndicator={false} refreshing={loading} onRefresh={loadBookings} />}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#07130D' },
  header: { height: 78, paddingHorizontal: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  back: { color: '#FFFFFF', fontSize: 38, width: 28 },
  eyebrow: { color: '#00A86B', fontSize: 9, fontWeight: '900', letterSpacing: 2.2 },
  title: { color: '#FFFFFF', fontSize: 27, fontWeight: '800', marginTop: 2 },
  spacer: { width: 28 },
  list: { paddingHorizontal: 16, paddingTop: 6, paddingBottom: 120 },
  card: { backgroundColor: 'rgba(15,31,23,0.94)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.09)', borderRadius: 24, padding: 18, marginBottom: 14 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  kicker: { color: '#FF9F0A', fontSize: 9, fontWeight: '900', letterSpacing: 1.8, marginBottom: 5 },
  chef: { color: '#FFFFFF', fontSize: 18, fontWeight: '800' },
  status: { backgroundColor: 'rgba(0,168,107,0.16)', borderWidth: 1, borderColor: 'rgba(0,168,107,0.28)', borderRadius: 16, paddingHorizontal: 10, paddingVertical: 6 },
  statusText: { color: '#52D39A', fontSize: 11, fontWeight: '800' },
  orderId: { color: '#A7B5AE', fontSize: 12, marginTop: 12 },
  date: { color: '#718078', fontSize: 12, marginTop: 3, marginBottom: 14 },
  divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.07)', marginBottom: 8 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 7 },
  muted: { color: '#8E9C95', fontSize: 13 },
  amount: { color: '#FFFFFF', fontSize: 13, fontWeight: '700' },
  fee: { color: '#FF9F0A', fontSize: 13, fontWeight: '800' },
  live: { color: '#52D39A', fontSize: 12, fontWeight: '700', marginTop: 15 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 30 },
  error: { color: '#FF8A80', textAlign: 'center', fontSize: 14 },
  emptyTitle: { color: '#FFFFFF', fontSize: 21, fontWeight: '800' },
  mutedCenter: { color: '#7E8B84', fontSize: 14, marginTop: 8, textAlign: 'center' },
  retry: { marginTop: 18, backgroundColor: '#FF9F0A', paddingHorizontal: 22, paddingVertical: 10, borderRadius: 22 },
  retryText: { color: '#1A1205', fontWeight: '900' },
});
