import { useEffect, useState} from 'react'
import { View, Text } from 'react-native'
import NetInfo from '@react-native-community/netinfo';
import { useBearStore } from '../store/storet'

const NetworthService = () => {
  const netWorth = useBearStore((state) => state.statusNet)
  const { setStatusNet } = useBearStore();

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

  useEffect(() => {
    startSyncing();
  }, [])

  return (
    <Text style={{ color: netWorth ? "#69A42F" : "#3E1054" }}>{ netWorth ? "Conectado" : "Desconectado" }</Text>
  )
}

export default NetworthService
