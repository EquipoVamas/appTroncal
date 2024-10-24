import React from 'react'
import { createMaterialBottomTabNavigator,  } from '@react-navigation/material-bottom-tabs';
import { useBearStore } from '../../store/storet';
import { Colors } from 'react-native/Libraries/NewAppScreen'
import Styles from '../style'

const Tab = createMaterialBottomTabNavigator();
import Icon from 'react-native-vector-icons/FontAwesome';

// Screens
import Settings from '../../screens/Settings'
import DataStorage from '../gestionTroncal/DataStorage';
import Home from '../Gestor/Home';
import Maps from '../Maps/Maps';

const Authenticated = () => {
  const { mode, statusNet } = useBearStore();
  const isDarkMode = mode === 'dark';

  return (
    <Tab.Navigator labeled={false} barStyle={{ backgroundColor: isDarkMode ? Colors.dark : Colors.lighter, }} inactiveColor={!isDarkMode ? Colors.dark : Colors.lighter} >
      <Tab.Screen 
        name='Progreso'
        component={DataStorage}
        options={{
          tabBarIcon: ({color}) => (
            <Icon 
              name="home"
              color={color}
              style={{padding: 0, margin: 0}}
              size={25}
            />
          )
        }}
      />
      <Tab.Screen
        name="Inicio"
        component={Home}
        options={{
          tabBarIcon: ({color}) => (
            <Icon
              name="folder"
              color={color}
              size={25}
            />
          ),
          tabBarBadge: statusNet ? false : true
        }}
      />
      <Tab.Screen
        name="Mapa"
        component={Maps}
        options={{
          tabBarIcon: ({color}) => (
            <Icon
              name="map"
              color={color}
              style={{padding: 0, margin: 0}}
              size={25}
            />
          ),
        }}
      />

      <Tab.Screen 
        name='Configuración'
        component={Settings}
        options={{
          tabBarIcon: ({color}) => (
            <Icon 
              name="cog"
              color={color}
              style={{padding: 0, margin: 0}}
              size={25}
            />
          )
        }}
      />
    </Tab.Navigator>
  )
}

export default Authenticated