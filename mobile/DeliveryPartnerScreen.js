import React, { useState } from 'react';
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

const partners = [
  { id: 'zepto', name: 'Zepto', time: '10-30 min' },
  { id: 'blinkit', name: 'Blinkit', time: '15-30 min' },
  { id: 'bigbasket', name: 'bigbasket', time: '30-60 min' },
];

export default function DeliveryPartnerScreen({ navigation }) {
  const [selectedPartner, setSelectedPartner] = useState(null);

  return (
    <SafeAreaView style={styles.screen}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.charcoal} />
      <View style={styles.content}>
        <Text style={styles.title}>Choose Delivery Partner</Text>

        <View style={styles.cards}>
          {partners.map((partner) => {
            const selected = selectedPartner === partner.id;
            return (
              <Pressable
                key={partner.id}
                onPress={() => setSelectedPartner(partner.id)}
                style={({ pressed }) => [
                  styles.card,
                  selected && styles.cardSelected,
                  pressed && styles.pressed,
                ]}
              >
                <View style={styles.brandMark}>
                  <Text style={styles.brandInitial}>{partner.name.charAt(0).toUpperCase()}</Text>
                </View>
                <View style={styles.partnerInfo}>
                  <Text style={styles.partnerName}>{partner.name}</Text>
                  <Text style={styles.deliveryTime}>{partner.time}</Text>
                </View>
                <View style={[styles.radio, selected && styles.radioSelected]}>
                  {selected && <View style={styles.radioDot} />}
                </View>
              </Pressable>
            );
          })}
        </View>

        <Pressable
          disabled={!selectedPartner}
          onPress={() => navigation.navigate('OrderSummary', { partner: selectedPartner })}
          style={({ pressed }) => [
            styles.button,
            !selectedPartner && styles.buttonDisabled,
            pressed && selectedPartner && styles.pressed,
          ]}
        >
          <Text style={styles.buttonText}>Continue</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.charcoal },
  content: { flex: 1, paddingHorizontal: 20, paddingTop: 24, paddingBottom: 18 },
  title: { color: COLORS.white, fontSize: 24, fontWeight: '800', marginBottom: 24 },
  cards: { gap: 14 },
  card: {
    minHeight: 86,
    borderRadius: 16,
    paddingHorizontal: 14,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardSelected: { borderColor: COLORS.primary, borderWidth: 2 },
  pressed: { opacity: 0.78 },
  brandMark: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: '#1C241C',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandInitial: { color: COLORS.primary, fontSize: 22, fontWeight: '900' },
  partnerInfo: { flex: 1, marginLeft: 14 },
  partnerName: { color: COLORS.white, fontSize: 17, fontWeight: '800' },
  deliveryTime: { color: COLORS.muted, fontSize: 13, marginTop: 5 },
  radio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.muted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: { borderColor: COLORS.primary },
  radioDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: COLORS.primary },
  button: {
    minHeight: 54,
    borderRadius: 14,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 'auto',
  },
  buttonDisabled: { opacity: 0.35 },
  buttonText: { color: '#000000', fontSize: 16, fontWeight: '800' },
});
