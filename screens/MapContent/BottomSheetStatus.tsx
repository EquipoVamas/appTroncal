import React, { useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import BottomSheet from '@gorhom/bottom-sheet';
import stylesDefault from '../style';
import { ActivityIndicator, Badge, IconButton, Text } from 'react-native-paper';
import Icon from 'react-native-vector-icons/FontAwesome';
import { getTypeStatusLocal, updateDetalleLocal, updateTypeStateDetalle } from '../../services/dataBase';
import { ScrollView } from 'react-native-gesture-handler';
import { useBearStore } from '../../store/storet';
import { Colors } from 'react-native/Libraries/NewAppScreen';
import { updateDetailsData } from '../../services/axios';

interface Props {
  data: any;
  dataRegister: any;
  visible: boolean;
  onClose: () => void;
  refresh: any;
}

const BottomSheetStatus = ({ data, visible, dataRegister, onClose, refresh }: Props) => {
  const modes = useBearStore((state) => state.mode)
  const isDarkMode = modes === 'dark';
  const { statusApp, statusNet, envAuto } = useBearStore.getState()

  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ['5%', '35%', '60%', '80%'], []);
  const [ loading, setLoading ] = useState(false);

  const [typeStatus, setTypeStatus] = useState<any[]>([]);
  
  const close = () => {
    onClose();
    bottomSheetRef.current?.close();
  };

  const getTypeStatus = async () => {
    const response:any = await getTypeStatusLocal();

    const newResp = response.filter(( val : any) => val.nombre == 'Borrador' || val.nombre == 'Cancelado' || val.nombre == 'Procesado')
    setTypeStatus(newResp);
  };

  const handleEditStatus = async ( idTipoEstado : any ) => {
    setLoading(true);
    let info = {
      idTipoEstado: idTipoEstado,
      alto: dataRegister?.altura || null,
      nivelTension: dataRegister?.nivelTension || null,
      codInterno: dataRegister?.codInterno || null,
      idPropietario: dataRegister?.idPropietario || null,
      nombre : data?.nombre,
      longitud: data?.longitud,
      latitud: data?.latitud
    };

    const response = await updateDetalleLocal(info, data?.id);

    if(response) {

      if( statusNet && !statusApp ) {

        const newInfo = Object.fromEntries(Object.entries(info).filter(( [ val ] ) => val !== null));
        const formData = new FormData();
        formData.append("data", JSON.stringify(newInfo));
  
        await updateDetailsData(data?.item, formData);
        
      }
      setLoading(false);
      close();
      refresh(data?.id);
    }
  }

  useEffect(() => {
    getTypeStatus();
  }, []);

  useEffect(() => {
    if (visible) {
        bottomSheetRef.current?.expand();
    } else {
      bottomSheetRef.current?.close();
    }
  }, [visible, snapPoints]);

  return (
      <BottomSheet
        ref={bottomSheetRef}
        style={{ zIndex: 999, flex: 1 }}
        backgroundStyle={{
          backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
        }}
        snapPoints={snapPoints}
        enablePanDownToClose
        onClose={close}
        handleIndicatorStyle={{ backgroundColor: 'gray' }}
      >
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
              <Text style={{fontWeight: 'bold'}}>Cargando...</Text>
            </View>
          )}
          
          {!loading && (
            <View style={{ flex: 1, margin: 20 }}>
              <View style={styles.contentBody}>
                <Text style={styles.textHeader}>Cambiar estado</Text>
                <View style={styles.closeButtonContainer}>
                  <IconButton
                    icon={() => <Icon name="close" size={20} />}
                    size={15}
                    style={{ backgroundColor: stylesDefault.grayLightBg.backgroundColor }}
                    onPress={close}
                  />
                </View>
              </View>

              <ScrollView activeCursor="all-scroll">
                {typeStatus.map((val: any) => (
                  <TouchableOpacity onPress={() => handleEditStatus(val?.item)} key={val?.id} style={styles.contentStatus}>
                    <View
                      style={[
                        styles.contentIconStatus,
                    
                      ]}
                    >
                    <Badge style={{ backgroundColor: val?.color }} />
                    </View>
                    <Text style={styles.textStatus}>{val?.nombre}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}
      </BottomSheet>
  );
};

const styles = StyleSheet.create({
  contentBody: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  textHeader: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  closeButtonContainer: {
    borderColor: stylesDefault.gray.color,
    borderWidth: 1,
    borderRadius: 15,
  },
  contentStatus: {
    marginVertical: 5,
    borderBottomColor: stylesDefault.gray.color,
    flexDirection: 'row',
    gap: 15,
    alignItems: 'center',
  },
  contentIconStatus: {
    padding: 10,
    marginRight: 10,
    borderRadius: 10,
  },
  textStatus: {
    fontSize: 20,
    fontWeight: 'bold',
  },
});

export default BottomSheetStatus;
