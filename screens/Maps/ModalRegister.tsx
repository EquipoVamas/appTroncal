import React, { useEffect, useState } from 'react'
import { StyleSheet, View } from 'react-native'
import { ActivityIndicator, Button, Dialog, HelperText, Portal, SegmentedButtons, Text, TextInput } from 'react-native-paper'
import { useBearStore } from '../../store/storet';
import { Colors } from 'react-native/Libraries/NewAppScreen';
import { Controller, useForm } from 'react-hook-form';
import stylesDefault from '../style';
import { registerDetails } from '../../services/axios';
import { getTypeStatusLocal, saveDetalleLocal } from '../../services/dataBase';
import Icon from 'react-native-vector-icons/FontAwesome';
import Geocoder from 'react-native-geocoding';

type DataForm = {
  nombre : string;
  latitud: string;
  longitud: string;
  tipo: string;
  idCategoria: string;
  idSubCategoria: string;
  idCarpeta: string;
  idSubCarpeta: string;

  ruta: string;
}

Geocoder.init('AIzaSyC40fYfX7LLMPqVkm0SN4L_9L1S_oRQ86s');

const ModalRegister = ( { visible = true , setVisible, loadAutomatic, refresh, insertId } : any ) => {

  const { statusNet, statusApp, mode, sessionUser, statusDirection } = useBearStore();
  const isDarkMode = mode === 'dark';

  const { control, handleSubmit, getValues, formState: {errors}, reset, watch, setValue } = useForm<DataForm>();
  const [ loading, setLoading ] = useState(false);
  const [ tipoEstados, setTipoEstados ] = useState([]);

  const loadActive = () => setLoading(true);
  const loadInactive = () => setLoading(false);

  const onSubmit = async () => {
    try {
      loadActive();

      let data:any = getValues();
      if (!data) throw new Error("Invalid form data");

      data = {
        ...data,
        idUsuario: sessionUser ? sessionUser?.idUsuario : undefined,
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

      // TODO : Validamos que el tipo sea POSTE para poder añadir la dirección...
      if( data?.tipo == 'POSTE' && statusDirection ) {
        var direccion = await getDireccionFromCoordenadas(data.latitud, data.longitud)
        data.direccion = direccion
      }
      if ( statusNet && !statusApp ) {
        console.log(data.idMufa)
        console.log(data.idSubMufa)
        const result = await saveServer(data.idMufa, data.idSubMufa, data);
        console.log(result)
        if (result?._id) {
          data.item = result._id;
          data.enviado = 1;
        }
      }
      
      const res = await saveLocal(data);
      if (res?.insertId) {
        insertId(res.insertId);
      } else {
        throw new Error("Local save failed");
      }
      resetForm();
    } catch (error) {
      throw error
    } finally {
      loadInactive();
      resetForm();
    }
  };

  const resetForm = async () => {
    refresh();
    reset();
    setVisible(!visible);
  }

  const cancel = () => {
    setVisible(false);
    refresh()
  };

  const getEstados = async () => {
    const res: any = await getTypeStatusLocal();

    setTipoEstados(res);
  }

  const save = () => {
    handleSubmit(onSubmit)();
  };

  const loadPickers = async (details: any) => {
    const { carpeta, subcarpeta, categoria, subcategoria, latitud, longitud } = details;
    try {
      setValue('latitud', latitud);
      setValue('longitud', longitud);
      // ids
      setValue('idCarpeta', carpeta?.item);
      setValue('idSubCarpeta', subcarpeta?.item);
      setValue('idCategoria', categoria?.item);
      setValue('idSubCategoria', subcategoria?.item);

      var ruta = `${carpeta?.distrito} / ${carpeta?.nombre} / ${subcarpeta?.nombre} / ${categoria?.nombre} / ${subcategoria?.nombre} /`
      setValue('ruta', ruta);

      if( subcategoria?.nombre == 'POSTES' ) setValue('tipo', 'POSTE');
      if( subcategoria?.nombre == 'NAPs' ) setValue('tipo', 'NAP');
      if( subcategoria?.nombre == 'MDs' ) setValue('tipo', 'MD');
      if( subcategoria?.nombre == 'MTs' ) setValue('tipo', 'MT');
      if( subcategoria?.nombre == 'ODFs' ) setValue('tipo', 'ODF');

    } catch (error) {
      console.error(error);
    }
  };

  const saveLocal = async ( data: any ) => {
    const res: any = await saveDetalleLocal(data);
    return res;
  }

  const saveServer = async ( idMufa:string, idSubMufa : string, data: any ) => {
    const formData = new FormData();
    formData.append("data", JSON.stringify(data));

    const res = await registerDetails(idMufa, idSubMufa, formData);
    console.log("res", res)
    return res?.data;
  }

  const getDireccionFromCoordenadas = async (latitude: number, longitude:number) => {
    try {
        const json = await Geocoder.from(latitude, longitude);
        const addressComponent = json.results[0].formatted_address;
        return addressComponent;
      } catch (error) {
        console.error(error);
      }
  };

  useEffect(() => {
    getEstados();
  }, [ visible ]);

  useEffect(( ) => {
    if( loadAutomatic && visible ) {
      loadPickers(loadAutomatic);
    }
  }, [ loadAutomatic, visible ]);

  return (
    <Dialog 
      visible={visible} 
      onDismiss={() => setVisible(visible)}
      style={{
        backgroundColor: isDarkMode ? Colors.darker : Colors.lighter, 
      }}
    >
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
          <View style={style.modalView}>
            <View style={{ ...style.containerTextInput, flexDirection: 'row', justifyContent: 'center' }}>
              <Text style= {{ fontSize: 18, fontWeight: 'bold' }}>Agregar {watch('tipo')}</Text>
            </View>

            <View style={{ ...style.containerTextInput, gap: 8, flexDirection: 'row' }}>
              <Text style= {{ fontSize: 16, fontWeight: 'bold' }}>Lat:</Text>
              <Text style= {{ fontSize: 16 }}>{watch('latitud')} </Text>
            </View>

            <View style={{ ...style.containerTextInput, gap: 8, flexDirection: 'row' }}>
              <Text style= {{ fontSize: 16, fontWeight: 'bold' }}>Long:</Text>
              <Text style= {{ fontSize: 16 }}>{watch('longitud')} </Text>
            </View>

            <View style={{ ...style.containerTextInput, gap: 8, flexDirection: 'row' }}>
              <Text style= {{ fontSize: 16, fontWeight: 'bold' }}>{watch('ruta')}</Text>
            </View>

            <View style={{...style.containerTextInput, paddingVertical: 5}}>
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

            <Button
              mode="contained-tonal"              
              // contentStyle={{ backgroundColor: "rgba(37, 247, 0, 0.13)" }}
              onPress={() => {
                setVisible(!visible);
              }}
              >
              <Icon name="map-marker" size={15} />   Cambiar ubicación
            </Button>

            <SegmentedButtons
              value={''}
              style={{ marginVertical: 15 }}
              onValueChange={() => {}}
              buttons={[
                {
                  value: 'shoot',
                  label: 'Cancelar',
                  labelStyle: { color: Colors.darker },
                  style: { backgroundColor: stylesDefault.btnCancelar.color, borderColor: isDarkMode ? Colors.darker : Colors.lighter },
                  onPress() {
                    cancel();
                  },
                },
                {
                  value: 'take',
                  label: `Confirmar`,
                  labelStyle: { color: Colors.darker  },
                  style: { backgroundColor: stylesDefault.btnConfirmar.color, borderColor: isDarkMode ? Colors.darker : Colors.lighter },
                  onPress() {
                    save();
                  },
                }
              ]}
            />
          </View>
        )}
      </Dialog.Content>
    </Dialog>
  )
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
    paddingVertical: 5,
  },
  focusedTextInput : {
    borderColor: 'rgba(216, 240, 244, 0.93)',
    backgroundColor: 'rgba(240, 240, 240, 0.93)'
  }
})

export default ModalRegister
