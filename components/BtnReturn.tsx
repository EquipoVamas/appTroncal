import { Pressable, StyleProp, StyleSheet, View, ViewStyle } from 'react-native'
import { Text } from 'react-native-paper';

interface Props { 
  iconName?: string;
  onPress? : () => void;
  style?: StyleProp<ViewStyle>
}

const BtnReturn = ( props : Props ) => {
  const { iconName, onPress, style } = props ;
  return (
    <View style={[styles.btn, style]}>
      <Pressable
      onPress={ onPress }
      >
        <Text>volver</Text>
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  btn: {
    zIndex: 1,
    position: 'absolute',
    height: 50,
    width: 50,
    borderRadius: 30,
    backgroundColor: 'black',
    justifyContent: 'center',
    alignItems: 'center',
    shadowOpacity: 0.3,
    shadowOffset: {
      height: 0.27,
      width: 4.5
    },
    elevation: 5,
  }
});

export default BtnReturn;