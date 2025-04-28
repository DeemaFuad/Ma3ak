// Screens/ProfileScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { getStoredUser, logout } from '../utils/auth';
import Header from '../components/Header';

const ProfileScreen = () => {
  const navigation = useNavigation();
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
  });

  useEffect(() => {
    const loadUser = async () => {
      const userData = await getStoredUser();
      setUser(userData);
      setFormData({
        name: userData?.name || '',
        email: userData?.email || '',
        phone: userData?.phone || '',
      });
    };
    loadUser();
  }, []);

  const handleUpdate = async () => {
    try {
      // TODO: Call API to update user profile
      setIsEditing(false);
      Alert.alert('Success', 'Profile updated successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile');
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigation.reset({
        index: 0,
        routes: [{ name: 'Welcome' }],
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to logout');
    }
  };

  return (
    <View style={styles.container}>
      <Header title="Profile" />
      <View style={styles.content}>
        <Text style={styles.text}>Profile Screen Content</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 16,
    color: '#212529',
    fontFamily: 'Roboto',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#212529',
    margin: 20,
  },
  section: {
    backgroundColor: '#FFFFFF',
    margin: 20,
    padding: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#CED4DA',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#212529',
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 15,
  },
  label: {
    color: '#212529',
    fontSize: 16,
    marginBottom: 5,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    color: '#212529',
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#CED4DA',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  button: {
    backgroundColor: '#14957B',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
    width: '85%',
    alignSelf: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  logoutButton: {
    backgroundColor: '#FF3B30',
    margin: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    color: '#212529',
    fontSize: 24,
    fontWeight: 'bold',
  },
  statLabel: {
    color: '#6C757D',
    fontSize: 14,
    marginTop: 5,
  },
});

export default ProfileScreen;
