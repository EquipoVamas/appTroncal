import React, { useState, useCallback, useEffect } from 'react'
import { StyleSheet, View, ScrollView } from 'react-native'
import Layout from '../../components/Layout'
import { Search } from './Search'
import { IconButton, Snackbar, Text } from 'react-native-paper'
import Icon from 'react-native-vector-icons/FontAwesome';
import { getAllDetailsServer } from '../../services/axios'
import { getAllDetalleLocal, resetTables, saveDetalleLocal } from '../../services/dataBase'
import DesingFolder from './DesingFolder'
import { useBearStore } from '../../store/storet'
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext'
import Styles from '../style'
import { Colors } from 'react-native/Libraries/NewAppScreen'

const GestorDetalle = () => {
  const { authState } = useAuth();
  const [mode, setMode] = useState<any>('list'); // card | list
  const modes = useBearStore((state) => state.mode)
  const isDarkMode = modes === 'dark';
  const [rows, setRows] = useState<any>([]); // card | list
  const { statusNet, statusApp } = useBearStore();
  const [visibleSnackBar, setVisibleSnackBar] = useState(false);
  const [message, setMessage] = useState<any>('card'); // card | list

  const onToggleSnackBar = () => setVisibleSnackBar(!visibleSnackBar);
  
  const onDismissSnackBar = () => {
    setTimeout(() => {
      setVisibleSnackBar(false)
    }, 1000)
  };

  const getDetalleServer = async (data: any = null) => {
    const idUsuario = authState?.user?.idUsuario;
    //const res: any = await getAllDetailsServer({ idUsuario });
    const { status, search } = data;
    const res: any = await getAllDetailsServer({ idTipoEstado: status, search: search });
    return res?.data?.data;
  };

  const downloadDataInLocal = async (status: any = null) => {
    if (!statusNet) {
      showMessage('No está conectado a internet para poder descargar los datos.');
      return;
    }
  
    const res = await getDetalleLocal(); 
    if(res.length > 0) {
      await resetTables('detalle');
      setRows([]);
    }

    if (res && statusNet) {
      const res: any = await getDetalleServer(status);
      if(res) {
        for (const val of res) {
          await saveDetalleLocal(setNewData(val));           
        }
        showMessage('Datos descargados y guardados localmente.');
      }
      await getDetalleLocal(); 
    } else {
      showMessage('No se pudo resetear la tabla o no hay conexión a internet.');
    }
  };
  
  const getDetalleLocal = async () => {
    const res: any = await getAllDetalleLocal();
    setRows(res);
    return res;
  }

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

  const showMessage = (message: string) => {
    setMessage(message)
    onToggleSnackBar();
    onDismissSnackBar();
  };

  const emitFilter = (data:any) => {
    if(statusNet && !statusApp){
      downloadDataInLocal(data)
    }else{
      const { status, search } = data;
      if(!status || !search) getDetalleLocal()
      if(status) setRows((value:any) => { return value.filter((vl:any) => vl.idTipoEstado == status ) })
      if(search) setRows((value:any) => { return value.filter((vl:any) =>  vl.nombre.toLowerCase().includes(search.toLowerCase()) ) })
      
    }
  }

  useFocusEffect(
    useCallback(() => {
      getDetalleLocal();
    }, [])
  );

  return (
    <Layout mode='column' pullRefresh={downloadDataInLocal} >
      <Search modeActive={mode} setModeActive={setMode} output={emitFilter}/>

      <View style={style.containerHeader}>
        <Text style={{...style.subtitle}}>Detalles</Text>
        <View style={style.containerIconHeader}>
          <IconButton
            icon={() => <Icon name="cloud-download" size={15} color={'#ffff'} />}
            size={20}
            style={{...style.iconDesign, backgroundColor: Styles.purple.color }}
            onPress={downloadDataInLocal}
          />
        </View>
      </View>
      
      <ScrollView showsHorizontalScrollIndicator={true}>
        <DesingFolder data={rows} mode={mode}/>
      </ScrollView>

      <View style={style.containerAlert}>
        <Snackbar
          visible={visibleSnackBar}
          style= {{  backgroundColor: isDarkMode ? Colors.darker : Colors.lighter }}
          onDismiss={onDismissSnackBar}
          action={{
            label: 'Cerrar',
            onPress: () => {
              onDismissSnackBar();
            },
          }}>
          <Text style={ { fontSize: 19 } }>{message}</Text>
        </Snackbar>
      </View>
    </Layout>
  )
}

const style = StyleSheet.create({
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
    margin: 8,
  },
  containerAlert: {
    flex: 1,
    justifyContent: 'space-between',
  }
})

export default GestorDetalle
