import React, { useEffect, useState } from 'react'
import { ScrollView, StyleSheet, Touchable, View, TouchableOpacity, Dimensions } from 'react-native'
import { Badge, Button, Divider, IconButton, Menu, Modal, Portal, Searchbar, Text } from 'react-native-paper'
import { useBearStore } from '../../store/storet';
import Icon from 'react-native-vector-icons/FontAwesome';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { Colors } from 'react-native/Libraries/NewAppScreen';
import { getTypeStatusLocal } from '../../services/dataBase';
import stylesDefault from '../style';
import ModalStatus from './ModalStatus';

interface Props {
  prefix : any;
  backNavigation? : any;
  refresh: any;
  search: any;
  modeActive: "card" | "list";
  setModeActive: (data:any) => void;

}

const SearchHome = ( props : Props ) => {
  const navigation = useNavigation<NavigationProp<any>>();
  const { prefix, backNavigation, search, modeActive, setModeActive } = props;
  const { mode } = useBearStore();
  const isDarkMode = mode === 'dark';
  const [modalVi, setModalVi] = useState(false);

  const [ stringSearch, setStringSearch ] = useState("");
  const [ idTypeStatus, setIdTypeStatus ] = useState("");


  const [visible, setVisible] = useState(false);
  const openMenu = () => setVisible(true);
  const closeMenu = () => setVisible(false);

  const [searchVisible, setSearchVisible] = useState(false);

  const loadSearch = (text : string) => {
    search({
      idTipoEstado: idTypeStatus,
      name : text
    })
    setStringSearch(text);
  }

  useEffect(() => {
    setStringSearch("");
    setIdTypeStatus("");
  }, [ prefix ]);
  
  return (
    <>
      <View
        style={{
          flexDirection: 'row',
          margin: 10,
        }}>

        {
          !searchVisible && (
            <View style={{ flexDirection: 'row', alignItems: 'center', width: '80%', alignSelf: 'center' }}>
              {
                prefix && Object.keys(prefix).length > 0 && (
                  <IconButton
                    icon={() => (
                      <Icon
                        name="arrow-left"
                        size={20}
                        color={isDarkMode ? '#fff' : '#000'}
                      />
                    )}
                    onPress={() =>
                      backNavigation({...prefix[prefix.length - 2], actions: 'back'})
                    }
                  />
                )
              }

              {
                prefix && Object.keys(prefix).length === 0 && (
                  <IconButton
                    icon={() => (
                      <Icon
                        name="home"
                        size={30}
                        color={isDarkMode ? '#fff' : '#000'}
                      />
                    )}
                  />
                )
              }

              <Text
                style={{ fontSize: 15, fontWeight: 'bold', flexShrink: 1 }}
                numberOfLines={2}
                ellipsizeMode="tail"
              >
                {prefix && Object.keys(prefix).length > 0 ? 
                  prefix.map((item: any) => ( item?.distrito ? item?.distrito + " / " : "" )  + item?.nombre).join(' / ') : 
                  'Troncales'}
              </Text>
            </View>
          )
        }


        {
          searchVisible && (
            <View style={{ flex: 1, alignItems: 'center' }}>
              <Searchbar
                placeholder="Buscar"
                style={{ width: '100%' }}
                onChangeText={loadSearch}
                value={stringSearch}
                icon={() => (
                  <MaterialIcons
                    name="expand-more"
                    size={20}
                    color={isDarkMode ? '#fff' : '#000'}
                  />
                )}
                onIconPress={() => {
                  setSearchVisible(false);
                  setStringSearch('');
                }}
                clearIcon={() => (
                  <></>
                )}
              />
            </View>
          )
        }

        <View style={{flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', width: '20%'}}>
          <IconButton
            icon={() => (
              <Icon
                name='search'
                size={20}
                color={isDarkMode ? '#fff' : '#000'}
              />
            )}
            onPress={() => setSearchVisible(true)}
          />
          <Menu
            visible={visible}
            onDismiss={closeMenu}
            contentStyle={{padding: 10, borderRadius: 25}}
            anchor={
              <IconButton
                icon={() => (
                  <Icon
                    name="ellipsis-v"
                    size={15}
                    color={isDarkMode ? '#fff' : '#000'}
                  />
                )}
                size={10}
                onPress={openMenu}
              />
            }>
            <Menu.Item
              leadingIcon={() =>
                modeActive === 'card' ? (
                  <IconButton
                    icon={() => (
                      <Icon
                        name="check"
                        size={15}
                        color={isDarkMode ? '#fff' : '#000'}
                      />
                    )}
                    size={10}
                    onPress={openMenu}
                  />
                ) : null
              }
              onPress={() => {
                setModeActive('card');
              }}
              title="Tarjeta"
              dense
            />
            <Menu.Item
              leadingIcon={() =>
                modeActive === 'list' ? (
                  <IconButton
                    icon={() => (
                      <Icon
                        name="check"
                        size={15}
                        color={isDarkMode ? '#fff' : '#000'}
                      />
                    )}
                    size={10}
                    onPress={openMenu}
                  />
                ) : null
              }
              onPress={() => {
                setModeActive('list');
              }}
              title="Lista"
              dense
            />

            <Divider bold />

            <Menu.Item
              leadingIcon={() => (
                <IconButton
                  icon={() => (
                    <Icon
                      name="filter"
                      size={15}
                      color={isDarkMode ? '#fff' : '#000'}
                    />
                  )}
                  size={10}
                  onPress={() => setModalVi(true)}
                />
              )}
              onPress={() => {
                setVisible(false);
                setModalVi(true);
              }}
              title="Filtrar estado"
            />
            <Menu.Item
              leadingIcon={() => (
                <IconButton
                  icon={() => (
                    <Icon
                      name="close"
                      size={15}
                      color={isDarkMode ? '#fff' : '#000'}
                    />
                  )}
                  size={10}
                  onPress={openMenu}
                />
              )}
              onPress={() => {
                search({
                  nombre: '',
                  idTipoEstado: '',
                });
              }}
              title="Quitar filtros"
              dense
            />
          </Menu>
        </View>

      </View>
      
      <ModalStatus visible={modalVi} setVisible={setModalVi} onClick={(e : any) => {
        search({
          idTipoEstado: e?.item,
          name: stringSearch,
        });
        setIdTypeStatus(e?.item);
        setModalVi(false);
      }}
      />
    </>
  );
}


export default SearchHome
