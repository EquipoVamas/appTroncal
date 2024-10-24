import React, { useEffect, useState } from 'react'
import { StyleSheet, View } from 'react-native'
import Layout from '../../components/Layout'
import { Search } from './Search'
import { IconButton, Text } from 'react-native-paper'

import Icon from 'react-native-vector-icons/FontAwesome';
import { RouteProp, useRoute } from '@react-navigation/native'

type RootStackParamList = {
  Registro: any;
};

type MapaScreenRouteProp = RouteProp<RootStackParamList, 'Registro'>;

const Gestor = () => {
  const [mode, setMode] = useState<any>('card'); // card | list
  const [prefix, setPrefix] = useState<any>([]);
  const route = useRoute<MapaScreenRouteProp>();

  useEffect(() => {
    if (route.params) {
      
    }
  }, [route]);
  return (
    <Layout mode='column'>
      <View style={[style.container]}>
        <Search modeActive={mode} setModeActive={setMode} />
        <View style={style.containerHeader}>
            {prefix.length > 0 &&
              <IconButton
                icon={() => (
                  <Icon name="arrow-circle-o-left" size={20} color={'#000'} />
                )}
                onPress={() => console.log("backFolder")}
              />
            }

          <Text style={{...style.subtitle}}>Carpetas</Text>
          <View style={style.containerIconHeader}>
            <IconButton
                icon={() => <Icon name="plus" size={25} />}
                size={40}
              style={{...style.iconDesign}}
              onPress={() => console.log("showDialog")}
            />
          </View>
        </View>
      </View>
    </Layout>
  )
}

const style = StyleSheet.create({
  container: {
    flex: 1,
    margin: 20,
    padding: 15,
    borderRadius: 30,
    borderColor: '#ffff',
    borderWidth: 3,
    backgroundColor: '#ffff',
    gap: 4,
  },
  containerIconHeader: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
  },
  containerHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    marginVertical: 10,
  },
  subtitle: {
    fontSize: 24,
    fontWeight: '700',
    fontFamily: 'Cochin',
    padding: 10,
  },
  iconDesign: {
    borderRadius: 40,
    margin: 10,
    backgroundColor: '#0d6efd',
  },
})
export default Gestor
