import React from 'react'
import { StyleSheet, View } from 'react-native'
import { IconButton, Text } from 'react-native-paper';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useBearStore } from '../../store/storet';
import { NavigationProp, useFocusEffect, useNavigation } from '@react-navigation/native';

const Header = ( { route } : any ) => {
  const navigation = useNavigation<NavigationProp<any>>();

  const { mode } = useBearStore();
  const isDarkMode = mode === 'dark';

  const handleDirection = () => {
    navigation.navigate('Inicio' , {});
  }

  return (
    <View style={ style.header }>
      <IconButton
        icon={() => <Icon name="arrow-left" size={20} color={isDarkMode ? "#fff" :"#000"}/>}
        onPress={handleDirection}
      />
              
      <Text numberOfLines={2} ellipsizeMode="tail" style={ style.routeText } >{route?.carpeta?.distrito } / {route?.carpeta?.nombre } / { route?.subcarpeta?.nombre } / { route?.categoria?.nombre } / { route?.subcategoria?.nombre } </Text>
    </View>
  )
}

const style = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 10,
  },
  routeText: {
    fontSize: 15,
    fontWeight: 'bold', 
    flexShrink: 1
  }
});

export default Header
