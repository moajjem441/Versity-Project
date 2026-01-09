//App start from here

import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { auth } from './firebaseConfig';

export default function IndexRedirect() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      if (user) {
        router.replace('/HomeScreen'); // Logged in → HomeScreen
      } else {
        router.replace('/LoginScreen'); // Not logged in → LoginScreen
      }
      setLoading(false);
    }, err => {
      console.log(err);
      setError('Failed to check login status');
      setLoading(false);
    });

    return unsubscribe; // cleanup
  }, []);

  if (loading) {
    return (
      <View style={{ flex:1, justifyContent:'center', alignItems:'center' }}>
        <ActivityIndicator size="large" color="#1ABC9C" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={{ flex:1, justifyContent:'center', alignItems:'center' }}>
        <Text>{error}</Text>
      </View>
    );
  }

  return null; // Redirect handled
}
