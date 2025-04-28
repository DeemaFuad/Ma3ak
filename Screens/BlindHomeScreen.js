import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { getStoredUser } from '../utils/auth';

const BlindHomeScreen = () => {
  const navigation = useNavigation();
  const [user, setUser] = React.useState(null);

  React.useEffect(() => {
    const loadUser = async () => {
      const userData = await getStoredUser();
      setUser(userData);
    };
    loadUser();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.welcomeText}>Hi {user?.name || 'there'}!</Text>
      <Text style={styles.subtitle}>How can we help you today?</Text>

      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={styles.button}
          onPress={() => navigation.navigate('RequestAssistance')}
        >
          <Text style={styles.buttonText}>Request Assistance</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.button}
          onPress={() => navigation.navigate('MyRequests')}
        >
          <Text style={styles.buttonText}>View My Requests</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#FFFFFF',
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#212529',
    marginTop: 40,
  },
  subtitle: {
    fontSize: 16,
    color: '#6C757D',
    marginTop: 10,
    marginBottom: 40,
  },
  buttonContainer: {
    gap: 20,
    alignItems: 'center',
  },
  button: {
    backgroundColor: '#14957B',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    width: '85%',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default BlindHomeScreen; 