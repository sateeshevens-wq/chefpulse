import React from 'react';
import { Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { useBooking } from './BookingContext';

export default function RequestStatusScreen({ navigation }) {
  const { bookingStatus, selectedChef, setBookingStatus } = useBooking();
  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.content}>
        <Text style={styles.title}>Request Status</Text>
        <Text style={styles.status}>{bookingStatus}</Text>
        <Text style={styles.chef}>{selectedChef?.name || 'No chef selected'}</Text>
        <Pressable style={styles.button} onPress={() => { setBookingStatus('requested'); navigation.navigate('IngredientList'); }}>
          <Text style={styles.buttonText}>Continue</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
const styles=StyleSheet.create({screen:{flex:1,backgroundColor:'#0B0F0A'},content:{flex:1,alignItems:'center',justifyContent:'center',padding:20},title:{color:'#FFFFFF',fontSize:28,fontWeight:'800'},status:{color:'#39FF14',fontSize:18,marginTop:12},chef:{color:'#9BA39A',fontSize:16,marginTop:8},button:{marginTop:28,width:'100%',backgroundColor:'#39FF14',borderRadius:14,padding:16,alignItems:'center'},buttonText:{color:'#000000',fontWeight:'900'}});
