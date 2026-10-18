import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, StatusBar } from 'react-native';
import { supabase } from './supabaseClient';

export default function ProfileScreen({ navigation }) {
  const options = ['Edit Profile', 'Payment Methods', 'Saved Addresses', 'Help & Support', 'Terms of Service'];
  const [isChef, setIsChef] = useState(false);
  const [chefLoading, setChefLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const loadChefStatus = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await supabase
          .from('chefs')
          .select('id')
          .eq('user_id', user.id)
          .maybeSingle();

        if (!error && mounted) setIsChef(!!data);
      } finally {
        if (mounted) setChefLoading(false);
      }
    };

    loadChefStatus();
    return () => { mounted = false; };
  }, []);

  const handleChefPortal = () => {
    navigation.navigate(isChef ? 'ChefDashboard' : 'ChefRegistration');
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <View style={styles.header}><Text style={styles.title}>Profile</Text></View>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.userCard}>
          <View style={styles.avatar}><Text style={styles.avatarTxt}>JD</Text></View>
          <View><Text style={styles.name}>John Doe</Text><Text style={styles.phone}>+91 98765 43210</Text></View>
        </View>

        {!chefLoading && (
          <TouchableOpacity style={styles.chefButton} onPress={handleChefPortal} activeOpacity={0.85}>
            <View>
              <Text style={styles.chefButtonTitle}>{isChef ? 'Chef Dashboard' : 'Become a Chef'}</Text>
              <Text style={styles.chefButtonSub}>
                {isChef ? 'Manage your availability' : 'List your services on ChefPulse'}
              </Text>
            </View>
            <Text style={styles.chefArrow}>›</Text>
          </TouchableOpacity>
        )}

        <Text style={styles.sectionTitle}>Settings</Text>
        {options.map((opt, i) => (
          <TouchableOpacity key={i} style={styles.optionRow}>
            <Text style={styles.optionTxt}>{opt}</Text>
            <Text style={styles.arrow}>›</Text>
          </TouchableOpacity>
        ))}
        <TouchableOpacity style={styles.logoutBtn}><Text style={styles.logoutTxt}>Log Out</Text></TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: { padding: 20, borderBottomWidth: 1, borderBottomColor: '#EEEEEE' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#000000' },
  content: { padding: 20 },
  userCard: { flexDirection: 'row', alignItems: 'center', marginBottom: 20, padding: 15, backgroundColor: '#F8F9F8', borderRadius: 16, borderWidth: 1, borderColor: '#EEEEEE' },
  avatar: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#E0F2F1', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  avatarTxt: { fontSize: 24, fontWeight: 'bold', color: '#00C853' },
  name: { fontSize: 18, fontWeight: 'bold', color: '#000000', marginBottom: 4 },
  phone: { fontSize: 14, color: '#666666' },
  chefButton: { backgroundColor: '#00C853', borderRadius: 16, padding: 18, marginBottom: 30, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  chefButtonTitle: { color: '#FFFFFF', fontSize: 18, fontWeight: '800', marginBottom: 4 },
  chefButtonSub: { color: '#FFFFFF', fontSize: 13, opacity: 0.9 },
  chefArrow: { color: '#FFFFFF', fontSize: 30 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#000000', marginBottom: 15 },
  optionRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#EEEEEE' },
  optionTxt: { fontSize: 16, color: '#333333' },
  arrow: { fontSize: 20, color: '#999999' },
  logoutBtn: { marginTop: 30, paddingVertical: 15, alignItems: 'center' },
  logoutTxt: { color: '#FF3B30', fontSize: 16, fontWeight: 'bold' }
});
