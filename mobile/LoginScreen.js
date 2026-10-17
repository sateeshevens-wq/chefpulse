import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TextInput, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const COLORS = { charcoal: '#0B0F0A', primary: '#39FF14', lime: '#A8FF3F', white: '#FFFFFF', muted: '#9BA39A', input: '#121812', border: '#283028' };

export default function LoginScreen({ navigation }) {
  const [visible, setVisible] = useState(false);
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const login = () => navigation.replace('Home');
  return (
    <SafeAreaView style={styles.screen}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.charcoal} />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <View style={styles.header}><Pressable onPress={() => navigation.goBack()} hitSlop={12}><Text style={styles.back}>‹</Text></Pressable><Text style={styles.logo}><Text style={{ color: COLORS.white }}>Chef</Text><Text style={{ color: COLORS.primary }}>Pulse</Text></Text><View style={{ width: 28 }} /></View>
          <View style={styles.form}><Text style={styles.title}>Welcome Back</Text><Text style={styles.subtitle}>Login to continue your food journey</Text><Text style={styles.label}>Email or Phone Number</Text><View style={styles.inputWrap}><Text style={styles.icon}>@</Text><TextInput value={identifier} onChangeText={setIdentifier} placeholder="Email or Phone Number" placeholderTextColor="#6E776D" style={styles.input} autoCapitalize="none" keyboardType="email-address" /></View><Text style={styles.label}>Password</Text><View style={styles.inputWrap}><Text style={styles.icon}>⌑</Text><TextInput value={password} onChangeText={setPassword} placeholder="Password" placeholderTextColor="#6E776D" style={styles.input} secureTextEntry={!visible} /><Pressable onPress={() => setVisible((v) => !v)} hitSlop={12}><Text style={styles.eye}>{visible ? '◉' : '◌'}</Text></Pressable></View><Pressable onPress={login} style={styles.button}><LinearGradient colors={[COLORS.primary, COLORS.lime]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.gradient}><Text style={styles.buttonText}>Login</Text></LinearGradient></Pressable><Pressable style={styles.forgot}><Text style={styles.forgotText}>Forgot Password?</Text></Pressable><View style={styles.dividerRow}><View style={styles.divider} /><Text style={styles.or}>OR</Text><View style={styles.divider} /></View><Pressable style={styles.outline}><Text style={styles.outlineText}>Create New Account</Text></Pressable></View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({ screen: { flex: 1, backgroundColor: COLORS.charcoal }, scroll: { flexGrow: 1, paddingBottom: 24 }, header: { height: 64, paddingHorizontal: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, back: { color: COLORS.white, fontSize: 38, lineHeight: 38, width: 28 }, logo: { fontSize: 22, fontWeight: '800' }, form: { paddingHorizontal: 20, paddingTop: 42 }, title: { color: COLORS.white, fontSize: 32, fontWeight: '800' }, subtitle: { color: COLORS.muted, fontSize: 15, marginTop: 8, marginBottom: 34 }, label: { color: COLORS.white, fontSize: 14, fontWeight: '700', marginBottom: 8, marginTop: 18 }, inputWrap: { minHeight: 54, backgroundColor: COLORS.input, borderWidth: 1, borderColor: COLORS.border, borderRadius: 14, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14 }, icon: { color: COLORS.primary, fontSize: 18, width: 28 }, input: { flex: 1, color: COLORS.white, fontSize: 15 }, eye: { color: COLORS.muted, fontSize: 18 }, button: { marginTop: 26, borderRadius: 14, overflow: 'hidden' }, gradient: { minHeight: 54, alignItems: 'center', justifyContent: 'center' }, buttonText: { color: '#000', fontSize: 16, fontWeight: '800' }, forgot: { alignItems: 'center', paddingVertical: 18 }, forgotText: { color: COLORS.primary, fontWeight: '700' }, dividerRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 14 }, divider: { flex: 1, height: 1, backgroundColor: COLORS.border }, or: { color: COLORS.muted, marginHorizontal: 12, fontSize: 12 }, outline: { minHeight: 54, borderRadius: 14, borderWidth: 1, borderColor: COLORS.primary, alignItems: 'center', justifyContent: 'center' }, outlineText: { color: COLORS.primary, fontSize: 16, fontWeight: '700' }
});
