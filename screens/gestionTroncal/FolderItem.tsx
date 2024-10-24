import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, IconButton, Menu } from 'react-native-paper';
import Icon from 'react-native-vector-icons/FontAwesome';
import { deleteFolder } from '../../services/axios';
import PreviewerImage from './PreviewerImage';
import colors from '../style';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { getOneItemIdServer } from '../../services/db';

const FolderItem = ({ data, onPress, folder = true, refreshDelete, rename, images } : any) => {
  const [menuVisible, setMenuVisible] = useState(false);
  const [previewVisible, setPreviewVisible] = useState(false);
  const navigation = useNavigation<NavigationProp<any>>();

  const handleDelete = async () => {
    const res = await deleteFolder({ folder: data?.name });
    if (res?.data) refreshDelete();
  };

  const getIconName = (fileName : any) => {
    if (fileName?.includes('.xlsx')) return 'file-excel-o';
    if (/\.(png|jpg|gif)$/.test(fileName)) return 'image';
    if (fileName?.includes('.pdf')) return 'file-pdf-o';
    return 'folder';
  };
  
  const getIconColor = (fileName : any) => {
    if (fileName?.includes('.xlsx')) return colors.green;
    if (/\.(png|jpg|gif)$/.test(fileName)) return colors.cyan;
    if (fileName?.includes('.pdf')) return colors.red;
    return colors.yellow;
  };

  const goStartedDetail = async ( data : any ) => {
    console.log(data)
    // const res: any = await getOneItemIdServer( data?.item );
    console.log("----------------------------------------------------")
    // console.log(res)
    // navigation.navigate('Mapa' , {...data, edit: 1});
  }

  const handleImageOpen = () => setPreviewVisible(true);

  return (
    <View style={styles.container}>
      <IconButton
        icon={() => (
          <Icon
            name={getIconName(data?.name)}
            size={30}
            style={getIconColor(data?.name)}
          />
        )}
        size={40}
        onPress={onPress}
        style={styles.iconButton}
      />

      <TouchableOpacity
        style={styles.textContainer}
        onPress={/\.(xlsx|pdf|png|jpg|gif)$/.test(data?.name) ? handleImageOpen : onPress}
        activeOpacity={0.8}
      >
        <Text style={styles.text}>{data?.name}</Text>
        <Text style={styles.subtext}>
          {folder ? `${data?.filesCount + data?.foldersCount} items | ` : ''}
          {data?.sizeFormatted}
        </Text>
      </TouchableOpacity>

      <View style={styles.menuContainer}>
        <Menu
          visible={menuVisible}
          onDismiss={() => setMenuVisible(false)}
          anchor={
            <IconButton
              icon={() => <Icon name="ellipsis-v" size={25} color="#d6d4d4" />}
              onPress={() => setMenuVisible(true)}
              style={styles.iconButton}
            />
          }
        > 
          {
            data?.isMarker && (
              <Menu.Item onPress={() => goStartedDetail(data)} title="Ir a detalle" />
            )
          }
          <Menu.Item
            onPress={() => rename({ name: data?.name, prefix: data?.prefix, rename: true }, () => setMenuVisible(false))}
            title="Renombrar"
          />
          <Menu.Item onPress={handleDelete} title="Eliminar" />
        </Menu>
      </View>

      <PreviewerImage visible={previewVisible} setVisible={setPreviewVisible} images={images} defaultImage={data?.name} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    margin: 3,
    padding: 8,
    borderColor: '#eeeeee',
    backgroundColor: '#f7f7f7',
    borderWidth: 2,
    borderRadius: 20,
    alignItems: 'center',
  },
  menuContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
  },
  textContainer: {
    flexDirection: 'column',
    marginHorizontal: 8,
  },
  text: {
    fontSize: 17,
    fontWeight: '100',
  },
  subtext: {
    color: 'gray',
    fontSize: 14,
  },
  iconButton: {
    borderRadius: 20,
  },
});

export default FolderItem;
