import React, { useCallback, useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import WelcomeScreen from './Screens/WelcomeScreen';
import LoginScreen from './Screens/LoginScreen';
import SignUpScreen from './Screens/SignUpScreen';
import BlindHomeScreen from './Screens/BlindHomeScreen';
import VolunteerHomeScreen from './Screens/VolunteerHomeScreen';
import { initializeAuth, isAuthenticated, getStoredUser } from './utils/auth';

SplashScreen.preventAutoHideAsync().catch(console.warn);

const Stack = createNativeStackNavigator();

export default function App() {
  const [appIsReady, setAppIsReady] = useState(false);
  const [isUserAuthenticated, setIsUserAuthenticated] = useState(false);
  const [userType, setUserType] = useState(null);
  const [key, setKey] = useState(0); // Add a key for forcing re-render

  const checkAuth = async () => {
    try {
      const authenticated = await isAuthenticated();
      setIsUserAuthenticated(authenticated);
      
      if (authenticated) {
        const user = await getStoredUser();
        setUserType(user?.userType);
      }
    } catch (e) {
      console.warn(e);
    }
  };

  useEffect(() => {
    async function prepare() {
      try {
        await initializeAuth();
        await checkAuth();
      } catch (e) {
        console.warn(e);
      } finally {
        setAppIsReady(true);
      }
    }

    prepare();
  }, []);

  // Add effect to check auth state periodically
  useEffect(() => {
    const interval = setInterval(checkAuth, 1000); // Check every second
    return () => clearInterval(interval);
  }, []);

  const onLayoutRootView = useCallback(async () => {
    if (appIsReady) {
      await SplashScreen.hideAsync();
    }
  }, [appIsReady]);

  if (!appIsReady) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#141613' }}>
        <Text style={{ color: 'white' }}>Loading...</Text>
      </View>
    );
  }

  return (
    <NavigationContainer key={key} onReady={onLayoutRootView}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isUserAuthenticated ? (
          // Auth Stack
          <>
            <Stack.Screen name="Welcome" component={WelcomeScreen} />
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="SignUp" component={SignUpScreen} />
          </>
        ) : (
          // Main App Stack
          <>
            {userType === 'blind' ? (
              <Stack.Screen name="BlindHome" component={BlindHomeScreen} />
            ) : (
              <Stack.Screen name="VolunteerHome" component={VolunteerHomeScreen} />
            )}
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}