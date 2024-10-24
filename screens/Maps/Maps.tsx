import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useLocation } from '../../store/useLocation';
import { Dimensions, Image, StyleSheet, View } from 'react-native';
import { RouteProp, useFocusEffect, useRoute } from '@react-navigation/native';
import { Colors } from 'react-native/Libraries/NewAppScreen';

import BottomSheet from '@gorhom/bottom-sheet';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import {ScrollView} from 'react-native-gesture-handler';
import { IconButton } from 'react-native-paper';
import Icon from 'react-native-vector-icons/FontAwesome';

import { useBearStore } from '../../store/storet';
import stylesDefault from '../style';

import Header from './Header';
import Legend from './Legend';
import ModalRegister from './ModalRegister';
import Layout from '../../components/Layout'
import { getAllDetalleLocal, getOneDetalleItem, getTypeStatusLocal, updateDetalleLocal } from '../../services/dataBase';
import BottomSheetHeader from './BottomSheetHeader';
import FormDescripcion from './FormDescripcion';
import BottomSheetContent from './BottomSheetContent';
import BottomSheetStatus from '../MapContent/BottomSheetStatus';
import ModalStatus from '../Gestor/ModalStatus';
import { updateDetailsData } from '../../services/axios';
import { filtrarDatos } from '../../components/Functions';

const { height } = Dimensions.get('window');

type RootStackParamList = {
  Registro: any;
};

type MapaScreenRouteProp = RouteProp<RootStackParamList, 'Registro'>;

