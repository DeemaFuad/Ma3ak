import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Header from '../components/Header';

const API_URL = "http://192.168.0.102:5000";

const MyTasksScreen = () => {
  const [tasks, setTasks] = useState({
    ongoingTasks: [],
    completedTasks: [],
  });
  const [refreshing, setRefreshing] = useState(false);

  const fetchTasks = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        Alert.alert('Error', 'Please log in again');
        return;
      }

      const response = await fetch(`${API_URL}/api/volunteer-tasks/my-tasks`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch tasks');
      }

      const data = await response.json();
      setTasks(data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      Alert.alert('Error', error.message || 'Failed to load tasks');
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchTasks();
    setRefreshing(false);
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchTasks();
    }, [])
  );

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const StatusBadge = ({ isCompleted }) => (
    <View style={[
      styles.statusBadge,
      isCompleted ? styles.completedBadge : styles.ongoingBadge
    ]}>
      <Text style={[
        styles.statusText,
        isCompleted ? styles.completedStatusText : styles.ongoingStatusText
      ]}>
        {isCompleted ? 'Completed' : 'Ongoing'}
      </Text>
    </View>
  );

  const renderTaskItem = ({ item, isCompleted }) => (
    <View style={[
      styles.taskCard,
      isCompleted && styles.completedTaskCard
    ]}>
      <View style={styles.taskHeader}>
        <View style={styles.headerLeft}>
          <Text style={styles.taskType}>{item.assistanceType}</Text>
          <StatusBadge isCompleted={isCompleted} />
        </View>
        <Text style={styles.taskDate}>
          {formatDate(item.createdAt)}
        </Text>
      </View>

      <View style={styles.studentInfo}>
        <Icon name="person-outline" size={16} color="#666" />
        <Text style={styles.studentName}>
          {item.userId?.name || 'Unknown Student'}
        </Text>
      </View>
      
      <Text style={styles.taskDescription}>{item.description}</Text>
      
      {item.location?.address && (
        <View style={styles.locationContainer}>
          <Icon name="location-outline" size={16} color="#666" />
          <Text style={styles.locationText}>{item.location.address}</Text>
        </View>
      )}

      {isCompleted && (
        <View style={styles.completedInfo}>
          <Text style={styles.completedLabel}>Completed:</Text>
          <Text style={styles.completedDate}>{formatDate(item.updatedAt)}</Text>
          {item.volunteerRating && (
            <View style={styles.ratingContainer}>
              <Text style={styles.ratingLabel}>Rating:</Text>
              <View style={styles.starsContainer}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <Icon
                    key={star}
                    name={star <= item.volunteerRating ? 'star' : 'star-outline'}
                    size={16}
                    color="#FFD700"
                  />
                ))}
              </View>
              {item.volunteerFeedback && (
                <Text style={styles.feedback}>{item.volunteerFeedback}</Text>
              )}
            </View>
          )}
        </View>
      )}
    </View>
  );

  const EmptyState = () => (
    <View style={styles.emptyContainer}>
      <Icon name="list-outline" size={48} color="#9CA3AF" style={styles.emptyIcon} />
      <Text style={styles.emptyText}>No tasks found</Text>
      <Text style={styles.emptySubtext}>Your accepted tasks will appear here</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Header title="My Tasks" />
      <FlatList
        data={[
          ...tasks.ongoingTasks.map(task => ({ ...task, isCompleted: false })),
          ...tasks.completedTasks.map(task => ({ ...task, isCompleted: true }))
        ]}
        renderItem={({ item }) => renderTaskItem({ item, isCompleted: item.isCompleted })}
        keyExtractor={(item) => item._id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={EmptyState}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFB',
  },
  taskCard: {
    backgroundColor: '#ffffff',
    margin: 10,
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  completedTaskCard: {
    backgroundColor: '#F9FDF9',
    borderColor: '#A7F3D0',
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  headerLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  taskType: {
    color: '#14957B',
    fontSize: 16,
    fontWeight: 'bold',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  ongoingBadge: {
    backgroundColor: '#FEF3C7',
  },
  completedBadge: {
    backgroundColor: '#D1FAE5',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  ongoingStatusText: {
    color: '#92400E',
  },
  completedStatusText: {
    color: '#065F46',
  },
  taskDate: {
    color: '#666',
    fontSize: 14,
  },
  studentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  studentName: {
    color: '#374151',
    fontSize: 14,
    marginLeft: 5,
    fontWeight: '500',
  },
  taskDescription: {
    color: '#374151',
    fontSize: 14,
    marginBottom: 10,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  locationText: {
    color: '#666',
    marginLeft: 5,
    fontSize: 14,
  },
  completedInfo: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#D1D5DB',
  },
  completedLabel: {
    color: '#666',
    fontSize: 14,
    marginBottom: 5,
  },
  completedDate: {
    color: '#374151',
    fontSize: 14,
    marginBottom: 10,
  },
  ratingContainer: {
    marginTop: 5,
  },
  ratingLabel: {
    color: '#666',
    fontSize: 14,
    marginBottom: 5,
  },
  starsContainer: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  feedback: {
    color: '#666',
    fontSize: 14,
    fontStyle: 'italic',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyIcon: {
    marginBottom: 16,
  },
  emptyText: {
    color: '#9CA3AF',
    fontSize: 18,
    fontWeight: '500',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtext: {
    color: '#9CA3AF',
    fontSize: 14,
    textAlign: 'center',
  },
});

export default MyTasksScreen; 