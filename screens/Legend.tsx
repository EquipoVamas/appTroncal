import React from 'react'
import { Text } from 'react-native-paper';
import { StyleSheet, Dimensions, View } from 'react-native'

const {width, height} = Dimensions.get('window');

const Legend = () => {
  
  return (
    
    <View style={styles.legend}>
    <View style={styles.legendContent}>
    <View style={styles.row}>
      <View style={[styles.colorBox, { backgroundColor: '#3D1053' }]} />
      <Text style={{ fontWeight: 'bold'}}>No enviado</Text>
    </View>
    <View style={styles.row}>
      <View style={[styles.colorBox, { backgroundColor: '#69A42F' }]} />
      <Text style={{ fontWeight: 'bold'}}>Enviado</Text>
    </View>
    <View style={styles.row}>
      <View style={[styles.colorBox, { backgroundColor: '#FF7F27' }]} />
      <Text style={{ fontWeight: 'bold'}}>Enviado - Modificado</Text>
    </View>
    </View>
  </View>
  )
}

const styles = StyleSheet.create({
  legend: {
    top: height - 180,
    left: 0,
    alignItems: 'flex-start',
    margin: 10,
    shadowOpacity: 0.2,
    position: 'absolute'
  },
  legendContent: {
    backgroundColor: 'rgba(240, 240, 240, 0.93)',
    padding: 8
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  colorBox: {
    width: 10,
    height: 10,
    marginRight: 5,
  },
})

export default Legend
