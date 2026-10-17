import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { BookingProvider } from './BookingContext';
import SplashScreen from './SplashScreen';
import HomeScreen from './DashboardScreen';
import SelectServiceScreen from './ServicesScreen';
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
import ServiceCompletedScreen from './ServiceCompletedScreen';
import BookingHistoryScreen from './BookingHistoryScreen';
import ProfileScreen from './ProfileScreen';

const Stack = createNativeStackNavigator();
const Tabs = createBottomTabNavigator();
const tabOptions = { headerShown: false, tabBarStyle: { backgroundColor: '#0E130D', borderTopColor: '#283028', height: 76 }, tabBarActiveTintColor: '#39FF14', tabBarInactiveTintColor: '#9BA39A' };

function MainTabs() {
  return (
    <Tabs.Navigator screenOptions={tabOptions}>
      <Tabs.Screen name="Home" component={HomeScreen} />
      <Tabs.Screen name="BookingHistory" component={BookingHistoryScreen} options={{ title: 'Orders' }} />
      <Tabs.Screen name="Profile" component={ProfileScreen} />
    </Tabs.Navigator>
  );
}

export default function AppNavigation() {
  return (
    <BookingProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="SplashScreen" screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#0B0F0A' } }}>
          <Stack.Screen name="SplashScreen" component={SplashScreen} />
          <Stack.Screen name="Home" component={MainTabs} />
          <Stack.Screen name="SelectService" component={SelectServiceScreen} />
          <Stack.Screen name="FindingChefs" component={FindingChefsScreen} />
          <Stack.Screen name="AvailableChefs" component={AvailableChefsScreen} />
          <Stack.Screen name="ChefDetails" component={ChefDetailsScreen} />
          <Stack.Screen name="RequestStatus" component={RequestStatusScreen} />
          <Stack.Screen name="IngredientList" component={IngredientListScreen} />
          <Stack.Screen name="DeliveryPartner" component={DeliveryPartnerScreen} />
          <Stack.Screen name="OrderSummary" component={OrderSummaryScreen} />
          <Stack.Screen name="DeliveryTracking" component={DeliveryTrackingScreen} />
          <Stack.Screen name="DeliverySuccess" component={DeliverySuccessScreen} />
          <Stack.Screen name="ChefTracking" component={ChefTrackingScreen} />
          <Stack.Screen name="ChefArrived" component={ChefArrivedScreen} />
          <Stack.Screen name="CookingInProgress" component={CookingInProgressScreen} />
          <Stack.Screen name="ServiceCompleted" component={ServiceCompletedScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </BookingProvider>
  );
}
