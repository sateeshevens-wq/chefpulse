import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, StatusBar } from 'react-native';

export default function SelectServiceScreen({ navigation }) {
  const [selectedId, setSelectedId] = useState(null);

  const services = [
    { id: '1', title: 'Home Cooking', sub: 'Everyday meals', icon: '🍲' },
    { id: '2', title: 'Special Cuisine', sub: 'Indian | Continental | Chinese', icon: '🥘' },
    { id: '3', title: 'Diet & Healthy', sub: 'Custom meals', icon: '🥗' },
    { id: '4', title: 'Party & Events', sub: 'Family & Friends', icon: '🎉' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chef Now</Text>
        <View style={styles.placeholder} />
      </View>

      <Text style={styles.subtitle}>Need a chef at your home soon?</Text>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {services.map((item) => {
          const isSelected = selectedId === item.id;
          return (
            <TouchableOpacity 
              key={item.id} 
              style={[styles.serviceCard, isSelected && styles.selectedCard]}
              onPress={() => setSelectedId(item.id)}
            >
              <View style={styles.iconContainer}>
                <Text style={styles.iconText}>{item.icon}</Text>
              </View>
              
              <View style={styles.textContainer}>
                <Text style={styles.cardTitle}>{item.title}</Text>
                <Text style={styles.cardSub}>{item.sub}</Text>
              </View>
              
              <Text style={styles.chevronIcon}>›</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity 
          style={[styles.continueButton, !selectedId && styles.disabledButton]}
          disabled={!selectedId}
          onPress={() => navigation.navigate('FindingChefs')}
        >
          <Text style={styles.continueText}>Continue</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#FFFFFF' 
  },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    paddingHorizontal: 20, 
    paddingTop: 10 
  },
  backButton: { 
    padding: 5 
  },
  backIcon: { 
    fontSize: 32, 
    color: '#000000', 
    fontWeight: '300', 
    marginTop: -5 
  },
  headerTitle: { 
    fontSize: 18, 
    fontWeight: 'bold', 
    color: '#000000' 
  },
  placeholder: { 
    width: 30 
  },
  subtitle: { 
    fontSize: 14, 
    color: '#666666', 
    textAlign: 'center', 
    marginTop: 10, 
    marginBottom: 25 
  },
  scrollContent: { 
    paddingHorizontal: 20 
  },
  serviceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#EEEEEE',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3
  },
  selectedCard: { 
    borderColor: '#00C853', 
    backgroundColor: '#F2FFF6', 
    borderWidth: 1.5 
  },
  iconContainer: { width: 50, height: 50, backgroundColor: '#F5F5F5', borderRadius: 25, alignItems: 'center', justifyContent: 'center', marginRight: 15 },
  iconText: { fontSize: 24 },
  textContainer: { flex: 1 },
  cardTitle: { fontSize: 16, fontWeight: 'bold', color: '#000000', marginBottom: 4 },
  cardSub: { fontSize: 13, color: '#666666' },
  chevronIcon: { fontSize: 24, color: '#9BA39A', marginLeft: 10 },
  footer: { padding: 20, paddingBottom: 30, backgroundColor: '#FFFFFF', borderTopWidth: 1, borderTopColor: '#EEEEEE' },
  continueButton: { backgroundColor: '#00C853', borderRadius: 25, height: 50, alignItems: 'center', justifyContent: 'center' },
  disabledButton: { backgroundColor: '#A5D6A7' },
  continueText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' }
});