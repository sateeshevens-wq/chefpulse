import { Alert, Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { supabase } from './supabaseClient';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export async function registerForNotifications(userId) {
  try {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('status', {
        name: 'ChefPulse Status Updates',
        importance: Notifications.AndroidImportance.DEFAULT,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#00C853',
      });
    }

    const current = await Notifications.getPermissionsAsync();
    let status = current.status;
    if (status !== 'granted') {
      const requested = await Notifications.requestPermissionsAsync({
        ios: { allowAlert: true, allowBadge: true, allowSound: true },
      });
      status = requested.status;
    }

    if (status !== 'granted') {
      return { granted: false, reason: 'Notifications are disabled. ChefPulse will continue to work normally, but status updates will appear inside the app.' };
    }

    if (!Device.isDevice) {
      return { granted: true, token: null, reason: 'Push tokens require a physical device.' };
    }

    const projectId = Constants.expoConfig?.extra?.eas?.projectId;
    const tokenResult = projectId
      ? await Notifications.getExpoPushTokenAsync({ projectId })
      : await Notifications.getExpoPushTokenAsync();
    const token = tokenResult?.data;

    if (userId && token) {
      const { error } = await supabase.from('users').update({ expo_push_token: token }).eq('id', userId);
      if (error) throw error;
    }

    return { granted: true, token };
  } catch (error) {
    console.warn('ChefPulse notification setup unavailable:', error?.message || error);
    return { granted: false, reason: 'Notifications are currently unavailable. ChefPulse will continue to work normally.' };
  }
}

export async function showStatusNotification(title, body) {
  try {
    await Notifications.scheduleNotificationAsync({
      content: { title, body, sound: false },
      trigger: null,
    });
  } catch (error) {
    console.warn('ChefPulse local notification unavailable:', error?.message || error);
  }
}

export function showNotificationFallback(reason) {
  if (reason) {
    Alert.alert('Notifications are off', reason, [{ text: 'OK' }]);
  }
}
