import React, { useEffect, useState } from 'react';
import { Pressable, SafeAreaView, StatusBar, StyleSheet, Switch, Text, View } from 'react-native';
import { supabase } from './supabaseClient';

const C = {
  bg: '#FFFFFF',
  g: '#00C853',
  black: '#000000',
  muted: '#666666',
  card: '#F8F9F8',
  border: '#EEEEEE',
  error: '#D32F2F',
};

export default function ChefDashboardScreen({ navigation }) {
  const [chef, setChef] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;

    const loadChef = async () => {
      setError('');
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError) throw userError;
        if (!user) throw new Error('You must be logged in.');

        const { data, error: chefError } = await supabase
          .from('chefs')
          .select('id, name, specialty, hourly_rate, bio, is_online')
          .eq('user_id', user.id)
          .maybeSingle();

        if (chefError) throw chefError;
        if (!data) {
          navigation.replace('ChefRegistration');
          return;
        }

        if (mounted) setChef(data);
      } catch (e) {
        if (mounted) setError(e?.message || 'Unable to load your chef profile.');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadChef();
    return () => { mounted = false; };
  }, [navigation]);

  const toggleOnline = async (nextValue) => {
    if (!chef || saving) return;
    setSaving(true);
    setError('');

    try {
      const { data, error: updateError } = await supabase
        .from('chefs')
        .update({ is_online: nextValue })
        .eq('id', chef.id)
        .select('id, name, specialty, hourly_rate, bio, is_online')
        .single();

      if (updateError) throw updateError;
      setChef(data);
    } catch (e) {
      setError(e?.message || 'Unable to update your availability.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.screen}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <View style={styles.center}><Text style={styles.muted}>Loading chef dashboard...</Text></View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screen}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
          <Text style={styles.back}>‹</Text>
        </Pressable>
        <Text style={styles.title}>Chef Dashboard</Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.content}>
        {!!error && <Text style={styles.error}>{error}</Text>}

        {chef && (
          <>
            <View style={styles.profileCard}>
              <Text style={styles.name}>{chef.name}</Text>
              <Text style={styles.specialty}>{chef.specialty}</Text>
              <Text style={styles.rate}>₹{Number(chef.hourly_rate).toLocaleString('en-IN')} / hour</Text>
              <Text style={styles.bio}>{chef.bio}</Text>
            </View>

            <View style={styles.onlineCard}>
              <View style={styles.onlineText}>
                <Text style={styles.onlineTitle}>Available for bookings</Text>
                <Text style={styles.onlineSub}>
                  {chef.is_online ? 'Customers can see you in chef search results.' : 'You are hidden from customer search results.'}
                </Text>
              </View>
              <Switch
                value={chef.is_online}
                onValueChange={toggleOnline}
                disabled={saving}
                trackColor={{ false: '#D9D9D9', true: '#A8FF3F' }}
                thumbColor={chef.is_online ? '#00C853' : '#FFFFFF'}
              />
            </View>

            <View style={[styles.statusPill, chef.is_online ? styles.onlinePill : styles.offlinePill]}>
              <Text style={[styles.statusText, chef.is_online ? styles.onlineStatus : styles.offlineStatus]}>
                {chef.is_online ? 'ONLINE' : 'OFFLINE'}
              </Text>
            </View>
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bg },
  header: { height: 64, paddingHorizontal: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: C.border },
  back: { color: C.black, fontSize: 38, width: 28 },
  title: { color: C.black, fontSize: 20, fontWeight: '800' },
  headerSpacer: { width: 28 },
  content: { padding: 20 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  muted: { color: C.muted, fontSize: 15 },
  error: { color: C.error, fontSize: 13, marginBottom: 14, lineHeight: 18 },
  profileCard: { backgroundColor: C.card, borderWidth: 1, borderColor: C.border, borderRadius: 16, padding: 20 },
  name: { color: C.black, fontSize: 24, fontWeight: '800' },
  specialty: { color: C.g, fontSize: 16, fontWeight: '700', marginTop: 6 },
  rate: { color: C.black, fontSize: 15, fontWeight: '700', marginTop: 14 },
  bio: { color: C.muted, fontSize: 14, lineHeight: 20, marginTop: 12 },
  onlineCard: { marginTop: 20, padding: 18, borderWidth: 1, borderColor: C.border, borderRadius: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  onlineText: { flex: 1, paddingRight: 12 },
  onlineTitle: { color: C.black, fontSize: 17, fontWeight: '800' },
  onlineSub: { color: C.muted, fontSize: 13, lineHeight: 18, marginTop: 5 },
  statusPill: { alignSelf: 'flex-start', marginTop: 16, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20 },
  onlinePill: { backgroundColor: '#E8F5E9' },
  offlinePill: { backgroundColor: '#F5F5F5' },
  statusText: { fontSize: 12, fontWeight: '800' },
  onlineStatus: { color: C.g },
  offlineStatus: { color: '#777777' },
});
