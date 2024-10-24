import React, { useState, useRef, useMemo, useEffect, useCallback } from 'react'
import { View, useColorScheme, Linking, ScrollView, Alert } from 'react-native'
import { Button, Avatar, List, Divider, Switch, Text, Modal, Portal, Badge, ActivityIndicator } from 'react-native-paper'
import Layout from '../components/Layout'
import Icon from 'react-native-vector-icons/FontAwesome';
import {Colors} from 'react-native/Libraries/NewAppScreen';
import { useAuth } from '../context/AuthContext'
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import { openSettings} from 'react-native-permissions'
import Styles from './style'
import { onDisplayNotification } from '../services/notification'
import { useBearStore } from '../store/storet';
import { getAllDetalleLocal, getTypeStatusLocal, updateDetalleLocal,updateDetalleArchivos } from '../services/dataBase'
import { addFilePoste, updateFilePoste, registerDetails, registerFileDetails, updateDetailsData } from '../services/axios'
import BackgroundService, { BackgroundTaskOptions } from 'react-native-background-actions'
import { taskService } from '../services/backgroundTask'
import { dropTables, initDB } from '../services/dataBase'
import Tables from '../services/Schemas.json'
import AsyncStorage from '@react-native-async-storage/async-storage'

import ListTables from './DownloadTables/ListTables'
import { useFocusEffect } from '@react-navigation/native';
import { filtrarDatos } from '../components/Functions';

