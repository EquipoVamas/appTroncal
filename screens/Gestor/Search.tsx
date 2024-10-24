import React, { useState, useEffect } from 'react'
import { View, ScrollView, TouchableOpacity } from 'react-native'
import { IconButton, Menu, Searchbar, Divider, Button, Modal, Portal, Text } from 'react-native-paper'
import Icon from 'react-native-vector-icons/FontAwesome';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useBearStore } from '../../store/storet'
import { getTypeStatusLocal } from '../../services/dataBase'
import { Colors } from 'react-native/Libraries/NewAppScreen'
import Styles from '../style'
import { Picker } from '@react-native-picker/picker';

interface SearchType {
  modeActive: "card" | "list";
  setModeActive: (data:any) => void;
  output?: (data:any) => void;
}

export const Search = ( { modeActive = 'card', setModeActive, output } : SearchType) => {
  const { mode } = useBearStore();
  const isDarkMode = mode === 'dark';
  const [typeStatus, setTypeStatus] = useState<any[]>([]);
  const [statusActive, setStatusActive] = useState("");
  const [searchQuery, setSearchQuery] = useState('');
  const [visible, setVisible] = useState(false);
  const [modalVi, setModalVi] = useState(false);
  const openMenu = () => setVisible(true);
  const closeMenu = () => setVisible(false);

  const getTypeStatus = async () => {
    setTypeStatus([]);
    const response:any = await getTypeStatusLocal();
    response.forEach((stat:any) => {
      setTypeStatus((value:any) => {
        return [...value, { label: stat.nombre, value: stat.item, item: stat.item } ]
      });
    });
    
  };

  const handleStatus = (e : any) => {
    setStatusActive(e);
    output && output({ status: e });
  }

  const handleSearch = () => {
    output && output({ search:  searchQuery });
  }

  useEffect(() => {
    getTypeStatus();
  }, []);

  return (
    <>
      <View style={{ display: "flex", flexDirection: 'row', justifyContent: 'center', alignItems: 'center', margin: 10 }}>
        <Searchbar
          placeholder="Buscar"
          style={{ flex: 1 }}
          onChangeText={setSearchQuery}
          value={searchQuery}
          icon={() => <Icon name="search" size={12} color={isDarkMode ? "#fff" :"#000"}/>}
          clearIcon={searchQuery.length == 0 ? undefined : () => <Icon name="times" size={15} color={isDarkMode ? "#fff" :"#000"} />}
          onClearIconPress={() => output && output({ search: undefined }) }
        />

        <IconButton
          icon={() => <MaterialIcons name="send" size={20} color={isDarkMode ? "#fff" :"#000"}/>}
          onPress={handleSearch}
        />

        <Menu
          visible={visible}
          onDismiss={closeMenu}
          contentStyle={{ padding: 10, borderRadius: 25 }}
          anchor={
            <IconButton
              icon={() => <Icon name="ellipsis-v" size={15} color={isDarkMode ? "#fff" :"#000"}/>}
              size={10}
              onPress={openMenu}
            />
          }>
            <Menu.Item 
              trailingIcon={() =>
                modeActive === 'card' ? (
                  <IconButton
                    icon={() => <Icon name="check" size={15} color={isDarkMode ? "#fff" :"#000"}/>}
                    size={10}
                    onPress={openMenu}
                  />
                ) : null
              } 
              onPress={() => {setModeActive('card')}}
              title="Tarjeta" dense
            />
            <Menu.Item
              trailingIcon={() =>
                modeActive === 'list' ? (
                  <IconButton
                    icon={() => <Icon name="check" size={15} color={isDarkMode ? "#fff" :"#000"} />}
                    size={10}
                    onPress={openMenu}
                  />
                ) : null
              }
              onPress={() => {setModeActive('list')}}
              title="Lista"
              dense
            />
            <Divider bold />
            <Menu.Item
              leadingIcon={() => 
                <IconButton
                    icon={() => <Icon name="filter" size={15} color={isDarkMode ? "#fff" :"#000"} />}
                    size={10}
                    onPress={openMenu}
                />
              }
              onPress={() => {setModalVi(true)}}
              title="Filtrar estado"
            />
            <Menu.Item
              leadingIcon={() => 
                <IconButton
                    icon={() => <Icon name="refresh" size={15} color={isDarkMode ? "#fff" :"#000"} />}
                    size={10}
                    onPress={openMenu}
                />
              }
              onPress={() => { setStatusActive(""); output && output({ status: undefined }) }}
              title="Quitar filtros"
              dense
            />

        </Menu>
      </View>

      <Portal>
        <Modal visible={modalVi} style={{ padding: 20, height: "100%"}} >
            <View style={{
                margin: 5, backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
                borderRadius: 20, padding: 20, justifyContent: 'center',alignContent: 'center',
              }}
            >
              <Text style={{ marginVertical: 5 }}>Selecciona un estado:</Text>
              <View style={{  borderWidth: 1, borderColor: '#0000', borderRadius: 10 }}>
                <Picker
                  selectedValue={statusActive}
                  style={{width: '100%', color: isDarkMode ? "#fff" : "#000" }}
                  dropdownIconColor={isDarkMode ? "#fff" : "#000"}
                  mode='dropdown'
                  onValueChange={handleStatus}>
                  <Picker.Item label="Seleccionar tipo" value="" style={{ color: isDarkMode ? "#fff" : "#000", backgroundColor: isDarkMode ? Colors.darker : Colors.lighter }} />
                  {typeStatus &&
                    typeStatus?.map((val: any) => (
                      <Picker.Item
                        style={{ color: isDarkMode ? "#fff" : "#000", backgroundColor: isDarkMode ? Colors.darker : Colors.lighter }}
                        key={val?.item} label={val?.label} value={val?.item}
                      />
                    ))}
                </Picker>
              </View>
              <Divider bold />
              <View style={{ display: "flex", flexDirection: "row", gap: 5, justifyContent: "center", marginTop: 20 }}>
                  <Button mode='contained-tonal' style={{backgroundColor: Styles.gray.color}} textColor='white' onPress={() => setModalVi(false) }>Cancelar</Button>
                  <Button mode='contained-tonal' style={{backgroundColor: Styles.purple.color}} textColor='white' onPress={() => { setModalVi(false); setStatusActive(""); output && output({ status: undefined }) } }>Limpiar</Button>
              </View>
            </View>
        </Modal>       
      </Portal>
    </>
  )
}
