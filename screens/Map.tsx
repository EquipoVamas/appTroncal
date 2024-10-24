import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {
  Alert,
  Dimensions,
  Image,
  Modal,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
  View,
} from 'react-native';
import MapView, {Marker, PROVIDER_GOOGLE} from 'react-native-maps';
import {
  Divider,
  Button,
  SegmentedButtons,
  Text,
  TextInput,
  DataTable 
} from 'react-native-paper';
import {Colors} from 'react-native/Libraries/NewAppScreen';
import {useLocation} from '../store/useLocation';
import Icon from 'react-native-vector-icons/EvilIcons';

const {width, height} = Dimensions.get('window');

const styles = StyleSheet.create({
  containerMap: {
    flex: 1, 
    width: width,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  infoContainer: {
    position: 'absolute',
    bottom: 50,
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 5,
    elevation: 3,
  },
  input: {
    height: 20,
    marginTop: 5,
    padding: 5,
    borderRadius: 5,
  },
  button: {
    color: 'white',
    height: 40,
    marginTop: 5,
    borderRadius: 4,
    fontSize: 4,
  },
  btnFloat: {
    top: height - 160,
    alignItems: 'flex-end',
    margin: 5,
    shadowOpacity: 0.5,
  },
  btn: {
    height: 70,
    width: 70,
    borderRadius: 50,
    backgroundColor: '#69A42F',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
  },
  btnText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  contentContainer: {
    flex: 1,
    alignItems: 'center',
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 25,
    //alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  buttonOpen: {
    backgroundColor: '#F194FF',
  },
  buttonClose: {
    backgroundColor: '#2196F3',
  },
  textStyle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  modalText: {
    marginBottom: 5,
    textAlign: 'center',
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
  },
  picker: {
    width: '100%',
    borderWidth: 1,
    borderRadius: 5,
  },
  selectedText: {
    marginTop: 16,
    fontSize: 16,
    color: 'blue',
  },
  contentBottomSheep: {
    // display: 'flex',
    // flexDirection: 'row',
    // gap: 8,
    // marginVertical: 8
    margin: 5,
  },
  textBottomSheep: {
    fontWeight: 'bold',
    fontSize: 12,
    // width: 120,
  },
  subTextBottomSheep: {
    fontSize: 16,
    flexWrap: 'wrap',
    width: '100%',
  },
  divider: {
    borderColor: '#c2c2c2',
    borderWidth: 0.2,
  },
  colorBox: {
    width: 12,
    height: 12,
    borderRadius: 12,
    marginRight: 5,
  },
});

import {
  NavigationProp,
  RouteProp,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import {Controller, useForm} from 'react-hook-form';
import Carousel from 'react-native-reanimated-carousel';
import {getItems, getOneItem, saveItem, updateItem} from '../services/db';

import BottomSheet, {BottomSheetView} from '@gorhom/bottom-sheet';
import {Picker} from '@react-native-picker/picker';
import {ScrollView} from 'react-native-gesture-handler';
import Layout from '../components/Layout';
import Legend from './Legend';

type RootStackParamList = {
  Registro: any;
};

type MapaScreenRouteProp = RouteProp<RootStackParamList, 'Registro'>;

const Maps = () => {
  const {
    control,
    handleSubmit,
    setValue,
    getValues,
    formState: {errors},
    reset,
    watch,
  } = useForm({
    defaultValues: {
      nombre: '',
      latitud: '',
      longitud: '',
      codPoste: '',
      propietario: 'OTROS',
      ladoVia: 'Izquierda',
      direccion: '',
      tipoVia: 'Avenida',
      nroApoyo: '1',
      nivelTension: 'BT',
      material: 'Madera',
      altura: '7M',
      idRegistro: '',
      nombreVia: '',
      lote: '',
      estadoP: 'Nuevos instalados',
      status: '',
      item: '',
    },
  });
  const isDarkMode = useColorScheme() === 'dark';

  const {lastKnownLocation, getLocation} = useLocation();
  const route = useRoute<MapaScreenRouteProp>();

  const mapRef = useRef<MapView>(null);
  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ['5%', '35%', '60%', '90%'], []);
  const [openBottomSheet, setOpenBottomSheep] = useState<any>(false);
  const [dataBottomSheet, setDataBottomSheep] = useState<any>([]);
  const [selectedLocation, setSelectedLocation] = useState<any>(null);
  const navigation = useNavigation<NavigationProp<any>>();
  const [postes, setPostes] = useState([]);
  const [photos, setPhotos] = useState<any>([]);
  
  const [ seeImages, setSeeImages ] = useState<any>(true);
  const [ seeMaterial, setSeeMaterial ] = useState<any>(false);
  const [ material, setMaterial] = useState<any>([]);

  const [isNewData, setIsNewData] = useState<any>(true);
  const [modalVisible, setModalVisible] = useState(false);

  const handleMapPress = (event: any) => {
    const {coordinate} = event.nativeEvent;
    setSelectedLocation(coordinate);
    bottomSheetRef.current?.forceClose();
  };

  const handleMarkerPress = () => {
    closeBottomSheet();
    setSelectedLocation(null);
  };

  const handleMarkerSelected = async (item: any) => {
    setSeeImages(true);
    setSeeMaterial(false);
    setDataBottomSheep(item);
    setOpenBottomSheep(true);

    if (item?.file) {
      const file = JSON.parse(item?.file);

      const fotos = file?.map((value: any) => {
        return value?.file;
      });

      setPhotos(fotos);
    } else {
      setPhotos([]);
    }

    if(item?.materiales){
      const material = JSON.parse(item?.materiales);
      setMaterial(material)
    }else {
      setMaterial([]);
    }

    bottomSheetRef.current?.expand();
  };

  const handleTransfer = (material?: boolean) => {
    var obj: any = {
      id: dataBottomSheet.id,
      nombre: dataBottomSheet.nombre,
      latitud: dataBottomSheet.latitud,
      longitud: dataBottomSheet.longitud,
      codPoste: dataBottomSheet.codPoste,
      direccion: dataBottomSheet.direccion,
      archivos: dataBottomSheet.file
        ? JSON.parse(dataBottomSheet.file)
        : undefined,
    };

    if (material)
      obj.materiales = dataBottomSheet.materiales
        ? JSON.parse(dataBottomSheet.materiales)
        : [];

    navigation.navigate('Evidencias', obj);
  };

  const handleSetData = () => {
    setValue('latitud', selectedLocation.latitude.toString());
    setValue('longitud', selectedLocation.longitude.toString());
    setModalVisible(true);
  };

  const handleSetDataEdit = (data: any) => {
    const {
      latitud,
      longitud,
      nombre,
      codPoste,
      direccion,
      propietario,
      ladoVia,
      tipoVia,
      nroApoyo,
      nivelTension,
      material,
      altura,
      nombreVia,
      lote,
      estadoP,
      estado,
      item,
    } = data;

    setValue('idRegistro', data?.id);

    setValue('latitud', latitud);
    setValue('longitud', longitud);
    setValue('nombre', nombre);
    setValue('codPoste', codPoste);
    setValue('direccion', direccion);
    setValue('nombreVia', nombreVia);
    setValue('lote', lote);
    setValue('estadoP', estadoP);
    setValue('propietario', propietario);
    setValue('ladoVia', ladoVia);
    setValue('tipoVia', tipoVia);
    setValue('nroApoyo', nroApoyo);
    setValue('nivelTension', nivelTension);
    setValue('material', material);
    setValue('altura', altura);
    setValue('status', estado);
    setValue('item', item);

    setModalVisible(true);
  };

  const getMarketItem = async () => {
    const response: any = await getItems();
    setPostes(response);
    mapRef.current?.render();
  };

  const save = () => {
    handleSubmit(onSubmit)();
  };

  const onSubmit = async () => {
    let data = getValues();

    var res: any = {};
    if (isNewData) {
      res = await saveItem(
        data.nombre,
        data.latitud,
        data.longitud,
        data.codPoste,
        data.propietario,
        data.ladoVia,
        `${data.nombreVia} - ${data.tipoVia}`,
        data.tipoVia,
        data.nroApoyo,
        data.nivelTension,
        data.material,
        data.altura,
        data.nombreVia,
        data.lote,
        data.estadoP,
        null,
      );
    } else {
      var result: any = await getOneItem(data.idRegistro);

      res = await updateItem(
        data.idRegistro,
        data.nombre,
        data.latitud,
        data.longitud,
        data.codPoste,
        data.propietario,
        data.ladoVia,
        `${data.nombreVia} - ${data.tipoVia}`,
        data.tipoVia,
        data.nroApoyo,
        data.nivelTension,
        data.material,
        data.altura,
        data.nombreVia,
        data.lote,
        data.estadoP,
        result?.file ? result?.file : null,
        parseFloat(data.status),
        data.item,
      );
    }
    if (res) {
      Alert.alert(`Se ${isNewData ? 'registró' : 'modificó'} correctamente.`);
      bottomSheetRef.current?.close();
      if (!isNewData) getItemReturn(data?.idRegistro);
      cancel();
    } else {
      Alert.alert('No se registró');
    }
  };

  const cancel = () => {
    setModalVisible(false);
    getMarketItem();
    setIsNewData(true);
    setSelectedLocation(null);
    reset();
  };

  const closeBottomSheet = () => {
    setDataBottomSheep([]);
    setPhotos([]);
    setMaterial([]);
    setSeeImages(true);
    setSeeMaterial(false);
    setOpenBottomSheep(false);
    bottomSheetRef.current?.forceClose();
  };

  const getItemReturn = async (id: any) => {
    const data: any = await getOneItem(id);
    handleMarkerSelected(data);
    bottomSheetRef.current?.expand();
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      setPhotos([]);
      getMarketItem();
    });

    return unsubscribe;
  }, [navigation]);

  useEffect(() => {
    if (lastKnownLocation === null) {
      getLocation();
    }
  }, [lastKnownLocation]);

  useEffect(() => {
    if (route.params) {
      if (route?.params?.processReturn == 'RegisterFileOrMaterial') {
        bottomSheetRef.current?.close();
        getItemReturn(route?.params?.id);
      } else {
        if (route?.params?.edit == 1) {
          setIsNewData(false);
        }

        const region = {
          latitude: parseFloat(route.params?.latitud),
          longitude: parseFloat(route.params?.longitud),
          latitudeDelta: 0.001,
          longitudeDelta: 0.001,
        };

        mapRef?.current?.animateToRegion(region);
        getItemReturn(route.params?.id);
      }
    }
  }, [route]);

  return (
    <Layout mode="column">
      <View style={styles.containerMap}>
        <MapView
          provider={PROVIDER_GOOGLE}
          loadingEnabled
          ref={mapRef}
          showsUserLocation
          style={styles.map}
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
          onPress={handleMapPress}
          showsMyLocationButton={true}
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
            postes.map((item: any, index: any) => (
              <Marker
                coordinate={{
                  latitude: parseFloat(item?.latitud),
                  longitude: parseFloat(item?.longitud),
                }}
                onPress={() => {
                  handleMarkerSelected(item);
                }}
                title={item?.nombre}
                key={item?.id}>
                <Text
                  style={{
                    fontWeight: 'bold',
                    textAlign: 'center',
                    color:
                      item.estado == 1
                        ? '#3D1053'
                        : item?.editado == 0
                        ? '#69A42F'
                        : '#FF7F27',
                  }}>
                  {item?.nombre}
                </Text>
                <Image
                  style={{width: 25, height: 35}}
                  source={
                    item.estado == 1
                      ? require('../assets/markerIcon2.png')
                      : item?.editado == 0
                      ? require('../assets/markerIcon.png')
                      : require('../assets/markerIcon3.png')
                  }
                />
              </Marker>
            ))}
        </MapView>

        <Legend />

        {selectedLocation && (
          <View style={styles.btnFloat}>
            <TouchableOpacity style={styles.btn} onPress={handleSetData}>
              <Text style={styles.btnText}>+</Text>
            </TouchableOpacity>
          </View>
        )}

        {modalVisible && (
          <View style={styles.centeredView}>
            <Modal
              animationType="slide"
              transparent={true}
              visible={modalVisible}
              onRequestClose={() => {
                setModalVisible(!modalVisible);
              }}>
              <ScrollView>
                <View
                  style={[
                    styles.modalView,
                    {
                      backgroundColor: isDarkMode
                        ? Colors.darker
                        : Colors.lighter,
                    },
                  ]}>
                  <Text
                    style={{
                      ...styles.modalText,
                      fontWeight: 'bold',
                      fontSize: 20,
                    }}>
                    FORMULARIO DEL POSTE
                  </Text>

                  <View style={{marginBottom: 6}}>
                    <Text
                      style={{
                        textAlign: 'center',
                        fontWeight: 'condensed',
                        fontSize: 13,
                      }}>
                      Latitud: {watch('latitud')}
                    </Text>

                    <Text
                      style={{
                        textAlign: 'center',
                        fontWeight: 'condensed',
                        fontSize: 13,
                      }}>
                      Longitud: {watch('longitud')}
                    </Text>
                  </View>

                  <View
                    style={[
                      {
                        alignContent: 'center',
                        width: 'auto',
                        marginBottom: 10,
                      },
                    ]}>
                    <Text style={{textTransform: 'uppercase', fontSize: 12}}>
                      Nombre
                    </Text>
                    <Controller
                      control={control}
                      rules={{required: true}}
                      render={({field: {onChange, onBlur, value}}) => (
                        <TextInput
                          placeholder="Escribe el nombre..."
                          onBlur={onBlur}
                          mode="outlined"
                          onChangeText={onChange}
                          value={value}
                        />
                      )}
                      name="nombre"
                    />
                  </View>

                  <View
                    style={[
                      {
                        alignContent: 'center',
                        width: 'auto',
                        marginBottom: 10,
                      },
                    ]}>
                    <Text style={{textTransform: 'uppercase', fontSize: 12}}>
                      Código
                    </Text>
                    <Controller
                      control={control}
                      rules={{required: true}}
                      render={({field: {onChange, onBlur, value}}) => (
                        <TextInput
                          placeholder="Escribe el código..."
                          onBlur={onBlur}
                          mode="outlined"
                          onChangeText={onChange}
                          value={value}
                        />
                      )}
                      name="codPoste"
                    />
                  </View>

                  <View
                    style={[
                      {
                        alignContent: 'center',
                        width: 'auto',
                        marginBottom: 10,
                      },
                    ]}>
                    <Text style={{textTransform: 'uppercase', fontSize: 12}}>
                      Nombre de Vía
                    </Text>
                    <Controller
                      control={control}
                      rules={{required: true}}
                      render={({field: {onChange, onBlur, value}}) => (
                        <TextInput
                          placeholder="Escribe la dirección..."
                          onBlur={onBlur}
                          mode="outlined"
                          onChangeText={onChange}
                          value={value}
                        />
                      )}
                      name="nombreVia"
                    />
                  </View>

                  <View
                    style={{
                      display: 'flex',
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      gap: 10,
                      width: 'auto',
                      marginBottom: 10,
                    }}>
                    <View
                      style={[{alignContent: 'center', width: width * 0.36}]}>
                      <Text style={{textTransform: 'uppercase', fontSize: 12}}>
                        Nro de apoyo
                      </Text>
                      <Controller
                        control={control}
                        rules={{required: true}}
                        render={({field: {onChange, onBlur, value}}) => (
                          <TextInput
                            onBlur={onBlur}
                            mode="outlined"
                            onChangeText={onChange}
                            value={value}
                          />
                        )}
                        name="nroApoyo"
                      />
                    </View>

                    <View
                      style={[{alignContent: 'center', width: width * 0.36}]}>
                      <Text style={{textTransform: 'uppercase', fontSize: 12}}>
                        Lote
                      </Text>
                      <Controller
                        control={control}
                        rules={{required: true}}
                        render={({field: {onChange, onBlur, value}}) => (
                          <TextInput
                            onBlur={onBlur}
                            mode="outlined"
                            onChangeText={onChange}
                            value={value.toString()}
                          />
                        )}
                        name="lote"
                      />
                    </View>
                  </View>

                  <View
                    style={{
                      display: 'flex',
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      gap: 10,
                      width: 'auto',
                      marginBottom: 10,
                    }}>
                    <View
                      style={[
                        {
                          alignContent: 'center',
                          width: width * 0.36,
                        },
                      ]}>
                      <Text style={{textTransform: 'uppercase', fontSize: 12}}>
                        PROPIETARIO
                      </Text>
                      <View style={[styles.picker]}>
                        <Picker
                          selectedValue={watch('propietario')}
                          onValueChange={(itemValue: any) => {
                            setValue('propietario', itemValue);
                          }}>
                          <Picker.Item label="Seleccione" value="" />
                          <Picker.Item label="OTROS" value="OTROS" />
                          <Picker.Item label="WOW" value="WOW" />
                          <Picker.Item label="ENSA" value="ENSA" />
                          <Picker.Item label="LDN" value="LDN" />
                          <Picker.Item label="LDS" value="LDS" />
                        </Picker>
                      </View>
                    </View>

                    <View
                      style={[
                        {
                          alignContent: 'center',
                          width: width * 0.36,
                        },
                      ]}>
                      <Text style={{textTransform: 'uppercase', fontSize: 12}}>
                        Lado de vía
                      </Text>
                      <View style={[styles.picker]}>
                        <Picker
                          selectedValue={watch('ladoVia')}
                          style={styles.picker}
                          onValueChange={(itemValue: any, itemIndex: any) =>
                            setValue('ladoVia', itemValue)
                          }>
                          <Picker.Item label="Izquierda" value="Izquierda" />
                          <Picker.Item label="Derecha" value="Derecha" />
                          <Picker.Item label="Centro" value="Centro" />
                        </Picker>
                      </View>
                    </View>
                  </View>

                  <View
                    style={{
                      display: 'flex',
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      gap: 10,
                      width: 'auto',
                      marginBottom: 10,
                    }}>
                    <View
                      style={[
                        {
                          alignContent: 'center',
                          width: width * 0.36,
                        },
                      ]}>
                      <Text style={{textTransform: 'uppercase', fontSize: 12}}>
                        Tipo Vía
                      </Text>
                      <View style={styles.picker}>
                        <Picker
                          selectedValue={watch('tipoVia')}
                          onValueChange={(itemValue: any, itemIndex: any) =>
                            setValue('tipoVia', itemValue)
                          }>
                          <Picker.Item label="Avenida" value="Avenida" />
                          <Picker.Item label="Calle" value="Calle" />
                          <Picker.Item label="Jirón" value="Jirón" />
                          <Picker.Item label="Pasaje" value="Pasaje" />
                        </Picker>
                      </View>
                    </View>

                    <View
                      style={[
                        {
                          alignContent: 'center',
                          width: width * 0.36,
                        },
                      ]}>
                      <Text style={{textTransform: 'uppercase', fontSize: 12}}>
                        Nivel de Tensión
                      </Text>
                      <View style={styles.picker}>
                        <Picker
                          selectedValue={watch('nivelTension')}
                          onValueChange={(itemValue: any, itemIndex: any) =>
                            setValue('nivelTension', itemValue)
                          }>
                          <Picker.Item label="BT" value="BT" />
                          <Picker.Item label="MT" value="MT" />
                          <Picker.Item label="AT" value="AT" />
                        </Picker>
                      </View>
                    </View>
                  </View>

                  <View
                    style={{
                      display: 'flex',
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      gap: 10,
                      width: 'auto',
                      marginBottom: 10,
                    }}>
                    <View
                      style={[
                        {
                          alignContent: 'center',
                          width: width * 0.36,
                        },
                      ]}>
                      <Text style={{textTransform: 'uppercase', fontSize: 12}}>
                        Material
                      </Text>
                      <View style={styles.picker}>
                        <Picker
                          selectedValue={watch('material')}
                          style={styles.picker}
                          onValueChange={(itemValue: any, itemIndex: any) =>
                            setValue('material', itemValue)
                          }>
                          <Picker.Item label="Concreto" value="Concreto" />
                          <Picker.Item label="Madera" value="Madera" />
                          <Picker.Item label="Fierro" value="Fierro" />
                        </Picker>
                      </View>
                    </View>

                    <View
                      style={[
                        {
                          alignContent: 'center',
                          width: width * 0.36,
                        },
                      ]}>
                      <Text style={{textTransform: 'uppercase', fontSize: 12}}>
                        Altura
                      </Text>
                      <View style={styles.picker}>
                        <Picker
                          selectedValue={watch('altura')}
                          style={styles.picker}
                          onValueChange={(itemValue: any, itemIndex: any) =>
                            setValue('altura', itemValue)
                          }>
                          <Picker.Item label="7M" value="7M" />
                          <Picker.Item label="8M" value="8M" />
                          <Picker.Item label="9M" value="9M" />
                          <Picker.Item label="13M" value="13M" />
                        </Picker>
                      </View>
                    </View>
                  </View>

                  <View
                    style={[
                      {
                        alignContent: 'center',
                        width: 'auto',
                        marginBottom: 10,
                      },
                    ]}>
                    <Text style={{textTransform: 'uppercase', fontSize: 12}}>
                      Estado del Poste
                    </Text>
                    <View style={styles.picker}>
                      <Picker
                        selectedValue={watch('estadoP')}
                        style={styles.picker}
                        onValueChange={(itemValue: any) =>
                          setValue('estadoP', itemValue)
                        }>
                        <Picker.Item
                          label="Nuevos instalados"
                          value="Nuevos instalados"
                        />
                        <Picker.Item
                          label="Existe usados"
                          value="Existe usados"
                        />
                      </Picker>
                    </View>
                  </View>

                  <SegmentedButtons
                    value={''}
                    style={{marginBottom: 10, marginTop: 5}}
                    onValueChange={() => {}}
                    buttons={[
                      {
                        value: 'take',
                        style: {backgroundColor: '#69A42F'},
                        labelStyle: {
                          color: '#fff',
                          fontSize: 14,
                          textTransform: 'uppercase',
                        },
                        label: `${isNewData ? 'Guardar' : 'Actualizar'}`,
                        onPress: () => {
                          save();
                        },
                      },
                      {
                        value: 'shoot',
                        style: {backgroundColor: '#3E1054'},
                        labelStyle: {
                          color: '#fff',
                          fontSize: 14,
                          textTransform: 'uppercase',
                        },
                        label: 'Cancelar',
                        onPress() {
                          cancel();
                        },
                      },
                    ]}
                  />
                </View>
              </ScrollView>
            </Modal>
          </View>
        )}
      </View>

      {openBottomSheet && (
        <BottomSheet
          ref={bottomSheetRef}
          snapPoints={snapPoints}
          enablePanDownToClose
          key={dataBottomSheet?.id}
          onClose={closeBottomSheet}
          backgroundStyle={{
            backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
          }}>
          <BottomSheetView
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              padding: 20,                    
              marginBottom: 70

            }}>
            <View style={{gap: 14}}>
              <View style={{display: 'flex'}}>
                <Text
                  style={{
                    fontWeight: 'bold',
                    textTransform: 'capitalize',
                    fontSize: 25,
                  }}>
                  {dataBottomSheet?.nombre}
                </Text>

                <View
                  style={{flexDirection: 'row', alignItems: 'center', gap: 5}}>
                  <Text
                    style={{
                      color:
                        dataBottomSheet?.estado == 0
                          ? dataBottomSheet?.editado == 0
                            ? '#69A42F'
                            : '#FF7F27'
                          : '#3E1054',
                      textTransform: 'capitalize',
                      fontWeight: 'semibold',
                    }}>
                    {dataBottomSheet?.estado == 0
                      ? dataBottomSheet?.editado == 0
                        ? 'Enviado'
                        : 'Enviado - Modificado'
                      : 'No Enviado'}
                  </Text>
                  <View
                    style={[
                      styles.colorBox,
                      {
                        backgroundColor:
                          dataBottomSheet?.estado == 0
                            ? dataBottomSheet?.editado == 0
                              ? '#69A42F'
                              : '#FF7F27'
                            : '#3E1054',
                      },
                    ]}
                  />
                </View>
              </View>

              <ScrollView activeCursor='all-scroll'>
                <ScrollView horizontal>
                  <View
                    style={{
                      marginVertical: 10,
                      justifyContent: 'flex-start',
                      alignItems: 'flex-start',
                      flexDirection: 'row',
                      gap: 15,
                      // padding: 10,
                    }}>
                    {!isNewData && (
                      <Button
                        mode="contained-tonal"
                        buttonColor="#b0e67a"
                        onPress={() => handleSetDataEdit(dataBottomSheet)}
                        icon={() => <Icon name="pencil" size={20} />}>
                        Editar
                      </Button>
                    )}

                    <Button
                      mode="contained-tonal"
                      buttonColor="#b0e67a"
                      onPress={() => handleTransfer(true)}>
                      Agregar Equipos
                    </Button>
                    <Button
                      mode="contained-tonal"
                      buttonColor="#b0e67a"
                      onPress={() => handleTransfer()}>
                      Agregar Evidencias
                    </Button>
                  </View>
                </ScrollView>

              <View>
                <View style={styles.contentBottomSheep}>
                  <Text style={styles.textBottomSheep}>Código:</Text>
                  <Text style={styles.subTextBottomSheep}>
                    {dataBottomSheet?.codPoste}
                  </Text>
                </View>
                <Divider style={styles.divider} />
                <View style={styles.contentBottomSheep}>
                  <Text style={styles.textBottomSheep}>Tipo Vía:</Text>
                  <Text style={styles.subTextBottomSheep}>
                    {dataBottomSheet?.tipoVia || 'S/N'}
                  </Text>
                </View>
                <Divider style={styles.divider} />
                <View style={styles.contentBottomSheep}>
                  <Text style={styles.textBottomSheep}>Vía:</Text>
                  <Text style={styles.subTextBottomSheep}>
                    {dataBottomSheet?.nombreVia || 'S/N'}
                  </Text>
                </View>
                <Divider style={styles.divider} />
                <View style={styles.contentBottomSheep}>
                  <Text style={styles.textBottomSheep}>Lado Vía:</Text>
                  <Text style={styles.subTextBottomSheep}>
                    {dataBottomSheet?.ladoVia || 'S/N'}
                  </Text>
                </View>
                <Divider style={styles.divider} />
                <View style={styles.contentBottomSheep}>
                  <Text style={styles.textBottomSheep}>Lote:</Text>
                  <Text style={styles.subTextBottomSheep}>
                    {dataBottomSheet?.lote || 'S/N'}
                  </Text>
                </View>
                <Divider style={styles.divider} />
                <View style={styles.contentBottomSheep}>
                  <Text style={styles.textBottomSheep}>Propietario:</Text>
                  <Text style={styles.subTextBottomSheep}>
                    {dataBottomSheet?.propietario || 'S/N'}
                  </Text>
                </View>
                <Divider style={styles.divider} />
                <View style={styles.contentBottomSheep}>
                  <Text style={styles.textBottomSheep}>Nro Apoyo:</Text>
                  <Text style={styles.subTextBottomSheep}>
                    {dataBottomSheet?.nroApoyo || 'S/N'}
                  </Text>
                </View>
                <Divider style={styles.divider} />
                <View style={styles.contentBottomSheep}>
                  <Text style={styles.textBottomSheep}>Nivel Tensión:</Text>
                  <Text style={styles.subTextBottomSheep}>
                    {dataBottomSheet?.nivelTension || 'S/N'}
                  </Text>
                </View>
                <Divider style={styles.divider} />
                <View style={styles.contentBottomSheep}>
                  <Text style={styles.textBottomSheep}>Estado:</Text>
                  <Text style={styles.subTextBottomSheep}>
                    {dataBottomSheet?.estadoP || 'S/N'}
                  </Text>
                </View>
                <Divider style={styles.divider} />
                <View style={styles.contentBottomSheep}>
                  <Text style={styles.textBottomSheep}>Dirección:</Text>
                  <Text style={styles.subTextBottomSheep}>
                    {dataBottomSheet?.direccion || 'S/N'}
                  </Text>
                </View>
                <Divider style={styles.divider} />
                <View style={styles.contentBottomSheep}>
                  <Text style={styles.textBottomSheep}>Material:</Text>
                  <Text style={styles.subTextBottomSheep}>
                    {dataBottomSheet?.material || 'S/N'}
                  </Text>
                </View>
                <Divider style={styles.divider} />
                <View style={styles.contentBottomSheep}>
                  <Text style={styles.textBottomSheep}>Altura:</Text>
                  <Text style={styles.subTextBottomSheep}>
                    {dataBottomSheet?.altura || 'S/N'}
                  </Text>
                </View>
                <Divider style={styles.divider} />
                </View>
              
              <View style={{
                flexDirection: 'row',
                gap: 10,
                marginVertical: 10,
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Button  onPress={() => {
                  setSeeImages(true);
                  setSeeMaterial(false);
                }}>
                  Imagénes
                </Button>
                <Button onPress={() => {
                  setSeeImages(false);
                  setSeeMaterial(true);
                }}>
                  Materiales
                </Button>
              </View>
      
                {photos.length > 0 && seeImages && (
                  <View
                    style={{
                      flex: 1,
                      width: width * 0.9,
                      height: height * 0.28,
                      marginBottom: 25
                    }}>
                    {photos.length === 1 ? (
                      <View
                        style={{
                          flex: 1,
                          borderWidth: 1,
                          borderColor: 'rgba(199, 198, 198, 0.93)',
                          justifyContent: 'center',
                        }}>
                        <Image
                          source={{uri: photos[0]?.uri}}
                          style={{flex: 1}}
                          resizeMode="contain"
                        />
                      </View>
                    ) : (
                      <Carousel
                        loop
                        width={width}
                        height={width / 2}
                        autoPlay={true}
                        data={photos}
                        scrollAnimationDuration={1000}
                        renderItem={({item}: any) => (
                          <View
                            style={{
                              flex: 1,
                              borderWidth: 1,
                              justifyContent: 'center',
                            }}>
                            <Image
                              source={{uri: item?.uri}}
                              style={{flex: 1}}
                              resizeMode="contain"
                            />
                          </View>
                        )}
                      />
                    )}
                  </View>
                )}

                {
                  seeMaterial && (
                    <View>
                       <DataTable>
                        <DataTable.Header>
                          <DataTable.Title>Producto</DataTable.Title>
                          <DataTable.Title>Cantidad</DataTable.Title>
                          <DataTable.Title>Evidencia</DataTable.Title>
                        </DataTable.Header>
                        {
                            material.length > 0 && material.map ( (item : any) => (
                              <DataTable.Row key={item?.item}>
                        
                              <DataTable.Cell>{item?.nombre}</DataTable.Cell>
                              <DataTable.Cell>{item?.cantidad}</DataTable.Cell>
                              <DataTable.Cell>{item?.evidencia}</DataTable.Cell>
                              
                            </DataTable.Row>
                            )
                              
                            )
                          }
                
                      </DataTable>
                    </View>
                  )
                }

              </ScrollView>
            </View>
          </BottomSheetView>
        </BottomSheet>
      )}
    </Layout>
  );
};

export default Maps;
