import React from 'react';
import { FlatList, Pressable, SafeAreaView, StatusBar, StyleSheet, Text, View } from 'react-native';
import { useBooking } from './BookingContext';

const COLORS = { charcoal:'#0B0F0A', primary:'#39FF14', white:'#FFFFFF', muted:'#9BA39A', input:'#121812', border:'#283028' };
const services = [
  { id:'1', title:'Home Chef', subtitle:'Book a chef for your home' },
  { id:'2', title:'Catering Service', subtitle:'Request catering for your event' },
  { id:'3', title:'Hire a Chef (B2B)', subtitle:'Find chefs for your business' },
];

export default function ServicesScreen({ navigation }) {
  const { setSelectedService, setBookingStatus } = useBooking();
  const renderService = ({ item }) => (
    <Pressable style={({pressed})=>[styles.serviceCard,pressed&&styles.pressed]} onPress={() => { setSelectedService(item.title); setBookingStatus('requested'); navigation.navigate('FindingChefs'); }}>
      <View style={styles.serviceThumbnail}><View style={styles.thumbnailPlaceholder}/><View style={styles.bookmarkBadge}><Text style={styles.bookmarkIcon}>♡</Text></View></View>
      <View style={styles.serviceInfo}><Text style={styles.serviceTitle}>{item.title}</Text><Text style={styles.serviceSubtitle}>{item.subtitle}</Text></View>
      <Text style={styles.serviceChevron}>›</Text>
    </Pressable>
  );
  return <SafeAreaView style={styles.screen}><StatusBar barStyle="light-content" backgroundColor={COLORS.charcoal}/><View style={styles.header}><Text style={styles.title}>Choose a Service</Text><Text style={styles.subtitle}>Select how you’d like to get started.</Text></View><FlatList data={services} keyExtractor={item=>item.id} renderItem={renderService} showsVerticalScrollIndicator={false} contentContainerStyle={styles.list}/></SafeAreaView>;
}
const styles=StyleSheet.create({screen:{flex:1,backgroundColor:COLORS.charcoal},header:{paddingHorizontal:22,paddingTop:24,paddingBottom:18},title:{color:COLORS.white,fontSize:30,fontWeight:'800'},subtitle:{color:COLORS.muted,fontSize:15,marginTop:7},list:{paddingHorizontal:20,paddingBottom:24},serviceCard:{minHeight:104,marginBottom:14,padding:12,borderRadius:16,backgroundColor:COLORS.input,borderWidth:1,borderColor:COLORS.border,flexDirection:'row',alignItems:'center'},pressed:{opacity:.78},serviceThumbnail:{width:80,height:80,borderRadius:14,overflow:'hidden',position:'relative',backgroundColor:'#1B241B'},thumbnailPlaceholder:{flex:1,backgroundColor:'#1B241B'},bookmarkBadge:{position:'absolute',top:7,right:7,width:28,height:28,borderRadius:14,backgroundColor:'rgba(0,0,0,.55)',alignItems:'center',justifyContent:'center'},bookmarkIcon:{color:COLORS.white,fontSize:17,lineHeight:19},serviceInfo:{flex:1,paddingHorizontal:14},serviceTitle:{color:COLORS.white,fontSize:17,fontWeight:'800'},serviceSubtitle:{color:'#B5BCB4',fontSize:13,lineHeight:19,marginTop:5},serviceChevron:{color:COLORS.white,fontSize:32,fontWeight:'300',marginRight:4}});
