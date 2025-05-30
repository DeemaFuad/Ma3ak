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
  ActivityIndicator,
} from 'react-native';
import { useNavigation, CommonActions } from '@react-navigation/native';
import { getStoredUser, logout } from '../utils/auth';
import Header from '../components/Header';
import axios from 'axios';
import Icon from 'react-native-vector-icons/Feather';
import AsyncStorage from '@react-native-async-storage/async-storage';
import storageEventEmitter from '../utils/storageEventEmitter';

const API_URL = 'http://192.168.0.102:5000/api/profile';

const ProfileScreen = () => {
  const navigation = useNavigation();
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    bio: '',
  });

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      setLoading(true);
      const userData = await getStoredUser();
      if (!userData?.token) {
        Alert.alert(
          'Session Expired',
          'Please log in again to continue.',
          [
            {
              text: 'OK',
              onPress: handleLogout,
            },
          ]
        );
        return;
      }

      const response = await axios.get(API_URL, {
        headers: {
          Authorization: `Bearer ${userData.token}`
        }
      });

      if (response.data.success) {
        setUser(response.data.user);
        setFormData({
          name: response.data.user.name || '',
          email: response.data.user.email || '',
          phoneNumber: response.data.user.phoneNumber || '',
          bio: response.data.user.bio || '',
        });
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      if (error.response?.status === 401) {
        Alert.alert(
          'Session Expired',
          'Please log in again to continue.',
          [
            {
              text: 'OK',
              onPress: handleLogout,
            },
          ]
        );
      } else {
        Alert.alert('Error', 'Failed to load profile data');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    try {
      setLoading(true);
      const userData = await getStoredUser();
      if (!userData?.token) {
        throw new Error('No authentication token found');
      }

      const response = await axios.put(API_URL, formData, {
        headers: {
          Authorization: `Bearer ${userData.token}`
        }
      });

      if (response.data.success) {
        setUser(response.data.user);
        setIsEditing(false);
        Alert.alert('Success', 'Profile updated successfully');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      if (error.response?.status === 401) {
        Alert.alert(
          'Session Expired',
          'Please log in again to continue.',
          [
            {
              text: 'OK',
              onPress: handleLogout,
            },
          ]
        );
      } else {
        Alert.alert('Error', error.response?.data?.msg || 'Failed to update profile');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      setLoading(true);
      // Clear axios default headers
      delete axios.defaults.headers.common['Authorization'];
      
      // Clear AsyncStorage
      await AsyncStorage.multiRemove(['userToken', 'userData']);
      
      // Emit events for both storage removals
      storageEventEmitter.emit('authChange', { key: 'userToken' });
      storageEventEmitter.emit('authChange', { key: 'userData' });
      
      // Call the logout function from auth utils
      await logout();
      
      // The AppNavigator will automatically detect the auth state change
      // and navigate to the Auth stack
    } catch (error) {
      console.error('Error during logout:', error);
      Alert.alert('Error', 'Failed to logout properly. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3BA99C" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header title="Profile" />
      <ScrollView style={styles.scrollView}>
        <View style={styles.profileHeader}>
          <Text>
          <Text style={styles.userName}>{user?.name+"   " || 'User'}</Text>
          <Text style={styles.userType}>{user?.userType === 'blind' ? 'Blind Student' : 'Volunteer'}</Text></Text>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Personal Information</Text>
            <TouchableOpacity 
              onPress={isEditing ? handleUpdate : () => setIsEditing(true)}
              disabled={loading}
              style={styles.editButton}
            >
              <Icon 
                name={isEditing ? 'check' : 'edit-2'} 
                size={20} 
                color="#14957B" 
              />
            </TouchableOpacity>
          </View>
          
          <View style={styles.inputContainer}>
            <View style={styles.labelContainer}>
              <Icon name="user" size={18} color="#14957B" style={styles.labelIcon} />
              <Text style={styles.label}>Name</Text>
            </View>
            {isEditing ? (
              <TextInput
                style={styles.input}
                value={formData.name}
                onChangeText={(text) => setFormData({ ...formData, name: text })}
                placeholder="Enter your name"
              />
            ) : (
              <Text style={styles.text}>{formData.name}</Text>
            )}
          </View>

          <View style={styles.inputContainer}>
            <View style={styles.labelContainer}>
              <Icon name="mail" size={18} color="#14957B" style={styles.labelIcon} />
              <Text style={styles.label}>Email</Text>
            </View>
            <Text style={styles.text}>{formData.email}</Text>
          </View>

          <View style={styles.inputContainer}>
            <View style={styles.labelContainer}>
              <Icon name="phone" size={18} color="#14957B" style={styles.labelIcon} />
              <Text style={styles.label}>Phone</Text>
            </View>
            {isEditing ? (
              <TextInput
                style={styles.input}
                value={formData.phoneNumber}
                onChangeText={(text) => setFormData({ ...formData, phoneNumber: text })}
                keyboardType="phone-pad"
                placeholder="Enter your phone number"
              />
            ) : (
              <Text style={styles.text}>{formData.phoneNumber}</Text>
            )}
          </View>

          <View style={styles.inputContainer}>
            <View style={styles.labelContainer}>
              <Icon name="file-text" size={18} color="#14957B" style={styles.labelIcon} />
              <Text style={styles.label}>Bio</Text>
            </View>
            {isEditing ? (
              <TextInput
                style={[styles.input, { height: 80 }]}
                value={formData.bio}
                onChangeText={(text) => setFormData({ ...formData, bio: text })}
                multiline
                placeholder="Tell us about yourself"
                maxLength={500}
              />
            ) : (
              <Text style={styles.text}>{formData.bio || 'No bio provided'}</Text>
            )}
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={[styles.button, styles.logoutButton]} 
            onPress={handleLogout}
            disabled={loading}
          >
            <Icon name="log-out" size={20} color="#FFFFFF" style={styles.buttonIcon} />
            <Text style={styles.buttonText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EDEFF1',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#EDEFF1',
  },
  scrollView: {
    flex: 1,
  },
  profileHeader: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#F8F9FA',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#212529',
    marginBottom: 5,
  },
  userType: {
    fontSize: 16,
    color: '#6C757D',
  },
  section: {
    backgroundColor: '#FAFAFB',
    margin: 10,
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#CED4DA',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1C1C1E',
  },
  editButton: {
    padding: 8,
  },
  inputContainer: {
    marginBottom: 15,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  labelIcon: {
    marginRight: 8,
  },
  label: {
    color: '#1C1C1E',
    fontSize: 16,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    color: '#1C1C1E',
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  text: {
    fontSize: 16,
    color: '#1C1C1E',
    padding: 12,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    backgroundColor: '#F8F9FA',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
  },
  buttonContainer: {
    padding: 20,
    gap: 10,
  },
  button: {
    backgroundColor: '#FF3B30',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  buttonIcon: {
    marginRight: 8,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  logoutButton: {
    backgroundColor: '#FF3B30',
  },
});

export default ProfileScreen;