const Maps = () => {
  const route = useRoute<MapaScreenRouteProp>();
  const { statusApp, statusNet } = useBearStore.getState()

  const modes = useBearStore((state) => state.mode)
  const isDarkMode = modes === 'dark';

  const { lastKnownLocation, getLocation } = useLocation();
  const mapRef = useRef<MapView>(null);
  const bottomSheetRef = useRef<BottomSheet>(null);

  const [ selectedLocation, setSelectedLocation ] = useState<any>(null);
  const [ dataRoute, setDataRoute ] = useState([]);
  const [ detalle, setDetalle ] = useState([]);

  // Modal
  const [modalVisible, setModalVisible] = useState(false);

  // BottomSheet
  const [ schemaRef, setSchemaRef ] = useState<any>([]);
  const [ dataBottomSheet, setDataBottomSheep ] = useState<any>([]);
  const [ takeAgain, setTakeAgain ] = useState<any>([]);
  const snapPoints = useMemo(() => ['90%'], []);

  // Modals Status
  const [ visibleModalStatus, setVisibleModalStatus ] = useState(false);
  const [ modalEditData, setModalEditData ] = useState<any>([]);
  const [ loadingModal, setLoadingModal ] = useState(false);

  // Modals 
  const [ fileTaken, setFileTaken ] = useState([]);
  const [ modalVisibleDescripcion, setModalVisibleDescripcion ] = useState(false);

  const [ typeStatus, setTypeStatus ] = useState([]);

  const getPostes = async () => {
    setDetalle([]);
    const res: any = await getAllDetalleLocal();
    setDetalle(res);
  };

  // * MARKERS MAP...
  const handleMapPress = ( event: any ) => {
    const { coordinate } = event.nativeEvent;
    setSelectedLocation(coordinate);
  };

  const handleMarkerPress = () => {
    setSelectedLocation(null);
  };

  const handleMarkerSelected = async ( item: any ) => {
    var schema : any = [];

    if( item?.tipo == 'ODF' ) {
      schema = [
        {
          name: 'ODF',
          body: [
            { orden: 1, descripcion: '', label: 'Recorrido de FO de 144 hilos - Vertical' },
            { orden: 2, descripcion: '', label: 'Recorrido de FO de 144 hilos - Horizontal ' },
            { orden: 3, descripcion: '', label: 'Ingreso de la FO de 144 hilos al ODF' },
            { orden: 4, descripcion: '', label: 'Panorámica frontal del rack' },
            { orden: 5, descripcion: '', label: 'Panorámica frontal (vista de 3 ODF)' },
            { orden: 6, descripcion: '', label: '1° ODF' },
            { orden: 7, descripcion: '', label: '2° ODF' },
            { orden: 8, descripcion: '', label: '3° ODF' },
            { orden: 0, descripcion: '', label: 'Tomar foto' },
          ]
        },
      ]
      setSchemaRef(schema);
    }
    else if( item?.tipo == 'MD' ) {
      schema = [
        {
          name: 'MD',
          body: [
            { orden: 1, descripcion: '', label: 'BANDEJA 1' },
            { orden: 2, descripcion: '', label: 'BANDEJA 2' },
            { orden: 3, descripcion: '', label: 'BANDERITAS' },
            { orden: 4, descripcion: '', label: 'ACONDICIONADO DE BUFFERS' },
            { orden: 5, descripcion: '', label: 'ETIQUETAS' },
            { orden: 6, descripcion: '', label: 'SOPORTES' },
            { orden: 7, descripcion: '', label: 'PANORAMICA' },
            { orden: 8, descripcion: '', label: 'OTRAS BANDEJAS' },
            { orden: 0, descripcion: '', label: 'Tomar foto' },
          ]
        },
      ]
      setSchemaRef(schema);
    }
    else if( item?.tipo == 'MT' ) {
      schema = [
        {
          name: 'MT',
          body: [
            { orden: 1, descripcion: '', label: 'BANDEJA 1' },
            { orden: 2, descripcion: '', label: 'BANDEJA 2' },
            { orden: 3, descripcion: '', label: 'BANDERITAS' },
            { orden: 4, descripcion: '', label: 'ACONDICIONADO DE BUFFERS' },
            { orden: 5, descripcion: '', label: 'ETIQUETAS' },
            { orden: 6, descripcion: '', label: 'SOPORTES' },
            { orden: 7, descripcion: '', label: 'PANORAMICA' },
            { orden: 8, descripcion: '', label: 'OTRAS BANDEJAS' },
            { orden: 0, descripcion: '', label: 'Tomar foto' },
          ]
        },
      ]
      setSchemaRef(schema);
    }else if( item?.tipo == 'NAP' ) {
      schema = [
        {
          name: 'Spliter 1',
          body: [
            { orden: 6, descripcion: '0', label: 'PT1' },
            { orden: 7, descripcion: '0', label: 'PT2' },
            { orden: 8, descripcion: '0', label: 'PT3' },
            { orden: 9, descripcion: '0', label: 'PT4' },
            { orden: 10, descripcion: '0', label: 'PT5' },
            { orden: 11, descripcion: '0', label: 'PT6' },
            { orden: 12, descripcion: '0', label: 'PT7' },
            { orden: 13, descripcion: '0', label: 'PT8' },
          ]
        },
        {
          name: 'Spliter 2',
          body: [
            { orden: 14, descripcion: '0', label: 'PT1' },
            { orden: 15, descripcion: '0', label: 'PT2' },
            { orden: 16, descripcion: '0', label: 'PT3' },
            { orden: 17, descripcion: '0', label: 'PT4' },
            { orden: 18, descripcion: '0', label: 'PT5' },
            { orden: 19, descripcion: '0', label: 'PT6' },
            { orden: 20, descripcion: '0', label: 'PT7' },
            { orden: 21, descripcion: '0', label: 'PT8' },
            { orden: -1, descripcion: '0', label: 'Adicional' },
            { orden: 0, descripcion: '', label: 'Tomar foto' },
          ]
        },
        {
          name: 'NAP',
          body: [
            { orden: 1, descripcion: '', label: 'SPLITTERS Y BUFFERS' },
            { orden: 2, descripcion: '', label: 'PIGTAILS' },
            { orden: 3, descripcion: '', label: 'ROTULADO' },
            { orden: 4, descripcion: '', label: 'PANORAMICA' },
            { orden: 5, descripcion: '', label: 'ETIQUETAS' },
            { orden: 0, descripcion: '', label: 'Tomar foto' },
          ]
        },
      ]
      setSchemaRef(schema);
    } else if( item?.tipo == 'POSTE' ){
      schema = [
        {
          name: 'POSTE',
          body: [
            { orden: 1, descripcion: '', label: 'FERRETERÍA' },
            { orden: 2, descripcion: '', label: 'PANORÁMICA' },
            { orden: 3, descripcion: '', label: 'OTROS' },
            { orden: 0, descripcion: '', label: 'Tomar foto' },
          ]
        },
        
      ]
      setSchemaRef(schema);
    }else {
      schema = [
        {
          name: 'SIN TIPO',
          body: [
            { orden: 0, descripcion: '', label: 'Tomar foto' },
          ]
        },
        
      ]
      setSchemaRef(schema);
    }

    setDataBottomSheep(item);
    bottomSheetRef.current?.expand();
  };

  const getItemReturn = async ( item: any ) => {
    handleMarkerSelected(item);
    bottomSheetRef.current?.expand();
  };

  const closeBottomSheet = ( ) => {
    bottomSheetRef.current?.close();
    setDataBottomSheep([]);
    setTakeAgain([]);
  }

  const refreshBottomSheet = async (id: any) => {
    setTakeAgain([]);
    const res : any = await getOneDetalleItem(id);
    getPostes();
    handleMarkerSelected(res);
  }

  // Modal Registrar
  const registerAdd = () => {
    if(Object.keys(dataRoute).length > 0){
      let data = {...dataRoute, latitud: selectedLocation?.latitude, longitud: selectedLocation?.longitude };
      setDataRoute(data);
      setModalVisible(true);
    }
  }

  // Modal Actualizar

  const handleEditStatus = async ( idTipoEstado : any ) => {
    setLoadingModal(true);

    let info : any = {
      ...dataBottomSheet,
      idTipoEstado: idTipoEstado,
      alto: modalEditData?.altura || null,
      nivelTension: modalEditData?.nivelTension || null,
      codInterno: modalEditData?.codInterno || null,
      idPropietario: modalEditData?.idPropietario || null,
    };
    delete info.dataActions

    console.log(info.dataActions)
    const response = await updateDetalleLocal(info, dataBottomSheet?.id);

    if(response) {
      if( statusNet && !statusApp ) {
        
        const newInfo = filtrarDatos(info)
        delete newInfo.id
        delete newInfo.item
        delete newInfo.archivos

        const formData = new FormData();
        formData.append("data", JSON.stringify(newInfo));
  
        const res : any = await updateDetailsData(dataBottomSheet?.item, formData);
      }
      setLoadingModal(false)
    }
    setVisibleModalStatus(false);
    refreshBottomSheet(dataBottomSheet?.id);
    setLoadingModal(false)
  }

  const findByIdStatus = (id: any) => {
    const stp :any = typeStatus.find((tp: any) => tp.item == id);
    
    if (stp) {
      return { color: stp.color, nombre: stp.nombre };
    }
    
    return { color: "#69A42F", nombre: "Sin asignar" };
  };

  const getEstados = async () => {
    const res: any = await getTypeStatusLocal();

    setTypeStatus(res);
  }

  useFocusEffect(
    useCallback(() => {
      if( typeStatus.length > 0) {
        getPostes();
      }
    }, [typeStatus])
  );
  
  useEffect(() => {
    if (lastKnownLocation === null) {
      getLocation();
    }
  }, [lastKnownLocation]);

  useEffect(() => {
    if (route.params !== undefined) {
      const { latitud, longitud, dataActions, actions } = route.params;
      let latitudeNew = latitud;
      let longitudeNew = longitud;

      if( actions == 'formulario' ) {
        setModalVisible(true);
        latitudeNew = lastKnownLocation?.latitude;
        longitudeNew = lastKnownLocation?.longitude;
      }else {
        getItemReturn(route.params);
      }

      setDataRoute( {...dataActions, latitud: latitudeNew, longitud: longitudeNew } );

      const region = {
        latitude: parseFloat(latitudeNew),
        longitude: parseFloat(longitudeNew),
        latitudeDelta: 0.001,
        longitudeDelta: 0.001,
      };

      mapRef?.current?.animateToRegion(region);
    }
  }, [route.params, lastKnownLocation]);

  useEffect(( ) => {
    getEstados();
  }, [ ])
  
  return (
    <Layout mode="column">
      {dataRoute && Object.keys(dataRoute).length > 0 && (
        <Header route={dataRoute} />
      )}

      <View style={style.container}>
        <MapView
          provider={PROVIDER_GOOGLE}
          loadingEnabled
          ref={mapRef}
          showsUserLocation
          showsScale
          style={style.map}
          region={{
            latitude:
              lastKnownLocation == null
                ? -12.061692
                : lastKnownLocation.latitude,
            longitude:
              lastKnownLocation == null
                ? -77.046461
                : lastKnownLocation.longitude,
            latitudeDelta: 0.001,
            longitudeDelta: 0.001,
          }}
          zoomControlEnabled
          onPress={handleMapPress}
          showsMyLocationButton
          showsCompass={true}>
          {selectedLocation && (
            <Marker
              coordinate={selectedLocation}
              title={'Poste'}
              onPress={handleMarkerPress}
            />
          )}

          {detalle &&
            detalle.map((item: any) => (
              <Marker
                coordinate={{
                  latitude: parseFloat(
                    item?.latitud ? item?.latitud : lastKnownLocation?.latitude,
                  ),
                  longitude: parseFloat(
                    item?.longitud
                      ? item?.longitud
                      : lastKnownLocation?.longitude,
                  ),
                }}
                onPress={() => handleMarkerSelected(item)}
                title={item?.nombre}
                
                pinColor={findByIdStatus(item?.idTipoEstado).color}
                key={item?.id}
              />
            ))}
        </MapView>

        {selectedLocation && Object.keys(dataRoute).length > 0 && (
          <View style={style.containerFloat}>
            <IconButton
              icon={() => <Icon name="plus" size={25} />}
              size={40}
              style={stylesDefault.blueLightBg}
              onPress={registerAdd}
            />
          </View>
        )}
      </View>
      
      <Legend />

      <ModalRegister
        visible={modalVisible}
        setVisible={setModalVisible}
        insertId={refreshBottomSheet}
        refresh={() => {
          console.log('Refresh');
        }}
        loadAutomatic={dataRoute}
      />

      {Object.keys(dataBottomSheet).length > 0  && (
        <BottomSheet
          key={dataBottomSheet?.item}
          ref={bottomSheetRef}
          snapPoints={snapPoints}
          enablePanDownToClose
          backgroundStyle={{
            backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
          }}
          onClose={() => {
            setDataBottomSheep([]);
            bottomSheetRef.current?.forceClose();
          }}>
          <ScrollView activeCursor="all-scroll" style={{marginHorizontal: 15}}>
            <BottomSheetHeader
              data={dataBottomSheet}
              openStatus={setVisibleModalStatus}
              dataRegister={setModalEditData}
              onClose={() => closeBottomSheet()}
            />
            <View>
              <FormDescripcion
                visible={modalVisibleDescripcion}
                setVisible={setModalVisibleDescripcion}
                takeFotoAgain={setTakeAgain}
                coordinateMarker={{
                  latitud : dataBottomSheet.latitud,
                  longitud : dataBottomSheet.longitud
                }}
                fileImage={fileTaken}
                refresh={() => {
                  refreshBottomSheet(dataBottomSheet?.id);
                  setFileTaken([]);
                }}
              />
              <BottomSheetContent
                takeFotoAgain={takeAgain}
                data={dataBottomSheet}
                schemaRef={schemaRef}
                takenFile={setFileTaken}
                setVisible={setModalVisibleDescripcion}
              />
            </View>
          </ScrollView>
        </BottomSheet>
      )}

      <ModalStatus 
        visible={visibleModalStatus}
        loading={loadingModal}
        setVisible={setVisibleModalStatus} 
        onClick={ (e : any ) => {
          handleEditStatus(e?.item)
        }}
      />
    </Layout>
  );
}

const style = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  containerFloat: {
    top: height - 250,
    padding: 20,
    alignItems: 'flex-end',
    marginRight: 35,
    shadowOpacity: 0.5,
  },
})


export default Maps
