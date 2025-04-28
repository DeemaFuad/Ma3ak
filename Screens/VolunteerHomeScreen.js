import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Header from '../components/Header';

const VolunteerHomeScreen = () => {
  return (
    <View style={styles.container}>
      <Header title="Home" />
      <Text style={styles.text}>Welcome to Volunteer Home Page</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#141613',
  },
  text: {
    color: 'white',
    fontSize: 24,
  },
});

export default VolunteerHomeScreen; 