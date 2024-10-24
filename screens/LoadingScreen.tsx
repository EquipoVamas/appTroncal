import React from 'react'
import { View } from 'react-native'
import { ActivityIndicator } from 'react-native-paper'
import { Colors } from 'react-native/Libraries/NewAppScreen'
import { useBearStore } from '../store/storet';

const LoadingScreen = () => {

  const modes = useBearStore((state) => state.mode)
  const isDarkMode = modes === 'dark';

  return (
    <View style={ { flex: 1, justifyContent: 'center', alignItems:'center', backgroundColor: isDarkMode ? Colors.darker : Colors.lighter } }
    >
      <ActivityIndicator size={30} color={isDarkMode ? "white" : "black"}/>
    </View>
  )
}

export default LoadingScreen;