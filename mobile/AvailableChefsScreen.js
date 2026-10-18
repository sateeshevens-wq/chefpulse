import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, FlatList, ActivityIndicator, StatusBar } from 'react-native';
import { supabase } from './supabaseClient';

export default function AvailableChefsScreen({ navigation }) {
  const [chefs, setChefs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadChefs = useCallback(async () => {
    setLoading(true);
    setError('');

    const { data, error: fetchError } = await supabase
      .from('chefs')
      .select('id, name, specialty, hourly_rate, rating')
      .eq('is_online', true);

    if (fetchError) {
      setChefs([]);
      setError('Unable to load chefs right now. Please try again.');
    } else {
      setChefs(data || []);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    loadChefs();
  }, [loadChefs]);

  const renderChef = ({ item }) => {
    const initials = (item.name || 'Chef')
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map(part => part[0].toUpperCase())
      .join('');

    return (
      <View style={styles.card}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials || 'C'}</Text>
        </View>
        <View style={styles.info}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.rating}>⭐ {Number(item.rating || 0).toFixed(1)}</Text>
          <Text style={styles.tags}>{item.specialty || 'Chef'}</Text>
          <Text style={styles.price}>₹{Number(item.hourly_rate || 0).toLocaleString('en-IN')} / hr</Text>
        </View>
        <TouchableOpacity style={styles.acceptBtn} onPress={() => navigation.navigate('ChefDetails', { chefId: item.id })}>
          <Text style={styles.acceptText}>Book</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderContent = () => {
    if (loading) {
      return (
        <View style={styles.stateContainer}>
          <ActivityIndicator size="large" color="#00C853" />
          <Text style={styles.stateText}>Finding chefs who are online...</Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.stateContainer}>
          <Text style={styles.stateText}>{error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={loadChefs}>
            <Text style={styles.retryText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (chefs.length === 0) {
      return (
        <View style={styles.stateContainer}>
          <Text style={styles.emptyTitle}>No chefs are currently online in your area</Text>
          <Text style={styles.stateText}>Please check again shortly.</Text>
        </View>
      );
    }

    return (
      <FlatList
        data={chefs}
        renderItem={renderChef}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshing={loading}
        onRefresh={loadChefs}
      />
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}><Text style={styles.back}>‹</Text></TouchableOpacity>
        <View style={styles.headerText}>
          <Text style={styles.title}>{chefs.length > 0 ? `${chefs.length} chefs available` : 'Available chefs'}</Text>
          <Text style={styles.sub}>📍 Online now</Text>
        </View>
        <View style={{width: 30}}/>
      </View>
      {renderContent()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 10, paddingBottom: 15, borderBottomWidth: 1, borderBottomColor: '#EEEEEE' },
  backBtn: { padding: 5 },
  back: { fontSize: 32, color: '#000000', marginTop: -5 },
  headerText: { alignItems: 'center' },
  title: { fontSize: 16, fontWeight: 'bold', color: '#000000' },
  sub: { fontSize: 12, color: '#666666', marginTop: 2 },
  list: { padding: 20 },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 16, padding: 15, marginBottom: 15, borderWidth: 1, borderColor: '#EEEEEE', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3 },
  avatar: { width: 60, height: 60, borderRadius: 30, marginRight: 15, backgroundColor: '#E0F2F1', justifyContent: 'center', alignItems: 'center' },
  avatarText: { fontSize: 20, fontWeight: 'bold', color: '#00C853' },
  info: { flex: 1 },
  name: { fontSize: 16, fontWeight: 'bold', color: '#000000', marginBottom: 4 },
  rating: { fontSize: 12, color: '#666666', marginBottom: 2 },
  tags: { fontSize: 12, color: '#666666', marginBottom: 4 },
  price: { fontSize: 14, fontWeight: 'bold', color: '#00C853' },
  acceptBtn: { backgroundColor: '#00C853', paddingVertical: 8, paddingHorizontal: 20, borderRadius: 25 },
  acceptText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 14 },
  stateContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 30 },
  stateText: { marginTop: 12, fontSize: 14, color: '#666666', textAlign: 'center' },
  emptyTitle: { fontSize: 18, fontWeight: 'bold', color: '#000000', textAlign: 'center' },
  retryBtn: { marginTop: 18, backgroundColor: '#00C853', paddingVertical: 10, paddingHorizontal: 22, borderRadius: 25 },
  retryText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 14 }
});