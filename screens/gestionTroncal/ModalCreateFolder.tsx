import React, { useEffect, useState } from 'react'; 
import { StyleSheet, View } from 'react-native';
import { Button, Dialog, Portal, Snackbar, Text, TextInput } from 'react-native-paper';
import { createFolder } from '../../services/axios';

const ModalCreateFolder = ({ data = {}, visible, setVisible, prefix, refresh }: any) => {
  const hideDialog = () => setVisible(false);

  const [name, setName] = useState("");
  const [rename, setRename] = useState("");
  const [isRename, setIsRename] = useState(false);

  const [visibleSnackBar, setVisibleSnackBar] = useState(false);
  const onToggleSnackBar = () => setVisibleSnackBar(!visibleSnackBar);
  const onDismissSnackBar = () => setVisibleSnackBar(false);

  const create = async () => {
    const rootFolter =  prefix.length > 0 ? prefix[(prefix.length -1)] : "";
    const nameFolder = rootFolter + name + '/';
    const res:any = await createFolder({ folder: nameFolder })
    if( res?.data ) {
      refresh();
      onToggleSnackBar();
      hideDialog();

      setTimeout(() => {
        onDismissSnackBar();
        setName("");
      }, 1500)
    }
    
  }

  const renameFolder = async () => {
    const rootFolter =  prefix.length > 0 ? prefix[(prefix.length -1)] : "";
    const nameFolder = rootFolter + name + '/';
    const res:any = await createFolder({ 
      actual: rename,
      nuevo: nameFolder,
     })

    if( res?.data ) {
      refresh();
      onToggleSnackBar();
      hideDialog();
      setTimeout(() => {
        onDismissSnackBar();
        setName("");
        setIsRename(false);
      }, 1500)
    }
  }

  useEffect(( ) => {
    if(Object.keys(data).length > 0) {
      setName(data?.name);
      setRename(data?.prefix);
      setIsRename ( true );
    }
  }, [ data ])


  return (
    <Portal>
      <Dialog visible={visible} onDismiss={hideDialog}>
        <Dialog.Content>
          <TextInput
            label="Nombre de la carpeta"
            mode='flat'
            value={name}
            onChangeText={val => setName(val)}
          />
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={hideDialog}>Cancelar</Button>
          <Button onPress={isRename ? renameFolder : create}>{isRename ? 'Renombrar' : 'Crear'}</Button>
        </Dialog.Actions>
      </Dialog>

      <View style={styles.container}>
        <Snackbar
          visible={visibleSnackBar}
          onDismiss={onDismissSnackBar}
          action={{
            label: 'Cerrar',
            onPress: () => {
              onDismissSnackBar();
            },
          }}>
          <Text style={styles.textNotify}>Se { isRename ? 'renombró' : 'creó'} la carpeta "{name}" con éxito.</Text>
        </Snackbar>
      </View>
    </Portal>

    
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
  },
  textNotify: {
    color: '#ffff',
    fontSize: 18
  }
});


export default ModalCreateFolder;
