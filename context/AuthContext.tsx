import React, { createContext, useContext, useEffect, useState } from 'react'
import { Alert } from 'react-native'
import { loginUser, logoutUser, verifyUser } from '../services/query/auth'
import { ToasterHelper } from 'react-native-customizable-toast'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { Session } from '../types/session'
import { useBearStore } from '../store/storet'
import { resetTables } from '../services/dataBase'
import { loadAllDataDownload } from '../services/download'

interface AuthProps {
  authState?: { token: string | null; authenticated: boolean | null; user:Session | null };
  onLogin?: (usuario:string, clave:string) => Promise<any>;
  onRegister?: (usuario:string, clave:string) => Promise<any>;
  onLogout?: (id:string | undefined) => Promise<any>;
  onVerify?: () => Promise<any>,
  onLoading?: boolean
}

const AuthContext  = createContext<AuthProps>({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if(!context){
    throw new Error("useAuth must be used withim an AuthProvider")
  }
  return context;
}

export const AuthProvider = ({ children }: any ) => {
  const { token: tokenSession, setToken, sessionUser, setSessionUser, removeSessionUser, removeToken, statusNet, statusApp } = useBearStore()
  const [user, setUser] = useState<any>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  const verify = async () => {

    const token = await AsyncStorage.getItem('token');
    if(!token){
      setIsAuthenticated(false)
      setLoading(false);
      return setUser(null); 
    }
    
    if(!statusNet || statusApp){
      const user = await AsyncStorage.getItem("sessionUser");
      if(user){
        setUser(JSON.parse(user));
        setIsAuthenticated(true);
      }else{
        setIsAuthenticated(false);
      }
      setLoading(false);
      return;
    }

    try {
      const res = await verifyUser({ token: token })
      if(!res.data){
        removeSessionUser();
        removeToken();
        setIsAuthenticated(false)
        setLoading(false);
        return;
      }
      setIsAuthenticated(true)
      setUser(res.data)
      setSessionUser(res.data);
    } catch (error) {
      setIsAuthenticated(false);
      removeSessionUser();
      removeToken();
    }finally{
      setLoading(false);
    }

  }

  const logout = async ( id:string | undefined, session: boolean = true ) => {
    await logoutUser({ idUsuario: id || user?.idUsuario })
    if(session){
      resetTables("troncal");
      resetTables("nodo");
      resetTables("mufa");
      resetTables("subMufa");
      resetTables("detalle");
      setIsAuthenticated(false);
      setUser(null);
      removeSessionUser();
      removeToken();
    }else{
      ToasterHelper.show({ text: "Sesión cerrada", type: "success", timeout: 5000 })
    }
  }

  const login = async ( usuario:string, clave:string ) => {
    try {
      const res = await loginUser(usuario, clave);
      if(res.data){
        const { token } = res.data;
        await loadAllDataDownload(res.data?.idUsuario)
        await AsyncStorage.setItem('token', token)
        setToken(token)
        setIsAuthenticated(true)
        setUser(res.data)
        setSessionUser(res.data);
       
      }
    } catch (error:any) {
      if (error.response) {
        if(error.response.data.message){
          var txtError = error.response.data.message
          if(txtError.includes("Sesión activa en otro dispositivo")){
            var palabrasEnmarcadas:any = txtError.match(/<<([^<>]+)>>/g);
            var id = palabrasEnmarcadas[0].slice(2, -2);
            Alert.alert("Sesión activa en otro dispositivo..!", "¿Desea cerrar la sesión en el otro dispositivo anterior..?", [
              { text: "No", style: "cancel" },
              { text: "Si", style: "default", onPress: () => logout(id, false)}
            ])
            return;
          }
          // ToasterHelper.show({ text: txtError, type: "error", timeout: 5000 })
        }
        console.log("El status es:", error.response.status); // Código de estado HTTP
        console.log("Los headers son:", error.response.headers); // Headers de la respuesta
      } else if (error.request) {
        // ToasterHelper.show({ text: JSON.stringify(error.request), type: "error", timeout: 5000 })
        console.log("No se recibió respuesta, el error es:", error.request);
      } else {
        // ToasterHelper.show({ text: JSON.stringify(error.message), type: "error", timeout: 5000 })
        console.log("Error al hacer la solicitud:", error.message);
      }
      console.log("Config de la solicitud:", error.config);
    } finally  {
      setLoading(false);
    }
    //setIsAuthenticated(true);
  }

  const value: AuthProps = {
    authState: { authenticated: isAuthenticated, token: user?.token || "", user: user },
    onLogin: login,
    onLogout: logout,
    onVerify: verify,
    onLoading: loading
  }
  
  useEffect(() => {
    verify();
  },[])


  return (
    <AuthContext.Provider value={value}>
      { children }
    </AuthContext.Provider>
  )
  
}

