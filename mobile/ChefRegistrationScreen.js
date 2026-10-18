import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from './supabaseClient';

const C = {
  bg: '#FFFFFF',
  g: '#00C853',
  lime: '#39FF14',
  black: '#000000',
  muted: '#666666',
  input: '#F5F5F5',
  border: '#E0E0E0',
  error: '#D32F2F',
};

export default function ChefRegistrationScreen({ navigation }) {
  const [specialty, setSpecialty] = useState('');
  const [hourlyRate, setHourlyRate] = useState('');
  const [bio, setBio] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    setError('');

    const cleanSpecialty = specialty.trim();
    const cleanRate = hourlyRate.trim();
    const cleanBio = bio.trim();
    const rate = Number(cleanRate);

    if (!cleanSpecialty || !cleanRate || !cleanBio) {
      setError('Please fill in all fields.');
      return;
    }

    if (!Number.isFinite(rate) || rate < 0) {
      setError('Please enter a valid hourly rate.');
      return;
    }

    setLoading(true);

    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user) throw new Error('You must be logged in to register as a chef.');

      const name = user.user_metadata?.name?.trim() || user.email?.split('@')[0] || 'ChefPulse Chef';

      const { error: insertError } = await supabase.from('chefs').insert({
        id: user.id,
        user_id: user.id,
        name,
        specialty: cleanSpecialty,
        hourly_rate: rate,
        bio: cleanBio,
        rating: 0,
        is_online: false,
        background_verified: false,
      });

      if (insertError) {
        if (insertError.code === '23505') {
          setError('You are already registered as a chef.');
          return;
        }
        throw insertError;
      }

      navigation.replace('ChefDashboard');
    } catch (e) {
      setError(e?.message || 'Unable to register as a chef. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.screen}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <KeyboardAvoidingView style={styles.keyboard} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
              <Text style={styles.back}>‹</Text>
            </Pressable>
            <Text style={styles.headerTitle}>Become a Chef</Text>
            <View style={styles.headerSpacer} />
          </View>

          <View style={styles.form}>
            <Text style={styles.title}>Create Your Chef Profile</Text>
            <Text style={styles.sub}>Tell customers what you cook and what you charge.</Text>

            <Text style={styles.label}>Specialty</Text>
            <TextInput
              value={specialty}
              onChangeText={setSpecialty}
              placeholder="e.g. South Indian, Italian"
              placeholderTextColor="#999999"
              style={styles.input}
              autoCapitalize="sentences"
            />

            <Text style={styles.label}>Hourly Rate</Text>
            <TextInput
              value={hourlyRate}
              onChangeText={setHourlyRate}
              placeholder="e.g. 750"
              placeholderTextColor="#999999"
              style={styles.input}
              keyboardType="numeric"
            />

            <Text style={styles.label}>Bio</Text>
            <TextInput
              value={bio}
              onChangeText={setBio}
              placeholder="Tell customers about your cooking experience..."
              placeholderTextColor="#999999"
              style={[styles.input, styles.bioInput]}
              multiline
              textAlignVertical="top"
              maxLength={300}
            />

            {!!error && <Text style={styles.error}>{error}</Text>}

            <Pressable onPress={handleRegister} disabled={loading} style={[styles.button, loading && styles.buttonDisabled]}>
              <LinearGradient colors={[C.g, C.lime]} style={styles.gradient}>
                <Text style={styles.buttonText}>{loading ? 'Creating Profile...' : 'Register as Chef'}</Text>
              </LinearGradient>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bg },
  keyboard: { flex: 1 },
  scroll: { flexGrow: 1, paddingBottom: 30 },
  header: { height: 64, paddingHorizontal: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: '#EEEEEE' },
  back: { color: C.black, fontSize: 38, width: 28 },
  headerTitle: { color: C.black, fontSize: 20, fontWeight: '800' },
  headerSpacer: { width: 28 },
  form: { paddingHorizontal: 20, paddingTop: 28 },
  title: { color: C.black, fontSize: 28, fontWeight: '800' },
  sub: { color: C.muted, fontSize: 15, marginTop: 8, marginBottom: 22, lineHeight: 21 },
  label: { color: C.black, fontSize: 14, fontWeight: '700', marginBottom: 8, marginTop: 14 },
  input: { minHeight: 54, backgroundColor: C.input, borderWidth: 1, borderColor: C.border, borderRadius: 14, paddingHorizontal: 14, color: C.black, fontSize: 15 },
  bioInput: { minHeight: 130, paddingTop: 14 },
  error: { color: C.error, fontSize: 13, marginTop: 12, lineHeight: 18 },
  button: { marginTop: 24, borderRadius: 14, overflow: 'hidden' },
  buttonDisabled: { opacity: 0.65 },
  gradient: { minHeight: 54, alignItems: 'center', justifyContent: 'center' },
  buttonText: { color: C.black, fontSize: 16, fontWeight: '800' },
});
