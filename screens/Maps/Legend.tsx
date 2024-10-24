import React, { useEffect, useState } from 'react'
import { Badge, Text } from 'react-native-paper';
import { StyleSheet, Dimensions, View } from 'react-native'
import stylesDefault from '../style';
import Layout from '../../components/Layout';
import { useBearStore } from '../../store/storet';
import { Colors } from 'react-native/Libraries/NewAppScreen';
import { getTypeStatusLocal } from '../../services/dataBase';

const {height} = Dimensions.get('window');

const Legend = () => {
  const modes = useBearStore((state) => state.mode)
  const isDarkMode = modes === 'dark';

  const [ tipoEstados, setTipoEstados ] = useState([]);

  const getEstados = async () => {
    const res: any = await getTypeStatusLocal();

    setTipoEstados(res);
  }

  useEffect(( ) => {
    getEstados();
  }, [ ])

  return (
    <View
      style={{
        ...styles.legend,
        backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
      }}>
      <View style={styles.legendContent}>
        {
          tipoEstados && tipoEstados.map(( value : any ) => (
            <View style={styles.row} key={value?.item}>
              <Badge size={15} style={{ backgroundColor : value?.color }}></Badge>
              <Text style={{fontWeight: 'bold'}}>{value?.nombre}</Text>
            </View>
          ))
        }
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  legend: {
    top: height - 170,
    left: 0,
    alignItems: 'flex-end',
    marginHorizontal: 5,
    shadowOpacity: 0.2,
    position: 'absolute',
  },
  legendContent: {
    padding: 10
  },
  row: {
    gap: 10, 
    flexDirection: 'row',
    alignItems: 'center',
    alignContent: 'center',
    marginBottom: 3,
    marginHorizontal: 5
  }
})

export default Legend
