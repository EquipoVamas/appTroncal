import { getAllFilterUser } from "./axios";
import { getAllDetalleLocal, getMufaLocal, getNodoLocal, getSubMufaAllLocal, getTroncalLocal, saveDetalleLocal, saveMufaLocal, saveNodoLocal, saveSubMufaLocal, saveTroncalLocal } from "./dataBase";

// Generic save function for different types
const saveDataByType = async (type : any, idUsuario : any, localDataFunc: any, saveLocalFunc: any, dataMapper: any) => {
  const serverData = await getAllFilterUser({ idUsuario, type });
  const localData = await localDataFunc();
  console.log(`${type} ------------------`);
  
  serverData?.data?.forEach(async (val: any) => {
    const resultExist = localData.find((item: any) => val?._id === item?.item);
    if (!resultExist) {
      saveLocalFunc(dataMapper(val));
      console.log(val?.nombre || val?.nombreSubMufa || val?.nombre); // Adjust logging based on field
    }
  });
};

// Data mapper functions for each type
const troncalMapper = (val: any) => ({
  codInterno: val?.codInterno,
  nombre: val?.nombre,
  idTipoEstado: val?.idTipoEstado,
  item: val?._id,
  distrito: val?.idDistrito?.nombre,
});

const nodoMapper = (val: any) => ({
  codInterno: val?.codInterno,
  nombre: val?.nombre,
  idTipoEstado: val?.idTipoEstado,
  item: val?._id,
  idTroncal: val?.idTroncal,
});

const mufaMapper = (val: any) => ({
  codInterno: val?.codInterno,
  nombre: val?.nombre,
  idTipoEstado: val?.idTipoEstado,
  item: val?._id,
  idNodo: val?.idNodo,
});

const subMufaMapper = (val : any) => ({
  codInterno: val?.codInterno,
  nombre: val?.nombreSubMufa,
  idMufa: val?.idMufa,
  idTipoEstado: val?.idTipoEstado,
  item: val?._id,
});

const detalleMapper = (val : any) => {
  let newFiles = [];
  if (Array.isArray(val?.archivos) && val?.archivos.length > 0) {
    newFiles = val?.archivos.map((file : any) => ({
      descripcion: file?.descripcion,
      fechaFoto: file?.fechaFoto || null,
      orden: file?.orden,
      latitud: file?.latitud,
      longitud: file?.longitud,
      enviado: 1,
      modificado: 0,
      file: {
        uri: file?.url,
        nombre: file?.nombre,
        ext: file?.ext,
        type: file?.type,
      },
    }));
  }
  return {
    bool: 0,
    codInterno: val?.codInterno || null,
    codigo: val?.codigo || null,
    idProducto: val?.idProducto || null,
    nombre: val?.nombre || null,
    tipo: val?.tipo || null,
    estado: val?.estado || null,
    cantidadInicial: val?.cantidadInicial || null,
    cantidadReferencia: val?.cantidadReferencia || null,
    cantidadFinal: val?.cantidadFinal || null,
    precio: val?.precio || null,
    idTipoVia: val?.idTipoVia || null,
    ladoVia: val?.ladoVia || null,
    nombreVia: val?.nombreVia || null,
    lote: val?.lote || null,
    direccion: val?.direccion || null,
    latitud: val?.latitud || null,
    longitud: val?.longitud || null,
    apoyo: val?.apoyo || null,
    idPropietario: val?.idPropietario || null,
    propietario: val?.propietario || null,
    idUsuario: val?.idUsuario || null,
    nivelTension: val?.nivelTension || null,
    idUnidadMedidaAlto: val?.idUnidadMedidaAlto || null,
    alto: val?.alto || null,
    idUnidadMedidaAncho: val?.idUnidadMedidaAncho || null,
    ancho: val?.ancho || null,
    item: val?._id,
    idMufa: val?.idMufa || null,
    idSubMufa: val?.idSubMufa || null,
    idTipoEstado: val?.idTipoEstado || null,
    enviado: 1,
    editado: 0,
    especificaciones: Array.isArray(val?.especificaciones) && val?.especificaciones.length > 0 ? val?.especificaciones : null,
    materiales: Array.isArray(val?.materiales) && val?.materiales.length > 0 ? val?.materiales : null,
    referencias: Array.isArray(val?.referencias) && val?.referencias.length > 0 ? val?.referencias : null,
    archivos: Array.isArray(val?.archivos) && val?.archivos.length > 0 ? JSON.stringify(newFiles) : null,
  };
};

// Main function to execute all data loading and saving
export const loadAllDataDownload = async (idUsuario : any) => {
  await saveDataByType("TRONCAL", idUsuario, getTroncalLocal, saveTroncalLocal, troncalMapper);
  await saveDataByType("NODO", idUsuario, getNodoLocal, saveNodoLocal, nodoMapper);
  await saveDataByType("MUFA", idUsuario, getMufaLocal, saveMufaLocal, mufaMapper);
  await saveDataByType("SUBMUFA", idUsuario, getSubMufaAllLocal, saveSubMufaLocal, subMufaMapper);
  await saveDataByType("DETALLE", idUsuario, getAllDetalleLocal, saveDetalleLocal, detalleMapper);
};
