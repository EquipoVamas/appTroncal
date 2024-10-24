import React, { useEffect, useState } from 'react'
import { ScrollView, TouchableOpacity, View } from 'react-native';
import { ActivityIndicator, Badge, Button, Modal, Portal, Text } from 'react-native-paper';
import { useBearStore } from '../../store/storet';
import { Colors } from 'react-native/Libraries/NewAppScreen';
import { getTypeStatusLocal } from '../../services/dataBase';
import stylesDefault from '../style';
import Icon from 'react-native-vector-icons/FontAwesome';

const ModalStatus = ({ visible, setVisible, onClick, loading = false } : any) => {

  const { mode } = useBearStore();
  const isDarkMode = mode === 'dark';

  const [ typeStatus, setTypeStatus ] = useState<any[]>([]);

  const getTypeStatus = async () => {
    setTypeStatus([]);
    const nameStatus = ['Cancelado', 'Procesado', 'Pendiente'];
    const response: any = await getTypeStatusLocal();
  
    const result = response.filter((val: any) => nameStatus.includes(val?.nombre));
    
    setTypeStatus(result);
  };
  
  useEffect(() => {
    getTypeStatus();
  }, []);

  return (
    <Portal>
        <Modal
          visible={visible}
          contentContainerStyle={{ margin: 20, borderRadius: 40 }}
          >
          <View
            style={{
              backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
              padding: 20,
              // justifyContent: 'center',
              // alignContent: 'center',
              borderRadius: 40,
              marginVertical: 15
            }}>
            
            {
              loading && (
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
              )
            }

            {
              !loading && (
                <>
                  <View>
                    <Text style= {{ fontSize: 20, fontWeight: 'bold', textTransform: 'uppercase', textAlign:'center' }}>Seleccionar Estado</Text>
                  </View>
                  
                  <ScrollView showsHorizontalScrollIndicator={true}>
                    {typeStatus &&
                      typeStatus?.map((value: any) => (
                        <TouchableOpacity
                          activeOpacity={0.7}
                          key={value?.item}
                          onPress={() => onClick(value)}
                          style={{
                            paddingVertical: 10,
                            borderBottomWidth: 0.5,
                            borderBottomColor: stylesDefault.gray.color
                          }}>
                          <View
                            style={{
                              flex: 1,
                              flexDirection: 'row',
                              alignItems: 'center',
                              gap: 10,
                              marginHorizontal: 20,
                              alignContent: 'space-between'
                            }}>
                            <Icon name="circle" color={value?.color} size={20}  />
                            <Text style={{fontSize: 18, fontWeight: 'semibold', textTransform: 'uppercase'}}>{value?.nombre}</Text>
                          </View>
                        </TouchableOpacity>
                      ))}
                  </ScrollView>            

                  <Button style={{ marginTop: 8 }} mode='contained-tonal' onPress={() => setVisible(false)}>Cerrar</Button>
                </>
              )
            }
          </View>
        </Modal>
      </Portal>
  )
}

export default ModalStatus