import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, StatusBar, ActivityIndicator } from 'react-native';
import { supabase } from './supabaseClient';

export default function ChefDetailsScreen({ navigation, route }) {
  const { chefId } = route.params || {};
  const [chef, setChef] = useState(null);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;

    const loadChef = async () => {
      if (!chefId) {
        setError('Chef information is missing.');
        setLoading(false);
        return;
      }

      const { data, error: fetchError } = await supabase
        .from('chefs')
        .select('id, name, specialty, hourly_rate, rating, is_online, background_verified')
        .eq('id', chefId)
        .eq('is_online', true)
        .maybeSingle();

      if (!mounted) return;
      if (fetchError) setError('Unable to load this chef right now.');
      else if (!data) setError('This chef is no longer online.');
      else setChef(data);
      setLoading(false);
    };

    loadChef();
    return () => { mounted = false; };
  }, [chefId]);

  const confirmBooking = async () => {
    if (!chef || booking) return;
    setBooking(true);
    setError('');

    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user) throw new Error('Please log in to book a chef.');

      const orderId = `${user.id}-${Date.now()}`;
      const { error: insertError } = await supabase.from('orders').insert({
        id: orderId,
        user_id: user.id,
        chef_id: chef.id,
        status: 'pending',
        grocery_total: 700,
        delivery_fee: 40,
      });

      if (insertError) throw insertError;
      navigation.replace('CustomerOrders');
    } catch (e) {
      setError(e?.message || 'Unable to create your booking. Please try again.');
    } finally {
      setBooking(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <View style={styles.center}><ActivityIndicator size="large" color="#00C853" /></View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <ScrollView bounces={false} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <View style={styles.avatar}><Text style={styles.avatarText}>{(chef?.name || 'Chef').split(' ').slice(0, 2).map(part => part[0]).join('').toUpperCase()}</Text></View>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}><Text style={styles.backTxt}>‹</Text></TouchableOpacity>
          {chef?.is_online && <View style={styles.badge}><Text style={styles.badgeTxt}>🟢 Online</Text></View>}
        </View>

        <View style={styles.content}>
          {chef ? (
            <>
              <View style={styles.headerRow}>
                <View style={styles.nameWrap}>
                  <Text style={styles.name}>{chef.name}</Text>
                  <Text style={styles.rating}>⭐ {Number(chef.rating || 0).toFixed(1)} • ₹{Number(chef.hourly_rate || 0).toLocaleString('en-IN')} / hour</Text>
                </View>
                {chef.background_verified && <View style={styles.shield}><Text style={styles.shieldTxt}>🛡️ Verified</Text></View>}
              </View>

              <Text style={styles.secTitle}>Specialty</Text>
              <Text style={styles.desc}>{chef.specialty}</Text>

              {!!error && <Text style={styles.error}>{error}</Text>}
            </>
          ) : (
            <Text style={styles.error}>{error || 'Chef not found.'}</Text>
          )}
        </View>
      </ScrollView>

      {chef && (
        <View style={styles.footer}>
          <TouchableOpacity style={[styles.reqBtn, booking && styles.disabled]} onPress={confirmBooking} disabled={booking}>
            {booking ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.reqTxt}>Confirm Booking</Text>}
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  hero: { height: 260, backgroundColor: '#E0F2F1', justifyContent: 'center', alignItems: 'center', position: 'relative' },
  avatar: { width: 120, height: 120, borderRadius: 60, backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#00C853' },
  avatarText: { fontSize: 36, fontWeight: '800', color: '#00C853' },
  backBtn: { position: 'absolute', top: 30, left: 20, width: 40, height: 40, backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  backTxt: { fontSize: 32, color: '#000', marginTop: -5 },
  badge: { position: 'absolute', bottom: 20, left: 20, backgroundColor: '#FFFFFF', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, elevation: 4 },
  badgeTxt: { fontSize: 12, fontWeight: 'bold', color: '#000' },
  content: { padding: 20 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  nameWrap: { flex: 1, paddingRight: 10 },
  name: { fontSize: 24, fontWeight: 'bold', color: '#000', marginBottom: 4 },
  rating: { fontSize: 14, color: '#666' },
  shield: { backgroundColor: '#F2FFF6', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12, borderWidth: 1, borderColor: '#00C853' },
  shieldTxt: { fontSize: 12, color: '#00C853', fontWeight: 'bold' },
  secTitle: { fontSize: 18, fontWeight: 'bold', color: '#000', marginBottom: 10, marginTop: 10 },
  desc: { fontSize: 15, color: '#666', lineHeight: 22, marginBottom: 20 },
  error: { color: '#D32F2F', fontSize: 13, lineHeight: 18, marginTop: 12 },
  footer: { padding: 20, backgroundColor: '#FFF', borderTopWidth: 1, borderTopColor: '#EEE' },
  reqBtn: { backgroundColor: '#00C853', borderRadius: 25, height: 54, justifyContent: 'center', alignItems: 'center' },
  disabled: { opacity: 0.65 },
  reqTxt: { color: '#FFF', fontSize: 16, fontWeight: 'bold' }
});