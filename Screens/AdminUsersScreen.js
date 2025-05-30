import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  TextInput,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Header from '../components/Header';
import axios from 'axios';
import Icon from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'http://192.168.0.102:5000/api/admin';

const AdminUsersScreen = () => {
  const navigation = useNavigation();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedRole, setSelectedRole] = useState('blind');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchTimeout, setSearchTimeout] = useState(null);

  const fetchUsers = async (page = 1) => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        Alert.alert('Error', 'Authentication required');
        navigation.navigate('Login');
        return;
      }

      const response = await axios.get(`${API_URL}/users`, {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          role: selectedRole,
          search: searchQuery,
          page
        }
      });

      setUsers(response.data.users);
      setTotalPages(response.data.totalPages);
      setCurrentPage(response.data.currentPage);
    } catch (error) {
      console.error('Error fetching users:', error);
      Alert.alert('Error', 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [selectedRole]);

  useEffect(() => {
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
    setSearchTimeout(setTimeout(() => {
      fetchUsers(1);
    }, 500));
  }, [searchQuery]);

  const renderUser = (user) => (
    <View key={user._id} style={styles.userCard}>
      <View style={styles.userHeader}>
        <View style={styles.userInfo}>
          <Icon name="person-circle" size={24} color="#666" />
          <View style={styles.userDetails}>
            <Text style={styles.userName}>{user.name}</Text>
            <Text style={styles.userEmail}>{user.email}</Text>
          </View>
        </View>
        <View style={[
          styles.roleBadge,
          { backgroundColor: user.userType === 'blind' ? '#2196F3' : '#4CAF50' }
        ]}>
          <Text style={styles.roleText}>
            {user.userType.charAt(0).toUpperCase() + user.userType.slice(1)}
          </Text>
        </View>
      </View>

      <View style={styles.userStats}>
        <View style={styles.statItem}>
          <Icon name="call" size={16} color="#666" />
          <Text style={styles.statText}>{user.phoneNumber}</Text>
        </View>
        {user.major && (
          <View style={styles.statItem}>
            <Icon name="school" size={16} color="#666" />
            <Text style={styles.statText}>{user.major}</Text>
          </View>
        )}
        {user.year && (
          <View style={styles.statItem}>
            <Icon name="calendar" size={16} color="#666" />
            <Text style={styles.statText}>{user.year} Year</Text>
          </View>
        )}
      </View>

      {user.bio && (
        <Text style={styles.bio}>{user.bio}</Text>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <Header title="Manage Users" />
      
      <View style={styles.searchContainer}>
        <Icon name="search" size={20} color="#666" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by email or name..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#999"
        />
      </View>

      <View style={styles.toggleContainer}>
        <TouchableOpacity
          style={[styles.toggleButton, selectedRole === 'blind' && styles.toggleButtonActive]}
          onPress={() => setSelectedRole('blind')}
        >
          <Text style={[styles.toggleButtonText, selectedRole === 'blind' && styles.toggleButtonTextActive]}>
            Blind Students
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toggleButton, selectedRole === 'volunteer' && styles.toggleButtonActive]}
          onPress={() => setSelectedRole('volunteer')}
        >
          <Text style={[styles.toggleButtonText, selectedRole === 'volunteer' && styles.toggleButtonTextActive]}>
            Volunteers
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {loading ? (
          <ActivityIndicator size="large" color="#00796B" style={styles.loader} />
        ) : users.length > 0 ? (
          users.map(renderUser)
        ) : (
          <Text style={styles.noUsers}>No users found</Text>
        )}
      </ScrollView>

      {totalPages > 1 && (
        <View style={styles.pagination}>
          <TouchableOpacity
            style={[styles.pageButton, currentPage === 1 && styles.pageButtonDisabled]}
            onPress={() => currentPage > 1 && fetchUsers(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <Text style={styles.pageButtonText}>Previous</Text>
          </TouchableOpacity>
          <Text style={styles.pageInfo}>
            Page {currentPage} of {totalPages}
          </Text>
          <TouchableOpacity
            style={[styles.pageButton, currentPage === totalPages && styles.pageButtonDisabled]}
            onPress={() => currentPage < totalPages && fetchUsers(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            <Text style={styles.pageButtonText}>Next</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#212121',
    padding: 0,
  },
  toggleContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: 'center',
    borderRadius: 8,
    marginHorizontal: 4,
  },
  toggleButtonActive: {
    backgroundColor: '#00796B',
  },
  toggleButtonText: {
    color: '#757575',
    fontSize: 16,
    fontWeight: '500',
  },
  toggleButtonTextActive: {
    color: '#FFF',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  userCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  userHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  userDetails: {
    marginLeft: 12,
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#212121',
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  roleBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  roleText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '500',
  },
  userStats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    marginBottom: 8,
  },
  statText: {
    marginLeft: 8,
    color: '#666',
    fontSize: 14,
  },
  bio: {
    color: '#424242',
    fontSize: 14,
    lineHeight: 20,
  },
  loader: {
    marginTop: 32,
  },
  noUsers: {
    textAlign: 'center',
    color: '#757575',
    fontSize: 16,
    marginTop: 32,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  pageButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#00796B',
  },
  pageButtonDisabled: {
    backgroundColor: '#BDBDBD',
  },
  pageButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '500',
  },
  pageInfo: {
    marginHorizontal: 16,
    color: '#757575',
    fontSize: 14,
  },
});

export default AdminUsersScreen; 