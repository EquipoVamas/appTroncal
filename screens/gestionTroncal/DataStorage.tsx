import React, { useCallback, useEffect, useState } from 'react'
import { View, Dimensions, StyleSheet } from 'react-native'
import { Text, IconButton, MD3Colors, ProgressBar } from 'react-native-paper'
import Layout from '../../components/Layout';
import Icon from 'react-native-vector-icons/FontAwesome'
import stylesDefault from '../style';
import { useAuth } from '../../context/AuthContext';
import { getFolderServer } from '../../services/axios';
import { NavigationProp, useFocusEffect, useNavigation } from '@react-navigation/native';
import { getAllDetalleLocal, getTypeStatusLocal, getPosteLocal, getTroncalLocal, getNodoLocal, getMufaLocal, getSubMufaAllLocal } from '../../services/dataBase'
const { height } = Dimensions.get('window');

const DataStorage = () => {
  const navigation = useNavigation<NavigationProp<any>>();
  const [ postes, setPostes ] = useState([]);
  const [ calculate, setCalculate ] = useState<any>({});
  const { authState, onLogout, onLogin } = useAuth();
  const [loading, setLoading] = useState(false);
  const [ folders, setFolders ] = useState([]);
  const [countReg, setCountReg] = useState({ total: 0, pendiente: 0, procesado: 0});
  const [listTables, setListTables] = useState({ troncal: 0, nodo: 0, mufa: 0, submufa: 0, detalle: 0 });

  const getPostes = async () => {

    setLoading(true);
    const res:any = await getPosteLocal();

    if(res) {

      setPostes(res);
      calculatePercentage(res)
      setLoading(false);
    }

  }

  const getFoldersServer = async ( ) => {
    const res: any = await getFolderServer({});
    setFolders(res?.data?.data);
  }

  const sendFolders = async () => {
    // folders.map ( async ( value : any) => {
    //   const res : any = await saveFoldersLocal(value);
    // })
    // const result = await getFoldersSearchPrefixLocal('', 5);
  }

  const redirectionFolders = async ( slash : number = 1) => {
    // folders.map ( async ( value : any) => {
    //   const res : any = await saveFoldersLocal(value);
    // })
    navigation.navigate('Gestión de Archivos' , { numSlash: slash });

    // const result = await getFoldersSearchPrefixLocal('', slash);
  }

  const calculatePercentage = (data: any) => {
    const calculateNoSaveServer = data.filter((value: any) => value.editado == 1);
    const countTotal = data.length;
    const countSend = calculateNoSaveServer.length;

    let total = 0;
    if (countTotal > 0 && countSend > 0) {
      total = parseFloat(countSend) / parseFloat(countTotal);
    }
  
    const result = { countTotal, countSend, total };
    setCalculate(result);
  };

  const counterReg = async () => {
    var countT = 0;
    var countP = 0;
    var countPR = 0;
    const estados:any = await getTypeStatusLocal();
    const detalles:any = await getAllDetalleLocal();
    const troncales:any = await getTroncalLocal();
    const nodos:any = await getNodoLocal();
    const mufas:any = await getMufaLocal();
    const submufas:any = await getSubMufaAllLocal();
    const estProd = await estados.find((tp:any) => tp.nombre == "Procesado");
    const estPend = await estados.find((tp:any) => tp.nombre == "Pendiente");
    
    countT = detalles.length;
    
    for(const det of detalles){
      const idTE = det?.idTipoEstado;
      if(idTE == estPend.item){
        countP++
      }else if(idTE == estProd.item){
        countPR++
      }
    }

    setCountReg({ total: countT, pendiente: countP, procesado: countPR})
    setListTables({ detalle: detalles.length || 0, mufa: mufas.length || 0, nodo: nodos.length || 0, submufa: submufas.length || 0, troncal: troncales.length || 0})
  }
  
  useFocusEffect(
    useCallback(() => {
      counterReg()
    }, [])
  );

  return (
    <Layout mode="column" pullRefresh={getPostes} loading={loading}>
      <View style={[style.container]}>
        
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', alignContent: 'center' }}>
          <Text style= {{ fontSize: 23, fontWeight: '700', marginBottom: 10 }}> Hola, { authState?.user?.usuario } </Text>
          <IconButton
            icon={() => <Icon name="refresh" color={stylesDefault.gray.color} size={15} />}
            size={15}
            style={{...style.iconDesign}}
            onPress={counterReg}
          />
        </View>

        <Text style= {{ fontSize: 15, fontWeight: '700' }}> Tareas procesadas : {( (countReg.procesado / (countReg.pendiente + countReg.procesado)) * 100).toFixed(2)} % ({ countReg.procesado }/{countReg.pendiente + countReg.procesado})</Text>
        <ProgressBar progress={ (countReg.procesado / (countReg.pendiente + countReg.procesado))  || 0} color={stylesDefault.purpleLight.color} style={{ height: 10, shadowRadius: 30 }}/>

        <Text style={[style.subtitle]}>Categorías</Text>

        <View style={[style.containerIcons]}>
          <IconButton
            icon={() => <Icon name="archive" size={35} color={stylesDefault.green.color} />}
            size={50}
            style={{...stylesDefault.greenLightBg, ...style.iconDesign}} // daf6c9
            onPress={() => redirectionFolders(1)}
          />
          <View style={style.containerIconsText}>
            <Text style={[style.textIcons]}>Carpeta</Text>
            <Text style={{ ...stylesDefault.gray, ...style.textIcons }}>{listTables.troncal}</Text>
          </View>
        </View>

        <View style={[style.containerIcons]}>
          <IconButton
            icon={() => <Icon name="image" size={35} color={stylesDefault.cyan.color}/>}
            size={50}
            style={{...stylesDefault.cyanLightBg, ...style.iconDesign}}
            onPress={() => console.log('Pressed')}
          />
          <View style={style.containerIconsText}>
            <Text style={[style.textIcons]}>Subcarpeta</Text>
            <Text style={{ ...stylesDefault.gray, ...style.textIcons }}>{listTables.nodo}</Text>
          </View>
        </View>

        <View style={[style.containerIcons]}>
          <IconButton
            icon={() => <Icon name="video-camera" color={stylesDefault.red.color} size={35} />}
            size={50}
            style={{...stylesDefault.redLightBg, ...style.iconDesign}}
            onPress={() => console.log('Pressed')}
          />
          <View style={style.containerIconsText}>
            <Text style={[style.textIcons]}>Categoría</Text>
            <Text style={{ ...stylesDefault.gray, ...style.textIcons }}>{listTables.mufa}</Text>
          </View>
        </View>

        <View style={[style.containerIcons]}>
          <IconButton
            icon={() => <Icon name="spinner" size={35} color={stylesDefault.orange.color} />}
            size={50}
            style={{...stylesDefault.orangeLightBg, ...style.iconDesign}}
            onPress={() => console.log('Pressed')}
          />
          <View style={style.containerIconsText}>
            <Text style={[style.textIcons]}>Subcategoría</Text>
            <Text style={{ ...stylesDefault.gray, ...style.textIcons }}>{listTables.submufa}</Text>
          </View>
        </View>

        <View style={[style.containerIcons]}>
          <IconButton
            icon={() => <Icon name="plus" size={35} color={stylesDefault.purple.color} />}
            size={50}
            style={{...stylesDefault.purpleLightBg, ...style.iconDesign}}
            onPress={() => console.log('Pressed')}
          />
          <View style={style.containerIconsText}>
            <Text style={[style.textIcons]}>Detalle</Text>
            <Text style={{ ...stylesDefault.gray, ...style.textIcons }}>{listTables.detalle}</Text>
          </View>
        </View>
        
      </View>
    </Layout>
  );
}

const style = StyleSheet.create({
  container: {
    margin: 20,
    padding: 20,
    borderRadius: 30,
    height: height * 0.90,
    borderColor: '#ffff',
    borderWidth: 3,
    // backgroundColor: '#ffff',
    gap: 3
  },
  subtitle: {
    fontSize: 23,
    fontWeight: '700',
    fontFamily: 'Cochin',
    padding: 10
  },
  containerIcons: {
    flexDirection: 'row',
    margin: 3,
    padding: 10,
    // borderColor: '#eeeeee',
    // backgroundColor: '#f7f7f7',
    borderWidth: 1,
    borderRadius: 20,
  },
  containerIconsText: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    width: '75%' 
  },
  textIcons: {
    margin: 10,
    fontSize: 18,
    fontWeight:  '100'
  },
  iconDesign: {
    borderRadius: 20
  }
})

export default DataStorage
