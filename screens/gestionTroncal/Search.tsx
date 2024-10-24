import React, {useState} from 'react'
import { Text, View } from 'react-native'
import { IconButton, Menu, Searchbar } from 'react-native-paper'
import Icon from 'react-native-vector-icons/FontAwesome';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

export const Search = ( { modeActive = 'card', setModeActive } : any) => {

  
  const [searchQuery, setSearchQuery] = useState('');
  const [visible, setVisible] = useState(false);
  const openMenu = () => setVisible(true);
  const closeMenu = () => setVisible(false);

  return (
    <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
      <Searchbar
        placeholder="Buscar"
        style={{flex:1}}
        onChangeText={setSearchQuery}
        value={searchQuery}
        icon={() => <Icon name="search" size={10} color={'#000'} />}
      />
      <IconButton
        icon={() => <MaterialIcons name="send" size={20} color={'#000'} />}
        onPress={() => {}}
      />

      <Menu
        visible={visible}
        onDismiss={closeMenu}
        contentStyle={{ padding: 10, backgroundColor: '#fff', borderRadius: 25 }}
        anchor={
          <IconButton
            icon={() => <Icon name="ellipsis-v" size={15} color={'#000'} />}
            size={10}
            onPress={openMenu}
          />
        }>
          <Menu.Item 
            leadingIcon={() =>
              modeActive === 'card' ? (
                <IconButton
                  icon={() => <Icon name="check" size={15} color={'#000'} />}
                  size={10}
                  onPress={openMenu}
                />
              ) : null
            } 
            onPress={() => {setModeActive('card')}}
            title="Card" dense/>
          <Menu.Item
            leadingIcon={() =>
              modeActive === 'list' ? (
                <IconButton
                  icon={() => <Icon name="check" size={15} color={'#000'} />}
                  size={10}
                  onPress={openMenu}
                />
              ) : null
            }
          onPress={() => {setModeActive('list')}}
          title="List"
        />

      </Menu>
    </View>
  )
}
