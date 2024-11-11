import { useBearStore } from '../store/storet'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { saveTypeStatusLocal, saveUnitMeasurementLocal, saveTypeTrackLocal, saveEmpresaLocal, resetTables, saveMufaLocal, saveSubMufaLocal, saveTroncalLocal, saveNodoLocal, saveDetalleLocal, getAllDetalleLocal, getSubMufaLocal, getSubMufaAllLocal, getMufaLocal, getNodoLocal, getTroncalLocal  } from './dataBase'
import { getTypeStatusServer, getUnitMeasurementServer, getTypeTrackServer, getEmpresasServer, getMufasServer, getSubMufasServer, getTroncalServer, getNodoServer, getAllDetailsServer, getAllFilterUser } from './axios'

const sleep = (time:number) => new Promise((resolve:any) => setTimeout(() => resolve(), time));

export const evalDB = async () => {
  const sessionUser = await AsyncStorage.getItem("sessionUser");
  const idUsuario = sessionUser ?  JSON.parse(sessionUser)?.idUsuario : undefined;
  
  if(!useBearStore.getState().statusApp || useBearStore.getState().statusNet){
    
    resetTables("tipoEstado");
    resetTables("unidadMedida");
    resetTables("tipoVia");
    resetTables("empresa");
    // resetTables("troncal");
    // resetTables("nodo");
    // resetTables("mufa");
    // resetTables("subMufa");

    sleep(500);

    // Tipo estado
    const status = await getTypeStatusServer();
    status?.data?.forEach( async (val :any) => {
      if(val?.nombre == 'Pendiente' || val?.nombre == 'Procesado' || val?.nombre == 'Cancelado' ) {
        console.log(val)
        await saveTypeStatusLocal({ nombre: val?.nombre, item: val?._id, color: val?.color });
      }
    });

    // Unidad de medida
    const unit = await getUnitMeasurementServer();
    unit?.data?.forEach(async (val :any) => {
      saveUnitMeasurementLocal({ nombre: val?.nombre, item: val?._id })
    });

    // Tipo Via
    const track = await getTypeTrackServer();
    track?.data?.forEach(async (val :any) => {
      saveTypeTrackLocal({ nombre: val?.nombre, item: val?._id })
    });

    // Empresas
    const razonSociales = [ "WOW TEL S.A.C.", "ELECTRO SUR ESTE S.A.A." ];
    razonSociales.forEach( async ( item:any ) => {
      const result:any = await getEmpresasServer({ razonSocial : item });
      if( result ) {
        const { razonSocial, nombreComercial, ruc, _id } = result?.data;
        saveEmpresaLocal({ razonSocial : razonSocial, nombreComercial : nombreComercial, ruc : ruc, item: _id })
      }
    })


  }
}