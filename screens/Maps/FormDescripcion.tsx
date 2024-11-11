import React, { useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form';
import { StyleSheet, View, Image, TouchableOpacity, Touchable } from 'react-native'
import { ActivityIndicator, Button, Dialog, HelperText, IconButton, Portal, SegmentedButtons, Snackbar, Text, TextInput } from 'react-native-paper'
import stylesDefault from '../style';
import { getOneDetalleItem, getOneMufa, getOneNodo, getOneSubMufa, getOneTroncal, updateDetalleArchivos, updateDetalleLocal } from '../../services/dataBase';
import { useLocation } from '../../store/useLocation';

import { CameraRoll } from '@react-native-camera-roll/camera-roll'
import RNFS from 'react-native-fs'
import { registerFileDetails } from '../../services/axios';
import { useBearStore } from '../../store/storet';

import ImageViewer from 'react-native-image-zoom-viewer';
import Modal from 'react-native-modal';
import { Colors } from 'react-native/Libraries/NewAppScreen';
import Icon from 'react-native-vector-icons/FontAwesome';
import { getDistance } from '../../components/Functions';

type DataForm = {
  descripcion : string;
  orden?: string;
  message?: string;
}


const FormDescripcion = ( { visible, setVisible, fileImage, refresh, takeFotoAgain, coordinateMarker, dataRoute } : any) => {

  const { statusNet, statusApp } = useBearStore();

  const hideDialog = () => setVisible(false);
  const { control, setValue, formState: {errors}, reset, watch } = useForm<DataForm>();
  const { lastKnownLocation } = useLocation()
  // const [ distance, setDistance ] = useState<any>("0m");
  const [ loading, setLoading ] = useState(false);
  const modes = useBearStore((state) => state.mode)
  const isDarkMode = modes === 'dark';
  const [ prefix, setPrefix ] = useState<any>([]);

  const [visibleSnackBar, setVisibleSnackBar] = useState(false);

  const [isModalVisible, setModalVisible] = useState(false);

  const [visibleSnackBarAlert, setVisibleSnackBarAlert] = useState(false);

  const onToggleSnackBarAlert = () => setVisibleSnackBarAlert(!visibleSnackBarAlert);

  const onDismissSnackBarAlert = () => {
    setTimeout(() => {
      setVisibleSnackBarAlert(false)
    }, 1000)
  };

  const openModal = () => { 
    setModalVisible(true);
    console.log(fileImage)
  };

  const closeModal = () => {
    setModalVisible(false);
  };

  const onToggleSnackBar = () => setVisibleSnackBar(!visibleSnackBar);

  const onDismissSnackBar = () => {
    setTimeout(() => {
      setVisibleSnackBar(false)
    }, 1000)
  };

  const saveFiles = async () => {
    var isPowerMeter = fileImage?.nameCard == 'Spliter 1' || fileImage.nameCard == 'Spliter 2' ? true : false;

    const descripcion = watch('descripcion');
    const descripcionRange = parseFloat(descripcion);
    
    if (isPowerMeter && (isNaN(descripcionRange) || (descripcionRange < -20 || descripcionRange > -13)) && fileImage?.orden !== 0) {
      showMessage('No se encuentra en el rango...');
      return;
    }

    const data : any = await getOneDetalleItem(fileImage?.id);
    let filesData :any = typeof data?.archivos == 'string' ? JSON.parse(data?.archivos) : [];

    if (isPowerMeter && filesData.some((item: any) => item?.descripcion === parseFloat(descripcion).toFixed(2)) && fileImage?.orden !== 0 ) {
      showMessage('Ya tienes registrado este valor, por favor vuelva hacer el proceso.');
      return;
    }

    setLoading(true);
    
    const oldFile: any = {
      descripcion: isPowerMeter ? Number(descripcion).toFixed(2) : descripcion,
      orden: fileImage?.orden || null,
      file: fileImage?.file || null,
      fechaFoto: fileImage?.fechaFoto || null,
      latitud: fileImage?.latitud || '',
      longitud: fileImage?.longitud || '',
    };

    if( lastKnownLocation != null ) {
      oldFile.distancia = getDistance(
        oldFile?.latitud,
        oldFile?.longitud,
        parseFloat(coordinateMarker?.latitud),
        parseFloat(coordinateMarker?.longitud),
      )
    }
    
    const result = filesData.find(( val : any) => val?.orden == oldFile?.orden);
    let indexFile = -1;
    if(result) {
      indexFile = filesData.findIndex(( val :any ) => val?.orden == result?.orden);
      filesData[indexFile].orden = 0;
      filesData[indexFile].modificado = 1;
    }

    console.log("oldFile", oldFile)
    const newFile: any = await savePhoto(oldFile);

    var editado = 1; 

    const res = await updateDetalleArchivos(JSON.stringify([...filesData, newFile]), fileImage?.id, editado);

    if( res && statusNet && !statusApp ) {
      const formData = new FormData();
      
      formData.append("data", JSON.stringify(newFile));
      formData.append("file", newFile?.file);

      // Este manda al servidor
      const fileRes = await registerFileDetails(data?.item, formData);

      if(fileRes && fileRes?.data) {
        const allSent = filesData.every(
          (file: any) => file.enviado === 1,
        );  

        var datos : any = { archivos: JSON.stringify([...filesData, {...newFile, enviado: 1}] )};
        if( allSent ) datos.editado = 0;

        await updateDetalleLocal( datos , fileImage?.id );
        showMessage(`Enviado al servidor.`);
      }else{
        await updateDetalleLocal({ editado : 1, archivos: JSON.stringify([...filesData, {...newFile, enviado: 0}]) }, fileImage?.id)
      }
    }

    refreshModal();
  };

  const refreshModal = () => {
    setLoading(false)
    refresh();
    hideDialog();
  }

  const showMessage = (message: string) => {
    setValue('message', message);
    onToggleSnackBar();
    onDismissSnackBar();
  };

  const savePhoto = async (file: any) => {
    return new Promise(async (resolve, reject) => {
      var filesStorage = {};
      const photo = file?.file;
      if (photo) {
        const directoryPath = `${RNFS.ExternalStorageDirectoryPath}/Pictures/Pruebas`;
        const filePath = `${directoryPath}/${photo.fileName}`;
        try {
          await RNFS.mkdir(directoryPath);

          await RNFS.copyFile(photo.uri, filePath);

          CameraRoll.saveAsset(filePath, {type: 'photo', album: 'Pruebas'});

          filesStorage = {
            descripcion: file?.descripcion,
            longitud: file?.longitud,
            latitud: file?.latitud,
            distancia: file?.distancia,
            orden: file?.orden,
            fechaFoto: file?.fechaFoto,
            enviado: 0,
            file: {
              name: photo.fileName,
              type: photo.type,
              size: photo.fileSize,
              uri: photo ? `file://${filePath}` : photo.uri,
            },
          };
        } catch (error) {
          return null;
        }
      }

      resolve(filesStorage);
    });
  };

  const refreshTakenAgain = () => {
    setVisible(false)
    takeFotoAgain({ ...fileImage, edit: 1 });
  }

  const setPrefixHeader = async ( data : any ) => {
    const prefix = `${'https://semi.nyc3.digitaloceanspaces.com/SEMI PERU MONTAJES INDUSTRIALES S.A.C.'}/TRONCAL/${data?.carpeta?.nombre}/${data?.subcarpeta?.nombre}/${data?.categoria?.nombre}/${data?.subcategoria?.nombre}/${fileImage?.nameItem}`;
    setPrefix(prefix)
  }

  useEffect(( ) => {
    if(fileImage) {
      console.log(fileImage)
      setValue('descripcion', fileImage?.descripcion?.toString() || "");
    }
  }, [ fileImage, coordinateMarker ])

  useEffect(( ) => {
    if(dataRoute) {
      setPrefixHeader(dataRoute)
    }
  }, [ dataRoute, fileImage ])

  return (
    <Portal>
      <Dialog
        visible={visible}
        onDismiss={() => {
          if (!loading) {
            hideDialog();
          }
        }}>
        <Dialog.Content>
          {loading && (
            <View
              style={{
                flexDirection: 'row',
                gap: 10,
                alignContent: 'center',
                justifyContent: 'center',
                alignItems: 'center',
                padding: 10,
              }}>
              <ActivityIndicator
                size={'large'}
                animating={loading}
                color={stylesDefault.purpleLight.color}
              />
              <Text style={{fontWeight: 'bold'}}>Agregando...</Text>
            </View>
          )}
          {!loading && (
            <View>
              <View style={{ alignItems: 'flex-end' }}>
                <IconButton
                  icon={() => <Icon name="close" color={'gray'} size={20}  />}
                  onPress={() => setVisible(false)}
                />
              </View>
              <TouchableOpacity
                style={{
                  margin: 10,
                  borderWidth: 1,
                  borderColor: 'rgba(199, 198, 198, 0.93)',
                }}
                onPress={openModal}>
                <Image
                  style={{
                    width: '100%',
                    height: undefined,
                    aspectRatio: 1,
                  }}
                  source={{ uri: fileImage?.file?.uri }}
                  resizeMode="contain"
                />
              </TouchableOpacity>

              <View style={{ marginVertical: 4, marginHorizontal: 10, marginBottom: 6}}>
                <Text><Text style={ { fontWeight: 'bold' }}>Latitud:</Text> {fileImage?.latitud}</Text>
                <Text><Text style={ { fontWeight: 'bold' }}>Longitud:</Text> {fileImage?.longitud}</Text>
                <Text><Text style={ { fontWeight: 'bold' }}>Fecha:</Text> {fileImage?.fechaFoto}</Text>
              </View>

              <Controller
                name="descripcion"
                control={control}
                defaultValue={watch('descripcion')}
                rules={{required: {message: 'Requerido', value: true}}}
                render={({field: {onChange, onBlur, value}}) => (
                  <TextInput
                    disabled={fileImage?.edit == 0 ? false : true}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    error={Boolean(errors?.descripcion)}
                    placeholder="Descripción"
                    mode="outlined"
                    value={value}
                  />
                )}
              />

              <SegmentedButtons
                value={''}
                style={{ marginVertical: 15 }}
                onValueChange={() => {}}
                buttons={[
                  {
                    value: 'shoot',
                    label: 'Tomar Foto',
                    labelStyle: { color: Colors.darker },
                    style: { backgroundColor: stylesDefault.btnCancelar.color, borderColor: isDarkMode ? Colors.darker : Colors.lighter },
                    onPress() {
                      refreshTakenAgain();
                    },
                  },
                  {
                    value: 'take',
                    label: `Confirmar`,
                    disabled: fileImage?.edit == 0 ? false : true,
                    labelStyle: { color: Colors.darker  },
                    style: { backgroundColor: fileImage?.edit == 0 ?  stylesDefault.btnConfirmar.color : stylesDefault.grayLight.color , borderColor: isDarkMode ? Colors.darker : Colors.lighter },
                    onPress() {
                      saveFiles();
                    },
                  }
                ]}
              />
            </View>
          )}
        </Dialog.Content>
      </Dialog>

      <View style={style.container}>
        <Snackbar
          visible={visibleSnackBar}
          onDismiss={() => setVisibleSnackBar(false)}
          elevation={3}
          style= {{  backgroundColor: isDarkMode ? Colors.darker : Colors.lighter }}
          action={{
            label: 'Cerrar',
            onPress: () => {
              onDismissSnackBar();
            },
          }}>
          <Text style={ { fontSize: 18 } }>{watch('message')}</Text>
        </Snackbar>
      </View>

      
      <View style={style.container}>
        <Snackbar
          visible={visibleSnackBarAlert}
          onDismiss={() => setVisibleSnackBarAlert(false)}
          elevation={3}
          style= {{  backgroundColor: isDarkMode ? Colors.darker : Colors.lighter }}
          action={{
            label: 'Cerrar',
            onPress: () => {
              onDismissSnackBarAlert();
            },
          }}>
          <Text style={ { fontSize: 18 } }>No se obtenieron coordenadas, por favor vuelva a tomar la foto.</Text>
        </Snackbar>
      </View>

      <Modal isVisible={isModalVisible} onBackdropPress={closeModal} onDismiss={closeModal} 
        style={{ backgroundColor: '#fff', alignContent: 'center' }}>
        <View style={{ flex: 1 }}>
          <TouchableOpacity onPress={closeModal} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', width: '100%'}}>
            <IconButton
              icon={() => <Icon name="close" size={20}  />}  
            />
            <Text style={{ fontSize: 17 }}>Cerrar</Text>
          </TouchableOpacity>
          <ImageViewer imageUrls={ fileImage?.file?.uri ? [{ url : fileImage?.file?.uri }] : []} onCancel={closeModal}/>
        </View>
      </Modal>
    </Portal>
  );
}

const style = StyleSheet.create({
  picker: {
    borderWidth: 0.7,
    borderRadius: 10,
    marginVertical: 5,
  },
  container: {
    flex: 1,
    justifyContent: 'space-between',
  },
  textNotify: {
    color: '#ffff'
  }
})

export default FormDescripcion
