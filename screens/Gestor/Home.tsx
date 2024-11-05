import React, { useCallback, useEffect, useState } from 'react'
import Layout from '../../components/Layout'
import { View, ScrollView, StyleSheet, Dimensions, RefreshControl } from 'react-native'
import HeaderHome from './HeaderHome'
import DesingFolderHome from './DesingFolderHome'
import { getFilterDetalleLocal, getFilterMufaLocal, getFilterNodoLocal, getMufaLocal, getSubMufaLocal, getTroncalLocal, resetTables, saveDetalleLocal } from '../../services/dataBase'
import { NavigationProp, useFocusEffect, useNavigation } from '@react-navigation/native';
import { useBearStore } from '../../store/storet'
import { getAllDetailsServer, getPostes } from '../../services/axios'
import { IconButton } from 'react-native-paper'
import stylesDefault from '../style'
const { height } = Dimensions.get('window');
import { evalDB } from '../../services/backup'
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Icon from 'react-native-vector-icons/FontAwesome';

const sleep = (time:number) => new Promise((resolve:any) => setTimeout(() => resolve(), time));

const Home = () => {
  const navigation = useNavigation<NavigationProp<any>>();
  const { statusNet, statusApp } = useBearStore();

  const [ data, setData ] = useState<any>([]);
  const [ dataSearch, setDataSearch ] = useState<any>([]);
  // const [ visibleActions, setVisibleActions ] = useState<boolean>(false);
  // const [ actionsData, setActionsData ] = useState<any>([]);
  const [mode, setMode] = useState<any>('list'); // card | list

  const [ prefix, setPrefix ] = useState<any>([]);
  const [refreshing, setRefreshing] = useState(false);

  const getTroncal = async () => {
    const response = await getTroncalLocal();
    setData(response);
    setDataSearch(response)
  }

  const onChangeNavigation = async ( object: any ) => {
    const { item, nombre, distrito } = object;
    let newPrefixLength = prefix.length;

    if (object?.actions === 'back') {
      newPrefixLength -= 1;
      setPrefix((prevValue: any) => prevValue.slice(0, -1));
  
      if (newPrefixLength === 0) {
        getTroncal();
      }
    } else {
      newPrefixLength += 1;
      setPrefix((prevValue: any) => [...prevValue, { item, nombre, distrito }]);
    }

    let response : any = [];

    if( newPrefixLength == 1 ) response = await getFilterNodoLocal(object?.item);
    if( newPrefixLength == 2 ) response = await getFilterMufaLocal(object?.item);
    if( newPrefixLength == 3 ) response = await getSubMufaLocal(object?.item);
    if( newPrefixLength == 4 ) response = await getFilterDetalleLocal(object?.item);
    setData(response);
    setDataSearch(response);
  }

  const handleDirection = (item : any) => {
    let dataActions = {
      carpeta: prefix[0],
      subcarpeta: prefix[1],
      categoria: prefix[2],
      subcategoria: prefix[3]
    }

    let data = Object.keys(item).length > 0 ? {...item, dataActions} : {actions : 'formulario', dataActions};
    
    navigation.navigate('Mapa' , data);
  }

  const loadData = async () => {
    try {
      const object = prefix[prefix.length - 1];
      const newPrefixLength = prefix.length;
  
      let response: any = [];
      switch (newPrefixLength) {
        case 1:
          response = await getFilterNodoLocal(object?.item);
          break;
        case 2:
          response = await getFilterMufaLocal(object?.item);
          break;
        case 3:
          response = await getSubMufaLocal(object?.item);
          break;
        case 4:
          response = await getFilterDetalleLocal(object?.item);
          break;
        default: 
          getTroncal();
          break;
      }
      setData(response);
      setDataSearch(response)
    } catch (error) {
      console.error('Error cargando datos:', error);
    }
  };

  // Detalle
  const setNewData = (item: any) => {
    let newFiles : any = [];
    if(Array.isArray(item?.archivos) && item?.archivos.length > 0 )  {
      var files : any[] = item?.archivos
        newFiles = files.map(( val :any) => {
        return {
          descripcion: val?.descripcion,
          orden: val?.orden,
          latitud: val?.latitud,
          longitud: val?.longitud,
          enviado: 1, // Ya està en el back
          modificado: 0, // su orden no fue modificado
          file: {
            uri: val?.url,
            nombre: val?.nombre,
            ext: val?.ext,
            type: val?.type
          }
        }
      })
    }
    
    return {
      bool: 0,
      codInterno: item?.codInterno || null,
      codigo: item?.codigo || null,
      idProducto: item?.idProducto || null,
      nombre: item?.nombre || null,
      tipo: item?.tipo || null,
      estado: item?.estado || null,
      cantidadInicial: item?.cantidadInicial || null,
      cantidadReferencia: item?.cantidadReferencia || null,
      cantidadFinal: item?.cantidadFinal || null,
      precio: item?.precio || null,
      idTipoVia: item?.idTipoVia || null,
      ladoVia: item?.ladoVia || null,
      nombreVia: item?.nombreVia || null,
      lote: item?.lote || null,
      direccion: item?.direccion || null,
      latitud: item?.latitud || null,
      longitud: item?.longitud || null,
      apoyo: item?.apoyo || null,
      idPropietario: item?.idPropietario || null,
      propietario: item?.propietario || null,
      idUsuario: item?.idUsuario || null,
      nivelTension: item?.nivelTension || null,
      idUnidadMedidaAlto: item?.idUnidadMedidaAlto || null,
      alto: item?.alto || null,
      idUnidadMedidaAncho: item?.idUnidadMedidaAncho || null,
      ancho: item?.ancho || null,
      item: item?._id || null,
      idMufa: item?.idMufa || null,
      idSubMufa: item?.idSubMufa || null,
      idTipoEstado: item?.idTipoEstado || null,
      enviado: 1,
      editado: 0,
      especificaciones: Array.isArray(item?.especificaciones) && item?.especificaciones.length > 0 ? item?.especificaciones : null,
      materiales:  Array.isArray(item?.materiales) && item?.materiales.length > 0 ? item?.materiales : null,
      referencias: Array.isArray(item?.referencias) && item?.referencias.length > 0 ? item?.referencias : null,
      archivos: Array.isArray(item?.archivos) && item?.archivos.length > 0 ? JSON.stringify(newFiles) : null,
    };
  };
  
  const saveDetails = async () => {
    getPostes();
    if( !statusApp && statusNet ) {
      resetTables("detalle");
      sleep(500);
      
      const detalle = await getAllDetailsServer({});
      detalle?.data?.data?.forEach(async (val :any) => {
        saveDetalleLocal(setNewData(val))
      }); 
    }
  }
  
  const searching = (object: any) => {
    const { name, idTipoEstado } = object;
    
    const regex = name ? new RegExp(name, 'i') : null;
  
    const filteredData = dataSearch.filter((item: any) => {
      const matchesName = regex ? regex.test(item.nombre) : true;  // If name is present, test the regex, otherwise true
      const matchesEstado = idTipoEstado ? item.idTipoEstado === idTipoEstado : true;  // If idTipoEstado is present, match, otherwise true
      return matchesName && matchesEstado;
    });
  
    setData(filteredData);
  };  

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      evalDB();
      setPrefix([]);
      await loadData();
      await getTroncal();

    } catch (error) {
        setRefreshing(false);
    } finally {
        setRefreshing(false);
    }
};

  useEffect(() => {
    getTroncal();
  }, []);

  useFocusEffect(
    useCallback(() => {
      if( prefix ) {
        loadData();
      }
    }, [prefix])
  );

  return (
    <Layout mode='column'>
      <HeaderHome 
        search={searching} 
        prefix={prefix} 
        backNavigation={onChangeNavigation} 
        refresh={getTroncal}
        modeActive={mode} setModeActive={setMode}
      />

      <ScrollView showsHorizontalScrollIndicator={true} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}>
        <DesingFolderHome 
          mode={mode}
          data={data} 
          onNavigation={(e:any) => prefix.length == 4 ? handleDirection(e) : onChangeNavigation(e)}
        />
      </ScrollView>

      {
        Object.keys(prefix).length == 4 && (
          <IconButton
            icon={() => <Icon name="plus" size={25} />}
            size={40}
            style={{...stylesDefault.blueLightBg, ...style.containerFloat }}
            onPress={() => handleDirection({})}
          />
        )
      }

    </Layout>
  )
}

const style = StyleSheet.create({
  headerTwo : { flexDirection: 'row',  alignItems: 'center', alignContent: 'center' },
  containerFloat: {
    position: "absolute",
    margin: 15,
    bottom: 0,
    right: 0,
    justifyContent: 'flex-end',
    alignSelf: 'flex-end'
  },
})

export default Home
