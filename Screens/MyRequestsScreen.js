import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Header from '../components/Header';
import Icon from 'react-native-vector-icons/Feather';
import axios from 'axios';
import { getStoredUser } from '../utils/auth';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';


const API_URL = 'http://192.168.0.102:5000/auth';

const StarRating = ({ rating, onRatingChange, accessible }) => {
  return (
    <View style={styles.starContainer}>
      {[1, 2, 3, 4, 5].map((star) => (
        <TouchableOpacity
          key={star}
          onPress={() => onRatingChange(star)}
          accessible={accessible}
          accessibilityLabel={`Rate ${star} stars`}
          accessibilityHint="Double tap to select this rating"
        >
          <MaterialIcons
            name={star <= rating ? 'star' : 'star-border'}
            size={24}
            color="#FFD700" // gold
          />
        </TouchableOpacity>
      ))}
    </View>
  );
};


const FeedbackModal = ({ visible, onClose, onSubmit, volunteerName }) => {
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');

  const handleSubmit = () => {
    onSubmit(rating, feedback);
    setRating(0);
    setFeedback('');
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.modalContainer}
      >
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Rate Your Experience</Text>
          <Text style={styles.modalSubtitle}>
            How was your experience with {volunteerName}?
          </Text>

          <StarRating
            rating={rating}
            onRatingChange={setRating}
            accessible={true}
          />

          <TextInput
            style={styles.feedbackInput}
            placeholder="Add a comment (optional)"
            value={feedback}
            onChangeText={setFeedback}
            multiline
            numberOfLines={4}
            accessible={true}
            accessibilityLabel="Feedback comment"
            accessibilityHint="Enter your feedback about the volunteer"
          />

          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={[styles.modalButton, styles.skipButton]}
              onPress={onClose}
              accessible={true}
              accessibilityLabel="Skip feedback"
              accessibilityHint="Double tap to skip leaving feedback"
            >
              <Text style={styles.skipButtonText}>Skip</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.modalButton,
                styles.submitButton,
                !rating && styles.disabledButton
              ]}
              onPress={handleSubmit}
              disabled={!rating}
              accessible={true}
              accessibilityLabel="Submit feedback"
              accessibilityHint="Double tap to submit your feedback"
            >
              <Text style={styles.submitButtonText}>Submit</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const RequestItem = ({ item, onCancel, onFinish }) => {
  const [showFeedback, setShowFeedback] = useState(false);

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return '#FFA500';
      case 'attended':
        return '#4CAF50';
      case 'finished':
        return '#3BA99C';
      case 'cancelled':
        return '#D32F2F';
      default:
        return '#6C757D';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return 'clock';
      case 'attended':
        return 'user-check';
      case 'finished':
        return 'check-circle';
      case 'cancelled':
        return 'x-circle';
      default:
        return 'help-circle';
    }
  };

  const handleFinish = () => {
    setShowFeedback(true);
  };

  const handleFeedbackSubmit = async (rating, feedback) => {
    await onFinish(item._id, rating, feedback);
    setShowFeedback(false);
  };

  return (
    <View style={styles.requestItem}>
      <View style={styles.requestHeader}>
        <Icon name={getStatusIcon(item.status)} size={24} color={getStatusColor(item.status)} />
        <Text style={[styles.status, { color: getStatusColor(item.status) }]}>
          {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
        </Text>
      </View>

      <Text style={styles.requestDescription}>{item.assistanceType}</Text>
      {item.description && (
        <Text style={styles.description}>{item.description}</Text>
      )}
      
      <View style={styles.requestDetails}>
        <Text style={styles.date}>
          {new Date(item.createdAt).toLocaleString()}
        </Text>
        {item.assignedVolunteer && (
          <Text style={styles.volunteerInfo}>
            Volunteer: {item.assignedVolunteer.name}
          </Text>
        )}
      </View>

      <View style={styles.actionButtons}>
        {item.status === 'pending' && (
          <TouchableOpacity
            style={[styles.actionButton, styles.cancelButton]}
            onPress={() => onCancel(item._id)}
            accessible={true}
            accessibilityLabel="Cancel request"
            accessibilityHint="Double tap to cancel this assistance request"
          >
            <Icon name="x" size={20} color="#FFFFFF" />
            <Text style={styles.buttonText}>Cancel Request</Text>
          </TouchableOpacity>
        )}
        {item.status === 'attended' && (
          <TouchableOpacity
            style={[styles.actionButton, styles.finishButton]}
            onPress={handleFinish}
            accessible={true}
            accessibilityLabel="Mark request as finished"
            accessibilityHint="Double tap to mark this assistance request as completed"
          >
            <Icon name="check" size={20} color="#FFFFFF" />
            <Text style={styles.buttonText}>Mark as Finished</Text>
          </TouchableOpacity>
        )}
      </View>

      <FeedbackModal
        visible={showFeedback}
        onClose={() => setShowFeedback(false)}
        onSubmit={handleFeedbackSubmit}
        volunteerName={item.assignedVolunteer?.name || 'the volunteer'}
      />
    </View>
  );
};

