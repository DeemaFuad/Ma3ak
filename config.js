import AsyncStorage from '@react-native-async-storage/async-storage';

export const API_URL = 'http://192.168.0.110:5000'; // Replace with your backend IP/URL

export const getAuthToken = async () => {
  try {
    const token = await AsyncStorage.getItem('userToken'); // ✅ matches what you're storing
    return token;
  } catch (error) {
    console.error('Failed to get auth token:', error);
    return null;
  }
};