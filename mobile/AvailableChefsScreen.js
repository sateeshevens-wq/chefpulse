import React from 'react';
import { Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { useBooking } from './BookingContext';

const chef = { name: 'Rohit Sharma', rating: 4.8, image: null };

export default function AvailableChefsScreen({ navigation }) {
  const { selectedChef, setSelectedChef, setBookingStatus } = useBooking();
  const currentChef = selectedChef || chef;
  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.card}>
        <Text style={styles.title}>{currentChef.name}</Text>
        <Text style={styles.rating}>★ {currentChef.rating}</Text>
        <Text style={styles.imageText}>{currentChef.image ? 'Chef image available' : 'Chef image'}</Text>
        <Pressable style={styles.button} onPress={() => { setSelectedChef(chef); setBookingStatus('requested'); navigation.navigate('ChefDetails'); }}>
          <Text style={styles.buttonText}>Select Chef</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
const styles=StyleSheet.create({screen:{flex:1,backgroundColor:'#0B0F0A',alignItems:'center',justifyContent:'center',padding:20},card:{width:'100%',backgroundColor:'#111511',borderWidth:1,borderColor:'#283028',borderRadius:18,padding:24},title:{color:'#FFFFFF',fontSize:24,fontWeight:'800'},rating:{color:'#39FF14',fontSize:17,marginTop:8},imageText:{color:'#9BA39A',marginTop:18},button:{marginTop:24,backgroundColor:'#39FF14',borderRadius:14,padding:16,alignItems:'center'},buttonText:{color:'#000000',fontWeight:'900'}});
