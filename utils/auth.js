import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const API_URL = 'http://localhost:5000/auth';

export const getStoredUser = async () => {
  try {
    const userData = await AsyncStorage.getItem('userData');
    return userData ? JSON.parse(userData) : null;
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
    await AsyncStorage.removeItem('userToken');
    await AsyncStorage.removeItem('userData');
    setAuthToken(null);
  } catch (error) {
    console.error('Error during logout:', error);
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