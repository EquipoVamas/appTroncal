import { View, Text, Image, useColorScheme, Dimensions } from 'react-native'
import React from 'react'
import Layout from '../components/Layout'
import { Colors } from 'react-native/Libraries/NewAppScreen'

const LoadingFirst = () => {
  const isDarkMode = useColorScheme() === 'dark';
  const widthL = Math.round(Dimensions.get("window").width )
  const heightL =  Math.round(Dimensions.get("window").height)
  return (
      <View style={{ 
          alignContent: "center", 
          alignItems: "center",
          justifyContent: "center", 
          backgroundColor: isDarkMode ? Colors.darker : Colors.lighter, 
          padding: 20,
          width: Dimensions.get("window").width, 
          height: Dimensions.get("window").height 
        }}
      >
        <Image
          style={{ width: widthL, height: heightL, objectFit: "contain" }}
          source={ require('../assets/SEMI.png') }
        />
      </View>
  )
}

export default LoadingFirst