import React, { useCallback, useEffect, useState } from 'react';
import 'react-native-gesture-handler';
import { View, Text } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/Ionicons';

import WelcomeScreen from './Screens/WelcomeScreen';
import LoginScreen from './Screens/LoginScreen';
import SignUpScreen from './Screens/SignUpScreen';
import BlindHomeScreen from './Screens/BlindHomeScreen';
import VolunteerHomeScreen from './Screens/VolunteerHomeScreen';
import ProfileScreen from './Screens/ProfileScreen';
import RequestAssistanceScreen from './Screens/RequestAssistanceScreen';
import MyRequestsScreen from './Screens/MyRequestsScreen';
import VolunteerRequestsScreen from './Screens/VolunteerRequestsScreen';
import MyTasksScreen from './Screens/MyTasksScreen';

import { initializeAuth, isAuthenticated, getStoredUser } from './utils/auth';

// Prevent splash screen from auto hiding
SplashScreen.preventAutoHideAsync().catch(console.warn);

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const BlindStudentTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarStyle: {
          backgroundColor: '#1E1E1E',
          borderTopColor: '#333',
        },
        tabBarActiveTintColor: '#14957B',
        tabBarInactiveTintColor: '#888',
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="BlindHome"
        component={BlindHomeScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="home-outline" size={size} color={color} />
          ),
          title: 'Home',
        }}
      />
      <Tab.Screen
        name="RequestAssistance"
        component={RequestAssistanceScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="help-circle-outline" size={size} color={color} />
          ),
          title: 'Request Help',
        }}
      />
      <Tab.Screen
        name="MyRequests"
        component={MyRequestsScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="list-outline" size={size} color={color} />
          ),
          title: 'My Requests',
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="person-outline" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const VolunteerTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarStyle: {
          backgroundColor: '#1E1E1E',
          borderTopColor: '#333',
        },
        tabBarActiveTintColor: '#14957B',
        tabBarInactiveTintColor: '#888',
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="VolunteerHome"
        component={VolunteerHomeScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="home-outline" size={size} color={color} />
          ),
          title: 'Home',
        }}
      />
      <Tab.Screen
        name="VolunteerRequests"
        component={VolunteerRequestsScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="people-outline" size={size} color={color} />
          ),
          title: 'Requests',
        }}
      />
      <Tab.Screen
        name="MyTasks"
        component={MyTasksScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="list-outline" size={size} color={color} />
          ),
          title: 'My Tasks',
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="person-outline" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default function App() {
  const [appIsReady, setAppIsReady] = useState(false);
  const [isUserAuthenticated, setIsUserAuthenticated] = useState(false);
  const [userType, setUserType] = useState(null);

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
    const interval = setInterval(checkAuth, 1000);
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
    <NavigationContainer onReady={onLayoutRootView}>
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
              <Stack.Screen name="BlindStudentTabs" component={BlindStudentTabs} />
            ) : (
              <Stack.Screen name="VolunteerTabs" component={VolunteerTabs} />
            )}
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}