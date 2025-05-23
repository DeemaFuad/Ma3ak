import React, { useState, useEffect } from 'react';
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
  Image,
} from 'react-native';
import * as Location from 'expo-location';
import Icon from 'react-native-vector-icons/Ionicons';
import MapView, { Marker } from 'react-native-maps';
import { useNavigation } from '@react-navigation/native';
import Header from '../components/Header';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Voice from '@react-native-voice/voice';

const ASSISTANCE_OPTIONS = [
  { key: 'guide', label: 'I need a guide.' },
  { key: 'find_place', label: 'I need help finding a place.' },
  { key: 'writer_exam', label: 'I need a writer in an exam.' },
  { key: 'homework', label: 'I need help with homework.' },
  { key: 'clinic', label: 'I need to visit the university clinic.' },
  { key: 'registration', label: 'Registration of subjects.' },
  { key: 'other', label: 'Other' },
];

const RequestAssistanceScreen = () => {
  const navigation = useNavigation();
  const [selectedOption, setSelectedOption] = useState(null);
  const [otherText, setOtherText] = useState('');
  const [location, setLocation] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isMapVisible, setIsMapVisible] = useState(false);
  const [mapRegion, setMapRegion] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasUnseenNotifications, setHasUnseenNotifications] = useState(true); // This would come from your state management
  const [isSelectorVisible, setIsSelectorVisible] = useState(false);
  const [locationError, setLocationError] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const [voiceError, setVoiceError] = useState(null);

  useEffect(() => {
    const fetchInitialLocation = async () => {
      setIsLoading(true);
      setLocationError(null);
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setLocationError('Location permission denied. Please enable location services.');
          setIsLoading(false);
          return;
        }
        const currentLocation = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Highest });
        setLocation({
          latitude: currentLocation.coords.latitude,
          longitude: currentLocation.coords.longitude,
        });
        setMapRegion({
          latitude: currentLocation.coords.latitude,
          longitude: currentLocation.coords.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        });
      } catch (error) {
        setLocationError('Could not get your location. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchInitialLocation();
  }, []);

  useEffect(() => {
    // Initialize voice recognition
    const initVoice = async () => {
      try {
        await Voice.isAvailable();
        Voice.onSpeechStart = onSpeechStart;
        Voice.onSpeechEnd = onSpeechEnd;
        Voice.onSpeechResults = onSpeechResults;
        Voice.onSpeechError = onSpeechError;
      } catch (e) {
        setVoiceError('Voice recognition is not available on this device');
      }
    };

    initVoice();

    return () => {
      // Cleanup
      Voice.destroy().then(Voice.removeAllListeners);
    };
  }, []);

  const onSpeechStart = () => {
    setIsListening(true);
    setVoiceError(null);
  };

  const onSpeechEnd = () => {
    setIsListening(false);
  };

  const onSpeechResults = (e) => {
    const text = e.value[0];
    if (selectedOption === 'other') {
      setOtherText(text);
    } else {
      // If no option is selected, find the closest matching option
      const matchingOption = ASSISTANCE_OPTIONS.find(option => 
        option.label.toLowerCase().includes(text.toLowerCase())
      );
      if (matchingOption) {
        setSelectedOption(matchingOption.key);
      } else {
        setSelectedOption('other');
        setOtherText(text);
      }
    }
  };

  const onSpeechError = (e) => {
    setVoiceError(e.error?.message || 'Speech recognition failed');
    setIsListening(false);
  };

  const startListening = async () => {
    try {
      setVoiceError(null);
      await Voice.start('en-US');
    } catch (e) {
      setVoiceError(e.message || 'Failed to start voice recognition');
      setIsListening(false);
    }
  };

  const stopListening = async () => {
    try {
      await Voice.stop();
    } catch (e) {
      setVoiceError(e.message || 'Failed to stop voice recognition');
    }
  };

  const getCurrentLocation = async () => {
    try {
      setIsLoading(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required to submit a request.');
        return;
      }

      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Highest,
      });
      
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

  const handleSelectOption = (key) => {
    setSelectedOption(key);
    setIsSelectorVisible(false);
    if (key !== 'other') setOtherText('');
  };

  const isOtherSelected = selectedOption === 'other';

  const handleSubmit = async () => {
    if (!selectedOption) {
      Alert.alert('Error', 'Please select the type of assistance you need.');
      return;
    }
    if (isOtherSelected && !otherText.trim()) {
      Alert.alert('Error', 'Please describe your request in the "Other" field.');
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
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        setIsSubmitting(false);
        Alert.alert('Error', 'You must be logged in to submit a request.');
        return;
      }

      const payload = {
        assistanceType: selectedOption,
        description: isOtherSelected ? otherText.trim() : undefined,
        location: {
          type: "Point",
          coordinates: [location.longitude, location.latitude]  // Note: GeoJSON format is [longitude, latitude]
        }
      };
      
      console.log('Submitting payload:', payload);
      const res = await axios.post('http://192.168.0.102:5000/auth/requests', payload, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      setIsSubmitting(false);
      Alert.alert('Success', 'Your request has been submitted!');
      // Reset form
      setSelectedOption(null);
      setOtherText('');
      setLocation(null);
    } catch (error) {
      setIsSubmitting(false);
      let msg = 'Failed to submit request.';
      if (error.response && error.response.data && error.response.data.msg) {
        msg = error.response.data.msg;
      }
      Alert.alert('Error', msg);
    }
  };

  return (
    <View style={styles.container}>
      <Header title="Request Assistance" />
      <ScrollView style={styles.content}>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Type of Assistance</Text>
          <View style={styles.selectorContainer}>
            <TouchableOpacity
              style={styles.selectorField}
              onPress={() => setIsSelectorVisible(true)}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Select the type of assistance you need"
              accessibilityHint="Opens a list of assistance options"
            >
              <Text style={[styles.selectorText, !selectedOption && { color: '#757575' }]}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {selectedOption
                  ? ASSISTANCE_OPTIONS.find(o => o.key === selectedOption)?.label
                  : 'Select the type of assistance you need'}
              </Text>
              <Icon name="chevron-down" size={22} color="#00796B" style={{ marginLeft: 8 }} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.micButton, isListening && styles.micButtonRecording]}
              onPress={isListening ? stopListening : startListening}
              accessibilityLabel={isListening ? "Stop voice input" : "Start voice input"}
              accessibilityHint="Double tap to start or stop voice recognition"
            >
              <Icon 
                name={isListening ? "stop-circle" : "mic"} 
                size={24} 
                color={isListening ? "#FF0000" : "#00796B"} 
              />
            </TouchableOpacity>
          </View>
          {isListening && (
            <Text style={styles.listeningText} accessibilityLiveRegion="polite">
              Listening...
            </Text>
          )}
          {voiceError && (
            <Text style={styles.errorText} accessibilityLiveRegion="polite">
              {voiceError}
            </Text>
          )}
          {isOtherSelected && (
            <TextInput
              style={styles.input}
              placeholder="Please describe your request..."
              placeholderTextColor="#757575"
              value={otherText}
              onChangeText={setOtherText}
              multiline
              numberOfLines={3}
              minHeight={60}
              accessibilityLabel="Other assistance description"
            />
          )}
          <Modal
            visible={isSelectorVisible}
            animationType="slide"
            transparent
            onRequestClose={() => setIsSelectorVisible(false)}
          >
            <TouchableOpacity
              style={styles.bottomSheetBackdrop}
              activeOpacity={1}
              onPress={() => setIsSelectorVisible(false)}
              accessible={true}
              accessibilityLabel="Close assistance type selector"
            >
              <View style={styles.bottomSheetContainer}>
                <View style={styles.bottomSheetHandle} />
                {ASSISTANCE_OPTIONS.map(option => (
                  <TouchableOpacity
                    key={option.key}
                    style={[
                      styles.bottomSheetOption,
                      selectedOption === option.key && styles.bottomSheetOptionSelected,
                    ]}
                    onPress={() => handleSelectOption(option.key)}
                    accessible={true}
                    accessibilityRole="button"
                    accessibilityState={{ selected: selectedOption === option.key }}
                    accessibilityLabel={option.label}
                  >
                    <Text style={styles.bottomSheetOptionText}>{option.label}</Text>
                    {selectedOption === option.key && (
                      <Icon name="checkmark" size={20} color="#00796B" />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </TouchableOpacity>
          </Modal>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Location</Text>
          <View style={styles.mapPreviewContainer}>
            <TouchableOpacity
              activeOpacity={0.85}
              style={styles.mapPreviewTouchable}
              onPress={() => setIsMapVisible(true)}
              accessible={true}
              accessibilityRole="imagebutton"
              accessibilityLabel={location ? `Map preview, current location: latitude ${location.latitude?.toFixed(4)}, longitude ${location.longitude?.toFixed(4)}` : 'Map preview, no location selected'}
              accessibilityHint="Opens an interactive map to select or adjust your location"
            >
              <MapView
                style={styles.mapPreview}
                region={location ? {
                  latitude: location.latitude,
                  longitude: location.longitude,
                  latitudeDelta: 0.01,
                  longitudeDelta: 0.01,
                } : {
                  latitude: 24.7136, // Default to Riyadh, KSA
                  longitude: 46.6753,
                  latitudeDelta: 0.01,
                  longitudeDelta: 0.01,
                }}
                pointerEvents="none"
                importantForAccessibility="no-hide-descendants"
                accessibilityLabel={location ? `Map showing your current location at latitude ${location.latitude?.toFixed(4)}, longitude ${location.longitude?.toFixed(4)}` : 'Map showing no location selected'}
                accessibilityHint="Double tap to open the interactive map and adjust your location"
              >
                {location && (
                  <Marker
                    coordinate={{ latitude: location.latitude, longitude: location.longitude }}
                    accessibilityLabel="Your selected location"
                  />
                )}
              </MapView>
              <TouchableOpacity
                style={styles.overlayLocationButton}
                onPress={() => setIsMapVisible(true)}
                accessibilityLabel="Select location on map"
                accessibilityHint="Opens an interactive map to select or adjust your location"
                accessible={true}
                accessibilityRole="button"
              >
                <Icon name="location" size={20} color="#fff" style={{ marginRight: 8 }} />
                <Text style={styles.overlayLocationButtonText}>
                  {location ? 'Adjust Location' : 'Select Location'}
                </Text>
              </TouchableOpacity>
            </TouchableOpacity>
          </View>
          {locationError && (
            <Text style={[styles.helperText, { color: '#c00', marginTop: 8 }]} accessibilityLiveRegion="polite">{locationError}</Text>
          )}
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  inputContainer: {
    marginBottom: 25,
    position: 'relative',
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
  selectorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  selectorField: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#CED4DA',
    paddingVertical: 14,
    paddingHorizontal: 16,
    minHeight: 48,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 2,
    justifyContent: 'space-between',
  },
  selectorText: {
    fontSize: 16,
    color: '#212529',
    fontFamily: 'Roboto',
    flex: 1,
  },
  bottomSheetBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'flex-end',
  },
  bottomSheetContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 12,
    paddingBottom: 24,
    paddingHorizontal: 16,
    minHeight: 320,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
  },
  bottomSheetHandle: {
    width: 40,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#CED4DA',
    alignSelf: 'center',
    marginBottom: 16,
  },
  bottomSheetOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F3F4',
    justifyContent: 'space-between',
  },
  bottomSheetOptionSelected: {
    backgroundColor: '#E0F2F1',
    borderRadius: 8,
  },
  bottomSheetOptionText: {
    fontSize: 16,
    color: '#212529',
    fontFamily: 'Roboto',
    flex: 1,
  },
  mapPreviewContainer: {
    width: '100%',
    height: 160,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 12,
    position: 'relative',
    backgroundColor: '#E0F2F1',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 2,
    alignSelf: 'center',
  },
  mapPreview: {
    width: '100%',
    height: '100%',
  },
  overlayLocationButton: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#00796B',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 2,
  },
  overlayLocationButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: 'bold',
    fontFamily: 'Roboto',
  },
  mapPreviewTouchable: {
    width: '100%',
    height: '100%',
    position: 'relative',
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#E0F2F1',
  },
  micButton: {
    marginLeft: 8,
    backgroundColor: '#E0F2F1',
    padding: 8,
    borderRadius: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  micButtonRecording: {
    backgroundColor: '#FFE5E5',
  },
  listeningText: {
    color: '#00796B',
    fontSize: 14,
    marginTop: 4,
    fontStyle: 'italic',
  },
  errorText: {
    color: '#FF0000',
    fontSize: 14,
    marginTop: 4,
  },
});

export default RequestAssistanceScreen; 