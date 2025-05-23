import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const API_URL = 'http://192.168.0.102:5000/auth';

export const getStoredUser = async () => {
  try {
    const userData = await AsyncStorage.getItem('userData');
    if (!userData) return null;
    
    const parsedData = JSON.parse(userData);
    if (!parsedData.token) {
      // If no token in userData, try to get it from userToken
      const token = await AsyncStorage.getItem('userToken');
      if (token) {
        parsedData.token = token;
      }
    }
    return parsedData;
  } catch (error) {
    console.error('Error getting stored user:', error);
    return null;
  }
};

export const getStoredToken = async () => {
  try {
    return await AsyncStorage.getItem('userToken');
  } catch (error) {
    console.error('Error getting stored token:', error);
    return null;
  }
};

export const setAuthToken = (token) => {
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete axios.defaults.headers.common['Authorization'];
  }
};

export const logout = async () => {
  try {
    await AsyncStorage.multiRemove(['userToken', 'userData']);
  } catch (error) {
    console.error('Error during logout:', error);
    throw error;
  }
};

export const isAuthenticated = async () => {
  const token = await getStoredToken();
  return !!token;
};

export const initializeAuth = async () => {
  const token = await getStoredToken();
  if (token) {
    setAuthToken(token);
  }
};

export const getAuthToken = async () => {
  try {
    const userData = await getStoredUser();
    return userData?.token;
  } catch (error) {
    console.error('Error getting auth token:', error);
    return null;
  }
}; 