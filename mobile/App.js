import React, { useState } from 'react';
import {
  Alert,
  FlatList,
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
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import * as Location from 'expo-location';

const Stack = createNativeStackNavigator();

const COLORS = {
  charcoal: '#0B0F0A',
  primary: '#39FF14',
  lime: '#A8FF3F',
  bright: '#7CFF00',
  darkGreen: '#00C853',
  white: '#FFFFFF',
  muted: '#9BA39A',
  input: '#121812',
  border: '#283028',
};

function ChefPulseLogo({ compact = false }) {
  return (
    <View style={[styles.logoWrap, compact && styles.logoCompact]}>
      <View style={styles.clocheArea}>
        <View style={styles.speedLineOne} />
        <View style={styles.speedLineTwo} />
        <View style={styles.cloche}>
          <View style={styles.clocheKnob} />
        </View>
        <View style={styles.clocheBase} />
      </View>
      <Text style={[styles.logoText, compact && styles.logoTextCompact]}>
        <Text style={styles.logoChef}>Chef</Text>
        <Text style={styles.logoPulse}>Pulse</Text>
      </Text>
      {!compact && <Text style={styles.logoTagline}>Great Food. At Your Place.</Text>}
    </View>
  );
}

function PrimaryButton({ title, onPress, outline = false }) {
  if (outline) {
    return (
      <Pressable style={({ pressed }) => [styles.outlineButton, pressed && styles.pressed]} onPress={onPress}>
        <Text style={styles.outlineButtonText}>{title}</Text>
      </Pressable>
    );
  }

  return (
    <Pressable style={({ pressed }) => [pressed && styles.pressed]} onPress={onPress}>
      <LinearGradient
        colors={[COLORS.primary, COLORS.lime]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.primaryButton}
      >
        <Text style={styles.primaryButtonText}>{title}</Text>
      </LinearGradient>
    </Pressable>
  );
}

function SplashScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.screen}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.charcoal} />
      <View style={styles.splashContent}>
        <ChefPulseLogo />
        <Text style={styles.splashSubtitle}>Fresh Ingredients. Real Chefs. Home-Cooked Goodness.</Text>
      </View>

      <View style={styles.splashBottom}>
        <View style={styles.waveOne} />
        <View style={styles.waveTwo} />
        <PrimaryButton title="Get Started" onPress={() => navigation.navigate('Onboarding')} />
        <View style={styles.buttonGap} />
        <PrimaryButton title="Login" outline onPress={() => navigation.navigate('Login')} />
      </View>
    </SafeAreaView>
  );
}

const slides = [
  { key: '1', title: 'Authentic Home-Cooked Food Just for You', kind: 'home' },
  { key: '2', title: 'Trusted & Vetted Chefs', kind: 'chef' },
  { key: '3', title: 'Fresh Ingredients & Custom Menus', kind: 'fresh' },
];

function SlideArtwork({ kind }) {
  if (kind === 'chef') {
    return (
      <View style={styles.artCard}>
        <View style={styles.chefHead} />
        <View style={styles.chefBody} />
        <View style={styles.chefHat} />
        <View style={styles.verifiedBadge}><Text style={styles.verifiedCheck}>✓</Text><Text style={styles.verifiedText}>Verified</Text></View>
      </View>
    );
  }

  if (kind === 'fresh') {
    return (
      <View style={styles.artCard}>
        <View style={styles.plate}>
          <View style={styles.plateFood} />
          <View style={[styles.leaf, styles.leafOne]} />
          <View style={[styles.leaf, styles.leafTwo]} />
          <View style={[styles.leaf, styles.leafThree]} />
        </View>
        <View style={styles.ingredientDotOne} />
        <View style={styles.ingredientDotTwo} />
        <View style={styles.ingredientDotThree} />
      </View>
    );
  }

  return (
    <View style={styles.artCard}>
      <View style={styles.houseRoof} />
      <View style={styles.houseBody}>
        <View style={styles.houseWindow} />
        <View style={styles.houseDoor} />
      </View>
      <View style={styles.foodBowl}><View style={styles.foodSteamOne} /><View style={styles.foodSteamTwo} /></View>
    </View>
  );
}

