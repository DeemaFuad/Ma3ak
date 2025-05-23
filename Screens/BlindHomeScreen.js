import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { getStoredUser } from '../utils/auth';
import Header from '../components/Header';
import Icon from 'react-native-vector-icons/Feather';
import axios from 'axios';

const API_URL = 'http://192.168.0.102:5000/auth';

const BlindHomeScreen = () => {
  const navigation = useNavigation();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeRequest, setActiveRequest] = useState(null);

  useEffect(() => {
    loadUserAndRequests();
  }, []);

  const loadUserAndRequests = async () => {
    try {
      setLoading(true);
      const userData = await getStoredUser();
      if (!userData?.token) {
        throw new Error('No authentication token found');
      }
      setUser(userData);

      // Fetch active requests
      const response = await axios.get(`${API_URL}/active-requests`, {
        headers: {
          Authorization: `Bearer ${userData.token}`
        }
      });

      if (response.data.success && response.data.requests.length > 0) {
        setActiveRequest(response.data.requests[0]); // Get the most recent active request
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const getWeekday = () => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[new Date().getDay()];
  };

  const getRequestStatus = () => {
    if (!activeRequest) 
      return {
        text: `No active requests`,
        icon: 'user-check',
        color: '#4CAF50'
      };

    switch (activeRequest.status) {
      case 'pending':
        return {
          text: 'Waiting for a volunteer...',
          icon: 'clock',
          color: '#FFA500'
        };
      case 'attended':
        return {
          text: `Volunteer ${activeRequest.assignedVolunteer?.name + 'is on the way'}!`,
          icon: 'user-check',
          color: '#4CAF50'
        };
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3BA99C" />
      </View>
    );
  }

  const requestStatus = getRequestStatus();

  return (
    <View style={styles.container}>
      <Header title="Home" />
      
      <View style={styles.headerSection}>
        <Text style={styles.greeting}>{getGreeting()}, {user?.name || 'there'}!</Text>
        <Text style={styles.weekday}>Today is {getWeekday()}</Text>
      </View>

      {requestStatus && (
        <View style={[styles.statusCard, { borderColor: requestStatus.color }]}>
          <Icon name={requestStatus.icon} size={24} color={requestStatus.color} />
          <Text style={[styles.statusText, { color: requestStatus.color }]}>
            {requestStatus.text}
          </Text>
        </View>
      )}

      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={styles.button}
          onPress={() => navigation.navigate('RequestAssistance')}
        >
          <Icon name="help-circle" size={24} color="#FFFFFF" style={styles.buttonIcon} />
          <Text style={styles.buttonText}>Request Assistance</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.button}
          onPress={() => navigation.navigate('MyRequests')}
        >
          <Icon name="list" size={24} color="#FFFFFF" style={styles.buttonIcon} />
          <Text style={styles.buttonText}>View My Requests</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#EDEFF1',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#EDEFF1',
  },
  headerSection: {
    marginTop: 20,
    marginBottom: 30,
  },
  greeting: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1C1C1E',
  },
  weekday: {
    fontSize: 16,
    color: '#6C757D',
    marginTop: 5,
  },
  statusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderRadius: 10,
    marginBottom: 30,
    borderWidth: 1,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 10,
  },
  buttonContainer: {
    gap: 20,
    alignItems: 'center',
  },
  button: {
    backgroundColor: '#3BA99C',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    width: '85%',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  buttonIcon: {
    marginRight: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default BlindHomeScreen; 