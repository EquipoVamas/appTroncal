import { Picker } from '@react-native-picker/picker';
import React, { useCallback, useEffect, useState } from 'react'
import { View , ScrollView, StyleSheet, SafeAreaView} from 'react-native';
import { getFilterMufaLocal, getFilterNodoLocal, getMufaLocal, getNodoLocal, getSubMufaLocal, getTroncalLocal, getTypeStatusLocal, getTypeTrackLocal, getUnitMeasurementLocal, saveDetalleLocal, savePosteLocal, updateTypeStateDetalle } from '../../services/dataBase';
import { ActivityIndicator, Dialog, HelperText, Modal, Portal, SegmentedButtons, Text, TextInput } from 'react-native-paper';
import stylesDefault from '../style';
import {Controller, useForm} from 'react-hook-form';
import { registerDetails } from '../../services/axios';
import { useBearStore } from '../../store/storet';
import { Colors } from 'react-native/Libraries/NewAppScreen'
import Styles from '../style'

type DataForm = {
  nombre : string;
  nivelTension: string;
  altura: string;
  idPropietario : string;
  tipo: string;
  idCategoria: string;
  idSubCategoria: string;
  idCarpeta: string;
  idSubCarpeta: string;
  latitud: string;
  longitud: string;
}

const RegisterModal = ( { visible = false, setVisible, cordinate, refresh, insertId, loadAutomatic} : any) => {
  const { statusNet, statusApp, mode, sessionUser } = useBearStore();
  const isDarkMode = mode === 'dark';
  const { control, handleSubmit, getValues, formState: {errors}, reset, watch, setValue } = useForm<DataForm>();
  const [ subcategoria, setSubcategoria ] = useState([]);
  const [ categoria, setCategoria ] = useState([]);
  const [ carpeta, setCarpeta ] = useState([]);
  const [ subcarpeta, setSubCarpeta ] = useState([]);
  const [ tipoEstados, setTipoEstados ] = useState([]);
  const [ loading, setLoading ] = useState(false);

  const tipo = [
    { label: 'NAP', value: 'NAP' },
    { label: 'MUFA', value: 'MUFA' },
    { label: 'POSTE', value: 'POSTE' },
  ]

  const save = () => {
    handleSubmit(onSubmit)();
  };

  const loadActive = () => setLoading(true);
  const loadInactive = () => setLoading(false);

  const onSubmit = async () => {
    try {
      loadActive();
  
      let data:any = getValues();
      if (!data) throw new Error("Invalid form data");
  
      if (cordinate) {
        if (!cordinate.latitude || !cordinate.longitude) throw new Error("Invalid coordinates");
        data.latitud = cordinate.latitude;
        data.longitud = cordinate.longitude;
      }

      data = {
        ...data,
        idUsuario: sessionUser ? JSON.parse(sessionUser)?.idUsuario : undefined,
        idMufa: data.idCategoria || null,
        idSubMufa: data.idSubCategoria || null,
        codInterno: data.nombre || null,
        enviado: 0,
        editado : 0
      };
  
      delete data.idCategoria;
      delete data.idSubCategoria;
  
      const idTipoEstado :any = tipoEstados.find((val: any) => val.nombre === 'Pendiente');
      if (!idTipoEstado) throw new Error("Status 'Pendiente' not found");
      
      data.idTipoEstado = idTipoEstado.item;
  
      if (statusNet && !statusApp) {
        const result = await saveServer(data.idMufa, data.idSubMufa, data);
        if (result?._id) {
          data.item = result._id;
          data.enviado = 1;
        } else {
          throw new Error("Server save failed");
        }
      }
      
      const res = await saveLocal(data);
      if (res?.insertId) {
        insertId(res.insertId);
      } else {
        throw new Error("Local save failed");
      }
  
    } catch (error) {
      throw error
    } finally {
      loadInactive();
      resetForm();
    }
  };

  const getCarpeta = async () => {
    const response : any = await getTroncalLocal();
    const newRes = response.map(( val : any ) => {
      return { ...val, label: val?.nombre, value: val?.item };
    })
    setCarpeta(newRes)
  }

  const getSubCarpeta = async (item: any) => {
    const response : any = await getFilterNodoLocal(item);
    const newRes = response.map(( val : any ) => {
      return { ...val, label: val?.nombre, value: val?.item };
    })
    setSubCarpeta(newRes)
  }

  const getCategoria = async (item: string) => {
    const res : any = await getFilterMufaLocal(item);
    const newRes = res.map(( val : any ) => {
      return { ...val, label: val?.nombre, value: val?.item };
    })
    setCategoria(newRes);
  }

  const getSubcategoria = async ( id: any) => {
    const res : any = await getSubMufaLocal(id);
    const newRes = res.map(( val : any ) => {
      return { ...val, label: val?.nombreSubMufa, value: val?.item };
    })
    setSubcategoria(newRes);
  }

  const getEstados = async () => {
    const res: any = await getTypeStatusLocal();

    setTipoEstados(res);
  }

  const resetForm = async () => {
    refresh();
    reset();
    setVisible(!visible);
  }

  const saveLocal = async ( data: any ) => {
    const res: any = await saveDetalleLocal(data);
    return res;
  }

  const saveServer = async ( idMufa:string, idSubMufa : string, data: any ) => {
    const formData = new FormData();
    formData.append("data", JSON.stringify(data));
    
    const res = await registerDetails(idMufa, idSubMufa, formData);
    return res?.data;
  }

  const cancel = () => {
    resetForm();
    setVisible(false);
  };

  const loadPickers = async (details: any) => {
    const { carpeta, subcarpeta, categoria, subcategoria } = details;
    
    try {

      setValue('idCarpeta', carpeta?.item);

      getSubCarpeta(carpeta?.item);
      setValue('idSubCarpeta', subcarpeta?.item);
    
      getCategoria(subcarpeta?.item);
      setValue('idCategoria', categoria?.item);
  
      getSubcategoria(categoria?.item);
      setValue('idSubCategoria', subcategoria?.item);

      if( subcategoria?.nombre == 'POSTES' ) setValue('tipo', 'POSTE');
      if( subcategoria?.nombre == 'NAPS' ) setValue('tipo', 'NAP');
      if( subcategoria?.nombre == 'MUFAS' ) setValue('tipo', 'MUFA');

    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    getCarpeta();
    getEstados();
    setValue('nombre', '');
  }, [visible, cordinate]);

  useEffect(() => {
    if(cordinate){
      setValue('latitud', cordinate?.latitude);
      setValue('longitud', cordinate?.longitude);
    }
  }, [cordinate]);
  
  useEffect(( ) => {
    if( loadAutomatic && visible ) {
      loadPickers(loadAutomatic)
    }
  }, [ loadAutomatic, visible ]);

  return (
    <Portal>
      <Dialog visible={visible} onDismiss={() => setVisible(!visible)} style={{ backgroundColor: isDarkMode ? Colors.darker : Colors.lighter }}>
        <Dialog.Content>
          {loading && (
            <View
              style={{
                flexDirection: 'row',
                alignContent: 'center',
                justifyContent: 'center',
                alignItems: 'center',
                gap: 10
              }}>
              <ActivityIndicator
                size={'large'}
                animating={loading}
                color={stylesDefault.purple.color}
              />
              <Text style={{fontWeight: 'bold'}}>Agregando...</Text>
            </View>
          )}
          {!loading && (
            <ScrollView>
              <View style={style.modalView}>

                <View style={style.containerTextInput}>
                  <Picker
                    selectedValue={watch('idCarpeta')}
                    style={{width: '100%', color: isDarkMode ? "#fff" : "#000"}}
                    mode='dropdown'
                    dropdownIconColor={isDarkMode ? "#fff" : "#000"}
                    onValueChange={itemValue => {
                      setValue('idCarpeta', itemValue);
                      console.log(itemValue)
                      getSubCarpeta(itemValue);
                    }}>
                    <Picker.Item label="Seleccionar carpeta" value="" style={{ color: isDarkMode ? "#fff" : "#000", backgroundColor: isDarkMode ? Colors.darker : Colors.lighter }} />
                    {carpeta &&
                      carpeta?.map((val: any) => (
                        <Picker.Item
                          key={val?.item}
                          label={val?.nombre}
                          value={val?.item}
                          style={{ color: isDarkMode ? "#fff" : "#000", backgroundColor: isDarkMode ? Colors.darker : Colors.lighter }}
                        />
                      ))}
                  </Picker>
                </View>

                <View style={style.containerTextInput}>
                  <Picker
                    selectedValue={watch('idSubCarpeta')}
                    style={{width: '100%', color: isDarkMode ? "#fff" : "#000"}}
                    mode='dropdown'
                    dropdownIconColor={isDarkMode ? "#fff" : "#000"}
                    onValueChange={itemValue => {
                      setValue('idSubCarpeta', itemValue);
                      getCategoria(itemValue);
                    }}>
                    <Picker.Item label="Seleccionar subcarpeta" value="" style={{ color: isDarkMode ? "#fff" : "#000", backgroundColor: isDarkMode ? Colors.darker : Colors.lighter }} />
                    {subcarpeta &&
                      subcarpeta?.map((val: any) => (
                        <Picker.Item
                          key={val?.item}
                          label={val?.nombre}
                          value={val?.item}
                          style={{ color: isDarkMode ? "#fff" : "#000", backgroundColor: isDarkMode ? Colors.darker : Colors.lighter }}
                        />
                      ))}
                  </Picker>
                </View>

                <View style={style.containerTextInput}>
                  <Picker
                    selectedValue={watch('idCategoria')}
                    style={{width: '100%', color: isDarkMode ? "#fff" : "#000"}}
                    mode='dropdown'
                    dropdownIconColor={isDarkMode ? "#fff" : "#000"}
                    onValueChange={itemValue => {
                      setValue('idCategoria', itemValue);
                      getSubcategoria(itemValue);
                    }}>
                    <Picker.Item label="Seleccionar categoría" value="" style={{ color: isDarkMode ? "#fff" : "#000", backgroundColor: isDarkMode ? Colors.darker : Colors.lighter }} />
                    {categoria &&
                      categoria?.map((val: any) => (
                        <Picker.Item
                          key={val?.item}
                          label={val?.nombre}
                          value={val?.item}
                          style={{ color: isDarkMode ? "#fff" : "#000", backgroundColor: isDarkMode ? Colors.darker : Colors.lighter }}
                        />
                      ))}
                  </Picker>
                </View>

                <View style={style.containerTextInput}>
                  <Picker
                    selectedValue={watch('idSubCategoria')}
                    style={{width: '100%', color: isDarkMode ? "#fff" : "#000"}}
                    dropdownIconColor={isDarkMode ? "#fff" : "#000"}
                    mode='dropdown'
                    onValueChange={itemValue =>
                      setValue('idSubCategoria', itemValue)
                    }>
                    <Picker.Item label="Seleccionar subcategoría" value="" style={{ color: isDarkMode ? "#fff" : "#000", backgroundColor: isDarkMode ? Colors.darker : Colors.lighter }} />
                    {subcategoria &&
                      subcategoria?.map((val: any) => (
                        <Picker.Item
                          key={val?.item}
                          label={val?.nombre}
                          value={val?.item}
                          style={{ color: isDarkMode ? "#fff" : "#000", backgroundColor: isDarkMode ? Colors.darker : Colors.lighter }}
                        />
                      ))}
                  </Picker>
                </View>

                <View style={style.containerTextInput}>
                  <Picker
                    selectedValue={watch('tipo')}
                    style={{width: '100%', color: isDarkMode ? "#fff" : "#000"}}
                    dropdownIconColor={isDarkMode ? "#fff" : "#000"}
                    mode='dropdown'
                    onValueChange={itemValue => setValue('tipo', itemValue)}>
                    <Picker.Item label="Seleccionar tipo" value="" style={{ color: isDarkMode ? "#fff" : "#000", backgroundColor: isDarkMode ? Colors.darker : Colors.lighter }}/>
                    {tipo &&
                      tipo?.map((val: any) => (
                        <Picker.Item
                          style={{ color: isDarkMode ? "#fff" : "#000", backgroundColor: isDarkMode ? Colors.darker : Colors.lighter }}
                          key={val?.value}
                          label={val?.label}
                          value={val?.value}
                        />
                      ))}
                  </Picker>
                </View>

                {/* Latitud */}
                <View style={style.containerTextInput}>
                  <Controller
                    name="latitud"
                    control={control}
                    render={({field: {onChange, onBlur, value}}) => (
                      <TextInput
                        onBlur={onBlur}
                        onChangeText={onChange}
                        error={Boolean(errors?.latitud)}
                        placeholder="Latitud"
                        mode="outlined"
                        value={value.toString()}
                      />
                    )}
                  />
                  {errors?.latitud && (
                    <HelperText type="error">
                      {errors.latitud.message}
                    </HelperText>
                  )}
                </View>

                {/* Longitud */}
                <View style={style.containerTextInput}>
                  <Controller
                    name="longitud"
                    control={control}
                    render={({field: {onChange, onBlur, value}}) => (
                      <TextInput
                        onBlur={onBlur}
                        onChangeText={onChange}
                        error={Boolean(errors?.longitud)}
                        placeholder="Longitud"
                        mode="outlined"
                        value={value.toString()}
                      />
                    )}
                  />
                  {errors?.longitud && (
                    <HelperText type="error">
                      {errors.longitud.message}
                    </HelperText>
                  )}
                </View>

                {/* Nombre */}
                <View style={style.containerTextInput}>
                  <Controller
                    name="nombre"
                    control={control}
                    rules={{required: {message: 'Requerido', value: true}}}
                    render={({field: {onChange, onBlur, value}}) => (
                      <TextInput
                        onBlur={onBlur}
                        onChangeText={onChange}
                        error={Boolean(errors?.nombre)}
                        placeholder="Nombre"
                        mode="outlined"
                        value={value}
                      />
                    )}
                  />
                  {errors?.nombre && (
                    <HelperText type="error">
                      {errors.nombre.message}
                    </HelperText>
                  )}
                </View>

                <SegmentedButtons
                  value={''}
                  style={{marginVertical: 15}}
                  onValueChange={() => {}}
                  buttons={[
                    {
                      value: 'take',
                      label: `Agregar`,
                      style: {backgroundColor: stylesDefault.purpleLight.color},
                      onPress() {
                        save();
                      },
                    },
                    {
                      value: 'shoot',
                      label: 'Cancelar',
                      style: {backgroundColor: stylesDefault.redLight.color},
                      onPress() {
                        cancel();
                      },
                    },
                  ]}
                />
              </View>
            </ScrollView>
          )}
        </Dialog.Content>
      </Dialog>
    </Portal>
  );
}

const style = StyleSheet.create({
  modalView: {
    borderRadius: 20,
    justifyContent: 'center',
    alignContent: 'center',
  },
  picker: {
    borderWidth: 0.7,
    borderRadius: 10,
    marginVertical: 5,
  },
  containerTextInput: {
    marginVertical: 5,
  },
  focusedTextInput : {
    borderColor: 'rgba(216, 240, 244, 0.93)',
    backgroundColor: 'rgba(240, 240, 240, 0.93)'
  }
})

export default RegisterModal
