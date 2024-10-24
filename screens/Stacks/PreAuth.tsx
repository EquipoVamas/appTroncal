import React from 'react'
import { View, Text } from 'react-native'
import { createStackNavigator } from '@react-navigation/stack';

const Stack = createStackNavigator();

// Auth
import Login from '../Auth/Login'
import RegisterL from '../Auth/Register'

const PreAuth = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Login" component={Login} options={{ headerShown: false }} />
      <Stack.Screen name="Register" component={RegisterL} options={{ headerShown: false }} />
    </Stack.Navigator>
  )
}

export default PreAuth