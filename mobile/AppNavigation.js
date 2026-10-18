import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { supabase } from './supabaseClient';
import SplashScreen from './SplashScreen';
import LoginScreen from './LoginScreen';
import SignUpScreen from './SignUpScreen';
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

const AuthStack = createNativeStackNavigator();
const AppStack = createNativeStackNavigator();
const Tabs = createBottomTabNavigator();

const tabOptions = {
  headerShown: false,
  tabBarStyle: { backgroundColor: '#0E130D', borderTopColor: '#283028', height: 76 },
  tabBarActiveTintColor: '#39FF14',
  tabBarInactiveTintColor: '#9BA39A',
};

function MainTabs() {
  return (
    <Tabs.Navigator screenOptions={tabOptions}>
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
    </AuthStack.Navigator>
  );
}

function AppNavigator() {
  return (
    <AppStack.Navigator initialRouteName="Home" screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#FFFFFF' }, animation: 'slide_from_right' }}>
      <AppStack.Screen name="Home" component={MainTabs} />
      <AppStack.Screen name="SelectService" component={SelectServiceScreen} />
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
  const [startupError, setStartupError] = useState(null);

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession()
      .then(({ data: { session: currentSession } }) => {
        if (!mounted) return;
        setSession(currentSession);
        setAuthLoading(false);
      })
      .catch((error) => {
        if (!mounted) return;
        console.error('ChefPulse Supabase startup error:', error);
        setStartupError(error);
        setAuthLoading(false);
      });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setAuthLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  if (startupError) {
    throw startupError;
  }

  return (
    <NavigationContainer>
      {!splashDone || authLoading ? (
        <SplashScreen onFinish={() => setSplashDone(true)} />
      ) : session ? (
        <AppNavigator />
      ) : (
        <AuthNavigator />
      )}
    </NavigationContainer>
  );
}
