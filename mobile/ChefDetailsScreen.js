import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, StatusBar, ActivityIndicator, TextInput } from 'react-native';
import { supabase } from './supabaseClient';

export default function ChefDetailsScreen({ navigation, route }) {
  const { chefId } = route.params || {};
  const [chef, setChef] = useState(null);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [serviceType, setServiceType] = useState('home_chef');
  const [cateringQuote, setCateringQuote] = useState('');
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

  const homeChefBreakdown = useMemo(() => {
    const chefFee = Number(chef?.hourly_rate || 0);
    const groceries = 700;
    const delivery = 40;
    const platform = 49;
    return { chefFee, groceries, delivery, platform, total: chefFee + groceries + delivery + platform };
  }, [chef]);

  const cateringAmount = Number(cateringQuote || 0);
  const cateringPlatformFee = cateringAmount > 0 ? cateringAmount * 0.1 : 0;
  const cateringTotal = cateringAmount + cateringPlatformFee;

  const confirmBooking = async () => {
    if (!chef || booking) return;
    setBooking(true);
    setError('');

    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user) throw new Error('Please log in to book a chef.');

      if (serviceType === 'catering' && cateringAmount <= 0) {
        throw new Error('Enter the catering quoted amount before requesting catering.');
      }

      const orderId = `${user.id}-${Date.now()}`;
      const { error: insertError } = await supabase.from('orders').insert({
        id: orderId,
        user_id: user.id,
        chef_id: chef.id,
        status: 'pending',
        service_type: serviceType,
        grocery_total: serviceType === 'home_chef' ? 700 : 0,
        delivery_fee: serviceType === 'home_chef' ? 40 : 0,
        platform_fee: serviceType === 'home_chef' ? 49 : Number(cateringPlatformFee.toFixed(2)),
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
      <ScrollView bounces={false} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
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

              <View style={styles.typeRow}>
                <TouchableOpacity style={[styles.typeButton, serviceType === 'home_chef' && styles.typeButtonActive]} onPress={() => setServiceType('home_chef')}>
                  <Text style={[styles.typeText, serviceType === 'home_chef' && styles.typeTextActive]}>Home Chef</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.typeButton, serviceType === 'catering' && styles.typeButtonActive]} onPress={() => setServiceType('catering')}>
                  <Text style={[styles.typeText, serviceType === 'catering' && styles.typeTextActive]}>Request Catering</Text>
                </TouchableOpacity>
              </View>

              {serviceType === 'home_chef' ? (
                <View style={styles.breakdown}>
                  <Text style={styles.breakdownTitle}>Home Chef checkout</Text>
                  <View style={styles.row}><Text style={styles.item}>Chef fee</Text><Text style={styles.price}>₹{homeChefBreakdown.chefFee.toLocaleString('en-IN')}</Text></View>
                  <View style={styles.row}><Text style={styles.item}>Grocery costs</Text><Text style={styles.price}>₹{homeChefBreakdown.groceries.toLocaleString('en-IN')}</Text></View>
                  <View style={styles.row}><Text style={styles.item}>Partner delivery</Text><Text style={styles.price}>₹{homeChefBreakdown.delivery.toLocaleString('en-IN')}</Text></View>
                  <View style={styles.row}><Text style={styles.item}>Chef Pulse platform fee</Text><Text style={styles.fee}>₹49</Text></View>
                  <View style={styles.divider} />
                  <View style={styles.row}><Text style={styles.totalLabel}>Estimated total</Text><Text style={styles.total}>₹{homeChefBreakdown.total.toLocaleString('en-IN')}</Text></View>
                  <Text style={styles.note}>The ₹49 platform fee is separate from the chef fee and grocery costs.</Text>
                </View>
              ) : (
                <View style={styles.breakdown}>
                  <Text style={styles.breakdownTitle}>Catering quote</Text>
                  <TextInput
                    style={styles.quoteInput}
                    value={cateringQuote}
                    onChangeText={setCateringQuote}
                    keyboardType="numeric"
                    placeholder="Enter quoted amount (₹)"
                    placeholderTextColor="#9BA39A"
                  />
                  <View style={styles.row}><Text style={styles.item}>Quoted amount</Text><Text style={styles.price}>₹{cateringAmount.toLocaleString('en-IN')}</Text></View>
                  <View style={styles.row}><Text style={styles.item}>Chef Pulse platform fee (10%)</Text><Text style={styles.fee}>₹{cateringPlatformFee.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</Text></View>
                  <View style={styles.divider} />
                  <View style={styles.row}><Text style={styles.totalLabel}>Estimated total</Text><Text style={styles.total}>₹{cateringTotal.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</Text></View>
                  <Text style={styles.note}>Catering platform fee is 10% of the quoted transaction amount. The fee is added separately to the quote.</Text>
                </View>
              )}

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
            {booking ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.reqTxt}>{serviceType === 'catering' ? 'Request Catering' : 'Confirm Home Chef Booking'}</Text>}
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  scrollContent: { paddingBottom: 20 },
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
  typeRow: { flexDirection: 'row', gap: 10, marginBottom: 15 },
  typeButton: { flex: 1, minHeight: 48, borderRadius: 12, borderWidth: 1, borderColor: '#DDDDDD', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 8 },
  typeButtonActive: { backgroundColor: '#00C853', borderColor: '#00C853' },
  typeText: { color: '#555', fontSize: 13, fontWeight: '700', textAlign: 'center' },
  typeTextActive: { color: '#FFFFFF' },
  breakdown: { backgroundColor: '#F8F9F8', borderRadius: 16, borderWidth: 1, borderColor: '#EEEEEE', padding: 16, marginTop: 4 },
  breakdownTitle: { color: '#000', fontSize: 16, fontWeight: '800', marginBottom: 14 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  item: { color: '#666', fontSize: 13, flex: 1, paddingRight: 8 },
  price: { color: '#000', fontSize: 13, fontWeight: '600' },
  fee: { color: '#00C853', fontSize: 13, fontWeight: '800' },
  divider: { height: 1, backgroundColor: '#E0E0E0', marginVertical: 8 },
  totalLabel: { color: '#000', fontSize: 15, fontWeight: '800' },
  total: { color: '#00C853', fontSize: 17, fontWeight: '800' },
  note: { color: '#666', fontSize: 12, lineHeight: 18, marginTop: 5 },
  quoteInput: { height: 48, borderRadius: 10, borderWidth: 1, borderColor: '#DDDDDD', backgroundColor: '#FFFFFF', paddingHorizontal: 12, color: '#000000', fontSize: 14, marginBottom: 15 },
  error: { color: '#D32F2F', fontSize: 13, lineHeight: 18, marginTop: 12 },
  footer: { padding: 20, backgroundColor: '#FFF', borderTopWidth: 1, borderTopColor: '#EEE' },
  reqBtn: { backgroundColor: '#00C853', borderRadius: 25, height: 54, justifyContent: 'center', alignItems: 'center' },
  disabled: { opacity: 0.65 },
  reqTxt: { color: '#FFF', fontSize: 16, fontWeight: 'bold' }
});
