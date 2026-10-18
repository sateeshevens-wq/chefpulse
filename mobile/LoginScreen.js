import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TextInput, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from './supabaseClient';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    const cleanEmail = email.trim().toLowerCase();
    setError('');
    if (!/^\S+@\S+\.\S+$/.test(cleanEmail)) {
      setError('Please enter a valid email address.');
      return;
    }
    setLoading(true);
    try {
      const { error: otpError } = await supabase.auth.signInWithOtp({
        email: cleanEmail,
        options: { shouldCreateUser: false },
      });
      if (otpError) throw otpError;
      navigation.navigate('EmailOtp', { email: cleanEmail });
    } catch (e) {
      setError(e?.message || 'Unable to send the email OTP.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.screen}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <KeyboardAvoidingView style={styles.keyboard} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <View style={styles.header}><View style={styles.headerSpacer} /><Text style={styles.logo}><Text style={styles.logoBlack}>Chef</Text><Text style={styles.logoGreen}>Pulse</Text></Text><View style={styles.headerSpacer} /></View>
          <View style={styles.form}>
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.sub}>Sign in securely with a 6-digit email OTP.</Text>
            <Text style={styles.label}>Email</Text>
            <TextInput value={email} onChangeText={setEmail} placeholder="you@example.com" placeholderTextColor="#999999" style={styles.input} keyboardType="email-address" autoCapitalize="none" autoCorrect={false} />
            {!!error && <Text style={styles.error}>{error}</Text>}
            <Pressable onPress={handleLogin} disabled={loading} style={[styles.button, loading && styles.buttonDisabled]}>
              <LinearGradient colors={['#00C853', '#39FF14']} style={styles.gradient}><Text style={styles.buttonText}>{loading ? 'Sending OTP...' : 'Send Email OTP'}</Text></LinearGradient>
            </Pressable>
            <View style={styles.dividerRow}><View style={styles.divider} /><Text style={styles.or}>OR</Text><View style={styles.divider} /></View>
            <Pressable style={styles.outline} onPress={() => navigation.navigate('SignUp')}><Text style={styles.outlineText}>Create New Account</Text></Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#FFFFFF' }, keyboard: { flex: 1 }, scroll: { flexGrow: 1, paddingBottom: 30 },
  header: { height: 64, paddingHorizontal: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, headerSpacer: { width: 28 },
  logo: { fontSize: 22, fontWeight: '800' }, logoBlack: { color: '#000000' }, logoGreen: { color: '#00C853' }, form: { paddingHorizontal: 20, paddingTop: 58 },
  title: { color: '#000000', fontSize: 32, fontWeight: '800' }, sub: { color: '#666666', fontSize: 15, marginTop: 8, marginBottom: 34 }, label: { color: '#000000', fontSize: 14, fontWeight: '700', marginBottom: 8, marginTop: 18 },
  input: { minHeight: 54, backgroundColor: '#F5F5F5', borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 14, paddingHorizontal: 14, color: '#000000', fontSize: 15 },
  error: { color: '#D32F2F', fontSize: 13, marginTop: 12, lineHeight: 18 }, button: { marginTop: 26, borderRadius: 14, overflow: 'hidden' }, buttonDisabled: { opacity: 0.65 }, gradient: { minHeight: 54, alignItems: 'center', justifyContent: 'center' }, buttonText: { color: '#000000', fontSize: 16, fontWeight: '800' },
  dividerRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 24 }, divider: { flex: 1, height: 1, backgroundColor: '#E0E0E0' }, or: { color: '#666666', marginHorizontal: 12, fontSize: 12 }, outline: { minHeight: 54, borderRadius: 14, borderWidth: 1, borderColor: '#00C853', alignItems: 'center', justifyContent: 'center' }, outlineText: { color: '#00C853', fontSize: 16, fontWeight: '700' },
});
