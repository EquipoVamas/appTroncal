import React, { useEffect } from 'react'
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native'
import StackAuth from './Authenticated'
import StackPre from './PreAuth'
import { useAuth } from '../../context/AuthContext'

const Stack = createStackNavigator();

const ProtectecScreen = () => {
  const { authState } = useAuth();

  return (
    <NavigationContainer>
        <Stack.Navigator>
          {
            authState?.authenticated ? (
              <Stack.Screen name="StackAuth" component={StackAuth} options={{ headerShown: false }} />
            ) : (
              <Stack.Screen name="StackPre" component={StackPre} options={{ headerShown: false }} />
            )
          }
        </Stack.Navigator>
    </NavigationContainer>
  )
}

export default ProtectecScreen