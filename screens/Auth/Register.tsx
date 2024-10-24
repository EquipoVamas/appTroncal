import React from 'react'
import { View, Text } from 'react-native'
import { Button } from 'react-native-paper'
import Layout from '../../components/Layout'
import { useNavigation, NavigationProp } from '@react-navigation/native'

const Register = () => {
  const navigation = useNavigation<NavigationProp<any>>();

  return (
    <Layout>
      <Text>Register</Text>
      <Button mode='contained-tonal' onPress={() => navigation.navigate("Login") }>Register</Button>
    </Layout>
  )
}

export default Register