function OnboardingScreen({ navigation }) {
  const [index, setIndex] = useState(0);

  const goNext = () => {
    if (index === slides.length - 1) {
      navigation.navigate('LocationPermission');
    } else {
      setIndex(index + 1);
    }
  };

  const goBack = () => {
    if (index === 0) navigation.goBack();
    else setIndex(index - 1);
  };

  return (
    <SafeAreaView style={styles.screen}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.charcoal} />
      <View style={styles.onboardingHeader}>
        <Pressable onPress={goBack} hitSlop={12}><Text style={styles.backArrow}>‹</Text></Pressable>
        <ChefPulseLogo compact />
        <View style={{ width: 28 }} />
      </View>

      <FlatList
        data={slides}
        horizontal
        pagingEnabled
        scrollEnabled
        showsHorizontalScrollIndicator={false}
        initialScrollIndex={0}
        getItemLayout={(_, itemIndex) => ({ length: 1, offset: 1 * itemIndex, index: itemIndex })}
        onMomentumScrollEnd={(event) => {
          const width = event.nativeEvent.layoutMeasurement.width;
          setIndex(Math.round(event.nativeEvent.contentOffset.x / width));
        }}
        keyExtractor={(item) => item.key}
        renderItem={({ item }) => (
          <View style={styles.slide}>
            <SlideArtwork kind={item.kind} />
            <Text style={styles.slideTitle}>{item.title}</Text>
          </View>
        )}
      />

      <View style={styles.onboardingBottom}>
        <View style={styles.pagination}>
          {slides.map((slide, i) => <View key={slide.key} style={[styles.dot, i === index ? styles.dotActive : styles.dotInactive]} />)}
        </View>
        <Pressable onPress={goNext} style={({ pressed }) => [styles.nextCircle, pressed && styles.pressed]}>
          <Text style={styles.nextArrow}>›</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

function LocationPermissionScreen({ navigation }) {
  const [loading, setLoading] = useState(false);

  const allowLocation = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Location not enabled', 'You can continue without location for now.');
      }
    } catch (_) {
      Alert.alert('Location unavailable', 'You can continue without location for now.');
    } finally {
      setLoading(false);
      navigation.navigate('Login');
    }
  };

  return (
    <SafeAreaView style={styles.screen}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.charcoal} />
      <View style={styles.locationContent}>
        <View style={styles.radar}>
          <View style={styles.radarRingLarge} />
          <View style={styles.radarRingMedium} />
          <View style={styles.radarRingSmall} />
          <View style={styles.locationPin}><Text style={styles.pinDot}>•</Text></View>
        </View>
        <Text style={styles.locationTitle}>Enable Location</Text>
        <Text style={styles.locationSubtitle}>Help us find the best chefs near you.</Text>
      </View>
      <View style={styles.locationBottom}>
        <PrimaryButton title={loading ? 'Requesting…' : 'Allow Location'} onPress={allowLocation} />
        <Pressable onPress={() => navigation.navigate('Login')} style={styles.notNowButton}>
          <Text style={styles.notNowText}>Not Now</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

