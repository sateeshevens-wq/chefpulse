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

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [visible, setVisible] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setError('');

    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail || !password) {
      setError('Please enter your email and password.');
      return;
    }

    if (!/^\S+@\S+\.\S+$/.test(cleanEmail)) {
      setError('Please enter a valid email address.');
      return;
    }

    setLoading(true);

    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });

      if (signInError) throw signInError;
    } catch (e) {
      setError(e?.message || 'Unable to log in. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.screen}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <KeyboardAvoidingView
        style={styles.keyboard}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <View style={styles.headerSpacer} />
            <Text style={styles.logo}>
              <Text style={styles.logoWhite}>Chef</Text>
              <Text style={styles.logoGreen}>Pulse</Text>
            </Text>
            <View style={styles.headerSpacer} />
          </View>

          <View style={styles.form}>
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.sub}>Login to continue your food journey</Text>

            <Text style={styles.label}>Email</Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="you@example.com"
              placeholderTextColor="#999999"
              style={styles.input}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />

            <Text style={styles.label}>Password</Text>
            <View style={styles.passwordWrap}>
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="Password"
                placeholderTextColor="#999999"
                style={styles.passwordInput}
                secureTextEntry={!visible}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <Pressable onPress={() => setVisible(v => !v)} hitSlop={10}>
                <Text style={styles.eye}>{visible ? 'Hide' : 'Show'}</Text>
              </Pressable>
            </View>

            {!!error && <Text style={styles.error}>{error}</Text>}

            <Pressable
              onPress={handleLogin}
              disabled={loading}
              style={[styles.button, loading && styles.buttonDisabled]}
            >
              <LinearGradient colors={[C.g, C.lime]} style={styles.gradient}>
                <Text style={styles.buttonText}>{loading ? 'Logging In...' : 'Login'}</Text>
              </LinearGradient>
            </Pressable>

            <View style={styles.dividerRow}>
              <View style={styles.divider} />
              <Text style={styles.or}>OR</Text>
              <View style={styles.divider} />
            </View>

            <Pressable style={styles.outline} onPress={() => navigation.navigate('SignUp')}>
              <Text style={styles.outlineText}>Create New Account</Text>
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
  header: {
    height: 64,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerSpacer: { width: 28 },
  logo: { fontSize: 22, fontWeight: '800' },
  logoWhite: { color: C.black },
  logoGreen: { color: C.g },
  form: { paddingHorizontal: 20, paddingTop: 58 },
  title: { color: C.black, fontSize: 32, fontWeight: '800' },
  sub: { color: C.muted, fontSize: 15, marginTop: 8, marginBottom: 34 },
  label: { color: C.black, fontSize: 14, fontWeight: '700', marginBottom: 8, marginTop: 18 },
  input: {
    minHeight: 54,
    backgroundColor: C.input,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 14,
    paddingHorizontal: 14,
    color: C.black,
    fontSize: 15,
  },
  passwordWrap: {
    minHeight: 54,
    backgroundColor: C.input,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
  },
  passwordInput: { flex: 1, color: C.black, fontSize: 15 },
  eye: { color: C.g, fontSize: 14, fontWeight: '700' },
  error: { color: C.error, fontSize: 13, marginTop: 12, lineHeight: 18 },
  button: { marginTop: 26, borderRadius: 14, overflow: 'hidden' },
  buttonDisabled: { opacity: 0.65 },
  gradient: { minHeight: 54, alignItems: 'center', justifyContent: 'center' },
  buttonText: { color: C.black, fontSize: 16, fontWeight: '800' },
  dividerRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 24 },
  divider: { flex: 1, height: 1, backgroundColor: C.border },
  or: { color: C.muted, marginHorizontal: 12, fontSize: 12 },
  outline: {
    minHeight: 54,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.g,
    alignItems: 'center',
    justifyContent: 'center',
  },
  outlineText: { color: C.g, fontSize: 16, fontWeight: '700' },
});
