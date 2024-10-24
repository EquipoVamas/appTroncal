import React, { useState, useEffect, useCallback } from 'react'
import { View, Alert } from 'react-native'
import { Divider, IconButton, List, Text } from 'react-native-paper'
import Layout from '../components/Layout'
import NetComponent from '../components/NetComponent'
import Icon from 'react-native-vector-icons/EvilIcons'
import { deleteTable, getItems, initDB, saveItem } from '../services/db'
import { getPostes } from '../services/axios'
import { useBearStore } from '../store/storet'
import { NavigationProp, useNavigation } from '@react-navigation/native';

const ListPost = () => {
  const navigation = useNavigation<NavigationProp<any>>();

  const { statusNet } = useBearStore((state) => state)
  const [loading, setLoading] = useState(false);
  const [postes, setPostes] = useState<any>([])
  
  const getMarketItems = async ( ) => {
    setLoading(true);
    await initDB();
    setPostes([]);    
    const response:any = await getItems();
    response.length > 0 ? setPostes(response) : setPostes([]);
    if(statusNet){
      const res:any = await getPostes();
      if(res.data){
        var list = res.data
        var newList = list.filter((itm:any) => !response.some((res2:any) => itm?.codPoste == res2?.codPoste));
        if(newList.length > 0){
          for(const lst of newList){
            const obj = {
              nombre: lst.nombre,
              latitud: lst.latitud, 
              longitud: lst.longitud, 
              codPoste: lst.codPoste, 
              propietario: lst?.propietario || "OTROS", 
              ladoVia: lst?.ladoVia || "Izquierda", 
              direccion: lst?.direccion || "",
              tipoVia: lst?.tipoVia || "",
              nroApoyo: lst?.nroApoyo || "",
              nivelTension: lst?.nivelTension || "",
              material: lst?.material || "",
              altura: lst?.altura || "",
              nombreVia: lst?.nombreVia || "",
              lote: lst?.lote || "",
              estadoP: lst?.estadoP || "",
              archivos: null,
              estado: 0,
              item: lst?.id || lst?._id ||  ""
            }
            const reg = await saveItem(
              obj.nombre,
              obj.latitud,
              obj.longitud,
              obj.codPoste,
              obj?.propietario || 'OTROS',
              obj?.ladoVia || 'Izquierda',
              obj?.direccion || '',
              obj?.tipoVia || '',
              obj?.nroApoyo || '',
              obj?.nivelTension || '',
              obj?.material || '',
              obj?.altura || '',
              obj?.nombreVia || '',
              obj?.lote || '',
              obj?.estadoP || '',
              null,
              0,
              obj.item ? obj.item : null
            );
            setPostes((value:any) => {
              return [...value, obj]
            })
          }
          setLoading(false);
          return;
        }
      }
    }
    setLoading(false);
  }

  const handleEdit = (item : any) => {
    navigation.navigate('Mapa' , {...item, edit: 1});
  }

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      getMarketItems();
    });

    return unsubscribe;
  }, [navigation]);

  useEffect(() => {
      getMarketItems();
  }, [statusNet]);



  return (
    <Layout pullRefresh={getMarketItems} loading={loading} >
        <NetComponent />
        <View style={{ display: "flex", flexDirection: "row", justifyContent: "space-between", alignContent: "center", alignItems: "center"}}>
          <Text>Postes registrados</Text>
          <IconButton icon={() => <Icon name='trash' size={20} color="red"/>} onPress={() => { deleteTable(); setPostes([]) }}/>
        </View>
        
        <View style={{ display: "flex", flexDirection: "row", justifyContent: "space-around", alignContent: "center", alignItems: "center", marginVertical: 15}}>
          <View style= {{flexDirection: 'row', gap: 5}}>
            <Icon name='check' size={20} color="#69A42F" />
            <Text style={{color: "#69A42F"}}>Enviado </Text>
          </View>
          <View style= {{flexDirection: 'row', gap: 5}}>
            <Icon name='pencil' size={20} color="#FF7F27"/>
            <Text style={{color: "#FF7F27"}}>Enviado - Modificado </Text>
          </View>
          <View style= {{flexDirection: 'row', gap: 5 }}>
            <Icon name='close-o' size={20} color="#3E1054"/>
            <Text style={{color: "#3E1054"}}>No Enviado</Text>
          </View>
        </View>

        <View>
          <List.Section>
            {
              postes && postes.map(( item : any, index: any) => (
                  <List.Accordion  
                    key={index || item?.codPoste} 
                    title={item?.nombre}
                    onLongPress={() => {
                      handleEdit(item);
                    }}
                    left={props => <List.Icon icon={() => <Icon name={ item.estado == 0 ? item.editado == 1 ? 'pencil' :'check' : 'close-o'} color={ item.estado == 0 ? item.editado == 1 ? '#FF7F27':"#69A42F" : "#3E1054"} size={25}/> } />} 
                    right={props => <List.Icon icon={() => <Icon name={ props.isExpanded ? 'chevron-up' : 'chevron-down'} size={25}/>} />}
                  >
                      <List.Item title={`Propietario: ${item.propietario || "S/N"}`}/>
                      <List.Item title={`Código: ${item.codPoste || "S/N"}`} />
                      <List.Item title={`${item?.longitud} / ${item?.longitud}`} />
                  </List.Accordion>
              ))
            }
          </List.Section>
        </View>
    </Layout>
  )
}

export default ListPost