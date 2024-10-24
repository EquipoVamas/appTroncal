import React, {useEffect, useState} from 'react';
import {StyleSheet, ScrollView, View} from 'react-native';
import {Text, IconButton, Searchbar} from 'react-native-paper';
import Layout from '../../components/Layout';
import Icon from 'react-native-vector-icons/FontAwesome';

import ModalCreateFolder from './ModalCreateFolder';
import {getFolders, searchSubMufa} from '../../services/axios';
import FileItem from './FileItem';
import {Search} from './Search';
import FolderItem from './FolderItem';

const Carpetas = () => {
  const [visible, setVisible] = useState(false);
  const showDialog = () => setVisible(true);

  const [foldersView, setFoldersView] = useState<any>([]);
  const [filesView, setFilesView] = useState<any>([]);
  const [prefix, setPrefix] = useState<any>([]);
  const [mode, setMode] = useState<any>('card'); // card | list
  const [dataRename, setDataRename] = useState<any>([]); // card | list

  const listFolder = async (prefixString = '') => {
    try {
      const res = await getFolders({ folder: prefixString });
  
      if (res?.data?.data) {
        const { data } = res.data;
        const newPrefix = prefixString ? [...prefix, prefixString] : prefix;
  
        if (prefixString && !prefix.includes(prefixString)) {
          setPrefix(newPrefix);
        }
        
        let dataFolders = data.folders;
        let dataFiles = data.files;

        if (newPrefix.length === 4) {
          const lastSegment = prefixString.split('/').filter(Boolean).pop();
          const resDetails = await searchDetailsFolder(lastSegment);
        
          dataFolders = data.folders.map((value: any) => {
            const details = resDetails[0]?.detalle;
            const exists = details?.find((item: any) => item?.nombre === value?.name);
        
            if (exists) {
              return { ...value, isMarker: true, codPoste: exists?.nombre, item : exists?._id };
            }
        
            return value;
          });
        }
        
        setFoldersView(dataFolders || []);
        setFilesView(dataFiles || []);
        
      }
    } catch (error) {
      throw error;
    }
  };

  const searchDetailsFolder = async (name: any) => {
    try {
      const res: any = await searchSubMufa( { 'subMufas.nombreSubMufa' : name } )

      return res?.data[0]?.subMufas
    } catch (error) {
      throw error;
    }
  }
  
  const backFolder = () => {
    const newPrefix = prefix.slice(0, -1);
    setPrefix(newPrefix);
    listFolder(newPrefix[newPrefix.length - 1]);
  };

  useEffect(() => {
    if (prefix.length == 0) listFolder();
  }, [prefix]);

  return (
    <Layout mode="column">
      <View style={[style.container]}>
        <Search modeActive={mode} setModeActive={setMode} />

        <View style={style.containerHeader}>
          {prefix.length > 0 && (
            <IconButton
              icon={() => (
                <Icon name="arrow-circle-o-left" size={20} color={'#000'} />
              )}
              onPress={backFolder}
            />
          )}

          <Text style={{...style.subtitle}}>Carpetas</Text>
          <View style={style.containerIconHeader}>
            <IconButton
              icon={() => <Icon name="plus" size={15} color={'#ffff'} />}
              size={15}
              style={{...style.iconDesign}}
              onPress={showDialog}
            />
          </View>
        </View>

        <ScrollView showsHorizontalScrollIndicator={true}>
          {foldersView?.map((value: any) =>
            mode === 'card' ? (
              <FolderItem
                data={value}
                key={value?.prefix}
                onPress={() => listFolder(value?.prefix)}
                refreshDelete={() => listFolder(prefix[prefix.length - 1])}
                rename={(value: any) => {
                  setDataRename(value);
                  showDialog();
                }}
              />
            ) : (
              <FileItem
                data={value}
                key={value?.prefix}
                onPress={() => listFolder(value?.prefix)}
              />
            ),
          )}

          {filesView?.map((value: any) =>
            mode === 'card' ? (
              <FolderItem
                data={value}
                images={filesView}
                key={value?.prefix}
                onPress={() => listFolder(value?.prefix)}
                folder={false}
              />
            ) : (
              <FileItem
                data={value}
                key={value?.prefix}
                onPress={() => listFolder(value?.prefix)}
                folder={false}
              />
            ),
          )}
        </ScrollView>
      </View>

      <ModalCreateFolder
        visible={visible}
        setVisible={setVisible}
        prefix={prefix}
        refresh={() => listFolder(prefix[prefix.length - 1])}
        data={dataRename}
      />
    </Layout>
  );
};

const style = StyleSheet.create({
  container: {
    flex: 1,
    margin: 20,
    padding: 15,
    borderRadius: 30,
    borderColor: '#ffff',
    borderWidth: 3,
    backgroundColor: '#ffff',
    gap: 4,
  },
  containerHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    marginVertical: 10,
  },
  containerIconHeader: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
  },
  subtitle: {
    fontSize: 24,
    fontWeight: '700',
    fontFamily: 'Cochin',
    padding: 10,
  },
  iconDesign: {
    borderRadius: 40,
    margin: 10,
    backgroundColor: '#0d6efd',
  },
  link: {
    paddingHorizontal: 10,
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default Carpetas;
