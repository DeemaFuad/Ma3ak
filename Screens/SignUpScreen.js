import React, { useState } from 'react';
import axios from 'axios';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView
} from 'react-native';

const SignUpScreen = () => {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    phoneNumber: '',
    userType: '',
    major: '',
    year: '',
    bio: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (key, value) => {
    console.log(`Updating ${key} with value:`, value);
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
    console.log('Submit button pressed');
    console.log('Current form data:', form);
    
    const { name, email, password, phoneNumber, userType } = form;
  
    // Validation checks
    if (!name || !email || !password || !phoneNumber || !userType) {
      console.log('Validation failed: Missing required fields');
      console.log('Missing fields:', {
        name: !name,
        email: !email,
        password: !password,
        phoneNumber: !phoneNumber,
        userType: !userType
      });
      return Alert.alert('Error', 'Please fill in all required fields.');
    }
  
    if (!email.endsWith('@ju.edu.jo')) {
      console.log('Validation failed: Invalid email domain');
      return Alert.alert('Error', 'Please use your university email address.');
    }
  
    setIsLoading(true);
    
    try {
      console.log('Making API request to:', 'http://localhost:5000/auth/signup');
      const res = await axios.post('http://192.168.0.107:5000/auth/signup', form);
      console.log('API Response:', res.data);
      
      Alert.alert('Success', res.data.msg || 'Account created!');
      // Navigate to login/home screen if needed
    } catch (error) {
      console.error('Sign up error:', error);
      
      if (error.response) {
        console.log('Server error response:', error.response.data);
        Alert.alert('Error', error.response.data.msg || 'Sign up failed');
      } else if (error.request) {
        console.log('No response received:', error.request);
        Alert.alert('Error', 'Could not connect to server. Please check your internet connection.');
      } else {
        console.log('Request setup error:', error.message);
        Alert.alert('Error', 'An unexpected error occurred. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Sign Up</Text>

      <TextInput 
        style={styles.input} 
        placeholder="Name" 
        value={form.name}
        onChangeText={text => handleChange('name', text)} 
      />
      <TextInput 
        style={styles.input} 
        placeholder="Example@ju.edu.jo" 
        value={form.email}
        autoCapitalize="none" 
        keyboardType="email-address" 
        onChangeText={text => handleChange('email', text)} 
      />
      <TextInput 
        style={styles.input} 
        placeholder="Password" 
        value={form.password}
        secureTextEntry 
        onChangeText={text => handleChange('password', text)} 
      />
      <TextInput 
        style={styles.input} 
        placeholder="Phone Number" 
        value={form.phoneNumber}
        keyboardType="phone-pad" 
        onChangeText={text => handleChange('phoneNumber', text)} 
      />

      <Text style={styles.label}>I am a:</Text>
      <View style={styles.roleContainer}>
        <TouchableOpacity
          style={[styles.roleButton, form.userType === 'blind' && styles.selected]}
          onPress={() => handleChange('userType', 'blind')}
        >
          <Text style={form.userType === 'blind' ? styles.selectedText : null}>Blind Student</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.roleButton, form.userType === 'volunteer' && styles.selected]}
          onPress={() => handleChange('userType', 'volunteer')}
        >
          <Text style={form.userType === 'volunteer' ? styles.selectedText : null}>Volunteer</Text>
        </TouchableOpacity>
      </View>

      <TextInput 
        style={styles.input} 
        placeholder="Major (Optional)" 
        value={form.major}
        onChangeText={text => handleChange('major', text)} 
      />
      <TextInput 
        style={styles.input} 
        placeholder="Year (First, Second, etc.)" 
        value={form.year}
        onChangeText={text => handleChange('year', text)} 
      />
      <TextInput
        style={[styles.input, { height: 80 }]}
        placeholder="Bio (Optional)"
        value={form.bio}
        multiline
        onChangeText={text => handleChange('bio', text)}
      />

      <TouchableOpacity 
        style={[styles.submitButton, isLoading && styles.submitButtonDisabled]} 
        onPress={handleSubmit}
        disabled={isLoading}
      >
        <Text style={styles.submitText}>{isLoading ? 'Signing Up...' : 'Sign Up'}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { 
    padding: 20, 
    paddingTop: 50 
  },
  title: { 
    fontSize: 24, 
    fontWeight: 'bold', 
    marginBottom: 20 
  },
  input: {
    borderWidth: 1, 
    borderColor: '#ccc', 
    padding: 10, 
    borderRadius: 10, 
    marginBottom: 15,
    backgroundColor: '#fff',
  },
  label: { 
    marginBottom: 5, 
    fontWeight: '600' 
  },
  roleContainer: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    marginBottom: 15 
  },
  roleButton: {
    flex: 1, 
    padding: 10, 
    borderWidth: 1, 
    borderColor: '#ccc',
    marginHorizontal: 5, 
    borderRadius: 10, 
    alignItems: 'center',
  },
  selected: {
    backgroundColor: '#007bff', 
    borderColor: '#0056b3',
  },
  selectedText: {
    color: '#fff',
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: '#007bff', 
    padding: 15, 
    borderRadius: 10, 
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#ccc',
  },
  submitText: { 
    color: '#fff', 
    fontWeight: 'bold' 
  },
});

export default SignUpScreen;