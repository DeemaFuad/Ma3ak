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

  const handleChange = (key, value) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
    const { name, email, password, phoneNumber, userType } = form;
  
    if (!name || !email || !password || !phoneNumber || !userType) {
      return Alert.alert('Error', 'Please fill in all required fields.');
    }
  
    if (!email.endsWith('@ju.edu.jo')) {
      return Alert.alert('Error', 'Please use your university email address.');
    }
  
    try {
      const res = await axios.post('http://localhost:5000/api/signup', form);
      Alert.alert('Success', res.data.msg || 'Account created!');
      // Navigate to login/home screen if needed
    } catch (error) {
      if (error.response) {
        Alert.alert('Error', error.response.data.msg || 'Sign up failed');
      } else {
        Alert.alert('Error', 'Could not connect to server');
      }
    }
  };
  

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Sign Up</Text>

      <TextInput style={styles.input} placeholder="Name" onChangeText={text => handleChange('name', text)} />
      <TextInput style={styles.input} placeholder="University Email" autoCapitalize="none" keyboardType="email-address" onChangeText={text => handleChange('email', text)} />
      <TextInput style={styles.input} placeholder="Password" secureTextEntry onChangeText={text => handleChange('password', text)} />
      <TextInput style={styles.input} placeholder="Phone Number" keyboardType="phone-pad" onChangeText={text => handleChange('phoneNumber', text)} />

      <Text style={styles.label}>I am a:</Text>
      <View style={styles.roleContainer}>
        <TouchableOpacity
          style={[styles.roleButton, form.userType === 'blind' && styles.selected]}
          onPress={() => handleChange('userType', 'blind')}
        >
          <Text>Blind Student</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.roleButton, form.userType === 'volunteer' && styles.selected]}
          onPress={() => handleChange('userType', 'volunteer')}
        >
          <Text>Volunteer</Text>
        </TouchableOpacity>
      </View>

      <TextInput style={styles.input} placeholder="Major (Optional)" onChangeText={text => handleChange('major', text)} />
      <TextInput style={styles.input} placeholder="Year (First, Second, etc.)" onChangeText={text => handleChange('year', text)} />
      <TextInput
        style={[styles.input, { height: 80 }]}
        placeholder="Bio (Optional)"
        multiline
        onChangeText={text => handleChange('bio', text)}
      />

      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
        <Text style={styles.submitText}>Sign Up</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20, paddingTop: 50 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  input: {
    borderWidth: 1, borderColor: '#ccc', padding: 10, borderRadius: 10, marginBottom: 15,
  },
  label: { marginBottom: 5, fontWeight: '600' },
  roleContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
  roleButton: {
    flex: 1, padding: 10, borderWidth: 1, borderColor: '#ccc',
    marginHorizontal: 5, borderRadius: 10, alignItems: 'center',
  },
  selected: {
    backgroundColor: '#cce5ff', borderColor: '#007bff',
  },
  submitButton: {
    backgroundColor: '#007bff', padding: 15, borderRadius: 10, alignItems: 'center',
  },
  submitText: { color: '#fff', fontWeight: 'bold' },
});

export default SignUpScreen;