function LoginScreen({ navigation }) {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');

  return (
    <SafeAreaView style={styles.screen}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.charcoal} />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.loginScroll} keyboardShouldPersistTaps="handled">
          <View style={styles.loginTopRow}>
            <Pressable onPress={() => navigation.goBack()} hitSlop={12}><Text style={styles.backArrow}>‹</Text></Pressable>
            <ChefPulseLogo compact />
            <View style={{ width: 28 }} />
          </View>

          <View style={styles.loginForm}>
            <Text style={styles.loginTitle}>Welcome Back</Text>
            <Text style={styles.loginSubtitle}>Login to continue your food journey</Text>

            <Text style={styles.fieldLabel}>Email or Phone Number</Text>
            <View style={styles.inputWrap}>
              <Text style={styles.inputIcon}>@</Text>
              <TextInput
                value={identifier}
                onChangeText={setIdentifier}
                placeholder="Email or Phone Number"
                placeholderTextColor="#6E776D"
                style={styles.input}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>

            <Text style={[styles.fieldLabel, { marginTop: 18 }]}>Password</Text>
            <View style={styles.inputWrap}>
              <Text style={styles.inputIcon}>⌑</Text>
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="Password"
                placeholderTextColor="#6E776D"
                style={styles.input}
                secureTextEntry={!passwordVisible}
              />
              <Pressable onPress={() => setPasswordVisible((value) => !value)} hitSlop={12}>
                <Text style={styles.eyeIcon}>{passwordVisible ? '◉' : '◌'}</Text>
              </Pressable>
            </View>

            <View style={styles.loginButtonSpacing}>
              <PrimaryButton title="Login" onPress={() => {}} />
            </View>

            <Pressable style={styles.forgotButton}>
              <Text style={styles.forgotText}>Forgot Password?</Text>
            </Pressable>

            <View style={styles.dividerRow}>
              <View style={styles.divider} />
              <Text style={styles.orText}>OR</Text>
              <View style={styles.divider} />
            </View>

            <PrimaryButton title="Create New Account" outline onPress={() => {}} />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false, contentStyle: { backgroundColor: COLORS.charcoal } }}>
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        <Stack.Screen name="LocationPermission" component={LocationPermissionScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.charcoal },
  pressed: { opacity: 0.78 },
  logoWrap: { alignItems: 'center', justifyContent: 'center' },
  logoCompact: { flexDirection: 'row' },
  clocheArea: { width: 74, height: 58, alignItems: 'center', justifyContent: 'flex-end', marginBottom: 4 },
  speedLineOne: { position: 'absolute', left: 2, top: 18, width: 17, height: 3, borderRadius: 3, backgroundColor: COLORS.primary, transform: [{ rotate: '-12deg' }] },
  speedLineTwo: { position: 'absolute', left: 9, top: 30, width: 12, height: 3, borderRadius: 3, backgroundColor: COLORS.lime, transform: [{ rotate: '-12deg' }] },
  cloche: { width: 46, height: 32, borderTopLeftRadius: 46, borderTopRightRadius: 46, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'flex-start' },
  clocheKnob: { width: 10, height: 6, borderRadius: 6, backgroundColor: COLORS.primary, marginTop: -3 },
  clocheBase: { width: 54, height: 6, borderRadius: 6, backgroundColor: COLORS.lime, marginTop: -2 },
  logoText: { fontSize: 38, fontWeight: '800', letterSpacing: -1.5 },
  logoTextCompact: { fontSize: 22, letterSpacing: -0.7 },
  logoChef: { color: COLORS.white },
  logoPulse: { color: COLORS.primary },
  logoTagline: { color: COLORS.white, fontSize: 13, marginTop: 7, letterSpacing: 0.2 },
  splashContent: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 28, paddingTop: 20 },
  splashSubtitle: { color: COLORS.white, textAlign: 'center', fontSize: 15, lineHeight: 22, marginTop: 18, maxWidth: 310 },
  splashBottom: { paddingHorizontal: 20, paddingBottom: 18, position: 'relative' },
  buttonGap: { height: 12 },
  primaryButton: { minHeight: 54, borderRadius: 14, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 18 },
  primaryButtonText: { color: '#000000', fontSize: 16, fontWeight: '800' },
  outlineButton: { minHeight: 54, borderRadius: 14, borderWidth: 1, borderColor: COLORS.white, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 18, backgroundColor: COLORS.charcoal },
  outlineButtonText: { color: COLORS.white, fontSize: 16, fontWeight: '700' },
  waveOne: { position: 'absolute', left: -30, bottom: 116, width: 180, height: 70, borderTopWidth: 2, borderColor: COLORS.darkGreen, borderRadius: 100, transform: [{ rotate: '-10deg' }], opacity: 0.55 },
  waveTwo: { position: 'absolute', left: -50, bottom: 98, width: 220, height: 70, borderTopWidth: 2, borderColor: COLORS.primary, borderRadius: 100, transform: [{ rotate: '-10deg' }], opacity: 0.28 },
  onboardingHeader: { height: 64, paddingHorizontal: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  loginTopRow: { height: 64, paddingHorizontal: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  backArrow: { color: COLORS.white, fontSize: 38, lineHeight: 38, fontWeight: '300', width: 28 },
  slide: { width: 360, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 },
  artCard: { width: 300, height: 320, borderRadius: 28, backgroundColor: '#121A12', borderWidth: 1, borderColor: '#203020', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  slideTitle: { color: COLORS.white, fontSize: 26, lineHeight: 33, fontWeight: '800', textAlign: 'center', marginTop: 28 },
  chefHead: { width: 76, height: 76, borderRadius: 38, backgroundColor: '#D8B08A', marginTop: 42 },
  chefBody: { width: 140, height: 120, borderTopLeftRadius: 48, borderTopRightRadius: 48, backgroundColor: COLORS.white, marginTop: 10 },
  chefHat: { position: 'absolute', top: 70, width: 98, height: 46, borderRadius: 28, backgroundColor: COLORS.white, borderBottomWidth: 4, borderBottomColor: '#D7D7D7' },
  verifiedBadge: { position: 'absolute', top: 24, right: 18, backgroundColor: COLORS.darkGreen, borderRadius: 18, paddingHorizontal: 11, paddingVertical: 8, flexDirection: 'row', alignItems: 'center' },
  verifiedCheck: { color: COLORS.white, fontWeight: '900', marginRight: 5 },
  verifiedText: { color: COLORS.white, fontWeight: '800', fontSize: 12 },
  plate: { width: 190, height: 190, borderRadius: 95, borderWidth: 10, borderColor: '#D7E2D2', alignItems: 'center', justifyContent: 'center' },
  plateFood: { width: 112, height: 112, borderRadius: 56, backgroundColor: '#6F9F4E' },
  leaf: { position: 'absolute', width: 36, height: 18, borderRadius: 18, backgroundColor: COLORS.lime },
  leafOne: { top: 42, right: 22, transform: [{ rotate: '24deg' }] },
  leafTwo: { bottom: 50, left: 22, transform: [{ rotate: '-30deg' }] },
  leafThree: { top: 86, left: 6, transform: [{ rotate: '50deg' }] },
  ingredientDotOne: { position: 'absolute', width: 14, height: 14, borderRadius: 7, backgroundColor: '#FF8A3D', top: 58, left: 48 },
  ingredientDotTwo: { position: 'absolute', width: 11, height: 11, borderRadius: 6, backgroundColor: '#E84B4B', bottom: 60, right: 56 },
  ingredientDotThree: { position: 'absolute', width: 16, height: 16, borderRadius: 8, backgroundColor: COLORS.primary, top: 122, right: 42 },
  houseRoof: { width: 190, height: 100, backgroundColor: COLORS.darkGreen, transform: [{ rotate: '45deg' }], position: 'absolute', top: 40 },
  houseBody: { width: 180, height: 150, backgroundColor: '#D8E2D4', marginTop: 55, alignItems: 'center', justifyContent: 'center' },
  houseWindow: { width: 55, height: 55, backgroundColor: '#8ED7E7', borderWidth: 7, borderColor: '#354535', position: 'absolute', left: 18, top: 24 },
  houseDoor: { width: 46, height: 82, backgroundColor: '#6E513D', position: 'absolute', right: 20, bottom: 0 },
  foodBowl: { position: 'absolute', bottom: 22, width: 90, height: 34, borderBottomLeftRadius: 45, borderBottomRightRadius: 45, backgroundColor: '#F2F2E8', alignItems: 'center' },
  foodSteamOne: { width: 4, height: 28, borderRadius: 4, backgroundColor: COLORS.white, position: 'absolute', top: -25, left: 30, opacity: 0.65 },
  foodSteamTwo: { width: 4, height: 22, borderRadius: 4, backgroundColor: COLORS.white, position: 'absolute', top: -20, right: 30, opacity: 0.55 },
  onboardingBottom: { height: 92, paddingHorizontal: 22, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  pagination: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  dot: { height: 7, borderRadius: 7 },
  dotActive: { width: 28, backgroundColor: COLORS.bright },
  dotInactive: { width: 7, backgroundColor: '#3A4039' },
  nextCircle: { width: 56, height: 56, borderRadius: 28, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center' },
  nextArrow: { color: '#000000', fontSize: 35, lineHeight: 36, marginTop: -4 },
  locationContent: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 28 },
  radar: { width: 250, height: 250, alignItems: 'center', justifyContent: 'center', marginBottom: 28 },
  radarRingLarge: { position: 'absolute', width: 238, height: 238, borderRadius: 119, borderWidth: 1, borderColor: 'rgba(57,255,20,0.12)' },
  radarRingMedium: { position: 'absolute', width: 178, height: 178, borderRadius: 89, borderWidth: 1, borderColor: 'rgba(57,255,20,0.25)' },
  radarRingSmall: { position: 'absolute', width: 116, height: 116, borderRadius: 58, borderWidth: 1, borderColor: 'rgba(57,255,20,0.45)' },
  locationPin: { width: 66, height: 82, borderRadius: 36, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center', transform: [{ rotate: '45deg' }] },
  pinDot: { color: '#0B0F0A', fontSize: 54, lineHeight: 54, transform: [{ rotate: '-45deg' }], marginTop: -10 },
  locationTitle: { color: COLORS.white, fontSize: 30, fontWeight: '800', marginBottom: 10 },
  locationSubtitle: { color: COLORS.muted, fontSize: 16, textAlign: 'center' },
  locationBottom: { paddingHorizontal: 20, paddingBottom: 20 },
  notNowButton: { alignItems: 'center', paddingVertical: 18 },
  notNowText: { color: COLORS.white, fontSize: 15, fontWeight: '700' },
  loginScroll: { flexGrow: 1, paddingBottom: 28 },
  loginForm: { paddingHorizontal: 22, paddingTop: 26 },
  loginTitle: { color: COLORS.white, fontSize: 32, fontWeight: '800' },
  loginSubtitle: { color: COLORS.muted, fontSize: 15, marginTop: 7, marginBottom: 30 },
  fieldLabel: { color: COLORS.white, fontSize: 13, fontWeight: '700', marginBottom: 8 },
  inputWrap: { minHeight: 56, borderRadius: 13, borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.input, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14 },
  inputIcon: { color: COLORS.primary, fontSize: 19, width: 28, textAlign: 'center' },
  input: { flex: 1, color: COLORS.white, fontSize: 15, paddingVertical: 12 },
  eyeIcon: { color: COLORS.muted, fontSize: 19, paddingLeft: 8 },
  loginButtonSpacing: { marginTop: 26 },
  forgotButton: { alignItems: 'center', paddingVertical: 17 },
  forgotText: { color: COLORS.primary, fontWeight: '700', fontSize: 14 },
  dividerRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 10 },
  divider: { flex: 1, height: 1, backgroundColor: COLORS.border },
  orText: { color: COLORS.muted, fontSize: 12, marginHorizontal: 12, fontWeight: '700' },
});
