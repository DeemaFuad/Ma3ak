import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  Linking,
  RefreshControl,
  Modal,
} from 'react-native';
import * as Location from 'expo-location';
import Icon from 'react-native-vector-icons/Ionicons';
import Header from '../components/Header';
import { getAuthToken } from '../config';
import axios from 'axios';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';

const API_URL = 'http://192.168.0.102:5000';

// Helper function to calculate distance between two points
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in meters

  return distance;
};

// Helper function to format distance
const formatDistance = (distanceInMeters) => {
  if (distanceInMeters < 1000) {
    return `${Math.round(distanceInMeters)}m away`;
  } else {
    return `${(distanceInMeters / 1000).toFixed(1)}km away`;
  }
};

const VolunteerRequestsScreen = () => {
  const [requests, setRequests] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [location, setLocation] = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isMapVisible, setIsMapVisible] = useState(false);
  const [mapRegion, setMapRegion] = useState(null);

  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required to view nearby requests.');
        return null;
      }

      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High
      });
      return currentLocation.coords;
    } catch (error) {
      console.error('Error getting location:', error);
      Alert.alert('Error', 'Failed to get your location');
      return null;
    }
  };

  const fetchRequests = useCallback(async () => {
    try {
      const currentLocation = await getCurrentLocation();
      if (!currentLocation) return;

      setLocation(currentLocation);

      const token = await getAuthToken();
      const response = await axios.get(
        `${API_URL}/volunteerRequests/requests`,
        {
          params: {
            latitude: currentLocation.latitude,
            longitude: currentLocation.longitude,
          },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Add distance information to each request
      const requestsWithDistance = response.data.map(request => ({
        ...request,
        distance: calculateDistance(
          currentLocation.latitude,
          currentLocation.longitude,
          request.location.coordinates[1],
          request.location.coordinates[0]
        )
      }));

      // Sort requests by distance
      requestsWithDistance.sort((a, b) => a.distance - b.distance);

      setRequests(requestsWithDistance);
    } catch (error) {
      console.error('Error fetching requests:', error.message || error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to fetch requests');
    }
  }, []);

  useEffect(() => {
    fetchRequests();
    const interval = setInterval(fetchRequests, 30000);
    return () => clearInterval(interval);
  }, [fetchRequests]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchRequests();
    setRefreshing(false);
  }, [fetchRequests]);

  const handleAttendRequest = async (request) => {
    try {
      const currentLocation = await getCurrentLocation();
      if (!currentLocation) return;

      setSelectedRequest(request);
      setMapRegion({
        latitude: request.location.coordinates[1],
        longitude: request.location.coordinates[0],
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
      setIsMapVisible(true);
    } catch (error) {
      console.error('Error preparing navigation:', error);
      Alert.alert('Error', 'Failed to prepare navigation');
    }
  };

  const confirmAttendance = async () => {
    try {
      const response = await fetch(`${API_URL}/volunteerRequests/attend/${selectedRequest._id}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${await getAuthToken()}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to attend request');
      }

      Alert.alert('Success', 'You are now attending this request');
      setIsMapVisible(false);
      fetchRequests();
    } catch (error) {
      console.error('Error attending request:', error);
      Alert.alert('Error', error.message || 'Failed to attend request');
    }
  };

  const openGoogleMaps = () => {
    if (!selectedRequest || !location) return;

    const { coordinates } = selectedRequest.location;
    const url = `https://www.google.com/maps/dir/?api=1&origin=${location.latitude},${location.longitude}&destination=${coordinates[1]},${coordinates[0]}&travelmode=walking`;
    Linking.openURL(url);
  };

  const handleContactStudent = (phoneNumber) => {
    if (!phoneNumber) {
      Alert.alert('Error', 'No contact information available');
      return;
    }

    Linking.openURL(`tel:${phoneNumber}`);
  };

  const renderRequestItem = ({ item }) => (
    <View style={styles.requestCard}>
      <View style={styles.requestHeader}>
        <View style={styles.userInfo}>
          <Icon name="person-circle" size={24} color="#00796B" />
          <Text style={styles.userName}>{item.userId.name}</Text>
        </View>
        <Text style={[
          styles.statusBadge,
          { backgroundColor: item.status === 'pending' ? '#FFF3E0' : '#E8F5E9' }
        ]}>
          {item.status}
        </Text>
      </View>

      <View style={styles.requestDetails}>
        <Text style={styles.requestType}>{item.assistanceType}</Text>
        {item.description && (
          <Text style={styles.description}>{item.description}</Text>
        )}
        <Text style={styles.date}>
          {new Date(item.createdAt).toLocaleString()}
        </Text>
      </View>

      <View style={styles.locationInfo}>
        <Icon name="location" size={20} color="#757575" />
        <Text style={styles.locationText}>
          {formatDistance(item.distance)}
        </Text>
      </View>

      <View style={styles.actionButtons}>
        {item.status === 'pending' && (
          <TouchableOpacity
            style={[styles.actionButton, styles.attendButton]}
            onPress={() => handleAttendRequest(item)}
          >
            <Icon name="navigate" size={20} color="#FFFFFF" />
            <Text style={styles.buttonText}>Navigate</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[styles.actionButton, styles.contactButton]}
          onPress={() => handleContactStudent(item.userId.phone)}
        >
          <Icon name="call" size={20} color="#FFFFFF" />
          <Text style={styles.buttonText}>Contact</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Header title="Assistance Requests" />
      <FlatList
        data={requests}
        renderItem={renderRequestItem}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="document-text" size={48} color="#BDBDBD" />
            <Text style={styles.emptyText}>No pending requests</Text>
          </View>
        }
      />

      <Modal
        visible={isMapVisible}
        animationType="slide"
        onRequestClose={() => setIsMapVisible(false)}
      >
        <View style={styles.mapContainer}>
          <MapView
            style={styles.map}
            provider={PROVIDER_GOOGLE}
            region={mapRegion}
            showsUserLocation
            showsMyLocationButton
          >
            {selectedRequest && (
              <Marker
                coordinate={{
                  latitude: selectedRequest.location.coordinates[1],
                  longitude: selectedRequest.location.coordinates[0],
                }}
                title="Request Location"
                description={selectedRequest.assistanceType}
              />
            )}
          </MapView>
          <View style={styles.mapButtons}>
            <TouchableOpacity
              style={[styles.mapButton, styles.confirmButton]}
              onPress={confirmAttendance}
            >
              <Text style={styles.mapButtonText}>Confirm Attendance</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.mapButton, styles.googleMapsButton]}
              onPress={openGoogleMaps}
            >
              <Text style={styles.mapButtonText}>Open in Google Maps</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.mapButton, styles.cancelButton]}
              onPress={() => setIsMapVisible(false)}
            >
              <Text style={styles.mapButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  listContainer: {
    padding: 16,
  },
  requestCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  requestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
    color: '#212529',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  requestDetails: {
    marginBottom: 12,
  },
  requestType: {
    fontSize: 18,
    fontWeight: '600',
    color: '#00796B',
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: '#424242',
    marginBottom: 8,
  },
  date: {
    fontSize: 12,
    color: '#757575',
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  locationText: {
    fontSize: 14,
    color: '#757575',
    marginLeft: 4,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
  },
  attendButton: {
    backgroundColor: '#00796B',
  },
  contactButton: {
    backgroundColor: '#2196F3',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  errorText: {
    color: '#D32F2F',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#00796B',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
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
  mapContainer: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  mapButtons: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    gap: 10,
  },
  mapButton: {
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  confirmButton: {
    backgroundColor: '#00796B',
  },
  googleMapsButton: {
    backgroundColor: '#2196F3',
  },
  cancelButton: {
    backgroundColor: '#757575',
  },
  mapButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default VolunteerRequestsScreen; 