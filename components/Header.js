import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';

const Header = ({ title, showNotificationDot = false }) => {
  const navigation = useNavigation();

  return (
    <View style={styles.header}>
      <TouchableOpacity 
        style={styles.profileButton}
        onPress={() => navigation.navigate('Profile')}
        accessibilityLabel="Go to profile"
      >
        <Image
          source={require('../assets/profile-placeholder.png')}
          style={styles.profileImage}
        />
      </TouchableOpacity>
      
      <Text style={styles.headerTitle}>{title}</Text>
      
      <TouchableOpacity 
        style={styles.notificationButton}
        onPress={() => navigation.navigate('Notifications')}
        accessibilityLabel="View notifications"
      >
        <Icon name="notifications-outline" size={24} color="#212529" />
        {showNotificationDot && (
          <View style={styles.notificationDot}>
            <Text style={styles.notificationDotText}>•</Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#CED4DA',
    backgroundColor: '#FFFFFF',
    marginTop: 20,
  },
  profileButton: {
    padding: 5,
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#212529',
    marginLeft: 10,
    marginRight: 'auto',
    fontFamily: 'Roboto',
  },
  notificationButton: {
    padding: 5,
    position: 'relative',
  },
  notificationDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#00796B',
    position: 'absolute',
    top: 5,
    right: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationDotText: {
    color: '#FFFFFF',
    fontSize: 8,
  },
});

export default Header; 