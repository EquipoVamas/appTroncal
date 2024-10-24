import React from 'react'
import { StyleSheet, View } from 'react-native';
import { Snackbar, Text } from 'react-native-paper';
import { useBearStore } from '../../store/storet';
import { Colors } from 'react-native/Libraries/NewAppScreen';

const AlertHome = ({ visible = false, onClose, message } : any) => {

  const { mode } = useBearStore();
  const isDarkMode = mode === 'dark';

  return (
    <View style={style.containerAlert}>
      <Snackbar
        visible={visible}
        style= {{  backgroundColor: isDarkMode ? Colors.darker : Colors.lighter }}
        onDismiss={() => onClose()}
        duration={700}
        action={{
          label: 'Cerrar',
          onPress: () => {
            onClose();
          },
        }}>
        <Text style={ { fontSize: 19 } }>{message}</Text>
      </Snackbar>
    </View>
  )
}

const style = StyleSheet.create({
  containerAlert: {
    flex: 1,
    justifyContent: 'space-between',
  }
})

export default AlertHome
