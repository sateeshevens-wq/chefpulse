import React from 'react';
import {
  FlatList,
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
  lime: '#A8FF3F',
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

const total = ingredients.reduce((sum, item) => sum + item.price, 0);

export default function IngredientListScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.screen}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.charcoal} />
      <View style={styles.content}>
        <Text style={styles.title}>Ingredients Required (From Chef Rohit Sharma)</Text>

        <FlatList
          data={ingredients}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <View style={styles.itemRow}>
              <Text style={styles.itemName}>{item.name}</Text>
              <Text style={styles.itemPrice}>₹{item.price}</Text>
            </View>
          )}
        />

        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total Amount</Text>
          <Text style={styles.totalValue}>₹{total}</Text>
        </View>

        <Pressable
          onPress={() => navigation.navigate('DeliveryPartner')}
          style={({ pressed }) => [styles.button, pressed && styles.pressed]}
        >
          <Text style={styles.buttonText}>Order Ingredients</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.charcoal },
  content: { flex: 1, paddingHorizontal: 20, paddingTop: 24, paddingBottom: 18 },
  title: { color: COLORS.white, fontSize: 24, lineHeight: 31, fontWeight: '800', marginBottom: 20 },
  list: { paddingBottom: 10 },
  itemRow: {
    minHeight: 58,
    paddingHorizontal: 16,
    marginBottom: 10,
    borderRadius: 14,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  itemName: { color: COLORS.white, fontSize: 15, fontWeight: '600' },
  itemPrice: { color: COLORS.white, fontSize: 15, fontWeight: '700' },
  totalRow: {
    paddingTop: 16,
    paddingBottom: 18,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: { color: COLORS.white, fontSize: 17, fontWeight: '800' },
  totalValue: { color: COLORS.primary, fontSize: 19, fontWeight: '900' },
  button: {
    minHeight: 54,
    borderRadius: 14,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: { opacity: 0.78 },
  buttonText: { color: '#000000', fontSize: 16, fontWeight: '800' },
});
