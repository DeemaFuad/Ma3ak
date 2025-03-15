import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Image, Dimensions } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import React, { useCallback, useEffect, useState } from 'react';

// Get screen dimensions
const { width, height } = Dimensions.get('window');

// Prevent the splash screen from auto-hiding
SplashScreen.preventAutoHideAsync()
  .catch(console.warn); // Add error handling

export default function App() {
  const [appIsReady, setAppIsReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        console.log('App is preparing...');
        
        // Simulate some loading time
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        console.log('Preparation done!');
      } catch (e) {
        console.warn('Error preparing app:', e);
      } finally {
        setAppIsReady(true);
      }
    }

    prepare();
  }, []);

  const onLayoutRootView = useCallback(async () => {
    if (appIsReady) {
      try {
        await SplashScreen.hideAsync();
      } catch (e) {
        console.warn('Error hiding splash screen:', e);
      }
    }
  }, [appIsReady]);

  if (!appIsReady) {
    return null;
  }

  return (
    <View style={styles.container} onLayout={onLayoutRootView}>
      <Image 
        source={require('./ju.jpg')}
        style={styles.backgroundImage}
      />
      <View style={styles.content}>
        <Text style={styles.text}>Welcome to Ma3ak Project!</Text>
        <Text style={styles.subText}>Splash screen should be gone now</Text>
      </View>
      <StatusBar style="light" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121413F5',

  },
  backgroundImage: {
    width: width,
    height: height,
    position: 'absolute',
    resizeMode: 'contain',
    opacity: 0.5,
  },
  content: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  subText: {
    fontSize: 18,
    color: '#FFFFFF',
    textAlign: 'center',
  },
});
