import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Modal,
  ActivityIndicator,
  Platform,
  Vibration,
} from 'react-native';
import * as Location from 'expo-location';
import Icon from 'react-native-vector-icons/Ionicons';
import MapView, { Marker } from 'react-native-maps';

const RequestAssistanceScreen = () => {
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isMapVisible, setIsMapVisible] = useState(false);
  const [mapRegion, setMapRegion] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getCurrentLocation = async () => {
    try {
      setIsLoading(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required to submit a request.');
        return;
      }

      const currentLocation = await Location.getCurrentPositionAsync({});
      const region = {
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };
      setMapRegion(region);
      setLocation({
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
      });
      setIsMapVisible(true);
    } catch (error) {
      Alert.alert('Error', 'Could not get your location. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMapPress = (e) => {
    const { latitude, longitude } = e.nativeEvent.coordinate;
    setMapRegion({
      ...mapRegion,
      latitude,
      longitude,
    });
  };

  const confirmLocation = () => {
    if (mapRegion) {
      setLocation({
        latitude: mapRegion.latitude,
        longitude: mapRegion.longitude,
      });
      setIsMapVisible(false);
    }
  };

  const handleSubmit = () => {
    if (!description) {
      Alert.alert('Error', 'Please describe your request');
      return;
    }
    if (!location) {
      Alert.alert('Error', 'Please select your location');
      return;
    }

    // Haptic feedback
    if (Platform.OS === 'ios') {
      Vibration.vibrate(50);
    } else {
      Vibration.vibrate(100);
    }

    setIsSubmitting(true);
    // TODO: Submit request to backend
    setTimeout(() => {
      setIsSubmitting(false);
      Alert.alert('Success', 'Your request has been submitted!');
    }, 1500);
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Request Assistance</Text>
      
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Describe your request</Text>
        <TextInput
          style={styles.input}
          placeholder="What kind of help do you need?"
          placeholderTextColor="#757575"
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={6}
          minHeight={150}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Location</Text>
        <TouchableOpacity
          style={styles.locationButton}
          onPress={getCurrentLocation}
          disabled={isLoading}
          accessibilityLabel="Select location on map"
          accessibilityHint="Opens a map view where you can adjust your location"
        >
          <Text style={styles.locationButtonText}>
            {location ? 'Adjust Location' : 'Select Location'}
          </Text>
        </TouchableOpacity>
        <Text style={styles.helperText}>
          Tap to adjust your location on the map.
        </Text>
        {location && (
          <Text style={styles.locationText}>
            Latitude: {location.latitude.toFixed(4)}, Longitude: {location.longitude.toFixed(4)}
          </Text>
        )}
      </View>

      <TouchableOpacity
        style={styles.submitButton}
        onPress={handleSubmit}
        disabled={isSubmitting}
        accessibilityLabel="Submit request"
        accessibilityHint="Sends your assistance request"
      >
        {isSubmitting ? (
          <ActivityIndicator color="white" />
        ) : (
          <>
            <Icon name="send" size={24} color="white" style={styles.submitIcon} />
            <Text style={styles.submitButtonText}>Submit Request</Text>
          </>
        )}
      </TouchableOpacity>

      <Modal
        visible={isMapVisible}
        animationType="slide"
        onRequestClose={() => setIsMapVisible(false)}
      >
        <View style={styles.mapContainer}>
          <MapView
            style={styles.map}
            region={mapRegion}
            onPress={handleMapPress}
            accessibilityLabel="Map view"
            accessibilityHint="Move the map to adjust your location. Confirm when ready."
          >
            {mapRegion && (
              <Marker
                coordinate={{
                  latitude: mapRegion.latitude,
                  longitude: mapRegion.longitude,
                }}
              />
            )}
          </MapView>
          <TouchableOpacity
            style={styles.confirmButton}
            onPress={confirmLocation}
            accessibilityLabel="Confirm location"
          >
            <Text style={styles.confirmButtonText}>Confirm Location</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#FFFFFF',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#212529',
    marginBottom: 30,
    fontFamily: 'Roboto',
  },
  inputContainer: {
    marginBottom: 25,
  },
  label: {
    color: '#212529',
    fontSize: 16,
    marginBottom: 8,
    fontFamily: 'Roboto',
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    color: '#212529',
    fontSize: 16,
    minHeight: 150,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: '#CED4DA',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    fontFamily: 'Roboto',
  },
  locationButton: {
    backgroundColor: '#00796B',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    width: '85%',
    alignSelf: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    minHeight: 48,
    justifyContent: 'center',
  },
  locationButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'Roboto',
  },
  helperText: {
    color: '#757575',
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
    fontFamily: 'Roboto',
  },
  locationText: {
    color: '#757575',
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
    fontFamily: 'Roboto',
  },
  submitButton: {
    backgroundColor: '#00796B',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
    width: '85%',
    alignSelf: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    minHeight: 56,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  submitIcon: {
    marginRight: 8,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'Roboto',
  },
  mapContainer: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  confirmButton: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: '#00796B',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  confirmButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'Roboto',
  },
});

export default RequestAssistanceScreen; 