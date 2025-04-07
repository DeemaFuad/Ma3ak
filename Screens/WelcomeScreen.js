// screens/WelcomeScreen.js
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Image, Dimensions, Pressable, Alert } from 'react-native';
import React from 'react';

const { width, height } = Dimensions.get('window');

export default function WelcomeScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Image 
        source={require('../ju.jpg')} // Adjust path if needed
        style={styles.backgroundImage}
      />
      <View style={styles.overlay} />
      <View style={styles.content}>
        <View style={styles.textContainer}>
          <Text style={styles.text}>Welcome to Ma3ak</Text>
          <Text style={styles.subText}>With you, we make the path easier</Text>
        </View>
        <Pressable 
          style={({ pressed }) => [
            styles.button,
            pressed && styles.buttonPressed
          ]}
          onPress={() => navigation.navigate('Login')} // 👈 navigate to Login screen
        >
          <Text style={styles.buttonText}>Get Started</Text>
        </Pressable>
      </View>
      <StatusBar style="light" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor:"#141613FF"
  },
  backgroundImage: {
    width: width,
    height: height,
    position: 'absolute',
    resizeMode: 'contain',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    paddingVertical: height * 0.15,
    paddingHorizontal: 20,
  },
  textContainer: {
    alignItems: 'center',
  },
  text: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  subText: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
  },
  button: {
    alignSelf: 'center',
    width: width * 0.85,
    height: 50,
    backgroundColor: '#1ABC9C',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  buttonPressed: {
    backgroundColor: '#14957B',
    transform: [{ scale: 0.98 }],
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
