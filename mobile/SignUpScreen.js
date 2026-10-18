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

export default function SignUpScreen({ navigation }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [visible, setVisible] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignUp = async () => {
    setError('');
    setMessage('');

    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanName || !cleanEmail || !password) {
      setError('Please fill in all fields.');
      return;
    }

    if (!/^\S+@\S+\.\S+$/.test(cleanEmail)) {
      setError('Please enter a valid email address.');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    setLoading(true);

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: cleanEmail,
        password,
        options: {
          data: {
            name: cleanName,
          },
        },
      });

      if (signUpError) throw signUpError;

      if (data.session) {
        setMessage('Account created successfully.');
      } else {
        setMessage('Account created. Check your email to verify your account, then log in.');
      }
    } catch (e) {
      setError(e?.message || 'Unable to create your account. Please try again.');
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
            <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
              <Text style={styles.back}>‹</Text>
            </Pressable>
            <Text style={styles.logo}>
              <Text style={styles.logoWhite}>Chef</Text>
              <Text style={styles.logoGreen}>Pulse</Text>
            </Text>
            <View style={styles.headerSpacer} />
          </View>

          <View style={styles.form}>
            <Text style={styles.title}>Create Your Account</Text>
            <Text style={styles.sub}>Join ChefPulse for great food at your place.</Text>

            <Text style={styles.label}>Name</Text>
            <TextInput value={name} onChangeText={setName} placeholder="Your full name" placeholderTextColor="#999999" style={styles.input} autoCapitalize="words" />

            <Text style={styles.label}>Email</Text>
            <TextInput value={email} onChangeText={setEmail} placeholder="you@example.com" placeholderTextColor="#999999" style={styles.input} keyboardType="email-address" autoCapitalize="none" autoCorrect={false} />

            <Text style={styles.label}>Password</Text>
            <View style={styles.passwordWrap}>
              <TextInput value={password} onChangeText={setPassword} placeholder="Minimum 8 characters" placeholderTextColor="#999999" style={styles.passwordInput} secureTextEntry={!visible} autoCapitalize="none" autoCorrect={false} />
              <Pressable onPress={() => setVisible(v => !v)} hitSlop={10}>
                <Text style={styles.eye}>{visible ? 'Hide' : 'Show'}</Text>
              </Pressable>
            </View>

            {!!error && <Text style={styles.error}>{error}</Text>}
            {!!message && <Text style={styles.message}>{message}</Text>}

            <Pressable onPress={handleSignUp} disabled={loading} style={[styles.button, loading && styles.buttonDisabled]}>
              <LinearGradient colors={[C.g, C.lime]} style={styles.gradient}>
                <Text style={styles.buttonText}>{loading ? 'Creating Account...' : 'Create Account'}</Text>
              </LinearGradient>
            </Pressable>

            <View style={styles.loginRow}>
              <Text style={styles.loginPrompt}>Already have an account? </Text>
              <Pressable onPress={() => navigation.replace('Login')}>
                <Text style={styles.loginLink}>Login</Text>
              </Pressable>
            </View>
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
  header: { height: 64, paddingHorizontal: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  back: { color: C.black, fontSize: 38, width: 28 },
  logo: { fontSize: 22, fontWeight: '800' },
  logoWhite: { color: C.black },
  logoGreen: { color: C.g },
  headerSpacer: { width: 28 },
  form: { paddingHorizontal: 20, paddingTop: 28 },
  title: { color: C.black, fontSize: 30, fontWeight: '800' },
  sub: { color: C.muted, fontSize: 15, marginTop: 8, marginBottom: 22 },
  label: { color: C.black, fontSize: 14, fontWeight: '700', marginBottom: 8, marginTop: 14 },
  input: { minHeight: 54, backgroundColor: C.input, borderWidth: 1, borderColor: C.border, borderRadius: 14, paddingHorizontal: 14, color: C.black, fontSize: 15 },
  passwordWrap: { minHeight: 54, backgroundColor: C.input, borderWidth: 1, borderColor: C.border, borderRadius: 14, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14 },
  passwordInput: { flex: 1, color: C.black, fontSize: 15 },
  eye: { color: C.g, fontSize: 14, fontWeight: '700' },
  error: { color: C.error, fontSize: 13, marginTop: 12, lineHeight: 18 },
  message: { color: C.g, fontSize: 13, marginTop: 12, lineHeight: 18, fontWeight: '600' },
  button: { marginTop: 24, borderRadius: 14, overflow: 'hidden' },
  buttonDisabled: { opacity: 0.65 },
  gradient: { minHeight: 54, alignItems: 'center', justifyContent: 'center' },
  buttonText: { color: C.black, fontSize: 16, fontWeight: '800' },
  loginRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 24 },
  loginPrompt: { color: C.muted, fontSize: 14 },
  loginLink: { color: C.g, fontSize: 14, fontWeight: '800' },
});
