import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Header from '../components/Header';

const NotificationsScreen = () => {
  return (
    <View style={styles.container}>
      <Header title="Notifications" />
      <View style={styles.content}>
        <Text style={styles.text}>Notifications Screen Content</Text>
      </View>
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 16,
    color: '#212529',
    fontFamily: 'Roboto',
  },
});

export default NotificationsScreen; 