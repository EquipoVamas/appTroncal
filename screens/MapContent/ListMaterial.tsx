import React, { useState } from 'react'
import { StyleSheet, View } from 'react-native'
import { DataTable, IconButton, Text, Dialog, Portal, TextInput, Snackbar, Button } from 'react-native-paper'
import Icon from 'react-native-vector-icons/FontAwesome';
import stylesDefault from '../style';
import { Picker } from '@react-native-picker/picker';
import { Dropdown } from 'react-native-paper-dropdown';
import { red200 } from 'react-native-paper/lib/typescript/styles/themes/v2/colors';
import { ScrollView } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native';

const ListMaterial = ( {  } : any) => {
  const [gender, setGender] = useState<string>();
  const [ materiales, setMateriales ] = useState<any>([]);

  const productos = [
    { label: 'Iphone 15', value: 'Iphone 15', item: 1, cantidad: 1 },
    { label: 'Antena 5G', value: 'Antena 5G', item: 2, cantidad: 1 },
    { label: 'CELAR 15 PRO MAX', value: 'CELAR 15 PRO MAX', item: 3, cantidad: 1 },
    { label: 'Laptop GX500', value: 'Laptop GX500', item: 4, cantidad: 1 },
    { label: 'Smartwatch Z4', value: 'Smartwatch Z4', item: 5, cantidad: 1 },
    { label: 'Teclado Mecánico RGB', value: 'Teclado Mecánico RGB', item: 6, cantidad: 1 },
    { label: 'Monitor UltraWide', value: 'Monitor UltraWide', item: 7, cantidad: 1 },
    { label: 'Drone X Pro', value: 'Drone X Pro', item: 8, cantidad: 1 }
  ];
  
  const handleAddData = (e : any) => {
    const res = productos.find((val:any) => val?.value == e);

    const exists = materiales.find(( val : any) => val?.item == res?.item)
    
    if(exists) {
      return;
    }
    
    setGender(e);
    setMateriales([...materiales, res])
  }

  const onChangeCantidad = (e:any, value: any) => {
    setMateriales((prevValue: any) => {
      return prevValue.map((val: any) =>
          val.item === value.item
              ? { ...val, cantidad: value.cantidad, evidencia: e ? e : 0 }
              : val
      );
    });
  }

  const onHandleDelete = (itemToDelete: any) => {
    setMateriales((prevValue: any) => {
      return prevValue.filter((val: any) => val.item !== itemToDelete.item);
    });
  };
  
  const handleSubmit = () => {

  }

  return (
    <SafeAreaView style={{flex: 4, flexDirection: 'column'}}>
      <View style={style.containerPicker}>
        <Dropdown
          label="Productos"
          options={productos}
          value={gender}
          onSelect={handleAddData}
          menuUpIcon={<Icon name="trash" size={10} />}
          menuDownIcon={<Icon name="trash" size={10} />}
          mode="outlined"
          hideMenuHeader
        />
      </View>

      <ScrollView   
        style= {{ flex: 2}}
        activeCursor="all-scroll">
        <DataTable>
          <DataTable.Header>
            <DataTable.Title style={[style.centerTable, {flex: 4.5}]}>
              <Text style={style.textTable}>Producto</Text>
            </DataTable.Title>
            <DataTable.Title style={[style.centerTable, {flex: 3.5}]}>
              <Text style={style.textTable}>Cantidad</Text>
            </DataTable.Title>
            <DataTable.Title style={[style.centerTable, {flex: 2}]}>
              <Text style={style.textTable}>Acciones</Text>
            </DataTable.Title>
          </DataTable.Header>

          {materiales &&
            materiales.length > 0 &&
            materiales.map((value: any) => (
              <DataTable.Row key={value?.item}>
                <DataTable.Cell style={[style.centerTable, {flex: 4.5}]}>
                  {value?.label}
                </DataTable.Cell>
                <DataTable.Cell style={[style.centerTable, {flex: 3.5}]}>
                  <TextInput
                    style={{margin: 4}}
                    defaultValue="1"
                    dense
                    keyboardType="numeric"
                    mode="outlined"
                    onChangeText={e => onChangeCantidad(e, value)}
                  />
                </DataTable.Cell>
                <DataTable.Cell style={[style.centerTable, {flex: 2}]}>
                  <Icon
                    name="close"
                    color={stylesDefault.red.color}
                    size={15}
                    onPress={() => onHandleDelete(value)}
                  />
                </DataTable.Cell>
              </DataTable.Row>
            ))}
        </DataTable>
      </ScrollView>

      <View style={{ flex: 1, justifyContent: 'flex-end', marginVertical: 10}}>
        <Button mode='contained-tonal' onPress={handleSubmit}>
          Guardar
        </Button>
      </View>
    </SafeAreaView>
  );
}

const style = StyleSheet.create({
  centerTable: {
    justifyContent: 'center',
    alignItems: 'center'
  },
  textTable: {
    fontWeight: 'bold'
  },
  buttonAdd : { 
    flex: 1, 
    marginHorizontal: 10,
    justifyContent: 'flex-end', 
    alignItems: 'flex-end'
  },
  iconDesign: {
    borderRadius: 40,
    margin: 5,
    backgroundColor: stylesDefault.blueBg.backgroundColor,
  },
  containerPicker: {
    flex: 1,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: '#0000',
    backgroundColor: '#0000',
    borderRadius: 10,
  },
  picker: {
    marginVertical: 10,
  },
  container: {
    flex: 1,
    justifyContent: 'space-between',
  },
  textNotify: {
    color: '#ffff'
  }
})

export default ListMaterial
