import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import Layout from '../../components/Layout';

import BottomSheet from '@gorhom/bottom-sheet';
import { RouteProp, useFocusEffect, useRoute } from '@react-navigation/native';
import { useForm } from 'react-hook-form';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { IconButton } from 'react-native-paper';
import Icon from 'react-native-vector-icons/FontAwesome';
import { getAllDetalleLocal, getOneDetalleItem } from '../../services/dataBase';
import { useLocation } from '../../store/useLocation';
import stylesDefault from '../style';
import BottomSheetContent from '../Maps/BottomSheetContent';
import BottomSheetHeader from '../Maps/BottomSheetHeader';
import RegisterModal from './RegisterModal';
const { height } = Dimensions.get('window');
import {ScrollView} from 'react-native-gesture-handler';
import FormDescripcion from '../Maps/FormDescripcion';
import ListMaterial from './ListMaterial';
import BottomSheetStatus from './BottomSheetStatus';
import Legend from '../Maps/Legend';
import { useBearStore } from '../../store/storet';
import { Colors } from 'react-native/Libraries/NewAppScreen';
import RegisterModalV2 from '../Maps/ModalRegister';
import { NavigationProp, useNavigation } from '@react-navigation/native';

type RootStackParamList = {
  Registro: any;
};

type MapaScreenRouteProp = RouteProp<RootStackParamList, 'Registro'>;

