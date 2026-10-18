import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ImageBackground, SafeAreaView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Location from 'expo-location';

const CHEF_IMAGE = 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=1200&q=85';
const CATERING_IMAGE = 'https://images.unsplash.com/photo-1515003197210-e0cd71810b5f?auto=format&fit=crop&w=900&q=85';
const KITCHEN_IMAGE = 'https://images.unsplash.com/photo-1556911220-bff31c812dba?auto=format&fit=crop&w=1200&q=85';

function GlassTag({ children, accent = false }) {
  return (
    <View style={[styles.glassTag, accent && styles.glassTagAccent]}>
      <Text style={[styles.glassTagText, accent && styles.glassTagAccentText]}>{children}</Text>
    </View>
  );
}

export default function HomeScreen({ navigation }) {
  const [locationName, setLocationName] = useState('Location unavailable');
  const [locationLoading, setLocationLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    let watcher;

    const updateLocation = async ({ coords }) => {
      try {
        const places = await Location.reverseGeocodeAsync({ latitude: coords.latitude, longitude: coords.longitude });
        if (!mounted) return;
        const place = places?.[0];
        setLocationName(place?.city || place?.district || place?.region || `${coords.latitude.toFixed(4)}, ${coords.longitude.toFixed(4)}`);
      } catch {
        if (mounted) setLocationName(`${coords.latitude.toFixed(4)}, ${coords.longitude.toFixed(4)}`);
      } finally {
        if (mounted) setLocationLoading(false);
      }
    };

    const startLocation = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          if (mounted) {
            setLocationName('Location permission denied');
            setLocationLoading(false);
          }
          return;
        }
        const current = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        await updateLocation(current);
        watcher = await Location.watchPositionAsync(
          { accuracy: Location.Accuracy.Balanced, distanceInterval: 100, timeInterval: 10000 },
          updateLocation,
        );
      } catch {
        if (mounted) {
          setLocationName('Location unavailable');
          setLocationLoading(false);
        }
      }
    };

    startLocation();
    return () => {
      mounted = false;
      watcher?.remove?.();
    };
  }, []);

  const cityLabel = locationName.includes('permission') || locationName.includes('unavailable')
    ? locationName
    : `${locationName}, India`;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#07130D" />

      <View style={styles.backgroundGlowTop} />
      <View style={styles.backgroundGlowBottom} />

      <View style={styles.header}>
        <View>
          <Text style={styles.eyebrow}>CHEFPULSE</Text>
          <Text style={styles.heading}>What are you hosting?</Text>
        </View>
        <View style={styles.locationTag}>
          <Text style={styles.locationPin}>●</Text>
          {locationLoading ? (
            <ActivityIndicator size="small" color="#FF9F0A" />
          ) : (
            <Text numberOfLines={1} style={styles.locationText}>{cityLabel}</Text>
          )}
        </View>
      </View>

      <View style={styles.grid}>
        <TouchableOpacity activeOpacity={0.9} style={styles.chefCard} onPress={() => navigation.navigate('SelectService')}>
          <ImageBackground source={{ uri: CHEF_IMAGE }} style={styles.imageFill} imageStyle={styles.cardImage}>
            <LinearGradient colors={['rgba(0,0,0,0.02)', 'rgba(0,0,0,0.82)']} style={styles.gradient}>
              <View style={styles.cardTopRow}>
                <GlassTag accent>LIVE • 5m</GlassTag>
                <GlassTag>Chef Now</GlassTag>
              </View>
              <View style={styles.cardBottom}>
                <Text style={styles.cardKicker}>HOME CHEF</Text>
                <Text style={styles.cardTitle}>Cook something{"\n