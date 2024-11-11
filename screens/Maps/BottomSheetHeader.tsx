import React, { useEffect, useMemo, useRef, useState } from 'react'
import { StyleSheet, TouchableOpacity, View } from 'react-native'
import { Badge, HelperText, IconButton, Text, TextInput } from 'react-native-paper'
import stylesDefault from '../style'
import { getEmpresaLocal, getOneMufa, getOneNodo, getOneSubMufa, getOneTroncal, getSubMufaAllLocal, getSubMufaLocal, getTroncalLocal, getTypeStatusLocal } from '../../services/dataBase';
import { Controller, useForm } from 'react-hook-form';
import { Picker } from '@react-native-picker/picker';
import Icon from 'react-native-vector-icons/FontAwesome';

interface Props {
  data : any;
  openStatus : any; 
  dataRegister? : any;
  onClose: any;
}

type DataForm = {
  codInterno? : string;
  altura? : string;
  nivelTension? : string;
  idPropietario? : string;
}

const BottomSheetHeader = (props : Props) => {
  const { handleSubmit, control, formState: {errors}, getValues, setValue, watch } = useForm<DataForm>();
  const { data, openStatus, dataRegister, onClose } = props;
  const [dataTypeStatus, setDataTypeStatus] = useState<any>([]);
  const [ empresas, setEmpresas ] = useState<any>([]);
  const [ prefix, setPrefix ] = useState<any>([]);

  const getTypeStatus = async () => {
    const response:any = await getTypeStatusLocal();
    if(response) {
      const result = response.find(( val : any) => val?.item == data?.idTipoEstado);
      setDataTypeStatus(result)
    }
  };

  const getEmpresas = async () => {
    const res: any = await getEmpresaLocal();

    setEmpresas(res);
  }

  const save = () => {
    handleSubmit(onSubmit)();
  };

  const setPrefixHeader = async ( data : any ) => {
    var idSubMufa = data?.idSubMufa;
    const responseSubMufa : any = await getOneSubMufa(idSubMufa);
    const responseMufa: any = await getOneMufa(responseSubMufa?.idMufa);
    const responseNodo: any = await getOneNodo(responseMufa?.idNodo);
    const responseTroncal: any = await getOneTroncal(responseNodo?.idTroncal);

    const prefix = `${responseTroncal?.distrito ? responseTroncal?.distrito + '/ ' : ''} ${responseTroncal?.nombre} / ${responseNodo?.nombre} / ${responseMufa?.nombre} / ${responseSubMufa?.nombre}`;
    setPrefix(prefix)
  }

  const onSubmit = async () => {
    const data = getValues();
    dataRegister(data);
    openStatus(true)
  }

  useEffect(() => {
    if( data ) {
      setPrefixHeader( data ) ;
      getTypeStatus();
      getEmpresas();
      setValue('altura', data?.alto);
      setValue('nivelTension', data?.nivelTension);
      setValue('codInterno', data?.codInterno);
      setValue('idPropietario', data?.idPropietario);
    }
  }, [data]);

  return (
    <View>
      <View style= {{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'}}>
        <Text numberOfLines={2} ellipsizeMode="tail">{ prefix }</Text>
        <IconButton
          icon={() => <Icon name="close" color={'gray'} size={20}  />}
          onPress={onClose}
        />
      </View>
      <View
        style={{
          flexDirection: 'row',
          alignContent: 'center',
          alignItems: 'center',
          gap: 5,
        }}>
        <Text style={style.title}>{data?.nombre}</Text>
          <TouchableOpacity activeOpacity={0.5} style={{ flexDirection: 'row', marginLeft: 8, alignItems: 'center', alignContent:'center' }} onPress={save}>
            <Text style={[style.textProcess, {color: dataTypeStatus?.color}]}>
              {dataTypeStatus?.nombre}
            </Text>
            <Icon name="chevron-down" color={dataTypeStatus?.color} size={12}  />
          </TouchableOpacity>
      </View>
      <View style={{flexDirection: 'row'}}>
        <Text style={style.textCoordinate}>
          <Text style={{fontWeight: 'bold'}}>Lat:</Text> {data?.latitud || '-'}
        </Text>
        <Text style={style.textCoordinate}>
          <Text style={{fontWeight: 'bold'}}>Long:</Text> {data?.longitud || '-'}
        </Text>
      </View>

      {
        data?.tipo == 'POSTE' && 
          <View style={ { gap: 5, marginVertical: 5 } }>
            <View style={ style.containerTextInput }>
              <Picker
                selectedValue={watch('idPropietario')}
                mode='dropdown'
                onValueChange={itemValue => setValue('idPropietario', itemValue)}>
                <Picker.Item label="Seleccionar" value="" />
                {empresas &&
                  empresas?.map((val: any) => (
                    <Picker.Item
                      key={val?.item}
                      label={val?.razonSocial}
                      value={val?.item}
                    />
                  ))}
              </Picker>
            </View>

            <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
              <View style={{...style.containerTextInput, width: '50%'}}>
                <Controller
                  name="altura"
                  control={control}
                  render={({field: {onChange, onBlur, value}}) => (
                    <TextInput
                      dense
                      onBlur={onBlur}
                      onChangeText={onChange}
                      error={Boolean(errors?.altura)}
                      placeholder="Altura"
                      mode="outlined"
                      value={value}
                    />
                  )}
                />
                {errors?.altura && (
                  <HelperText type="error">{errors.altura.message}</HelperText>
                )}
              </View>
              <View style={{...style.containerTextInput, width: '50%'}}>
                <Controller
                  name="nivelTension"
                  control={control}
                  render={({field: {onChange, onBlur, value}}) => (
                    <TextInput
                      dense
                      onBlur={onBlur}
                      onChangeText={onChange}
                      error={Boolean(errors?.altura)}
                      placeholder="Nivel de Tensión"
                      mode="outlined"
                      value={value}
                    />
                  )}
                />
                {errors?.nivelTension && (
                  <HelperText type="error">
                    {errors.nivelTension.message}
                  </HelperText>
                )}
              </View>
            </View>
            
            <View style={style.containerTextInput}>
              <Controller
                name="codInterno"
                control={control}
                render={({field: {onChange, onBlur, value}}) => (
                  <TextInput
                    onBlur={onBlur}
                    dense
                    onChangeText={onChange}
                    error={Boolean(errors?.codInterno)}
                    placeholder="Código Interno"
                    mode="outlined"
                    value={value}
                  />
                )}
              />
              {errors?.codInterno && (
                <HelperText type="error">{errors.codInterno.message}</HelperText>
              )}
            </View>
          </View>
      }
    </View>
  );
};

const style = StyleSheet.create({
  colorBox: {
    width: 12,
    height: 12,
    borderRadius: 12,
    marginRight: 5,
  },
  containerTextInput: {
    marginVertical: 2,
  },
  textProcess: {
    textTransform: 'capitalize',
    fontWeight: 'bold',
    marginHorizontal: 6,
    fontSize: 20,
  },
  title: {
    fontWeight: 'bold',
    textTransform: 'capitalize',
    fontSize: 25,
  },
  textCoordinate: {
    fontSize: 15,
    marginRight: 8
  }
})

export default BottomSheetHeader
