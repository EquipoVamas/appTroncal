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

    // Troncal
    //const troncalServer = await getTroncalServer();
    const troncalServer = await getAllFilterUser({ idUsuario: idUsuario, type: "TRONCAL"});
    const troncalLocal : any = await getTroncalLocal();
    console.log("Troncal ------------------")
    troncalServer?.data?.forEach(async (val :any) => {
      const resultExist = troncalLocal.find(( item : any ) => val?._id == item?.item);

      if(!resultExist) {
        console.log(val)

        saveTroncalLocal({ codInterno: val?.codInterno, nombre: val?.nombre, idTipoEstado: val?.idTipoEstado, item: val?._id, distrito: val?.idDistrito?.nombre })
        console.log(val?.nombre)
      }
    }); 

    // Nodo
    //const nodoServer = await getNodoServer();
    const nodoServer = await getAllFilterUser({ idUsuario: idUsuario, type: "NODO" });
    const nodoLocal :any = await getNodoLocal();
    console.log("Nodo ------------------")
    nodoServer?.data?.forEach(async (val :any) => {
      const resultExist = nodoLocal.find(( item : any ) => val?._id == item?.item);
      if(!resultExist) {
        saveNodoLocal({ codInterno: val?.codInterno, nombre: val?.nombre, idTipoEstado: val?.idTipoEstado, item: val?._id, idTroncal: val?.idTroncal })
        console.log(val?.nombre)
      }
    }); 

    // Mufa
    //const mufasServer = await getMufasServer();
    const mufasServer = await getAllFilterUser({ idUsuario: idUsuario, type: "MUFA"});
    const mufasLocal : any = await getMufaLocal();
    console.log("Mufa ------------------")
    mufasServer?.data?.forEach(async (val :any) => {
      const resultExist = mufasLocal.find(( item : any ) => val?._id == item?.item);
      if(!resultExist) {
        saveMufaLocal({ codInterno: val?.codInterno, nombre: val?.nombre, idTipoEstado: val?.idTipoEstado, item: val?._id, idNodo: val?.idNodo })
        console.log(val?.nombre)
      }
    });

    // Submufa
    console.log("SubMufa ------------------")
    //const subMufaServer = await getSubMufasServer();
    const subMufaServer = await getAllFilterUser({ idUsuario: idUsuario, type: "SUBMUFA"});
    console.log("Del servidor", subMufaServer?.data);
    const subMufaLocal : any = await getSubMufaAllLocal();
    subMufaServer?.data?.forEach(async (val :any) => {
      const resultExist = subMufaLocal.find(( item : any ) => val?._id == item?.item);
      if(!resultExist) {
        saveSubMufaLocal({ codInterno: val?.codInterno, nombre: val?.nombreSubMufa, idMufa: val?.idMufa, idTipoEstado: val?.idTipoEstado, item: val?._id })
        console.log(val?.nombreSubMufa)
      }
    });

    // Detalle
    const setNewData = (item: any) => {
      let newFiles : any = [];
      if(Array.isArray(item?.archivos) && item?.archivos.length > 0 )  {
        var files : any[] = item?.archivos
         newFiles = files.map(( val :any) => {
          return {
            descripcion: val?.descripcion,
            orden: val?.orden,
            latitud: val?.latitud,
            longitud: val?.longitud,
            enviado: 1, // Ya està en el back
            modificado: 0, // su orden no fue modificado
            file: {
              uri: val?.url,
              nombre: val?.nombre,
              ext: val?.ext,
              type: val?.type
            }
          }
        })
      }
      
      return {
        bool: 0,
        codInterno: item?.codInterno || null,
        codigo: item?.codigo || null,
        idProducto: item?.idProducto || null,
        nombre: item?.nombre || null,
        tipo: item?.tipo || null,
        estado: item?.estado || null,
        cantidadInicial: item?.cantidadInicial || null,
        cantidadReferencia: item?.cantidadReferencia || null,
        cantidadFinal: item?.cantidadFinal || null,
        precio: item?.precio || null,
        idTipoVia: item?.idTipoVia || null,
        ladoVia: item?.ladoVia || null,
        nombreVia: item?.nombreVia || null,
        lote: item?.lote || null,
        direccion: item?.direccion || null,
        latitud: item?.latitud || null,
        longitud: item?.longitud || null,
        apoyo: item?.apoyo || null,
        idPropietario: item?.idPropietario || null,
        propietario: item?.propietario || null,
        idUsuario: item?.idUsuario || null,
        nivelTension: item?.nivelTension || null,
        idUnidadMedidaAlto: item?.idUnidadMedidaAlto || null,
        alto: item?.alto || null,
        idUnidadMedidaAncho: item?.idUnidadMedidaAncho || null,
        ancho: item?.ancho || null,
        item: item?._id,
        idMufa: item?.idMufa || null,
        idSubMufa: item?.idSubMufa || null,
        idTipoEstado: item?.idTipoEstado || null,
        enviado: 1,
        editado: 0,
        especificaciones: Array.isArray(item?.especificaciones) && item?.especificaciones.length > 0 ? item?.especificaciones : null,
        materiales:  Array.isArray(item?.materiales) && item?.materiales.length > 0 ? item?.materiales : null,
        referencias: Array.isArray(item?.referencias) && item?.referencias.length > 0 ? item?.referencias : null,
        archivos: Array.isArray(item?.archivos) && item?.archivos.length > 0 ? JSON.stringify(newFiles) : null,
      };
    };

    //const detailsServer = await getAllDetailsServer({});
    const detailsServer = await getAllFilterUser({ idUsuario: idUsuario, type: "DETALLE"});
    const detailsLocal : any = await getAllDetalleLocal();
    console.log("Detalle ------------------")
    detailsServer?.data?.forEach(async (val :any) => {
      const resultExist = detailsLocal.find(( item : any ) => val?._id == item?.item);
      if(!resultExist) {
        saveDetalleLocal(setNewData(val));
        console.log(setNewData(val))
        console.log("------------------------------------")
      }
    });
  }
}