import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, StatusBar } from 'react-native';
import { supabase } from './supabaseClient';

export default function ProfileScreen({ navigation }) {
  const options = ['Edit Profile', 'Payment Methods', 'Saved Addresses', 'Help & Support', 'Terms of Service'];
  const [user, setUser] = useState(null);
  const [isChef, setIsChef] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    const loadProfile = async () => {
      try {
        const { data: { user: currentUser }, error: userError } = await supabase.auth.getUser();
        if (userError) throw userError;
        if (!currentUser) throw new Error('No active session.');
        if (mounted) setUser(currentUser);
        const { data: chef, error: chefError } = await supabase.from('chefs').select('id').eq('user_id', currentUser.id).maybeSingle();
        if (!chefError && mounted) setIsChef(!!chef);
      } catch (e) {
        if (mounted) setError(e?.message || 'Unable to load your profile.');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    loadProfile();
    return () => { mounted = false; };
  }, []);

  const displayName = user?.user_metadata?.name?.trim() || user?.email?.split('@')[0] || 'ChefPulse User';
  const initials = displayName.split(/\s+/).map(part => part[0]).join('').slice(0, 2).toUpperCase();
  const handleLogout = async () => { await supabase.auth.signOut(); };
  const handleChefPortal = () => navigation.navigate(isChef ? 'ChefDashboard' : 'ChefRegistration');

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#07130D" />
      <View style={styles.header}><Text style={styles.eyebrow}>CHEFPULSE</Text><Text style={styles.title}>Profile</Text></View>
      {loading ? <View style={styles.center}><ActivityIndicator size="large" color="#FF9F0A" /></View> : (
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {!!error && <Text style={styles.error}>{error}</Text>}
          <View style={styles.userCard}>
            <View style={styles.avatar}><Text style={styles.avatarTxt}>{initials}</Text></View>
            <View style={styles.userText}><Text style={styles.name}>{displayName}</Text><Text style={styles.email}>{user?.email || 'No email'}</Text></View>
            <View style={styles.verified}><Text style={styles.verifiedText}>✓</Text></View>
          </View>
          <TouchableOpacity style={styles.chefButton} onPress={handleChefPortal} activeOpacity={0.85}>
            <View style={styles.chefCopy}><Text style={styles.chefKicker}>{isChef ? 'CHEF PORTAL' : 'CREATOR PROGRAM'}</Text><Text style={styles.chefButtonTitle}>{isChef ? 'Chef Dashboard' : 'Become a Chef'}</Text><Text style={styles.chefButtonSub}>{isChef ? 'Manage your availability & jobs' : 'List your services on ChefPulse'}</Text></View><View style={styles.chefArrow}><Text style={styles.arrowText}>↗</Text></View>
          </TouchableOpacity>
          <Text style={styles.sectionTitle}>Settings</Text>
          <View style={styles.settingsCard}>{options.map((opt, i) => <TouchableOpacity key={i} style={[styles.optionRow, i === options.length - 1 && styles.lastRow]}><Text style={styles.optionTxt}>{opt}</Text><Text style={styles.arrow}>›</Text></TouchableOpacity>)}</View>
          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}><Text style={styles.logoutTxt}>Log Out</Text></TouchableOpacity>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#07130D' },
  header: { paddingHorizontal: 20, paddingTop: 18, paddingBottom: 18 },
  eyebrow: { color: '#00A86B', fontSize: 10, fontWeight: '900', letterSpacing: 2.5 },
  title: { color: '#FFFFFF', fontSize: 28, fontWeight: '800', marginTop: 5 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  content: { paddingHorizontal: 16, paddingBottom: 120 },
  error: { color: '#FF8A80', marginBottom: 12 },
  userCard: { flexDirection: 'row', alignItems: 'center', padding: 16, backgroundColor: 'rgba(15,31,23,0.94)', borderRadius: 24, borderWidth: 1, borderColor: 'rgba(255,255,255,0.09)' },
  avatar: { width: 58, height: 58, borderRadius: 29, backgroundColor: 'rgba(0,168,107,0.16)', borderWidth: 1, borderColor: 'rgba(0,168,107,0.32)', justifyContent: 'center', alignItems: 'center', marginRight: 14 },
  avatarTxt: { fontSize: 21, fontWeight: '900', color: '#52D39A' },
  userText: { flex: 1 },
  name: { fontSize: 18, fontWeight: '800', color: '#FFFFFF', marginBottom: 4 },
  email: { fontSize: 13, color: '#89978F' },
  verified: { width: 25, height: 25, borderRadius: 13, backgroundColor: '#00A86B', alignItems: 'center', justifyContent: 'center' },
  verifiedText: { color: '#06150D', fontWeight: '900' },
  chefButton: { backgroundColor: '#0B1E14', borderRadius: 24, padding: 18, marginTop: 14, borderWidth: 1, borderColor: 'rgba(255,159,10,0.26)', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  chefCopy: { flex: 1 },
  chefKicker: { color: '#FF9F0A', fontSize: 9, fontWeight: '900', letterSpacing: 1.7, marginBottom: 6 },
  chefButtonTitle: { color: '#FFFFFF', fontSize: 19, fontWeight: '800', marginBottom: 4 },
  chefButtonSub: { color: '#92A098', fontSize: 12 },
  chefArrow: { width: 42, height: 42, borderRadius: 21, backgroundColor: '#FF9F0A', alignItems: 'center', justifyContent: 'center', marginLeft: 12 },
  arrowText: { color: '#1A1205', fontSize: 19, fontWeight: '900' },
  sectionTitle: { fontSize: 12, fontWeight: '900', color: '#78867F', letterSpacing: 1.6, marginTop: 28, marginBottom: 10, marginLeft: 4 },
  settingsCard: { backgroundColor: 'rgba(15,31,23,0.94)', borderRadius: 22, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', overflow: 'hidden' },
  optionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 17, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.06)' },
  lastRow: { borderBottomWidth: 0 },
  optionTxt: { fontSize: 15, color: '#DDE5E0', fontWeight: '600' },
  arrow: { fontSize: 24, color: '#64736B' },
  logoutBtn: { marginTop: 22, paddingVertical: 15, alignItems: 'center' },
  logoutTxt: { color: '#FF7A6D', fontSize: 14, fontWeight: '800' },
});
