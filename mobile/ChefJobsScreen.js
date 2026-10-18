import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, SafeAreaView, StatusBar, StyleSheet, Text, View } from 'react-native';
import { supabase } from './supabaseClient';

const statusLabels = { pending: 'Pending', accepted: 'Accepted', declined: 'Declined', in_progress: 'In Progress', completed: 'Completed', cancelled: 'Cancelled' };

export default function ChefJobsScreen({ navigation }) {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [error, setError] = useState('');

  const loadJobs = useCallback(async () => {
    setLoading(true); setError('');
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setJobs([]); setError('Please log in to view your booking requests.'); setLoading(false); return; }
    const { data, error: fetchError } = await supabase.from('bookings').select('id, user_id, service_type, status, amount, platform_fee, created_at, updated_at').eq('chef_id', user.id).order('created_at', { ascending: false });
    if (fetchError) { setJobs([]); setError('Unable to load your booking requests right now.'); } else setJobs(data || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    let mounted = true;
    let channel;
    const start = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !mounted) return;
      await loadJobs();
      channel = supabase.channel(`chef-bookings-${user.id}`)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings', filter: `chef_id=eq.${user.id}` }, payload => {
          if (!mounted) return;
          setJobs(current => {
            if (payload.eventType === 'DELETE') return current.filter(item => item.id !== payload.old.id);
            const next = payload.new;
            const exists = current.some(item => item.id === next.id);
            return exists ? current.map(item => item.id === next.id ? { ...item, ...next } : item) : [next, ...current];
          });
        }).subscribe();
    };
    start();
    return () => { mounted = false; if (channel) supabase.removeChannel(channel); };
  }, [loadJobs]);

  const updateStatus = async (id, status) => {
    if (updatingId) return;
    setUpdatingId(id); setError('');
    const { error: updateError } = await supabase.from('bookings').update({ status }).eq('id', id).eq('status', 'pending');
    if (updateError) setError('Unable to update this booking. Please try again.');
    else setJobs(current => current.map(job => job.id === id ? { ...job, status } : job));
    setUpdatingId(null);
  };

  const renderJob = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.row}><Text style={styles.jobTitle}>{item.service_type === 'catering' ? 'Catering Booking' : 'Home Chef Booking'}</Text><View style={styles.status}><Text style={styles.statusText}>{statusLabels[item.status] || item.status}</Text></View></View>
      <Text style={styles.jobId}>Booking #{String(item.id).slice(-8)}</Text>
      <Text style={styles.date}>{new Date(item.created_at).toLocaleString()}</Text>
      <View style={styles.amountRow}><Text style={styles.amountLabel}>Booking value</Text><Text style={styles.amount}>₹{Number(item.amount || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}</Text></View>
      {item.status === 'pending' && <View style={styles.actions}><Pressable style={[styles.accept, updatingId === item.id && styles.disabled]} onPress={() => updateStatus(item.id, 'accepted')} disabled={!!updatingId}><Text style={styles.actionText}>{updatingId === item.id ? 'Updating...' : 'Accept'}</Text></Pressable><Pressable style={[styles.decline, updatingId === item.id && styles.disabled]} onPress={() => updateStatus(item.id, 'declined')} disabled={!!updatingId}><Text style={styles.declineText}>Decline</Text></Pressable></View>}
    </View>
  );

  if (loading) return <SafeAreaView style={styles.screen}><StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" /><View style={styles.center}><ActivityIndicator size="large" color="#00C853" /></View></SafeAreaView>;

  return <SafeAreaView style={styles.screen}><StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" /><View style={styles.header}><Pressable onPress={() => navigation.goBack()} hitSlop={12}><Text style={styles.back}>‹</Text></Pressable><Text style={styles.title}>Booking Requests</Text><View style={styles.spacer} /></View>{!!error && <Text style={styles.error}>{error}</Text>}{jobs.length === 0 ? <View style={styles.center}><Text style={styles.emptyTitle}>No booking requests</Text><Text style={styles.muted}>New paid bookings will appear here instantly.</Text></View> : <FlatList data={jobs} renderItem={renderJob} keyExtractor={item => item.id} contentContainerStyle={styles.list} showsVerticalScrollIndicator={false} refreshing={loading} onRefresh={loadJobs} />}</SafeAreaView>;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#FFFFFF' }, header: { height: 64, paddingHorizontal: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: '#EEEEEE' }, back: { color: '#000000', fontSize: 38, width: 28 }, title: { color: '#000000', fontSize: 20, fontWeight: '800' }, spacer: { width: 28 }, list: { padding: 20 }, card: { backgroundColor: '#F8F9F8', borderWidth: 1, borderColor: '#EEEEEE', borderRadius: 16, padding: 16, marginBottom: 14 }, row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, jobTitle: { color: '#000000', fontSize: 16, fontWeight: '800', flex: 1, paddingRight: 8 }, status: { backgroundColor: '#E8F5E9', borderRadius: 14, paddingHorizontal: 10, paddingVertical: 5 }, statusText: { color: '#00C853', fontSize: 12, fontWeight: '800' }, jobId: { color: '#333333', fontSize: 13, marginTop: 10 }, date: { color: '#777777', fontSize: 12, marginTop: 4, marginBottom: 12 }, amountRow: { flexDirection: 'row', justifyContent: 'space-between' }, amountLabel: { color: '#666666', fontSize: 13 }, amount: { color: '#000000', fontSize: 14, fontWeight: '800' }, actions: { flexDirection: 'row', gap: 10, marginTop: 16 }, accept: { flex: 1, height: 46, borderRadius: 23, backgroundColor: '#00C853', justifyContent: 'center', alignItems: 'center' }, decline: { flex: 1, height: 46, borderRadius: 23, borderWidth: 1, borderColor: '#D32F2F', justifyContent: 'center', alignItems: 'center' }, actionText: { color: '#FFFFFF', fontSize: 14, fontWeight: '800' }, declineText: { color: '#D32F2F', fontSize: 14, fontWeight: '800' }, disabled: { opacity: 0.55 }, error: { color: '#D32F2F', fontSize: 13, textAlign: 'center', paddingHorizontal: 20, paddingTop: 12 }, center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 30 }, emptyTitle: { color: '#000000', fontSize: 20, fontWeight: '800' }, muted: { color: '#666666', fontSize: 14, marginTop: 8, textAlign: 'center' },
});