const Map = () => {
  const navigation = useNavigation<NavigationProp<any>>();
  const modes = useBearStore((state) => state.mode)
  const isDarkMode = modes === 'dark';
  const { setValue } = useForm({});
  const route = useRoute<MapaScreenRouteProp>();

  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ['5%', '35%', '60%', '90%'], []);

  const {lastKnownLocation, getLocation} = useLocation();
  const mapRef = useRef<MapView>(null);

  const [selectedLocation, setSelectedLocation] = useState<any>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [ dataBottomSheet, setDataBottomSheep ] = useState<any>([]);
  const [ bottomSheetStatus, setBottomSheetStatus ] = useState(false);
  const [ bottomSheetStatusData, setBottomSheetStatusData ] = useState(false);
  const [ modalVisibleV2, setModalVisibleV2 ] = useState(false);

  const [ modalVisibleMaterial, setModalVisibleMaterial ] = useState(false);
  const [ fileTaken, setFileTaken ] = useState([]);
  const [ loadAutomatic, setLoadAutomatic ] = useState([]);

  const [ postes, setPostes ] = useState([]);
  const [ schemaRef, setSchemaRef ] = useState<any>([]);

  const [ takeAgain, setTakeAgain ] = useState<any>([]);

  const getPostes = async () => {
    setPostes([]);
    const res: any = await getAllDetalleLocal();
    setPostes(res);
  };
  
  const handleMapPress = (event: any) => {
    const { coordinate } = event.nativeEvent;
    setSelectedLocation(coordinate);

    if(Object.keys(loadAutomatic).length > 0){
      let data = {...loadAutomatic, latitud: coordinate?.latitude, longitud: coordinate?.longitude };
      setLoadAutomatic(data);
      setModalVisibleV2(true);
    }
  };

  const handleMarkerPress = () => {
    setSelectedLocation(null);
  };

  const handleSetData = () => {
    setValue('latitud', selectedLocation.latitude.toString());
    setValue('longitud', selectedLocation.longitude.toString());
    setModalVisible(true);
  };

  const refreshBottomSheet = async (id: any) => {
    setTakeAgain([]);
    const res : any = await getOneDetalleItem(id);
    getPostes();
    handleMarkerSelected(res);
  }

  const handleMarkerSelected = async (item: any) => {
    var schema : any = [];

    if( item?.tipo == 'MUFA' ) {
      schema = [
        {
          name: 'Mufa',
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
            { orden: 6, descripcion: '0', label: 'SP1PT1' },
            { orden: 7, descripcion: '0', label: 'SP1PT2' },
            { orden: 8, descripcion: '0', label: 'SP1PT3' },
            { orden: 9, descripcion: '0', label: 'SP1PT4' },
            { orden: 10, descripcion: '0', label: 'SP1PT5' },
            { orden: 11, descripcion: '0', label: 'SP1PT6' },
            { orden: 12, descripcion: '0', label: 'SP1PT7' },
            { orden: 13, descripcion: '0', label: 'SP1PT8' },
          ]
        },
        {
          name: 'Spliter 2',
          body: [
            { orden: 14, descripcion: '0', label: 'SP2PT1' },
            { orden: 15, descripcion: '0', label: 'SP2PT2' },
            { orden: 16, descripcion: '0', label: 'SP2PT3' },
            { orden: 17, descripcion: '0', label: 'SP2PT4' },
            { orden: 18, descripcion: '0', label: 'SP2PT5' },
            { orden: 19, descripcion: '0', label: 'SP2PT6' },
            { orden: 20, descripcion: '0', label: 'SP2PT7' },
            { orden: 21, descripcion: '0', label: 'SP2PT8' },
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
    } else{
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
    }

    setDataBottomSheep(item);
    bottomSheetRef.current?.expand();
  };

  const getItemReturn = async (item: any) => {
    handleMarkerSelected(item);
    bottomSheetRef.current?.expand();
  };

  useFocusEffect(
    useCallback(() => {
      getPostes();
    }, [])
  );

  useEffect(() => {
    if (lastKnownLocation === null) {
      getLocation();
    }
  }, [lastKnownLocation]);

  useEffect(() => {
    if (route.params !== undefined) {
      const { latitud, longitud, actions, dataActions } = route.params;

      if( actions == 'formulario' ) {
        setModalVisibleV2(true);
        setSelectedLocation(lastKnownLocation);
        setLoadAutomatic({...dataActions, latitud: lastKnownLocation?.latitude, longitud: lastKnownLocation?.longitude});
      } else {
        getItemReturn(route.params);
      }

      const region = {
        latitude: parseFloat(latitud ? latitud : lastKnownLocation?.latitude),
        longitude: parseFloat(longitud ? longitud : lastKnownLocation?.longitude),
        latitudeDelta: 0.001,
        longitudeDelta: 0.001,
      };
      mapRef?.current?.animateToRegion(region);
    }
  }, [route.params , lastKnownLocation]);
  

  return (
    <Layout mode="column">
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
          zoomTapEnabled
          zoomEnabled
          onPress={handleMapPress}
          showsMyLocationButton
          showsCompass={true}>
            
          {selectedLocation && (
            <Marker
              coordinate={selectedLocation}
              title={'Poste'}
              onPress={handleMarkerPress}
              style={{width: 30}}
            />
          )}

          {postes &&
            postes.map((item: any) => (
            <Marker
              coordinate={{
                latitude: parseFloat(item?.latitud ? item?.latitud : lastKnownLocation?.latitude),
                longitude: parseFloat(item?.longitud ? item?.longitud : lastKnownLocation?.longitude),
              }}
              onPress={() => handleMarkerSelected(item)}
              title={item?.nombre}
              pinColor={item?.enviado == 1 && item?.editado == 1 ? stylesDefault.purple.color : item?.enviado == 1 && item?.editado == 0 ? stylesDefault.greenLight.color : stylesDefault.orange.color  }
              key={item?.id}
            />
          ))}
        </MapView>

        {selectedLocation && (
          <View style={style.containerFloat}>
            <IconButton
              icon={() => <Icon name="plus" size={25} />}
              size={40}
              style={stylesDefault.blueLightBg}
              onPress={handleSetData}
            />
          </View>
        )}

        <Legend />

        <RegisterModal
          visible={modalVisible}
          setVisible={setModalVisible}
          cordinate={selectedLocation}
          insertId={refreshBottomSheet}
          refresh={() => {
            getPostes();
            setLoadAutomatic([]);
          }}
        />

        <RegisterModalV2 
          visible={modalVisibleV2}
          setVisible={setModalVisibleV2}
          insertId={refreshBottomSheet}
          refresh={() => {
            navigation.navigate('Mapa' , {});
            setLoadAutomatic([]);
            getPostes();
          }}
          loadAutomatic={loadAutomatic}
        />

        {Object.keys(dataBottomSheet).length > 0 && !bottomSheetStatus && (
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
              bottomSheetRef.current?.forceClose()
            }}>
            <ScrollView
              activeCursor="all-scroll"
              style={{ marginHorizontal: 15 }}>
              <BottomSheetHeader
                data={dataBottomSheet}
                openStatus={setBottomSheetStatus}
                dataRegister={setBottomSheetStatusData}
              />
                <View>
                  <FormDescripcion
                    visible={modalVisibleMaterial}
                    setVisible={setModalVisibleMaterial}
                    takeFotoAgain={setTakeAgain}
                    fileImage={fileTaken}
                    refresh={() => {
                      refreshBottomSheet(dataBottomSheet?.id)
                      setFileTaken([]);
                    }}
                  />
                  <BottomSheetContent
                    takeFotoAgain={takeAgain}
                    data={dataBottomSheet}
                    schemaRef={schemaRef}
                    takenFile={setFileTaken}
                    setVisible={setModalVisibleMaterial}
                  />

                </View>
            </ScrollView>
          </BottomSheet>
        )}

        {dataBottomSheet && bottomSheetStatus && (
          <BottomSheetStatus
            data={dataBottomSheet}
            visible={bottomSheetStatus}
            onClose={() => setBottomSheetStatus(false)}
            refresh={refreshBottomSheet}
            dataRegister={bottomSheetStatusData}
          />
        )}
      </View>
    </Layout>
  );
}

const style = StyleSheet.create({
  container: {
    flex: 1
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  containerFloat: {
    top: height - 190,
    padding: 20,
    alignItems: 'flex-end',
    marginRight: 35,
    shadowOpacity: 0.5,
  },
})

export default Map
