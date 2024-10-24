import React, { useEffect, useState } from 'react'
import { View, StyleSheet, TouchableOpacity } from 'react-native'
import stylesDefault from '../style'
import { Surface, Card, ActivityIndicator, MD2Colors, TextInput, Text } from 'react-native-paper'
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { getOneDetalleItem } from '../../services/dataBase';
import { sendImageIA } from '../../services/axios';
import { useBearStore } from '../../store/storet';
import Icon from 'react-native-vector-icons/FontAwesome';
import { Controller, useForm } from 'react-hook-form';
import Layout from '../../components/Layout';

interface Props {
  data: any;
  schemaRef: any;
  setVisible: any;
  takenFile: any;
  takeFotoAgain?: any
}

const BottomSheetContent = ( props : Props) => {

  const { data, schemaRef, setVisible, takenFile, takeFotoAgain } = props;
  const { statusNet, statusIA } = useBearStore();

  const wavelengths = ['1310', '1550', '1310', '1550'];
  const [ cardImg, setCardImg ] = useState(schemaRef);
  const [ loading, setLoading ] = useState(false);

  const takePhoto = async ( item : any ) => {
    const { orden, nameCard }= item;
    var isPowerMeter = nameCard == 'Spliter 1' || nameCard == 'Spliter 2' ? true : false;
    
    if(item?.edit != 1) {
      const response = await verifyPhoto(item);
      if(response) return;
    }
    
    launchCamera({ mediaType: 'photo' }, async (response) => {
      if (response?.assets) {
        var descripcion = "";

        if ( statusIA && statusNet && isPowerMeter ) descripcion = await getDescriptionIA(response?.assets[0]);
        
        if( !isPowerMeter && orden != '0') {
          const response = cardImg.find(( val : any) => val?.name == nameCard);
          descripcion = response?.body?.find(( val : any) => val?.orden == orden).label
        }

        setVisible(true);
        takenFile({ id: data.id, orden : orden, file: response?.assets[0], descripcion: descripcion, edit: 0, nameCard: nameCard });
      }
    });
  };

  const selectImage = async (item: any) => {
    const { orden, nameCard }= item;
    var isPowerMeter = nameCard == 'Spliter 1' || nameCard == 'Spliter 2' ? true : false;
    console.log(nameCard)
    if(item?.edit != 1) {
      const response = await verifyPhoto(item);
      if(response) return;
    }
    
    launchImageLibrary({ mediaType: 'photo', selectionLimit: 1 }, async (response) => {
        if (response?.assets) {
          var descripcion = "";

          if ( statusIA && statusNet && isPowerMeter ) descripcion = await getDescriptionIA(response?.assets[0]);
          
          if( !isPowerMeter && orden != '0') {
            const response = cardImg.find(( val : any) => val?.name == nameCard);
            descripcion = response?.body?.find(( val : any) => val?.orden == orden).label
          }
          
          setVisible(true);
          takenFile({ id: data.id, orden : orden, file: response?.assets[0], descripcion: descripcion, fechaFoto : new Date().toLocaleString(), edit: 0, nameCard: nameCard });
        }
    });
  };

  const getDescriptionIA = async (item: any) => {
    try {
      setLoading(true);
      const formData = new FormData();
      
      formData.append("file", {
        uri: item.uri,
        type: item.type,
        name: item.fileName,
      });
      
      const res: any = await sendImageIA(formData);
      setLoading(false);

      return typeof res?.data === "string" ? "" : res?.data;
    } catch (error: any) {
      setLoading(false);

      return "";
    }
  };
  
  const compareArchive = async (data: any) => {    
    try {
      const arrayImg = typeof data?.archivos === 'string' ? JSON.parse(data.archivos) : data?.archivos || [];
      const res = schemaRef.map((val: any) => {
        const body = val?.body?.map((item: any) => {
          const exists = arrayImg?.find((arch: any) => arch?.orden === item?.orden);
          
          return exists ? { ...item, descripcion: exists.descripcion } : item;
        });
        
        return { ...val, body };
      });
      
      setCardImg(res);
    } catch (error) {
      throw error;
    }
  };

  const verifyPhoto = async (item: any) => {
    if(data?.archivos != null && typeof data?.archivos == 'string'){
      var isPowerMeter = item?.nameCard == 'Spliter 1' || item?.nameCard == 'Spliter 2' ? true : false;

      const archivos = JSON.parse(data?.archivos);
      const response = archivos.find(( val : any ) => val?.orden == item?.orden);

      if(response != undefined && Object.keys(response).length > 0) {
        setVisible(true);
        var descripcion = response?.descripcion;
        if ( statusIA && statusNet && isPowerMeter ) descripcion = await getDescriptionIA(response?.assets[0]);

        var datos = { id: data.id, orden : response?.orden, file: response?.file, descripcion: descripcion, fechaFoto : response?.fechaFoto, nameCard: item?.nameCard, edit: 1 }
        takenFile(datos);
        return true
      }

      return false;
    } 
  }
  
  useEffect(() => {
    if(data) {
      compareArchive(data);
    }
  }, [data]);

  useEffect(() => {
    if(Object.keys(takeFotoAgain).length > 0){
      takePhoto(takeFotoAgain);
    }
  }, [ takeFotoAgain ])

  return (
    <View style={style.container}>

      {
        cardImg.filter(( val : any) => val?.name == 'Spliter 1' || val?.name == 'Spliter 2').length > 0 && (
          <View style={style.containerHeader}>
              <Text style={{fontWeight: 'bold', fontSize: 16}}>
                Rango -13.00 dBm a -20.00 dBm
              </Text>
          </View>
        )
      }

      {
        loading && 
        <View style={{ flexDirection : 'row', gap: 10, alignContent: 'center',justifyContent: 'center', alignItems: 'center', padding: 10 }}>
          <ActivityIndicator size={'large'} animating={loading} color={MD2Colors.blue400} />
          <Text style= {{ fontWeight: 'bold' }}>Cargando...</Text>
        </View>
      }

      {cardImg && !loading &&
        cardImg.map((item: any, index: any) => (
          <Card
            style={{paddingVertical: 10, marginVertical: 5}}
            key={index}>

            <Text style={{ paddingHorizontal: 10, paddingVertical: 2, fontSize: 18, fontWeight: 'bold' }}>{item?.name}</Text>

            {
              ['Spliter 1', 'Spliter 2'].includes(item?.name) && 
              <View style={style.spliterContent}>
                {wavelengths.map((wavelength, idx) => (
                  <Text
                    key={idx}
                    style={{
                      ...style.textSpliterHead,
                      color:
                        idx % 2 === 0
                          ? stylesDefault.green.color
                          : stylesDefault.purple.color,
                    }}>
                    {wavelength} nm
                  </Text>
                ))}
              </View>
            }

            <View style={style.spliterContent}>
              {item?.body &&
                item?.body.map((val: any) => (
                  <TouchableOpacity
                  key={val?.orden}
                  onPress={() => takePhoto({...val, nameCard: item?.name}) }
                  style={[
                    style.surface,
                    {
                      backgroundColor:
                        val?.orden % 2 === 0
                          ? stylesDefault.semiGreenBg.backgroundColor
                          : stylesDefault.semiPurpleBg.backgroundColor,
                      width: item?.name === 'Spliter 1' || item?.name === 'Spliter 2' ? '20%' : '40%'
                    },
                  ]}>
                    
                  {
                    val?.descripcion != "" && val?.orden != '0' && (
                      <Text style={style.textSpliterNumber}>
                        {item?.name === 'Spliter 1' || item?.name === 'Spliter 2' ? `${val.descripcion} dBm` : <Icon name="check" size={25} />}
                      </Text>
                    )
                  }

                  <Text style={style.textSpliterNumber}>{val.label}</Text>
                  </TouchableOpacity>
                ))}
            </View>
          </Card>
        ))}
    </View>
  );
}

const style = StyleSheet.create({
  container: { marginVertical: 5 },
  containerHeader: {
    ...stylesDefault.cyanLightBg,
    padding: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  surface: {
    height: 90,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
  },
  spliterContent: {
    gap: 2,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginVertical: 2,
  },
  spliterContentTwo: {
    gap: 3,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginVertical: 2,
  },

  textSpliterNumber: {fontSize: 15, fontWeight: 'bold', color: 'white', textAlign: 'center'},
  textSpliterHead: { fontWeight: 'bold', fontSize: 15 },
  textSpliter: { fontSize: 15, fontWeight: 'bold', color: 'white' }
});

export default BottomSheetContent
