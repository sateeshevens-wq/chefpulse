import React from 'react';
import { Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { useBooking } from './BookingContext';

export default function ChefDetailsScreen({ navigation }) {
  const { selectedChef, selectedService, setBookingStatus } = useBooking();
  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.card}>
        <Text style={styles.title}>{selectedChef?.name || 'No chef selected'}</Text>
        <Text style={styles.rating}>★ {selectedChef?.rating ?? '-'}</Text>
        <Text style={styles.service}>{selectedService || 'Service not selected'}</Text>
        <Pressable style={styles.button} onPress={() => { setBookingStatus('requested'); navigation.navigate('RequestStatus'); }}>
          <Text style={styles.buttonText}>Request Chef</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
const styles=StyleSheet.create({screen:{flex:1,backgroundColor:'#0B0F0A',alignItems:'center',justifyContent:'center',padding:20},card:{width:'100%',backgroundColor:'#111511',borderWidth:1,borderColor:'#283028',borderRadius:18,padding:24},title:{color:'#FFFFFF',fontSize:26,fontWeight:'800'},rating:{color:'#39FF14',fontSize:17,marginTop:8},service:{color:'#9BA39A',fontSize:15,marginTop:14},button:{marginTop:26,backgroundColor:'#39FF14',borderRadius:14,padding:16,alignItems:'center'},buttonText:{color:'#000000',fontWeight:'900'}});
