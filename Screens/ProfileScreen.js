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
  Image,
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
    major: '',
    year: '',
    bio: '',
  });

  useEffect(() => {
    const loadUser = async () => {
      const userData = await getStoredUser();
      setUser(userData);
      setFormData({
        name: userData?.name || '',
        email: userData?.email || '',
        phone: userData?.phoneNumber || '',
        major: userData?.major || '',
        year: userData?.year || '',
        bio: userData?.bio || '',
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
      <ScrollView style={styles.scrollView}>
        <View style={styles.profileHeader}>
          <Image
            source={require('../assets/profile-placeholder.png')}
            style={styles.profileImage}
          />
          <Text style={styles.userName}>{user?.name || 'User'}</Text>
          <Text style={styles.userType}>{user?.userType === 'blind' ? 'Blind Student' : 'Volunteer'}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Personal Information</Text>
          
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Name</Text>
            {isEditing ? (
              <TextInput
                style={styles.input}
                value={formData.name}
                onChangeText={(text) => setFormData({ ...formData, name: text })}
              />
            ) : (
              <Text style={styles.text}>{formData.name}</Text>
            )}
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email</Text>
            {isEditing ? (
              <TextInput
                style={styles.input}
                value={formData.email}
                onChangeText={(text) => setFormData({ ...formData, email: text })}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            ) : (
              <Text style={styles.text}>{formData.email}</Text>
            )}
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Phone</Text>
            {isEditing ? (
              <TextInput
                style={styles.input}
                value={formData.phone}
                onChangeText={(text) => setFormData({ ...formData, phone: text })}
                keyboardType="phone-pad"
              />
            ) : (
              <Text style={styles.text}>{formData.phone}</Text>
            )}
          </View>

          {user?.userType === 'blind' && (
            <>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Major</Text>
                {isEditing ? (
                  <TextInput
                    style={styles.input}
                    value={formData.major}
                    onChangeText={(text) => setFormData({ ...formData, major: text })}
                  />
                ) : (
                  <Text style={styles.text}>{formData.major}</Text>
                )}
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Year</Text>
                {isEditing ? (
                  <TextInput
                    style={styles.input}
                    value={formData.year}
                    onChangeText={(text) => setFormData({ ...formData, year: text })}
                  />
                ) : (
                  <Text style={styles.text}>{formData.year}</Text>
                )}
              </View>
            </>
          )}

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Bio</Text>
            {isEditing ? (
              <TextInput
                style={[styles.input, { height: 80 }]}
                value={formData.bio}
                onChangeText={(text) => setFormData({ ...formData, bio: text })}
                multiline
              />
            ) : (
              <Text style={styles.text}>{formData.bio}</Text>
            )}
          </View>
        </View>

        <View style={styles.buttonContainer}>
          {isEditing ? (
            <TouchableOpacity style={styles.button} onPress={handleUpdate}>
              <Text style={styles.buttonText}>Save Changes</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.button} onPress={() => setIsEditing(true)}>
              <Text style={styles.buttonText}>Edit Profile</Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity 
            style={[styles.button, styles.logoutButton]} 
            onPress={handleLogout}
          >
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
    backgroundColor: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  profileHeader: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#F8F9FA',
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
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
  text: {
    fontSize: 16,
    color: '#212529',
    padding: 12,
  },
  buttonContainer: {
    padding: 20,
    gap: 10,
  },
  button: {
    backgroundColor: '#14957B',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
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
  },
});

export default ProfileScreen;
