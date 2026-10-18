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

export default function ChefJobsScreen({ navigation }) {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [error, setError] = useState('');

  const loadJobs = useCallback(async () => {
    setLoading(true);
    setError('');

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setJobs([]);
      setError('Please log in to view your job requests.');
      setLoading(false);
      return;
    }

    const { data, error: fetchError } = await supabase
      .from('orders')
      .select('id, user_id, status, grocery_total, delivery_fee, created_at')
      .eq('chef_id', user.id)
      .order('created_at', { ascending: false });

    if (fetchError) {
      setJobs([]);
      setError('Unable to load your job requests right now.');
    } else {
      setJobs(data || []);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    loadJobs();
  }, [loadJobs]);

  const updateStatus = async (id, status) => {
    if (updatingId) return;
    setUpdatingId(id);
    setError('');

    const { error: updateError } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', id);

    if (updateError) {
      setError('Unable to update this job. Please try again.');
    } else {
      setJobs(current => current.map(job => job.id === id ? { ...job, status } : job));
    }

    setUpdatingId(null);
  };

  const renderJob = ({ item }) => {
    const actionStatus = item.status === 'pending' ? 'accepted' : item.status === 'accepted' ? 'completed' : null;
    const actionLabel = item.status === 'pending' ? 'Accept Job' : item.status === 'accepted' ? 'Mark Completed' : null;

    return (
      <View style={styles.card}>
        <View style={styles.row}>
          <Text style={styles.jobTitle}>Customer Booking</Text>
          <View style={styles.status}><Text style={styles.statusText}>{statusLabels[item.status] || item.status}</Text></View>
        </View>
        <Text style={styles.jobId}>Order #{String(item.id).slice(-8)}</Text>
        <Text style={styles.date}>{new Date(item.created_at).toLocaleString()}</Text>
        <Text style={styles.amount}>Groceries: ₹{Number(item.grocery_total).toLocaleString('en-IN')}</Text>
        <Text style={styles.amount}>Delivery: ₹{Number(item.delivery_fee).toLocaleString('en-IN')}</Text>
        {actionStatus && (
          <Pressable style={[styles.action, updatingId === item.id && styles.disabled]} onPress={() => updateStatus(item.id, actionStatus)} disabled={!!updatingId}>
            {updatingId === item.id ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.actionText}>{actionLabel}</Text>}
          </Pressable>
        )}
      </View>
    );
  };

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
        <Text style={styles.title}>Job Requests</Text>
        <View style={styles.spacer} />
      </View>

      {!!error && <Text style={styles.error}>{error}</Text>}

      {jobs.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyTitle}>No job requests yet</Text>
          <Text style={styles.muted}>New customer bookings will appear here.</Text>
        </View>
      ) : (
        <FlatList
          data={jobs}
          renderItem={renderJob}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshing={loading}
          onRefresh={loadJobs}
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
  jobTitle: { color: '#000000', fontSize: 17, fontWeight: '800' },
  status: { backgroundColor: '#E8F5E9', borderRadius: 14, paddingHorizontal: 10, paddingVertical: 5 },
  statusText: { color: '#00C853', fontSize: 12, fontWeight: '800' },
  jobId: { color: '#333333', fontSize: 13, marginTop: 10 },
  date: { color: '#777777', fontSize: 12, marginTop: 4, marginBottom: 12 },
  amount: { color: '#444444', fontSize: 13, marginTop: 4 },
  action: { marginTop: 15, backgroundColor: '#00C853', minHeight: 46, borderRadius: 23, justifyContent: 'center', alignItems: 'center' },
  actionText: { color: '#FFFFFF', fontSize: 14, fontWeight: '800' },
  disabled: { opacity: 0.65 },
  error: { color: '#D32F2F', fontSize: 13, textAlign: 'center', paddingHorizontal: 20, paddingTop: 12 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 30 },
  emptyTitle: { color: '#000000', fontSize: 20, fontWeight: '800' },
  muted: { color: '#666666', fontSize: 14, marginTop: 8, textAlign: 'center' },
});
