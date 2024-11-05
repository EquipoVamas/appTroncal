import React, { useState } from 'react'
import { View, Text, Image, Dimensions } from 'react-native'
import { Button, TextInput, Checkbox, HelperText, Snackbar } from 'react-native-paper'
import Layout from '../../components/Layout'
import Icon from 'react-native-vector-icons/FontAwesome';
import { useForm, Controller } from 'react-hook-form'
import { useNavigation, NavigationProp } from '@react-navigation/native'
import { useAuth } from '../../context/AuthContext'

import Loader from '../LoadingScreen'

import Styles from '../style'
import { useBearStore } from '../../store/storet';
import { Colors } from 'react-native/Libraries/NewAppScreen';

interface dataLogin {
  usuario: string;
  clave: string;
}

const Login = () => {
  const { statusApp, statusNet } = useBearStore();

  const modes = useBearStore((state) => state.mode)
  const isDarkMode = modes === 'dark';
  const navigation = useNavigation<NavigationProp<any>>();
  const [lockPass, setLockPass] = useState(false);
  const [remember, setRemember] = useState(false);
  const { authState, onLogin, onLoading } = useAuth();
  const { control, handleSubmit, setValue, formState: { errors }, reset, watch } = useForm<dataLogin>()
  const widthL = Math.round(Dimensions.get("window").width - 50)
  const [visibleSnackBar, setVisibleSnackBar] = useState(false);

  const startLogin = async (data:dataLogin) => {
    if( statusNet ) {
      onLogin && onLogin(data.usuario, data.clave);
    }else {
      onToggleSnackBar();

      setTimeout(() => {
        onDismissSnackBar()
      }, 1500);
    }
  }

  const onToggleSnackBar = () => setVisibleSnackBar(!visibleSnackBar);

  const onDismissSnackBar = () => {
    setTimeout(() => {
      setVisibleSnackBar(false)
    }, 1000)
  };

  if(onLoading){
    return <Loader />
  }

  return (
    <Layout centered mode='column'>
      <View style={{ display: "flex", alignItems: "center"}}>
        <Image
          style={{ width: widthL , height: 150, objectFit: "contain" }}
          source={ require('../../assets/SEMI.png') }
        />
      </View>
      <Controller 
        name="usuario"
        control={control}
        rules={{ required: { message: "El usuario es requerido", value: true } }}
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput 
            value={value}
            mode='outlined' 
            label="Usuario"
            style={{ marginHorizontal: 15 }}
            onChangeText={onChange}
            onBlur={onBlur}
            error={Boolean(errors?.usuario)} 
            left={<TextInput.Icon icon={() => <Icon name="user" size={20} color={isDarkMode ? "white": "black"}/>}/>} 
          />
        )}
      />
      {
        errors?.usuario && <HelperText type='error'>{errors?.usuario?.message}</HelperText>
      }
      <Controller 
        name="clave"
        control={control}
        rules={{ required: { message: "La clave es requerida", value: true } }}
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput 
            mode='outlined' 
            label="Contraseña"
            value={value}
            style={{ marginHorizontal: 15, marginTop: 10 }}
            secureTextEntry={!lockPass}
            onChangeText={onChange}
            onBlur={onBlur}
            error={Boolean(errors?.clave)}  
            left={ <TextInput.Icon icon={() => <Icon name="lock" size={20} color={isDarkMode ? "white": "black"} />}/> } 
            right={<TextInput.Icon icon={()=> <Icon name={lockPass ? 'eye-slash' : 'eye'} size={20} color={isDarkMode ? "white": "black"} />} onPress={() => setLockPass(!lockPass) } />} 
          />
        )}
      />
      {
        errors?.clave && <HelperText type='error'>{errors.clave.message}</HelperText>
      }

     {/*  <Button mode='text'  onPress={() => console.log("Recuperar...") } >¡Olvidé mi contraseña!</Button> */}
      <Button mode='contained-tonal' onPress={handleSubmit(startLogin)} style={{ backgroundColor: Styles.color_primary.color, marginTop: 20, marginHorizontal: 15 }} textColor='white' >Continuar</Button>
      <Text style={{ marginTop: 55, textAlign: "center" }} >v 0.1.1</Text>
      <View style={{
          justifyContent: 'space-between',
        }}>
        <Snackbar
          visible={visibleSnackBar}
          onDismiss={() => setVisibleSnackBar(false)}
          elevation={3}
          style= {{  backgroundColor: isDarkMode ? Colors.darker : Colors.lighter }}
          action={{
            label: 'Cerrar',
            onPress: () => {
              onDismissSnackBar();
            },
          }}>
          <Text style={ { fontSize: 18 } }>Para iniciar sesión necesita conectarse a una red de internet.</Text>
        </Snackbar>
      </View>
    </Layout>
  )
}

export default Login