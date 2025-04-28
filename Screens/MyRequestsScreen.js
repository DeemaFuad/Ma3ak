import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';

// Mock data - replace with actual API calls
const mockRequests = [
  {
    id: '1',
    description: 'Need help with grocery shopping',
    status: 'Pending',
    date: '2024-04-10 14:30',
  },
  {
    id: '2',
    description: 'Assistance with reading mail',
    status: 'Accepted',
    date: '2024-04-09 10:15',
  },
  {
    id: '3',
    description: 'Help with navigation to doctor appointment',
    status: 'Completed',
    date: '2024-04-08 09:00',
  },
];

const RequestItem = ({ item, onCancel }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending':
        return '#FFA500';
      case 'Accepted':
        return '#4CAF50';
      case 'Completed':
        return '#2196F3';
      default:
        return '#6C757D';
    }
  };

  return (
    <View style={styles.requestItem}>
      <Text style={styles.requestDescription}>{item.description}</Text>
      <View style={styles.requestDetails}>
        <Text style={[styles.status, { color: getStatusColor(item.status) }]}>
          {item.status}
        </Text>
        <Text style={styles.date}>{item.date}</Text>
      </View>
      {item.status === 'Pending' && (
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => onCancel(item.id)}
        >
          <Text style={styles.cancelButtonText}>Cancel Request</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const MyRequestsScreen = () => {
  const [requests, setRequests] = useState(mockRequests);

  const handleCancel = (requestId) => {
    Alert.alert(
      'Cancel Request',
      'Are you sure you want to cancel this request?',
      [
        {
          text: 'No',
          style: 'cancel',
        },
        {
          text: 'Yes',
          onPress: () => {
            // TODO: Call API to cancel request
            setRequests(requests.filter(req => req.id !== requestId));
            Alert.alert('Success', 'Request cancelled successfully');
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Requests</Text>
      <FlatList
        data={requests}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <RequestItem item={item} onCancel={handleCancel} />
        )}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#212529',
    margin: 20,
  },
  listContainer: {
    padding: 20,
  },
  requestItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#CED4DA',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  requestDescription: {
    color: '#212529',
    fontSize: 16,
    marginBottom: 10,
  },
  requestDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  status: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  date: {
    color: '#6C757D',
    fontSize: 14,
  },
  cancelButton: {
    backgroundColor: '#FF3B30',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    width: '85%',
    alignSelf: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cancelButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default MyRequestsScreen; 