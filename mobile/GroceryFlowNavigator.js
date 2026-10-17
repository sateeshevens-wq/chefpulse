import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import IngredientListScreen from './IngredientListScreen';
import DeliveryPartnerScreen from './DeliveryPartnerScreen';
import OrderSummaryScreen from './OrderSummaryScreen';
import DeliveryTrackingScreen from './DeliveryTrackingScreen';

const Stack = createNativeStackNavigator();

export default function GroceryFlowNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#0B0F0A' },
      }}
    >
      <Stack.Screen name="IngredientList" component={IngredientListScreen} />
      <Stack.Screen name="DeliveryPartner" component={DeliveryPartnerScreen} />
      <Stack.Screen name="OrderSummary" component={OrderSummaryScreen} />
      <Stack.Screen name="DeliveryTracking" component={DeliveryTrackingScreen} />
    </Stack.Navigator>
  );
}
