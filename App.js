import React, { useCallback, useEffect, useState } from 'react';
import 'react-native-gesture-handler';
import { View, Text } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import storageEventEmitter from './utils/storageEventEmitter';

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
import AdminRequestsScreen from './Screens/AdminRequestsScreen';
import AdminUsersScreen from './Screens/AdminUsersScreen';

import { initializeAuth, isAuthenticated, getStoredUser } from './utils/auth';

// Prevent splash screen from auto hiding
SplashScreen.preventAutoHideAsync().catch(console.warn);

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const AuthStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Welcome" component={WelcomeScreen} />
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="SignUp" component={SignUpScreen} />
  </Stack.Navigator>
);

const AdminTabs = () => {
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
        name="AdminRequests"
        component={AdminRequestsScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="list-outline" size={size} color={color} />
          ),
          title: 'Requests',
        }}
      />
      <Tab.Screen
        name="AdminUsers"
        component={AdminUsersScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="people-outline" size={size} color={color} />
          ),
          title: 'Users',
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

const AppNavigator = () => {
  const [isUserAuthenticated, setIsUserAuthenticated] = useState(false);
  const [userType, setUserType] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuthState();
  }, []);

  const checkAuthState = async () => {
    try {
      const user = await getStoredUser();
      setIsUserAuthenticated(!!user);
      setUserType(user?.userType);
    } catch (error) {
      console.error('Error checking auth state:', error);
      setIsUserAuthenticated(false);
      setUserType(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Listen for auth state changes using the event emitter
  useEffect(() => {
    const listener = (event) => {
      if (event.key === 'userData' || event.key === 'userToken') {
        checkAuthState();
      }
    };

    const subscription = storageEventEmitter.addListener('authChange', listener);
    return () => {
      subscription.remove();
    };
  }, []);

  if (isLoading) {
    return null;
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!isUserAuthenticated ? (
        <Stack.Screen name="Auth" component={AuthStack} />
      ) : (
        <>
          {userType === 'blind' && (
            <Stack.Screen name="BlindStudentTabs" component={BlindStudentTabs} />
          )}
          {userType === 'volunteer' && (
            <Stack.Screen name="VolunteerTabs" component={VolunteerTabs} />
          )}
          {userType === 'admin' && (
            <Stack.Screen name="AdminTabs" component={AdminTabs} />
          )}
        </>
      )}
    </Stack.Navigator>
  );
};

export default function App() {
  const [appIsReady, setAppIsReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        await initializeAuth();
      } catch (e) {
        console.warn(e);
      } finally {
        setAppIsReady(true);
      }
    }

    prepare();
  }, []);

  const onLayoutRootView = useCallback(async () => {
    if (appIsReady) {
      await SplashScreen.hideAsync();
    }
  }, [appIsReady]);

  if (!appIsReady) {
    return null;
  }

  return (
    <NavigationContainer onReady={onLayoutRootView}>
      <AppNavigator />
    </NavigationContainer>
  );
}