const MyRequestsScreen = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadRequests = async () => {
    try {
      setLoading(true);
      setError(null);
      const userData = await getStoredUser();
      if (!userData?.token) {
        throw new Error('No authentication token found');
      }

      console.log('Loading requests with token:', userData.token.substring(0, 10) + '...');
      
      const response = await axios.get(`${API_URL}/requests`, {
        headers: {
          Authorization: `Bearer ${userData.token}`
        }
      });

      console.log('Response:', response.data);

      if (response.data.success) {
        setRequests(response.data.requests);
      } else {
        throw new Error(response.data.msg || 'Failed to load requests');
      }
    } catch (error) {
      console.error('Error loading requests:', error.response?.data || error.message);
      setError(error.response?.data?.msg || 'Failed to load requests. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const handleCancel = async (requestId) => {
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
          onPress: async () => {
            try {
              const userData = await getStoredUser();
              const response = await axios.put(
                `${API_URL}/requests/${requestId}/cancel`,
                {},
                {
                  headers: {
                    Authorization: `Bearer ${userData.token}`
                  }
                }
              );

              if (response.data.success) {
                Alert.alert('Success', 'Request cancelled successfully');
                loadRequests();
              }
            } catch (error) {
              console.error('Error cancelling request:', error);
              Alert.alert('Error', 'Failed to cancel request. Please try again.');
            }
          },
        },
      ]
    );
  };

  const handleFinish = async (requestId, rating, feedback) => {
    try {
      const userData = await getStoredUser();
      const response = await axios.put(
        `${API_URL}/requests/${requestId}/finish`,
        { rating, feedback },
        {
          headers: {
            Authorization: `Bearer ${userData.token}`
          }
        }
      );

      if (response.data.success) {
        Alert.alert('Success', 'Request marked as finished');
        loadRequests();
      }
    } catch (error) {
      console.error('Error finishing request:', error);
      Alert.alert('Error', 'Failed to mark request as finished. Please try again.');
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
      <Header title="My Requests" />
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
      <FlatList
        data={requests}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <RequestItem 
            item={item} 
            onCancel={handleCancel}
            onFinish={handleFinish}
          />
        )}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="inbox" size={48} color="#BDBDBD" />
            <Text style={styles.emptyText}>No requests found</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  errorContainer: {
    backgroundColor: '#FFEBEE',
    padding: 15,
    margin: 20,
    borderRadius: 10,
  },
  errorText: {
    color: '#D32F2F',
    fontSize: 14,
    textAlign: 'center',
  },
  listContainer: {
    padding: 20,
  },
  requestItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  requestHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  status: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  requestDescription: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#6C757D',
    marginBottom: 12,
  },
  requestDetails: {
    marginBottom: 15,
  },
  date: {
    fontSize: 12,
    color: '#6C757D',
    marginBottom: 4,
  },
  volunteerInfo: {
    fontSize: 14,
    color: '#3BA99C',
    fontWeight: '500',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
  },
  cancelButton: {
    backgroundColor: '#D32F2F',
  },
  finishButton: {
    backgroundColor: '#3BA99C',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 16,
    color: '#757575',
    marginTop: 8,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#212529',
    marginBottom: 8,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 16,
    color: '#6C757D',
    marginBottom: 20,
    textAlign: 'center',
  },
  starContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  star: {
    marginHorizontal: 4,
  },
  feedbackInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  modalButton: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  skipButton: {
    backgroundColor: '#F8F9FA',
  },
  submitButton: {
    backgroundColor: '#3BA99C',
  },
  disabledButton: {
    backgroundColor: '#BDBDBD',
  },
  skipButtonText: {
    color: '#6C757D',
    fontSize: 16,
    fontWeight: '500',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default MyRequestsScreen;
