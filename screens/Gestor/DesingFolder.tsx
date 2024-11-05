import React, { useEffect, useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, IconButton, Menu, Badge } from 'react-native-paper';
import Icon from 'react-native-vector-icons/FontAwesome';
import { deleteFolder } from '../../services/axios';
import colors from '../style';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import stylesDefault from '../style';
import { useBearStore } from '../../store/storet'
import { getTypeStatusLocal } from '../../services/dataBase'

interface Props {
  data: [];
  mode: "card" | "list"
}

const DesingFolder = (props : Props) => {
  const { data, mode: modeList } = props;
  const { mode } = useBearStore();
  const isDarkMode = mode === 'dark';
  const [typeStatus, setTypeStatus] = useState<any>([]);
  const navigation = useNavigation<NavigationProp<any>>();
  
  const handleDirection = (item : any) => {
    navigation.navigate('Mapa' , item);
  }

  const getTypeStatus = async () => {
    setTypeStatus([]);
    const response:any = await getTypeStatusLocal();
    setTypeStatus(response);
  };

  const findByIdStatus = (id:any) => {
    const stp = typeStatus.find((tp:any) => tp.item == id)
    if(stp){
      return { color: "#" + stp.color , nombre: stp.nombre }
    }
    return { color: "#69A42F", nombre: "Sin asignar"}
  }

  useEffect(() => {
    getTypeStatus();
    console.log(data)
  }, [data])

  return (
    <View style={{ display: "flex", flexDirection: modeList == "card" ? "row" : "column",  flexWrap: "wrap", justifyContent: "center" }}>
      {data.length > 0 && data?.map((val: any) => 
          <TouchableOpacity
            key={val?.id} // Add a key prop to help React identify the elements
            style={[styles.container, { flexDirection: modeList == "card" ? "column" : "row"}]}
            activeOpacity={0.8}
            onPress={() => handleDirection(val)}>
            <IconButton
              icon={() => (
                <Icon name="folder" size={30} style={stylesDefault.yellow} />
              )}
              size={40}
              style={styles.iconButton}
            />

            <View style={[styles.textContainer, { justifyContent: "center", alignContent: "center" }]}>
              <Text style={[styles.text, { textAlign: modeList == "card" ? "center" : "left" }]}>{val?.nombre}</Text>
              <View style={{ display: "flex", flexDirection: "row", flexWrap: "wrap", gap: 5, alignContent: "center", alignItems: "center", justifyContent: modeList == "card" ? "center" : "flex-start" }}>
                <View style={{ padding: 1}}>
                  <Badge size={13} style={{ backgroundColor: findByIdStatus(val?.idTipoEstado).color }} />
                </View>
                <Text style={{  alignItems: "center" }}>{ findByIdStatus(val?.idTipoEstado).nombre }</Text>
              </View>
            </View>

            <View style={styles.menuContainer}></View>
          </TouchableOpacity>
        )}

      {data.length === 0 && (
        <View style={{ padding: 10 }}>
          <Text style= {styles.textInfo}>No hay detalles para mostrar</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    margin: 3,
    padding: 5,
    borderColor: '#c2c2c2',
    //backgroundColor: '#f7f7f7',
    borderWidth: 0.5,
    borderRadius: 20,
    alignItems: 'center',
  },
  menuContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
  },
  textContainer: {
    flexDirection: 'column',
    marginHorizontal: 8,
  },
  text: {
    fontSize: 17,
    fontWeight: '100',
  },
  subtext: {
    color: 'gray',
    fontSize: 14,
  },
  iconButton: {
    borderRadius: 20,
  },
  textInfo: {
    fontWeight: 'bold',
    fontSize: 20
  }
});

export default DesingFolder;
