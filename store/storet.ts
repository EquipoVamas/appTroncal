import { create } from 'zustand'
import socket from '../services/socketConfig'
import AsyncStorage from '@react-native-async-storage/async-storage'

interface BearState {
    // Envío Automático
    envAuto: Boolean;
    setEnvAuto: (by:Boolean) => void;
    // Internet - Service
    statusNet: Boolean;
    setStatusNet: (by:Boolean) => void;
    // Internet - APP
    statusApp: Boolean;
    setStatusApp: (by:Boolean) => void;
    // Internet - APP
    statusIA: Boolean;
    setStatusIA: (by:Boolean) => void;
    // Dirección - API
    statusDirection: Boolean;
    setStatusDirection: (by:Boolean) => void;
    // DB
    statusDB: Boolean;
    setStatusDB: (by:Boolean) => void;
    // Modo
    mode: "dark" | "light";
    setMode: (by:any) => void;
    // Socket
    emitSocket: any;
    initSocket: () => void;
    sendSocket: (by:any) => void;
    // Session
    token: any,
    setToken: (by:any) => void;
    removeToken: () => void;
    sessionUser: any,
    setSessionUser: (by:any) => void;
    removeSessionUser: () => void;
}


export const useBearStore = create<BearState>()( (set) => ({
    // Envío Automático
    envAuto: false,
    setEnvAuto: async (by) => {
        set(() => ({ envAuto: by }));
        await AsyncStorage.setItem("auto", JSON.stringify(by))
    },
    // Internet - Service
    statusNet: false,
    setStatusNet: (by) => set(() => ({ statusNet:  by})),
    // Internet - APP
    statusApp: false,
    setStatusApp: async (by) => {
        set(() => ({ statusApp: by }));
        await AsyncStorage.setItem("net", JSON.stringify(by))
    },
    statusIA: false,
    setStatusIA: (by) => set(() => ({ statusIA: by })),
    // Internet - APP
    statusDirection: false,
    setStatusDirection: async (by) => {
        set(() => ({ statusDirection: by }));
        await AsyncStorage.setItem("statusDirection", JSON.stringify(by))
    },
    // Modo
    mode: "light",
    setMode: async (by) => {
        set(() => ({ mode: by }));
        const modes = await AsyncStorage.getItem("mode");
        if(modes !== by) await AsyncStorage.setItem("mode", by);
    },
    // DB
    statusDB: false,
    setStatusDB: (by) => set(() => ({ statusNet:  by})),
    // Socket
    emitSocket: null,
    initSocket: async () => { 
        socket.on('evento_vamas', (res) => { 
            set( () => ({ emitSocket: res} ))
        })
    },
    sendSocket: (by) => {
        socket.emit('evento_vamas', by)
    },
    // Session
    token: "",
    setToken: async (by) => {
        set(() => ({ token: by }));
        await AsyncStorage.setItem("token", by)
    },
    removeToken: async () => {
        set(() => ({ token: "" }));
        const stats = await AsyncStorage.getItem("token");
        if(stats) await AsyncStorage.removeItem("token");
    },
    sessionUser: "",
    setSessionUser: async (by) => {
        set(() => ({ sessionUser: by }));
        await AsyncStorage.setItem("sessionUser", JSON.stringify(by))
    },
    removeSessionUser: async () => {
        set(() => ({ sessionUser: "" }));
        const stats = await AsyncStorage.getItem("sessionUser");
        if(stats) await AsyncStorage.removeItem("sessionUser");
    }
}))