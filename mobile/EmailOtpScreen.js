import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, SafeAreaView, StatusBar, StyleSheet, Text, TextInput, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from './supabaseClient';

export default function EmailOtpScreen({ route, navigation }) {
  const { email, name = '' } = route.params || {};
  const [token, setToken] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  const verify = async () => {
    const cleanToken = token.replace(/\D/g, '');
    if (!email || cleanToken.length !== 6) {
      setError('Enter the 6-digit code from your email.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const { error: verifyError } = await supabase.auth.verifyOtp({ email, token: cleanToken, type: 'email' });
      if (verifyError) throw verifyError;
    } catch (e) {
      setError(e?.message || 'The code could not be verified.');
    } finally {
      setLoading(false);
    }
  };

  const resend = async () => {
    if (!email || resending) return;
    setResending(true);
    setError('');
    try {
      const { error: resendError } = await supabase.auth.signInWithOtp({
        email,
        options: { shouldCreateUser: true, data: name ? { name } : undefined },
      });
      if (resendError) throw resendError;
    } catch (e) {
      setError(e?.message || 'Unable to resend the code.');
    } finally {
      setResending(false);
    }
  };

  return (
    <SafeAreaView style={styles.screen}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <View style={styles.content}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={12}><Text style={styles.back}>‹</Text></Pressable>
        <Text style={styles.logo}><Text style={styles.logoBlack}>Chef</Text><Text style={styles.logoGreen}>Pulse</Text></Text>
        <Text style={styles.title}>Enter Email OTP</Text>
        <Text style={styles.subtitle}>We sent a 6-digit verification code to{`\n`}{email}</Text>
        <TextInput ref={inputRef} value={token} onChangeText={value => setToken(value.replace(/\D/g, '').slice(0, 6))} keyboardType="number-pad" maxLength={6} style={styles.otpInput} placeholder="000000" placeholderTextColor="#AAAAAA" textAlign="center" autoComplete="one-time-code" />
        {!!error && <Text style={styles.error}>{error}</Text>}
        <Pressable onPress={verify} disabled={loading} style={styles.button}>
          <LinearGradient colors={['#00C853', '#39FF14']} style={styles.gradient}>
            {loading ? <ActivityIndicator color="#000000" /> : <Text style={styles.buttonText}>Verify Code</Text>}
          </LinearGradient>
        </Pressable>
        <Pressable onPress={resend} disabled={resending} style={styles.resend}><Text style={styles.resendText}>{resending ? 'Sending…' : 'Resend Code'}</Text></Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#FFFFFF' }, content: { flex: 1, padding: 20 }, back: { color: '#000000', fontSize: 38, width: 28 },
  logo: { textAlign: 'center', fontSize: 22, fontWeight: '800', marginTop: 4 }, logoBlack: { color: '#000000' }, logoGreen: { color: '#00C853' },
  title: { color: '#000000', fontSize: 30, fontWeight: '800', marginTop: 70, textAlign: 'center' }, subtitle: { color: '#666666', fontSize: 15, lineHeight: 22, textAlign: 'center', marginTop: 10 },
  otpInput: { height: 64, marginTop: 30, borderWidth: 1.5, borderColor: '#00C853', borderRadius: 14, backgroundColor: '#F8F9F8', color: '#000000', fontSize: 28, fontWeight: '800', letterSpacing: 8 }, error: { color: '#D32F2F', fontSize: 13, lineHeight: 18, textAlign: 'center', marginTop: 12 },
  button: { marginTop: 24, borderRadius: 14, overflow: 'hidden' }, gradient: { minHeight: 54, alignItems: 'center', justifyContent: 'center' }, buttonText: { color: '#000000', fontSize: 16, fontWeight: '800' }, resend: { alignItems: 'center', paddingVertical: 18 }, resendText: { color: '#00C853', fontSize: 15, fontWeight: '800' },
});
