
import React, { useEffect, useState } from 'react'
import { StyleSheet, TouchableOpacity, View } from 'react-native'
import { Badge, IconButton, Text } from 'react-native-paper';
import stylesDefault from '../style';
import { getTypeStatusLocal } from '../../services/dataBase';

import Icon from 'react-native-vector-icons/FontAwesome';

interface Props {
  data: any[];
  mode: "card" | "list";
  setDataActions?: any;
  onNavigation?: any;
}

const DesingFolderHome = ( props : Props ) => {

  const { data, mode: modeList, setDataActions, onNavigation } = props;
  const [typeStatus, setTypeStatus] = useState<any>([]);

  const findByIdStatus = (id: any) => {
    const stp = typeStatus.find((tp: any) => tp.item == id);
    if (stp) {
      return { color: stp.color, nombre: stp.nombre };
    }
    return { color: "#69A42F", nombre: "Sin asignar" };
  };

  const getTypeStatus = async () => {
    const response:any = await getTypeStatusLocal();
    setTypeStatus(response);
  };
  
  useEffect(() => {
    if(data) getTypeStatus();
  }, [data])

  return (
    <View style={modeList == "card" ? style.containerCard : style.containerList} >
      {Array.isArray(data) && data.map((val: any) => (
        <TouchableOpacity
          key={val?.item}
          activeOpacity={0.7}
          onPress={() => onNavigation(val)}
          style={modeList == "card" ? style.containerFolderCard : style.containerFolderList} 
        >
          <View>
            <IconButton
              icon={() => (
                <Icon name="folder" size={modeList == "card" ? 55 : 35} style={stylesDefault.yellow} />
              )}
              size={40}
              style={style.iconButton}
            />
            {
              (val?.archivos && JSON.parse(val?.archivos).length >  0) && (
                <Badge style={{ position: "absolute", top: 5, left: 5}}>{ val?.archivos ? JSON.parse(val?.archivos).length : 0 }</Badge>
              )
             }
          </View>

          <View style= {modeList == "card" ? {flexDirection: 'row', width: '100%', justifyContent: 'center', alignContent: 'center'} : { flexDirection: 'row', flex: 1, width: '100%', justifyContent:'space-between', alignItems: 'center' }}>
            <View>
              <Text style={{ fontSize: 17 }}>{val?.distrito && `${val?.distrito} / `}{ val?.nombre }</Text>
              <View style={style.containerStatusList}>
                <Badge size={15} style={{ backgroundColor: findByIdStatus(val?.idTipoEstado)?.color }} />
                <Text style={{ alignItems: "center" }}>
                    {findByIdStatus(val?.idTipoEstado)?.nombre}
                  </Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      ))}

      {data && data.length === 0 && (
        <View style={{ padding: 10 }}>
          <Text>No hay registros...</Text>
        </View>
      )}
    </View>
  ) 
}

const style = StyleSheet.create({
  containerCard : {
    flex: 1,
    flexWrap: 'wrap',
    flexDirection: 'row',
    justifyContent: 'space-evenly',
  },
  containerFolderCard: {
    width: '40%',
    borderWidth: 1,
    borderRadius: 15,
    alignContent: 'center',
    alignItems: 'center',
    padding: 10,
    marginVertical: 5
  },
  containerList : {
    flex: 1,
    flexWrap: 'wrap',
    flexDirection: 'column',
    marginHorizontal: 10,
  },
  containerFolderList: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    // borderBottomWidth: 1,
    // borderBottomColor: '#cecece'
  },
  iconButton: {
    borderRadius: 20,
  },
  textFolder: {
    fontSize: 16,
    fontWeight: '100'
  },
  containerStatusList: {
    gap: 8,
    flexDirection : 'row',
    alignContent: 'center',
    alignItems: 'center'
  },
  containerStatusCard: {
    flexDirection : 'row',
    alignContent: 'center',
    alignItems: 'center'
  }
})

export default DesingFolderHome
