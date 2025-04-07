import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import BottomNavBar from '../components/BottomNavBar';

const BlindHomeScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Welcome to Blind Home Page</Text>
      <BottomNavBar />
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

export default BlindHomeScreen; 