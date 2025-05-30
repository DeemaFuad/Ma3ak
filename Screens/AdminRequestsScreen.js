import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Header from '../components/Header';
import axios from 'axios';
import Icon from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'http://192.168.0.102:5000/api/admin';

const AdminRequestsScreen = () => {
  const navigation = useNavigation();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [viewPast, setViewPast] = useState(false);

  const fetchRequests = async (page = 1) => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        Alert.alert('Error', 'Authentication required');
        navigation.navigate('Login');
        return;
      }

      const status = viewPast ? 'finished' : 'pending';
      const response = await axios.get(`${API_URL}/requests`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { status, page }
      });

      setRequests(response.data.requests);
      setTotalPages(response.data.totalPages);
      setCurrentPage(response.data.currentPage);
    } catch (error) {
      console.error('Error fetching requests:', error);
      Alert.alert('Error', 'Failed to fetch requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [viewPast]);

  const handleStatusUpdate = async (requestId, newStatus) => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const response = await axios.patch(
        `${API_URL}/requests/${requestId}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setRequests(requests.map(req => 
        req._id === requestId ? response.data.request : req
      ));
      Alert.alert('Success', 'Request status updated');
    } catch (error) {
      console.error('Error updating request:', error);
      Alert.alert('Error', 'Failed to update request status');
    }
  };

  const renderRequest = (request) => (
    <View key={request._id} style={styles.requestCard}>
      <View style={styles.requestHeader}>
        <Text style={styles.requestType}>{request.assistanceType}</Text>
        <Text style={[
          styles.statusBadge,
          { backgroundColor: getStatusColor(request.status) }
        ]}>
          {request.status}
        </Text>
      </View>

      <View style={styles.userInfo}>
        <Icon name="person" size={16} color="#666" />
        <Text style={styles.userText}>
          {request.userId.name} ({request.userId.userType})
        </Text>
      </View>

      {request.description && (
        <Text style={styles.description}>{request.description}</Text>
      )}

      {request.assignedVolunteer && (
        <View style={styles.volunteerInfo}>
          <Icon name="people" size={16} color="#666" />
          <Text style={styles.volunteerText}>
            Assigned to: {request.assignedVolunteer.name}
          </Text>
        </View>
      )}

      <View style={styles.actions}>
        {request.status === 'pending' && (
          <>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: '#4CAF50' }]}
              onPress={() => handleStatusUpdate(request._id, 'attended')}
            >
              <Text style={styles.actionButtonText}>Mark Attended</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: '#F44336' }]}
              onPress={() => handleStatusUpdate(request._id, 'cancelled')}
            >
              <Text style={styles.actionButtonText}>Cancel</Text>
            </TouchableOpacity>
          </>
        )}
        {request.status === 'attended' && (
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: '#2196F3' }]}
            onPress={() => handleStatusUpdate(request._id, 'finished')}
          >
            <Text style={styles.actionButtonText}>Mark Finished</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#FFC107';
      case 'attended': return '#2196F3';
      case 'finished': return '#4CAF50';
      case 'cancelled': return '#F44336';
      default: return '#757575';
    }
  };

  return (
    <View style={styles.container}>
      <Header title="Manage Requests" />
      
      <View style={styles.toggleContainer}>
        <TouchableOpacity
          style={[styles.toggleButton, !viewPast && styles.toggleButtonActive]}
          onPress={() => setViewPast(false)}
        >
          <Text style={[styles.toggleButtonText, !viewPast && styles.toggleButtonTextActive]}>
            Current Requests
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toggleButton, viewPast && styles.toggleButtonActive]}
          onPress={() => setViewPast(true)}
        >
          <Text style={[styles.toggleButtonText, viewPast && styles.toggleButtonTextActive]}>
            Past Requests
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {loading ? (
          <ActivityIndicator size="large" color="#00796B" style={styles.loader} />
        ) : requests.length > 0 ? (
          requests.map(renderRequest)
        ) : (
          <Text style={styles.noRequests}>No requests found</Text>
        )}
      </ScrollView>

      {totalPages > 1 && (
        <View style={styles.pagination}>
          <TouchableOpacity
            style={[styles.pageButton, currentPage === 1 && styles.pageButtonDisabled]}
            onPress={() => currentPage > 1 && fetchRequests(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <Text style={styles.pageButtonText}>Previous</Text>
          </TouchableOpacity>
          <Text style={styles.pageInfo}>
            Page {currentPage} of {totalPages}
          </Text>
          <TouchableOpacity
            style={[styles.pageButton, currentPage === totalPages && styles.pageButtonDisabled]}
            onPress={() => currentPage < totalPages && fetchRequests(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            <Text style={styles.pageButtonText}>Next</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  toggleContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: 'center',
    borderRadius: 8,
    marginHorizontal: 4,
  },
  toggleButtonActive: {
    backgroundColor: '#00796B',
  },
  toggleButtonText: {
    color: '#757575',
    fontSize: 16,
    fontWeight: '500',
  },
  toggleButtonTextActive: {
    color: '#FFF',
  },
  requestCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  requestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  requestType: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#212121',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    fontSize: 14,
    color: '#FFF',
    fontWeight: '500',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  userText: {
    marginLeft: 8,
    color: '#666',
    fontSize: 14,
  },
  description: {
    color: '#424242',
    marginBottom: 12,
    fontSize: 14,
  },
  volunteerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  volunteerText: {
    marginLeft: 8,
    color: '#666',
    fontSize: 14,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
  },
  actionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginLeft: 8,
  },
  actionButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '500',
  },
  loader: {
    marginTop: 32,
  },
  noRequests: {
    textAlign: 'center',
    color: '#757575',
    fontSize: 16,
    marginTop: 32,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  pageButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#00796B',
  },
  pageButtonDisabled: {
    backgroundColor: '#BDBDBD',
  },
  pageButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '500',
  },
  pageInfo: {
    marginHorizontal: 16,
    color: '#757575',
    fontSize: 14,
  },
});

export default AdminRequestsScreen; 