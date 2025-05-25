import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  ScrollView,
  Alert,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Header from '../components/Header';

const API_URL = "http://192.168.0.102:5000";

const VolunteerHomeScreen = () => {
  const navigation = useNavigation();
  const [refreshing, setRefreshing] = useState(false);
  const [homeData, setHomeData] = useState({
    pendingRequestsCount: 0,
    currentRequest: null,
  });

  const fetchHomeData = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        Alert.alert('Error', 'Please log in again');
        return;
      }

      const response = await fetch(`${API_URL}/volunteerRequests/home-data`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch data');
      }

      const data = await response.json();
      setHomeData(data);
    } catch (error) {
      console.error('Error fetching home data:', error);
      Alert.alert('Error', error.message || 'Failed to load data');
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchHomeData();
    setRefreshing(false);
  };

  useFocusEffect(
    useCallback(() => {
      fetchHomeData();
    }, [])
  );

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  return (
    <View style={styles.container}>
      <Header title="Home" />
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.content}>
          {/* Pending Requests Card */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Icon name="time-outline" size={24} color="#14957B" />
              <Text style={styles.cardTitle}>Pending Requests</Text>
            </View>
            <Text style={styles.pendingCount}>{homeData.pendingRequestsCount}</Text>
            <Text style={styles.pendingText}>
              {homeData.pendingRequestsCount === 0
                ? 'No pending requests at the moment'
                : 'New requests waiting for volunteers'}
            </Text>
          </View>

          {/* Current Request Card */}
          {homeData.currentRequest && (
            <View style={[styles.card, styles.currentRequestCard]}>
              <View style={styles.cardHeader}>
                <Icon name="person-outline" size={24} color="#14957B" />
                <Text style={styles.cardTitle}>Current Request</Text>
              </View>
              <Text style={styles.studentName}>
                {homeData.currentRequest.studentName} is waiting for you
              </Text>
              <Text style={styles.requestType}>
                {homeData.currentRequest.assistanceType}
              </Text>
              <Text style={styles.requestTime}>
                Requested {formatTimeAgo(homeData.currentRequest.createdAt)}
              </Text>
            </View>
          )}

          {/* Quick Actions */}
          <View style={styles.quickActions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => navigation.navigate('VolunteerRequests')}
            >
              <Icon name="list-outline" size={24} color="#14957B" />
              <Text style={styles.actionText}>View Requests</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => navigation.navigate('MyTasks')}
            >
              <Icon name="checkmark-circle-outline" size={24} color="#14957B" />
              <Text style={styles.actionText}>My Tasks</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFB',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  currentRequestCard: {
    borderColor: '#14957B',
    borderWidth: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginLeft: 8,
  },
  pendingCount: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#14957B',
    marginBottom: 8,
  },
  pendingText: {
    fontSize: 14,
    color: '#666',
  },
  studentName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  requestType: {
    fontSize: 16,
    color: '#14957B',
    marginBottom: 4,
  },
  requestTime: {
    fontSize: 14,
    color: '#666',
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 4,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  actionText: {
    marginTop: 8,
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
});

export default VolunteerHomeScreen; 