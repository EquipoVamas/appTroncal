import React, { useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import { useBearStore } from '../../store/storet';
import { Colors } from 'react-native/Libraries/NewAppScreen';
import { IconButton, Text } from 'react-native-paper';
import Icon from 'react-native-vector-icons/FontAwesome';
import { NavigationProp, useNavigation } from '@react-navigation/native';

import stylesDefault from '../style';

interface Props {
  data?: any;
  visible?: boolean;
}

interface ListAction {
  text: string;
  icon: string;
  function?: (action?: any) => void;  // Optional function parameter
}

const BottomSheetActions = (props: Props) => {
  const navigation = useNavigation<NavigationProp<any>>();

  const { visible, data } = props;
  const modes = useBearStore((state) => state.mode);
  const isDarkMode = modes === 'dark';
  const [pressedIndex, setPressedIndex] = useState(null);

  const snapPoints = useMemo(() => ['5%', '35%', '60%', '80%'], []);
  const bottomSheetRef = useRef<BottomSheet>(null);

  const handleDirection = (item : any) => {
    navigation.navigate('Mapa' , item);
  }

  const handlePressIn = (index : any) => {
    setPressedIndex(index); // Cambia el índice presionado
  };

  const handlePressOut = () => {
    setPressedIndex(null); // Restablece cuando se deja de presionar
  };

  const open = () => {
    bottomSheetRef.current?.expand();
  };

  const close = () => {
    bottomSheetRef.current?.close();
  };

  useEffect(() => {
    if (visible && data) {
      open();
    }
  }, [visible, data]);

  return (
    <BottomSheet
      ref={bottomSheetRef}
      style={{zIndex: 999, flex: 1}}
      backgroundStyle={{
        backgroundColor: isDarkMode ? Colors.darker : Colors.lighter, // '#39383d'
      }}
      snapPoints={snapPoints}
      enablePanDownToClose
      onClose={close}>
      <BottomSheetView>
        <View style={style.header}>
          <IconButton
            icon={() => (
              <Icon name="folder" size={25} style={stylesDefault.gray} />
            )}
            size={30}
          />
          <Text style={style.textHeader}>{data?.nombre}</Text>
        </View>

        <TouchableOpacity
          activeOpacity={0.9}
          onPressIn={() => handlePressIn(0)}
          onPressOut={handlePressOut}
          onPress={() => handleDirection(data)} // Call the specific function for this action
          style={[
            style.actions,
            pressedIndex === 0 && {backgroundColor: 'rgba(205, 200, 200, 0.1)'}, // Change background if pressed
          ]}>
          <IconButton
            icon={() => (
              <Icon
                name="location-arrow"
                size={25}
                style={stylesDefault.gray}
              />
            )}
            size={30}
          />
          <Text style={style.textActions}>Ir a Mapa</Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.9}
          onPressIn={() => handlePressIn(1)}
          onPressOut={handlePressOut}
          onPress={() => {
            /* Add functionality here for "Cambiar el nombre" */
          }}
          style={[
            style.actions,
            pressedIndex === 1 && {backgroundColor: 'rgba(205, 200, 200, 0.1)'}, // Change background if pressed
          ]}>
          <IconButton
            icon={() => (
              <Icon name="pencil" size={25} style={stylesDefault.gray} />
            )}
            size={30}
          />
          <Text style={style.textActions}>Cambiar el nombre</Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.9}
          onPressIn={() => handlePressIn(2)}
          onPressOut={handlePressOut}
          onPress={() => {
            /* Add functionality here for "Agregar a Favoritos" */
          }}
          style={[
            style.actions,
            pressedIndex === 2 && {backgroundColor: 'rgba(205, 200, 200, 0.1)'}, // Change background if pressed
          ]}>
          <IconButton
            icon={() => (
              <Icon name="star-o" size={25} style={stylesDefault.gray} />
            )}
            size={30}
          />
          <Text style={style.textActions}>Agregar a Favoritos</Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.9}
          onPressIn={() => handlePressIn(3)}
          onPressOut={handlePressOut}
          onPress={() => {
            /* Add functionality here for "Eliminar" */
          }}
          style={[
            style.actions,
            pressedIndex === 3 && {backgroundColor: 'rgba(205, 200, 200, 0.1)'}, // Change background if pressed
          ]}>
          <IconButton
            icon={() => (
              <Icon name="trash" size={25} style={stylesDefault.gray} />
            )}
            size={30}
          />
          <Text style={style.textActions}>Eliminar</Text>
        </TouchableOpacity>
      </BottomSheetView>
    </BottomSheet>
  );
};

const style = StyleSheet.create({
  header: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: stylesDefault.gray.color,
    alignItems: 'center'
  },
  textHeader: {
    fontSize: 18,
    fontWeight: 'bold'
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20
  },
  textActions: {
    fontSize: 18,
    fontWeight: 'condensedBold'
  },
})

export default BottomSheetActions;
