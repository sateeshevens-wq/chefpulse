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
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <View style={styles.header}><Text style={styles.title}>Profile</Text></View>
      {loading ? <View style={styles.center}><ActivityIndicator size="large" color="#00C853" /></View> : (
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {!!error && <Text style={styles.error}>{error}</Text>}
          <View style={styles.userCard}>
            <View style={styles.avatar}><Text style={styles.avatarTxt}>{initials}</Text></View>
            <View style={styles.userText}><Text style={styles.name}>{displayName}</Text><Text style={styles.email}>{user?.email || 'No email'}</Text></View>
          </View>
          <TouchableOpacity style={styles.chefButton} onPress={handleChefPortal} activeOpacity={0.85}>
            <View><Text style={styles.chefButtonTitle}>{isChef ? 'Chef Dashboard' : 'Become a Chef'}</Text><Text style={styles.chefButtonSub}>{isChef ? 'Manage your availability' : 'List your services on ChefPulse'}</Text></View><Text style={styles.chefArrow}>›</Text>
          </TouchableOpacity>
          <Text style={styles.sectionTitle}>Settings</Text>
          {options.map((opt, i) => <TouchableOpacity key={i} style={styles.optionRow}><Text style={styles.optionTxt}>{opt}</Text><Text style={styles.arrow}>›</Text></TouchableOpacity>)}
          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}><Text style={styles.logoutTxt}>Log Out</Text></TouchableOpacity>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' }, header: { padding: 20, borderBottomWidth: 1, borderBottomColor: '#EEEEEE' }, title: { fontSize: 24, fontWeight: 'bold', color: '#000000' }, center: { flex: 1, alignItems: 'center', justifyContent: 'center' }, content: { padding: 20 }, error: { color: '#D32F2F', marginBottom: 12 }, userCard: { flexDirection: 'row', alignItems: 'center', marginBottom: 20, padding: 15, backgroundColor: '#F8F9F8', borderRadius: 16, borderWidth: 1, borderColor: '#EEEEEE' }, avatar: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#E0F2F1', justifyContent: 'center', alignItems: 'center', marginRight: 15 }, avatarTxt: { fontSize: 24, fontWeight: 'bold', color: '#00C853' }, userText: { flex: 1 }, name: { fontSize: 18, fontWeight: 'bold', color: '#000000', marginBottom: 4 }, email: { fontSize: 14, color: '#666666' }, chefButton: { backgroundColor: '#00C853', borderRadius: 16, padding: 18, marginBottom: 30, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, chefButtonTitle: { color: '#FFFFFF', fontSize: 18, fontWeight: '800', marginBottom: 4 }, chefButtonSub: { color: '#FFFFFF', fontSize: 13, opacity: 0.9 }, chefArrow: { color: '#FFFFFF', fontSize: 30 }, sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#000000', marginBottom: 15 }, optionRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#EEEEEE' }, optionTxt: { fontSize: 16, color: '#333333' }, arrow: { fontSize: 20, color: '#999999' }, logoutBtn: { marginTop: 30, paddingVertical: 15, alignItems: 'center' }, logoutTxt: { color: '#FF3B30', fontSize: 16, fontWeight: 'bold' }
});
