import React, { useEffect, useState, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { Text, Switch, IconButton, Button } from 'react-native-paper';
import stylesDefault from '../style';
import { fetchAllTables, saveTypeStatusLocal, getTypeStatusLocal, saveTypeTrackLocal, resetTables, saveUnitMeasurementLocal, dropTables, saveTroncalLocal, saveEmpresaLocal, saveSubMufaLocal, saveMufaLocal, saveNodoLocal } from '../../services/dataBase';
import Icon from 'react-native-vector-icons/FontAwesome';
import { getEmpresasServer, getMufasServer, getNodoServer, getSubMufasServer, getTroncalServer, getTypeStatusServer, getTypeTrackServer, getUnitMeasurementServer, getAllFilterUser } from '../../services/axios';
import { useBearStore } from '../../store/storet';
import { Colors } from 'react-native/Libraries/NewAppScreen';

const ListTables = () => {
  const { mode, sessionUser } = useBearStore();
  const isDarkMode = mode === 'dark';
  const [switches, setSwitches] = useState<any>([]);
  const [selectedAll, setSelectedAll] = useState(false);

  const idUsuario = sessionUser ?  JSON.parse("sessionUser")?.idUsuario : undefined;

  const getTables = async () => {
    const res = await fetchAllTables();
    const newRes = res.reduce((acc : any, val, index) => {
      const mappings :any = {
        tipoEstado: 'Tipo de estados',
        unidadMedida: 'Unidad de Medida',
        tipoVia: 'Tipo de vías',
        troncal: 'Carpeta',
        nodo: 'Subcarpeta',
        empresa: 'Empresas',
        folder: 'Folder',
        detalle: 'Detalle',
        mufa: 'Categoría',
        subMufa: 'Subcategoria',
      };

      if (mappings[val]) {
        acc.push({ table: val, id: index, value: false, nombreGenerico: mappings[val]});
      }
      return acc;
    }, []);

    setSwitches(newRes);
  };

  const selectAllTables = () => {
    setSwitches(switches.map((item:any) => ({ ...item, value: !selectedAll })));
    setSelectedAll(!selectedAll);
  };

  const toggleSwitch = (id :any) => {
    setSwitches((prevSwitches:any) =>
      prevSwitches.map((item:any) => (item.id === id ? { ...item, value: !item.value } : item))
    );
  };

  // Tipo de estado
  const setTypeStatusLocal = async () => {
    try {
      const res = await getTypeStatusServer();
      const result = await res?.data?.map(async (val :any) => {
        saveTypeStatusLocal({
          nombre: val?.nombre,
          item: val?._id,
          color: val?.color
        })
      });
    } catch (error) {
      console.error('Error setting type status:', error);
    }
  };

  // Tipo de via
  const setTypeTrackLocal = async () => {
    try {
      const res = await getTypeTrackServer();
      const result = await res?.data?.map(async (val :any) => {
        saveTypeTrackLocal({
          nombre: val?.nombre,
          item: val?._id
        })
      });
    } catch (error) {
      console.error('Error setting:', error);
    }
  };
  
  // Unidad de medida
  const setUnitMeasurementLocal = async () => {
    try {
      const res = await getUnitMeasurementServer();
      const result = await res?.data?.map(async (val :any) => {
        saveUnitMeasurementLocal({
          nombre: val?.nombre,
          item: val?._id
        })
      });
    } catch (error) {
      console.error('Error setting:', error);
    }
  };

  // Empresas
  const setEmpresaLocal = async () => {

    const razonSociales = [
      "MANRIQUE SALDAÑA JORGE LUIS",
      "METAL JHORKAS S.A.C.",
      "JOTA DEV S.A.C.",
      "Festín Fast S.A.C."
    ];

    razonSociales.map( async ( item:any ) => {
      const result : any= await getEmpresasServer({ razonSocial : item });

      if( result ) {
        const { razonSocial, nombreComercial, ruc, _id } = result?.data;
        saveEmpresaLocal({
          razonSocial : razonSocial,
          nombreComercial : nombreComercial,
          ruc : ruc,
          item: _id
        })
      }

    })
  }

  // Troncal
  const setTroncalLocal = async () => {
    const res = await getAllFilterUser({ idUsuario: idUsuario, type: "TRONCAL"});
    const result = await res?.data?.map(async (val :any) => {
      await saveTroncalLocal({
        codInterno: val?.codInterno,
        nombre: val?.nombre,
        idEmpresa: val?.idEmpresa,
        idSede: val?.idSede,
        distrito: val?.idDistrito?.nombre,
        idTipoEstado: val?.idTipoEstado,
        item: val?._id
      })
    });
  }

  const setNodoLocal = async () => {
    const res = await getAllFilterUser({ idUsuario: idUsuario, type: "NODO" });
    const result = await res?.data?.map(async (val :any) => {
      await saveNodoLocal({
        codInterno: val?.codInterno,
        nombre: val?.nombre,
        idTroncal: val?.idTroncal,
        idTipoEstado: val?.idTipoEstado,
        item: val?._id
      })
    });
  }


  // Submufas
  const setSubMufaLocal = async () => {
    const res = await getAllFilterUser({ idUsuario: idUsuario, type: "SUBMUFA" });
    const result = await res?.data?.map(async (val :any) => {
      await saveSubMufaLocal({
        codInterno: val?.codInterno,
        nombre: val?.nombreSubMufa,
        idMufa: val?.idMufa,
        idTipoEstado: val?.idTipoEstado,
        item: val?._id
      })
    });  
  }

  // Mufas
  const setMufasLocal = async () => {
    try {
      const res = await getAllFilterUser({ idUsuario: idUsuario, type: "MUFA" });
      
      const result = await res?.data?.map(async (val :any) => {
        await saveMufaLocal({
          codInterno: val?.codInterno,
          nombre: val?.nombre,
          idTipoEstado: val?.idTipoEstado,
          idNodo: val?.idNodo,
          item: val?._id
        })
      }); 
    } catch (error) {
      console.error('Error setting type status:', error);
    }
  };

  const downloadData = async () => {
    switches.map(( item : any ) => {
      if(item?.value) {
        if(item?.table == 'tipoEstado') setTypeStatusLocal();
        if(item?.table == 'tipoVia') setTypeTrackLocal();
        if(item?.table == 'unidadMedida') setUnitMeasurementLocal();
        if(item?.table == 'troncal') setTroncalLocal();
        if(item?.table == 'nodo') setNodoLocal();
        if(item?.table == 'empresa') setEmpresaLocal();
        if(item?.table == 'mufa') setMufasLocal();
        if(item?.table == 'subMufa') setSubMufaLocal();
      }
    })
  };

  const deleteData = async () => {
    switches.map(async ( item : any ) => {
      if(item?.value) {
        await dropTables(item?.table);
      }
    })
  }

  useEffect(() => {
    getTables();
  }, []);

  return (
    <View style={[style.container, { backgroundColor: isDarkMode ? Colors.darker : Colors.lighter }]}>
      <View style={style.containerHeader}>
        <Text style={stylesDefault.subtitles}>Descargar datos</Text>
        <View style={style.containerIconHeader}>
          <IconButton
            icon={() => (
              <Icon name={selectedAll ? "check-square-o" : "square-o"} size={15} color={isDarkMode ? "#FFF" : "#000"} />
            )}
            size={15}
            onPress={selectAllTables}
          />
          <Text style={{ textAlign: "center", alignItems: "center"}}>Todo</Text>
        </View>
      </View>
      {switches.map((item :any) => (
        <View style={style.containerList} key={item?.id}>
          <View style={style.switch}>
            <Switch
              trackColor={{ false: '#767577', true: stylesDefault.purpleLight.color }}
              thumbColor={item?.value ? stylesDefault.purple.color : '#f4f3f4'}
              onValueChange={() => toggleSwitch(item?.id)}
              value={item?.value}
            />
            <Text style={style.text}>{item?.nombreGenerico}</Text>
          </View>
        </View>
      ))}
      <View style={{ display: "flex", flexDirection: "column", gap: 10, justifyContent: "center", marginTop: 20, padding: 10 }}>
        <Button onPress={downloadData} mode='contained-tonal' style={{ backgroundColor: stylesDefault.green.color }} textColor='white'>Descargar</Button>  
        <Button onPress={deleteData} mode='contained-tonal' style={{ backgroundColor: stylesDefault.purple.color }} textColor='white' >Eliminar datos</Button>
      </View>

    </View>
  );
};

const style = StyleSheet.create({
  container: {
    flex: 1,
    margin: 10,
    padding: 15,
    gap: 4,
  },
  containerList: {
    flexDirection: 'row',
    paddingVertical: 5,
    alignItems: 'center',
  },
  containerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 10,
  },
  containerIconHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    display: "flex"
  },
  text: {
    marginHorizontal: 8,
    fontSize: 17,
    fontWeight: '100',
  },
  switch: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
});

export default ListTables;
