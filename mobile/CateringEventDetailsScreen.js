import React, { useState } from 'react';
import { SafeAreaView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function CateringEventDetailsScreen({ navigation }) {
  const [guestCount, setGuestCount] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [occasion, setOccasion] = useState('');

  const next = () => {
    const guests = Number(guestCount);
    if (!Number.isInteger(guests) || guests <= 0 || !eventDate.trim() || !occasion.trim()) return;
    navigation.navigate('CateringMenuBuilder', { guestCount: guests, eventDate: eventDate.trim(), occasion: occasion.trim() });
  };

  return <SafeAreaView style={styles.screen}><StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" /><View style={styles.header}><TouchableOpacity onPress={() => navigation.goBack()}><Text style={styles.back}>‹</Text></TouchableOpacity><Text style={styles.title}>Catering · 1 of 2</Text><View style={styles.spacer}/></View><View style={styles.content}><Text style={styles.heading}>Tell us about your event</Text><Text style={styles.sub}>We’ll use these details to find the right caterers.</Text><Text style={styles.label}>Guest count</Text><TextInput style={styles.input} value={guestCount} onChangeText={setGuestCount} keyboardType="number-pad" placeholder="e.g. 50" placeholderTextColor="#999"/><Text style={styles.label}>Event date & time</Text><TextInput style={styles.input} value={eventDate} onChangeText={setEventDate} placeholder="e.g. 2026-11-15 19:00" placeholderTextColor="#999"/><Text style={styles.label}>Occasion</Text><TextInput style={styles.input} value={occasion} onChangeText={setOccasion} placeholder="Wedding, birthday, corporate..." placeholderTextColor="#999"/><TouchableOpacity style={styles.button} onPress={next}><Text style={styles.buttonText}>Continue to Menu</Text></TouchableOpacity></View></SafeAreaView>;
}
const styles=StyleSheet.create({screen:{flex:1,backgroundColor:'#FFF'},header:{height:64,paddingHorizontal:18,flexDirection:'row',alignItems:'center',justifyContent:'space-between',borderBottomWidth:1,borderBottomColor:'#EEE'},back:{fontSize:38,color:'#000',width:28},title:{fontSize:17,fontWeight:'800',color:'#000'},spacer:{width:28},content:{padding:24},heading:{fontSize:28,fontWeight:'800',color:'#000'},sub:{fontSize:14,color:'#666',lineHeight:20,marginTop:8,marginBottom:22},label:{fontSize:13,fontWeight:'700',color:'#222',marginTop:14,marginBottom:8},input:{height:52,borderWidth:1,borderColor:'#DDD',borderRadius:12,paddingHorizontal:14,color:'#000',backgroundColor:'#F8F9F8'},button:{height:54,borderRadius:27,backgroundColor:'#00C853',alignItems:'center',justifyContent:'center',marginTop:28},buttonText:{color:'#FFF',fontSize:16,fontWeight:'800'}});
