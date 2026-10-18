import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from './supabaseClient';
import SplashScreen from './SplashScreen';
import OnboardingScreen from './OnboardingScreen';
import LoginScreen from './LoginScreen';
import SignUpScreen from './SignUpScreen';
import EmailOtpScreen from './EmailOtpScreen';
import HomeScreen from './HomeScreen';
import SelectServiceScreen from './SelectServiceScreen';
import FindingChefsScreen from './FindingChefsScreen';
import AvailableChefsScreen from './AvailableChefsScreen';
import ChefDetailsScreen from './ChefDetailsScreen';
import RequestStatusScreen from './RequestStatusScreen';
import IngredientListScreen from './IngredientListScreen';
import DeliveryPartnerScreen from './DeliveryPartnerScreen';
import OrderSummaryScreen from './OrderSummaryScreen';
import DeliveryTrackingScreen from './DeliveryTrackingScreen';
import DeliverySuccessScreen from './DeliverySuccessScreen';
import ChefTrackingScreen from './ChefTrackingScreen';
import ChefArrivedScreen from './ChefArrivedScreen';
import CookingInProgressScreen from './CookingInProgressScreen';
import JobCompletedScreen from './JobCompletedScreen';
import ServiceCompletedScreen from './ServiceCompletedScreen';
import OrdersScreen from './OrdersScreen';
import ProfileScreen from './ProfileScreen';
import ChefRegistrationScreen from './ChefRegistrationScreen';
import ChefDashboardScreen from './ChefDashboardScreen';
import CustomerOrdersScreen from './CustomerOrdersScreen';
import ChefJobsScreen from './ChefJobsScreen';
import B2BJobBoardScreen from './B2BJobBoardScreen';
import CateringScreen from './CateringScreen';

const AuthStack = createNativeStackNavigator();
const AppStack = createNativeStackNavigator();
const Tabs = createBottomTabNavigator();

function MainTabs() {
  return (
    <Tabs.Navigator screenOptions={{ headerShown: false, tabBarStyle: { backgroundColor: '#FFFFFF', borderTopColor: '#EEEEEE', height: 68 }, tabBarActiveTintColor: '#00C853', tabBarInactiveTintColor: '#9BA39A' }}>
      <Tabs.Screen name="HomeScreen" component={HomeScreen} options={{ title: 'Home' }} />
      <Tabs.Screen name="OrdersScreen" component={OrdersScreen} options={{ title: 'Orders' }} />
      <Tabs.Screen name="Profile" component={ProfileScreen} />
    </Tabs.Navigator>
  );
}

function AuthNavigator() {
  return (
    <AuthStack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="SignUp" component={SignUpScreen} />
      <AuthStack.Screen name="EmailOtp" component={EmailOtpScreen} />
    </AuthStack.Navigator>
  );
}

function AppNavigator() {
  return (
    <AppStack.Navigator initialRouteName="Home" screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#FFFFFF' }, animation: 'slide_from_right' }}>
      <AppStack.Screen name="Home" component={MainTabs} />
      <AppStack.Screen name="SelectService" component={SelectServiceScreen} />
      <AppStack.Screen name="Catering" component={CateringScreen} />
      <AppStack.Screen name="FindingChefs" component={FindingChefsScreen} />
      <AppStack.Screen name="AvailableChefs" component={AvailableChefsScreen} />
      <AppStack.Screen name="ChefDetails" component={ChefDetailsScreen} />
      <AppStack.Screen name="CustomerOrders" component={CustomerOrdersScreen} />
      <AppStack.Screen name="ChefJobs" component={ChefJobsScreen} />
      <AppStack.Screen name="B2BJobBoard" component={B2BJobBoardScreen} />
      <AppStack.Screen name="RequestStatus" component={RequestStatusScreen} />
      <AppStack.Screen name="IngredientList" component={IngredientListScreen} />
      <AppStack.Screen name="DeliveryPartner" component={DeliveryPartnerScreen} />
      <AppStack.Screen name="OrderSummary" component={OrderSummaryScreen} />
      <AppStack.Screen name="DeliveryTracking" component={DeliveryTrackingScreen} />
      <AppStack.Screen name="DeliverySuccess" component={DeliverySuccessScreen} />
      <AppStack.Screen name="ChefTracking" component={ChefTrackingScreen} />
      <AppStack.Screen name="ChefArrived" component={ChefArrivedScreen} />
      <AppStack.Screen name="CookingInProgress" component={CookingInProgressScreen} />
      <AppStack.Screen name="JobCompleted" component={JobCompletedScreen} />
      <AppStack.Screen name="ServiceCompleted" component={ServiceCompletedScreen} />
      <AppStack.Screen name="Orders" component={OrdersScreen} />
      <AppStack.Screen name="Profile" component={ProfileScreen} />
      <AppStack.Screen name="ChefRegistration" component={ChefRegistrationScreen} />
      <AppStack.Screen name="ChefDashboard" component={ChefDashboardScreen} />
    </AppStack.Navigator>
  );
}

export default function AppNavigation() {
  const [session, setSession] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [splashDone, setSplashDone] = useState(false);
  const [introDone, setIntroDone] = useState(false);
  const [startupError, setStartupError] = useState(null);

  useEffect(() => {
    let mounted = true;
    const initialize = async () => {
      try {
        const [sessionResult, introValue] = await Promise.all([
          supabase.auth.getSession(),
          AsyncStorage.getItem('chefpulse_intro_seen'),
        ]);
        if (!mounted) return;
        if (sessionResult.error) throw sessionResult.error;
        setSession(sessionResult.data.session);
        setIntroDone(introValue === 'true');
        setAuthLoading(false);
      } catch (error) {
        if (!mounted) return;
        console.error('ChefPulse startup error:', error);
        setStartupError(error);
        setAuthLoading(false);
      }
    };
    initialize();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setAuthLoading(false);
    });

    return () => { mounted = false; subscription.unsubscribe(); };
  }, []);

  if (startupError) throw startupError;

  if (!splashDone) return <SplashScreen onFinish={() => setSplashDone(true)} />;
  if (!introDone) return <OnboardingScreen onFinish={async () => { await AsyncStorage.setItem('chefpulse_intro_seen', 'true'); setIntroDone(true); }} />;

  return (
    <NavigationContainer>
      {authLoading ? <SplashScreen onFinish={() => {}} /> : session ? <AppNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
}
