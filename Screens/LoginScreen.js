import React, { useState } from 'react';
import Icon from 'react-native-vector-icons/FontAwesome'; // Importing FontAwesome icons
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import storageEventEmitter from '../utils/storageEventEmitter';

const API_URL = 'http://192.168.0.102:5000/auth';// Use http:// and your development machine's local IP address


export default function LoginScreen() {
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const storeUserData = async (token, user) => {
    try {
      await AsyncStorage.multiSet([
        ['userToken', token],
        ['userData', JSON.stringify({ ...user, token })]
      ]);
      
      // Emit events for both storage changes
      storageEventEmitter.emit('authChange', { key: 'userToken' });
      storageEventEmitter.emit('authChange', { key: 'userData' });
    } catch (error) {
      console.error('Error storing user data:', error);
      throw error;
    }
  };

  const handleLogin = async () => {
    console.log("Attempting login with:", email, password);

    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await axios.post(`${API_URL}/login`, {
        email,
        password,
      });

      const { token, user } = response.data;
      
      // Store the token and user data
      await storeUserData(token, user);
      
      // Set the authorization header for future requests
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      // The AppNavigator will automatically detect the auth state change
      // and navigate to the appropriate screen
    } catch (err) {
      console.log("Login error:", err?.response?.data || err.message);
      const errorMessage = err.response?.data?.msg || 'An error occurred during login';
      setError(errorMessage);
      Alert.alert('Login Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.content}>
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Sign in to continue</Text>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <View style={styles.inputContainer}>
            <Icon name="user" size={20} color="#DBDBDB" style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="Email"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                setError('');
              }}
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!loading}
              placeholderTextColor="#DBDBDB"
            />
          </View>
          
          <View style={styles.inputContainer}>
            <Icon name="lock" size={20} color="#DBDBDB" style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="Password"
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                setError('');
              }}
              placeholderTextColor="#DBDBDB"
              secureTextEntry
              editable={!loading}
            />
          </View>

          <TouchableOpacity 
            style={[styles.loginButton, loading && styles.loginButtonDisabled]} 
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.loginButtonText}>Login</Text>
            )}
          </TouchableOpacity>

          <View style={styles.signupContainer}>
            <Text style={styles.signupText}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('SignUp')} disabled={loading}>
              <Text style={styles.signupLink}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#DBDBDB',
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#888888',
    marginBottom: 30,
  },
  inputContainer: {
    marginBottom: 20,
  },
  input: {
    backgroundColor: '#333333',
    borderRadius: 10,
    padding: 15,
    paddingLeft: 40,
    marginBottom: 15,
    color: '#ffffff',
    fontSize: 16,
  },
  loginButton: {
    backgroundColor: '#14957B',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  loginButtonDisabled: {
    backgroundColor: '#ccc',
  },
  loginButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  signupText: {
    color: '#888888',
    fontSize: 14,
  },
  signupLink: {
    color: '#14957B',
    fontSize: 14,
    fontWeight: 'bold',
  },
  errorText: {
    color: '#ff4444',
    marginBottom: 15,
    textAlign: 'center',
  },
  icon: {
    position: 'absolute', // Position the icon inside the input field
    left: 10, // Adjust this value for better positioning
    top: '40%', // Center it vertically
    transform: [{ translateY: -10 }], // Fine-tune vertical alignment
  },
});