const Settings = () => {
  const { setMode, setStatusApp, mode, statusApp, envAuto, setEnvAuto, setStatusIA, statusIA, statusNet, statusDirection, setStatusDirection } = useBearStore();
  const isDarkMode = mode === 'dark';
  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ['65%'], []);
  const [modalTable, setModalTable] = useState(false);
  const [countReg, setCountReg] = useState(0);
  const [btnSheet, setBtnSheet] = useState({ view: false, type: "" })
  const { authState, onLogout, onLogin } = useAuth();
  const [loadReg, setLoadReg] = useState(false);

  const support = async () => {
    await Linking.openURL("https://api.whatsapp.com/send/?phone=%2B51952394025&text=Hola+VAMAS&type=phone_number&app_absent=0");
  }

  const closeBottomSheet = () => {
    setBtnSheet({ view: false, type: "" })
    bottomSheetRef.current?.forceClose();;
  };

  const openBottomSheet = (type: string) => {
    setBtnSheet({ view: true, type: type });

    bottomSheetRef.current?.expand();
  }

  const deleteAllDB = async () => {
    for(const table of Tables){
      await dropTables(table.name);
    }

    const existing:any = await initDB();
    if(existing || existing >= 0 || existing.length >= 0 ){
      Alert.alert("Listo..!", "Tablas eliminadas y reseteadas..." )
    }else{
      Alert.alert("Error", "No se pudo eliminar las tablas..." )
    }
  }

  // Background Task
  const initTask = async () => {
    setEnvAuto(!Boolean(envAuto))
    if(envAuto){
      console.log("Detenido.............................................................................................................");
      await BackgroundService.stop();
    }else{
      console.log("Corriendo...");
      taskService();
    }
  }

  const enviarReg = async () => {
    
    const token = await AsyncStorage.getItem("token");
    if(statusNet && token){

      const detalles:any = await getAllDetalleLocal();
      const tipoEstados:any = await getTypeStatusLocal();

      var successItems = 0;
      var successFiles = 0;
      var errorItems = 0;
      var errorFiles = 0;
      
      if(detalles.length > 0){
        setLoadReg(true);
        for(const det of detalles){
  
          // Sin enviar
          if(det.enviado == 0){
            var data = {
              ...det,
              codInterno: det.nombre || null,
              enviado: 0,
              editado : 0
            };

            delete data.id;
            const formData = new FormData();
            formData.append("data", JSON.stringify(data));
        
            data.idTipoEstado = tipoEstados.find((val: any) => val.nombre === 'Pendiente').item;
            
            const res = await registerDetails(data.idMufa, data.idSubMufa, formData);
            
            if(res?.data){
              await updateDetalleLocal({ "item": res?.data?._id, "enviado": 1 }, det.id);
  
              var files = JSON.parse(data?.archivos) || [];
              if(files.length > 0){
                for(const file of files){
                  var filesOld:any = [];
                  if(file.enviado == 0){
                    const formFile = new FormData();
                    formFile.append("data", JSON.stringify(file));
                    formFile.append("file", file?.file);
                    const fileRest = await registerFileDetails(res?.data?._id, formFile);
                    if(fileRest && fileRest?.data){
                      successFiles++;
                      filesOld.push({...file, enviado: 1});
                      await updateDetalleArchivos(JSON.stringify(filesOld), det.id)
                      // Eliminar imagenes
                    }else{
                      errorFiles++;
                    }
                  }else{
                    filesOld.push(file);
                  }
                }
              }
              
              successItems++;
              // Posible limpieza de archivos...
            }else{
              errorItems++;
            }
  
          }else if(det.enviado == 1 && det.editado == 1 ){
            const archivos : any = det.archivos;
            const idDetalle = det.id;
            const idDetalleServer = det.item;

            delete det.id
            delete det.item
            delete det.archivos

            const newData = filtrarDatos(det);

            const formData = new FormData();
            formData.append("data", JSON.stringify(newData));

            const res = await updateDetailsData(idDetalleServer, formData);

            if(res?.data){
              // Actualiza el detalle y actualiza o reemplaza imagenes
              let filesData: any = typeof archivos === 'string' ? JSON.parse(archivos) : [];
    
              const archivo = filesData.filter(( value : any ) => value?.enviado == 0);
              
              if( archivo.length > 0) {
                for (const arch of archivo) {
                  // Validar solo las imágenes que estén en enviado == 0
                  if (arch.enviado === 0) {
                    const formData = new FormData();
                    formData.append('data', JSON.stringify(arch));
                    formData.append('file', arch?.file);
    
                    // Enviar archivo al backend y verificar respuesta
                    const response = await registerFileDetails(idDetalleServer, formData);
    
                    if (response) {
                      filesData = filesData.map((val: any) => {
                        if (val?.orden === arch.orden) {
                          return {...val, enviado: 1};
                        }
                        return val;
                      });
    
                      // Actualizar la base de datos local con los archivos modificados
                      await updateDetalleLocal(
                        {archivos: JSON.stringify(filesData)},
                        idDetalle,
                      );
                      successFiles++;
                    }else{
                      errorFiles++;
                    }
    
                    // Verificar si todos los archivos tienen enviado == 1
                    const allSent = filesData.every(
                      (file: any) => file.enviado === 1,
                    );
    
                    if (allSent) {
                      // Si todos los archivos están enviados, cambiar el estado de 'editado' a 0
                      await updateDetalleLocal( { editado: 0 }, idDetalle);
                    }
                  }
                }
              }
              successItems ++;
            }else{
              errorItems ++;
            }
          }else{
            continue;
          }
        }
      
        if(successItems > 0 || errorItems > 0) onDisplayNotification(`Se enviaron ${successItems} registros. <br/> Fallaron ${errorItems} registros.`)
        if(successFiles > 0 || errorFiles > 0) onDisplayNotification(`Se enviaron ${successFiles} archivos. <br/> Fallaron en enviar ${errorFiles}.`)
        counterReg();
        setLoadReg(false);
      }
    }

  }

  const counterReg = async () => {
    var count = 0;
    const detalles:any = await getAllDetalleLocal();

    for(const det of detalles){
      if(det.enviado == 0){
        count ++;
      }else if(det.enviado == 1 && det.editado == 1 ){
        count ++;
      }
    }

    setCountReg(count)

  }

  useEffect(() => {
    if(!envAuto){
      const stopTask = async () => {
        await BackgroundService.stop();
      }
      stopTask();
    }
    counterReg();
  }, [envAuto])

  useFocusEffect(
    useCallback(() => {
      counterReg();
    }, [])
  )

  return (
    <Layout centered mode='column'> 
      <View style={{ display: "flex", flexDirection: "column", marginTop: 5, alignItems: "center", gap: authState?.authenticated ? 2 : 8 }}>
        {
          authState?.authenticated ? (
            <>
              <Avatar.Icon size={75} icon={() => <Icon name="user" style={{padding: 0, margin: 0}} size={40} color="white" />} style={{ backgroundColor: Styles.purple.color }}/>
              <Text style={{ fontWeight: "bold", fontSize: 17 }}>{authState.user?.usuario}</Text>
              <Text>{authState.user?.rol}</Text>
            </>
          ) : (
            <>
              <Avatar.Icon size={75} icon={() => <Icon name="user" style={{padding: 0, margin: 0}} size={40} color="white" />} style={{ backgroundColor: Styles.purple.color }}/>
              <Button mode='contained-tonal' style={{ backgroundColor: Styles.purple.color }} textColor='white'>Recarga</Button>
            </>
          )
        }
      </View>
      <ScrollView>
        <List.Section style={{ width: "100%", marginTop: 10, paddingHorizontal: 10, paddingVertical: 10 }}>
          {
            authState?.authenticated && (
              <>
                {
                  (authState.user?.roles && authState.user.roles.length > 0) && authState.user.roles.map((rol:any) => (
                    <List.Item 
                      title={rol.idRol.nombre}
                      description="Cambiar rol" 
                      left={() =>
                        <Avatar.Icon size={40} style={{ backgroundColor: "transparent" }} icon={() => <Icon name="user-o" size={20} color={Styles.purple.color} /> }/> 
                      }
                      right={() =>
                        <Avatar.Icon size={40} style={{ backgroundColor: "transparent" }} icon={() => <Icon name="chevron-right" size={15} color={isDarkMode ? "white" : "dark"}/> }/> 
                      }
                      onPress={() => {}}
                    />
                  ))
                }

                <Divider bold />
                {/* <List.Item 
                  title="Editar Perfil" 
                  left={() =>
                    <Avatar.Icon size={40} style={{ backgroundColor: "#3E1054" }} icon={() => <Icon name="heart" size={20} color="white"/> }/> 
                  }
                  right={() =>
                    <Avatar.Icon size={40} style={{ backgroundColor: "transparent" }} icon={() => <Icon name="chevron-right" size={15} color={isDarkMode ? "white" : "dark"}/> }/> 
                  }
                  onPress={() => console.log("Holla")}
                /> */}
              </>
            )
          }
          <List.Item 
            title="Modo sin conexión"
            description="Utilizar datos almacenados"  
            left={() =>
              <Avatar.Icon size={40} style={{ backgroundColor: Styles.purple.color }} icon={() => <Icon name="wifi" size={20} color="white"/> }/> 
            }
            right={() =>
              <Switch value={Boolean(statusApp)} disabled/> 
            }
            onPress={() => setStatusApp(!Boolean(statusApp))}
          />
          {/* <List.Item 
            title="Envío automático"
            description="Enviar automáticamente los registros al servidor"  
            left={() =>
              <Avatar.Icon size={40} style={{ backgroundColor: Styles.purple.color }} icon={() => <Icon name="clock-o" size={20} color="white"/> }/> 
            }
            right={() =>
              <Switch value={Boolean(envAuto)} disabled/> 
            }
            onPress={() => initTask()}
          /> */}
          <List.Item 
            title="Consulta con IA"
            description="Validación con Inteligencia Artificial."  
            left={() =>
              <Avatar.Icon size={40} style={{ backgroundColor: Styles.purple.color }} icon={() => <Icon name="linode" size={20} color="white"/> }/> 
            }
            right={() =>
              <Switch value={Boolean(statusIA)} onChange={() => setStatusIA(!Boolean(statusIA))} disabled/> 
            }
            onPress={() => setStatusIA(!Boolean(statusIA))}
          />
          <List.Item 
            title="Consultar dirección"
            description="Obtener la ubicación del mapa."  
            left={() =>
              <Avatar.Icon size={40} style={{ backgroundColor: Styles.purple.color }} icon={() => <Icon name="map-pin" size={20} color="white"/> }/> 
            }
            right={() =>
              <Switch value={Boolean(statusDirection)} onChange={() => setStatusDirection(!Boolean(statusDirection))} disabled/> 
            }
            onPress={() => setStatusDirection(!Boolean(statusDirection))}
          />
          <List.Item 
            title="Modo oscuro"
            description="Cambiar el tema de la interfaz" 
            left={() =>
              <Avatar.Icon size={40} style={{ backgroundColor: Styles.purple.color }} icon={() => <Icon name="adjust" size={20} color="white"/> }/> 
            }
            right={() =>
              <Switch value={mode == "dark" ? true : false} disabled /> 
            }
            onPress={() => setMode(mode == "dark" ? "light" : "dark")}
          />
          <Divider bold/>
          <List.Item 
            title="Soporte"
            description="Contactar al equipo de soporte" 
            left={() =>
              <Avatar.Icon size={40} style={{ backgroundColor: Styles.purple.color }} icon={() => <Icon name="headphones" size={20} color="white"/> }/> 
            }
            right={() =>
              <Avatar.Icon size={40} style={{ backgroundColor: "transparent" }} icon={() => <Icon name="chevron-right" size={15} color={isDarkMode ? "white" : "gray"}/> }/> 
            }
            onPress={() =>  support()}
          />
          <List.Item 
            title="Borrar datos guardados"
            description="Eliminar los datos del dispositivo"  
            left={() =>
              <Avatar.Icon size={40} style={{ backgroundColor: Styles.purple.color }} icon={() => <Icon name="trash" size={20} color="white"/> }/> 
            }
            right={() =>
              <Avatar.Icon size={40} style={{ backgroundColor: "transparent" }} icon={() => <Icon name="chevron-right" size={15} color={isDarkMode ? "white" : "gray"}/> }/> 
            }
            onPress={() => openBottomSheet("Delete")}
          />
          {/* <List.Item 
            title="Editar datos"
            description="Descarga o configura lo guardado"  
            left={() =>
              <Avatar.Icon size={40} style={{ backgroundColor: Styles.purple.color }} icon={() => <Icon name="download" size={20} color="white"/> }/> 
            }
            right={() =>
              <Avatar.Icon size={40} style={{ backgroundColor: "transparent" }} icon={() => <Icon name="chevron-right" size={15} color={isDarkMode ? "white" : "gray"}/> }/> 
            }
            onPress={() => setModalTable(true) }
          /> */}
          <List.Item 
            title="Envíos disponibles"
            description="Enviar registros al servidor"  
            left={() =>
              <>
                <Avatar.Icon size={40} style={{ backgroundColor: Styles.purple.color }} icon={() => <Icon name="clock-o" size={20} color="white"/> }/> 
                { 
                  countReg > 0 && (
                    <Badge visible={true} style={{ position: "absolute", top: -3, left: 27 }}>{countReg}</Badge>
                  )
                } 
              </>
            }
            right={() => 
              <>
                {
                  loadReg ? (
                    <ActivityIndicator animating color={isDarkMode ? "white" : "gray"} />
                  ) : (
                    <Avatar.Icon size={40} style={{ backgroundColor: "transparent" }} icon={() => <Icon name="chevron-right" size={15} color={isDarkMode ? "white" : "gray"}/> }/> 
                  )
                }
              </>
            }
            onPress={() => enviarReg()}
          />
          <List.Item 
            title="Versión" 
            description="0.1.2"
            left={() =>
              <Avatar.Icon size={40} style={{ backgroundColor: Styles.purple.color }} icon={() => <Icon name="info" size={20} color="white"/> }/> 
            }
            onPress={() => onDisplayNotification("Hola")}
          />

        </List.Section>
        {
          authState?.authenticated && (
            <View style={{ display: "flex", paddingHorizontal: 25, marginBottom: 10}}>
              <Button mode='contained-tonal' style={{ backgroundColor: Styles.purple.color }} textColor='white' onPress={() => onLogout && onLogout(authState?.user?.idUsuario) } icon={() => <Icon name="sign-out" size={20} color="white" /> }>Cerrar Sesión</Button>
            </View>
          )
        }

        {
          btnSheet.view && (
            <BottomSheet
              ref={bottomSheetRef}
              snapPoints={snapPoints}
              enablePanDownToClose
              onClose={closeBottomSheet}
              backgroundStyle={{
                backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
              }}
            >
              <BottomSheetView>
                {
                  btnSheet.type == "Delete" && (
                    <View style={{ alignContent: "center", justifyContent: "center", paddingHorizontal: 15, paddingVertical: 10 }}>
                      <Text style={{ fontWeight: "bold", textAlign: "center", fontSize: 18, marginBottom: 10 }}>Borrar datos</Text>
                      <Divider bold/>
                      <View style={{ alignContent: "center", justifyContent: "center", borderWidth: 0.5, borderColor: isDarkMode ? "#fff" : "#000", marginVertical: 17, padding: 5, flexDirection: "row", display: "flex", gap: 7, borderRadius: 10 }}>
                        <View style={{ alignContent: "center", alignItems: "center", justifyContent: "center", width: "7%" }}>
                          <Icon name="exclamation-circle" size={20} color={isDarkMode ? "#fff" : "#000"}/>
                        </View>
                        <Text style={{ fontSize: 12, width: "87%"  }}>
                          Se va a eliminar solamente la Base de datos local guardada en tu dispositivo. 
                          Si en caso quieras borrar los datos del almacenamiento o la caché del aplicativo deberías hacerlo manualmente en la sección "Almacenamiento".
                          Esto a su vez, hará que deba iniciar sesión nuevamente.
                        </Text>
                      </View>
                      <Divider bold/>
                      <Button mode='text' onPress={() => openSettings()}>Abrir configuración</Button>
                      <Text style={{ fontSize: 12  }}>
                        Las siguientes acciones borrarán los datos almacenados en el aplicativo, excluyendo su sesión y otras configuraciones
                        en la aplicación.
                      </Text>
                      <View style={{ display: "flex", flexDirection: "row", gap: 10, justifyContent: "center", marginTop: 17 }}>
                        <Button mode='contained-tonal' style={{ width: "50%", backgroundColor: Styles.gray.color }} textColor="white" onPress={closeBottomSheet}>Cancelar</Button>
                        <Button mode='contained-tonal' style={{ width: "50%", backgroundColor: Styles.purple.color}} textColor='white' onPress={deleteAllDB}>Eliminar</Button>
                      </View>
                    </View>
                  )
                }
                {
                  btnSheet.type == "Support" && (
                    <View style={{ alignContent: "center", justifyContent: "center", paddingHorizontal: 15, paddingVertical: 10 }}>

                    </View>
                  )
                }
                {
                  btnSheet.type == "" && (
                    <View></View>
                  )
                }
              </BottomSheetView>
            </BottomSheet>
          )
        }
      </ScrollView>
      <Portal>
        <Modal visible={modalTable} style={{ padding: 20, height: "100%"}} >
          <View style={{
            margin: 5,
            backgroundColor: isDarkMode ? Colors.darker : Colors.lighter ,
            borderRadius: 20,
            padding: 20,
            justifyContent: 'center',
            alignContent: 'center',
            height: "100%"
          }}>
            <ListTables />
            <View>
              <Button mode='contained-tonal' style={{ backgroundColor: Styles.gray.color }} textColor="white" onPress={() => setModalTable(false) }>Cerrar</Button>
            </View>
          </View>
        </Modal>
      </Portal>
    </Layout>
  )
}

export default Settings