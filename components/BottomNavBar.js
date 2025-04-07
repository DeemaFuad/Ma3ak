import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { logout } from '../utils/auth';
import Icon from 'react-native-vector-icons/Ionicons';

const BottomNavBar = () => {
  const navigation = useNavigation();

  const handleLogout = async () => {
    try {
      await logout();
      // Force reload by resetting navigation to Welcome screen
      navigation.reset({
        index: 0,
        routes: [{ name: 'Welcome' }],
      });
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Icon name="log-out-outline" size={24} color="white" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
    backgroundColor: '#1E1E1E',
    borderTopWidth: 1,
    borderTopColor: '#333',
    justifyContent: 'flex-start',
    alignItems: 'flex-end', // Align the icon to the right
    paddingRight: 10,
  },
  logoutButton: {
    backgroundColor: '#FF3B30',
    padding: 10,
    borderRadius: 8,
    marginTop: 10,
  },
});

export default BottomNavBar; 