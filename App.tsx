import React, { useState, useEffect } from 'react';
import { Colors } from 'react-native/Libraries/NewAppScreen'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { Alert, SafeAreaView, ScrollView, StatusBar, useColorScheme, RefreshControl, View, Text } from 'react-native'
import { PaperProvider, MD3LightTheme as DefaultTheme, MD3DarkTheme as DarkTheme } from 'react-native-paper'
import NetInfo from '@react-native-community/netinfo';
import { AuthProvider } from './context/AuthContext';
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { Toaster } from 'react-native-customizable-toast'

import Loading from './screens/LoadingFirst'
import ProtectedScreen from './screens/Stacks/ProtectecScreen'
import BackgroundService from 'react-native-background-actions'
import { evalDB } from './services/backup'
import { requestAndCheckPermissions, requestOneByOne, checkOneByOne } from './services/permissionsService'
import { useBearStore } from './store/storet';
import { initDB } from './services/dataBase';
import { taskService } from './services/backgroundTask'

function App(): React.JSX.Element {
  const { setMode, mode, setStatusNet, setStatusApp, statusApp, statusNet, setEnvAuto } = useBearStore();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const isDarkMode = mode == 'dark';
  const backgroundStyle = { backgroundColor: isDarkMode ? Colors.dark : Colors.lighter, flex: 1 };
  
  const load = async () => {
    setRefreshing(true);
    try {
      //const valid = await requestAndCheckPermissions();
      await checkOneByOne()

      const existing :any = await initDB();
      if(existing || existing >= 0 || existing.length >= 0 ){
        setLoading(false);
        return;
      }

      setLoading(true);
    } catch (error) {
      Alert.alert("Error", JSON.stringify(error) )
    } finally {
      setRefreshing(false);
    }
  }

  const searchMode = async () => {
    // Deteniendo todo por si acaso...
    await BackgroundService.stop();
    
    const modes = await AsyncStorage.getItem("mode");
    const modes2 = await AsyncStorage.getItem("net");
    const modes3 = await AsyncStorage.getItem("auto");

    modes ? setMode(modes) : setMode("light");
    modes2 ? setStatusApp(JSON.parse(modes2)) : setStatusApp(false);
    modes3 ? setEnvAuto(JSON.parse(modes3)) : setEnvAuto(false);

    /* if(modes3 && JSON.parse(modes3)){
      if(!BackgroundService.isRunning()){
        taskService();
      }
    } */
  }

  const theme = {
    ...isDarkMode ? DarkTheme : DefaultTheme,
    colors: isDarkMode ? DarkTheme.colors : DefaultTheme.colors,
  };

  const syncData = async () => {
    const state = await NetInfo.fetch();
    if (state.isConnected) {
      setStatusNet(true);
    }else{
      setStatusNet(false);
    }
  };

  const startSyncing = () => {
    NetInfo.addEventListener(state => {
      if (state.isConnected) {
        syncData();
      }
    });
  };

  const loaderData = async () => {
    if(!statusApp || statusNet){
      evalDB();
    }
  }

  useEffect(() => {
    load(); // PERMISOS - DB
    loaderData(); // Tables from Server
    searchMode(); // MODE - NET - AUTO ENVIO
    startSyncing(); // NET - SERVICE
  }, [])

  if(loading){
    return (
      <ScrollView contentContainerStyle={{ flex: 1, justifyContent: 'center', alignContent: 'center'}}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={load} />
        }
      >
        <Loading />
      </ScrollView>
    )
  }
  
  return (
    <PaperProvider theme={theme}>
      <GestureHandlerRootView style={{flex: 1}}>
        <SafeAreaView style={backgroundStyle}>
          <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} backgroundColor={backgroundStyle.backgroundColor} />
            <AuthProvider>
              {
                (statusApp) && (
                  <Text style={{ textAlign: "center", padding: 5, backgroundColor: "#CCC", fontWeight: "900" }}>MODO SIN CONEXIÓN</Text>
                )
              }
              <ProtectedScreen />  
              <Toaster />
            </AuthProvider>
        </SafeAreaView>
      </GestureHandlerRootView>
    </PaperProvider>
  );
}

export default App;
