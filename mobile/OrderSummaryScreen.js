import React from 'react';
import {
  Pressable,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';

const COLORS = {
  charcoal: '#0B0F0A',
  primary: '#39FF14',
  white: '#FFFFFF',
  muted: '#9BA39A',
  card: '#111511',
  border: '#283028',
};

const ingredients = [
  { id: '1', name: 'Fresh Vegetables', price: 210 },
  { id: '2', name: 'Paneer', price: 130 },
  { id: '3', name: 'Rice', price: 120 },
  { id: '4', name: 'Cooking Oil', price: 100 },
  { id: '5', name: 'Spices', price: 140 },
];

const ingredientsTotal = 700;
const deliveryFee = 40;
const totalAmount = 740;

export default function OrderSummaryScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.screen}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.charcoal} />
      <View style={styles.content}>
        <Text style={styles.title}>Order Summary</Text>

        <View style={styles.receipt}>
          {ingredients.map((item) => (
            <View key={item.id} style={styles.row}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.price}>₹{item.price}</Text>
            </View>
          ))}
          <View style={styles.separator} />
          <View style={styles.row}>
            <Text style={styles.subtotalLabel}>Ingredients</Text>
            <Text style={styles.subtotalValue}>₹{ingredientsTotal}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.subtotalLabel}>Delivery Fee</Text>
            <Text style={styles.subtotalValue}>₹{deliveryFee}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total Amount</Text>
            <Text style={styles.totalValue}>₹{totalAmount}</Text>
          </View>
        </View>

        <Pressable
          onPress={() => navigation.navigate('DeliveryTracking')}
          style={({ pressed }) => [styles.payButton, pressed && styles.pressed]}
        >
          <Text style={styles.lockIcon}>▣</Text>
          <Text style={styles.payText}>Pay Now</Text>
          <Text style={styles.secureText}>Secure Payment</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.charcoal },
  content: { flex: 1, paddingHorizontal: 20, paddingTop: 24, paddingBottom: 18 },
  title: { color: COLORS.white, fontSize: 24, fontWeight: '800', marginBottom: 20 },
  receipt: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 16,
  },
  row: { minHeight: 38, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  name: { color: COLORS.white, fontSize: 14 },
  price: { color: COLORS.white, fontSize: 14, fontWeight: '700' },
  separator: { height: 1, backgroundColor: COLORS.border, marginVertical: 8 },
  subtotalLabel: { color: COLORS.muted, fontSize: 14 },
  subtotalValue: { color: COLORS.white, fontSize: 14, fontWeight: '700' },
  totalRow: {
    marginTop: 10,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: { color: COLORS.white, fontSize: 17, fontWeight: '800' },
  totalValue: { color: COLORS.primary, fontSize: 20, fontWeight: '900' },
  payButton: {
    minHeight: 60,
    borderRadius: 14,
    backgroundColor: COLORS.primary,
    marginTop: 'auto',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 18,
  },
  pressed: { opacity: 0.78 },
  lockIcon: { color: '#000000', fontSize: 17, marginRight: 8 },
  payText: { color: '#000000', fontSize: 17, fontWeight: '900' },
  secureText: { color: '#000000', fontSize: 11, fontWeight: '700', marginLeft: 10, opacity: 0.7 },
});
