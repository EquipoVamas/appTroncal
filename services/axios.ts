import axios from 'axios';

export const URL = "https://api.semi.nom.pe/apisemiperu";

export const instance = axios.create({
  baseURL: URL
});

export const getPostes = async () => {
  try {
    const res = await instance.get('/ejemplo');
    return res;
  } catch (error : any) {
    console.error("Error en la petición:", error.message);
    if (error.response) {
      console.log("Datos del error:", error.response.data);
      console.log("Estado del error:", error.response.status);
      console.log("Cabeceras del error:", error.response.headers);
    } else if (error.request) {
      console.log("No se recibió respuesta del servidor:", error.request);
    } else {
      console.log("Error al configurar la petición:", error.message);
    }        console.log("error", error);
  }
}

export const addFilePoste = async (form: any) => {
  try {
    const res = await instance.post('/ejemplo/RegisterAndFile', form, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res;
  } catch (error:any) {
        console.log("error", error);
  }
}

export const updateFilePoste = async (form: any) => {
  try {
    const res = await instance.post('/ejemplo/UpdateAndFile', form, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res;
  } catch (error:any) {
    console.log(error)

        console.log("error", error);
  }
}

export const sendImageIA = async (form: any) => {
  try {
    const res = await instance.post('/builderImage/lectura/', form, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res;
  } catch (error:any) {
    console.log(error)

        console.log("error", error);
  }
}


// ANDERSON

export const getFolders = async (form: any) => {
  try {
    const res = await instance.post('/fileManager/listFirstLayerFolderAndFiles', form, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return res;
  } catch (error : any) {
console.error("Error en la petición:", error.message);
    if (error.response) {
      console.log("Datos del error:", error.response.data);
      console.log("Estado del error:", error.response.status);
      console.log("Cabeceras del error:", error.response.headers);
    } else if (error.request) {
      console.log("No se recibió respuesta del servidor:", error.request);
    } else {
      console.log("Error al configurar la petición:", error.message);
    }        console.log("error", error);
  }
}

export const createFolder = async (form: any) => {
  try {
    const res = await instance.post('/fileManager/createFolder', form, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return res;
  } catch (error) {
    console.log("error", error);
        console.log("error", error);
  }
}

export const deleteFolder = async (form: any) => {
  try {
    const res = await instance.post('/fileManager/deleteFolder', form, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return res;
  } catch (error) {
    console.log("error", error);
        console.log("error", error);
  }
}

export const renameFolder = async (form: any) => {
  try {
    const res = await instance.post('/fileManager/renameFolder', form, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return res;
  } catch (error) {
    console.log("error", error);
        console.log("error", error);
  }
}

export const searchSubMufa = async (form: any) => {
  try {
    const res = await instance.post('/mufa/buscarParam', form, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return res;
  } catch (error) {
    console.log("error", error);
        console.log("error", error);
  }
}

// Registrar detalle ( poste )
export const registerDetails = async (idMufa: any, idSubMufa: any, form: any) => {
  try {
    const res = await instance.post(`/mufa/addDetalleSubMufa/${idMufa}/${idSubMufa}`, form, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res;
  } catch (error: any) {
        console.log("error", error);
  }
}

// Registrar detalle
export const registerFileDetails = async (idDetalle: any, form: any) => {
  try {
    const res = await instance.post(`/mufa/updateArchivoDetalle/${idDetalle}/`, form, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res;
  } catch (error: any) {
    console.error("Error en la petición:", error.message);
    if (error.response) {
      console.log("Datos del error:", error.response.data);
      console.log("Estado del error:", error.response.status);
      console.log("Cabeceras del error:", error.response.headers);
    } else if (error.request) {
      console.log("No se recibió respuesta del servidor:", error.request);
    } else {
      console.log("Error al configurar la petición:", error.message);
    }
  }
}

export const updateDetailsData = async (idDetalle: any, form: any) => {
  try {
    const res = await instance.post(`/mufa/updateDetalleSubMufaOnly/${idDetalle}/`, form, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res;
  } catch (error: any) {
    console.error("Error en la petición:", error.message);
    if (error.response) {
      console.log("Datos del error:", error.response.data);
      console.log("Estado del error:", error.response.status);
      console.log("Cabeceras del error:", error.response.headers);
    } else if (error.request) {
      console.log("No se recibió respuesta del servidor:", error.request);
    } else {
      console.log("Error al configurar la petición:", error.message);
    }
  }
}

// Tipo de estado
export const getTypeStatusServer = async () => {
  try {
    const res = await instance.get('/tipoEstado');
    return res;
  } catch (error : any) {
    console.error("Error en la petición:", error.message);
    if (error.response) {
      console.log("Datos del error:", error.response.data);
      console.log("Estado del error:", error.response.status);
      console.log("Cabeceras del error:", error.response.headers);
    } else if (error.request) {
      console.log("No se recibió respuesta del servidor:", error.request);
    } else {
      console.log("Error al configurar la petición:", error.message);
    }
  }
}

// Tipo de via
export const getTypeTrackServer = async () => {
  try {
    const res = await instance.get('/tipoVia');
    return res;
  } catch (error : any) {
    console.error("Error en la petición:", error.message);
    if (error.response) {
      console.log("Datos del error:", error.response.data);
      console.log("Estado del error:", error.response.status);
      console.log("Cabeceras del error:", error.response.headers);
    } else if (error.request) {
      console.log("No se recibió respuesta del servidor:", error.request);
    } else {
      console.log("Error al configurar la petición:", error.message);
    }
  }
}

// Unidad de medida
export const getUnitMeasurementServer = async () => {
  try {
    const res = await instance.get('/unidadMedida');
    return res;
  } catch (error : any) {
console.error("Error en la petición:", error.message);
    if (error.response) {
      console.log("Datos del error:", error.response.data);
      console.log("Estado del error:", error.response.status);
      console.log("Cabeceras del error:", error.response.headers);
    } else if (error.request) {
      console.log("No se recibió respuesta del servidor:", error.request);
    } else {
      console.log("Error al configurar la petición:", error.message);
    }  }
}

// Troncal
export const getTroncalServer = async () => {
  try {
    const res = await instance.get('/troncal');
    return res;
  } catch (error: any) {
console.error("Error en la petición:", error.message);
    if (error.response) {
      console.log("Datos del error:", error.response.data);
      console.log("Estado del error:", error.response.status);
      console.log("Cabeceras del error:", error.response.headers);
    } else if (error.request) {
      console.log("No se recibió respuesta del servidor:", error.request);
    } else {
      console.log("Error al configurar la petición:", error.message);
    }  }
}

// Nodo
export const getNodoServer = async () => {
  try {
    const res = await instance.get('/nodo');
    return res;
  } catch (error : any) {
console.error("Error en la petición:", error.message);
    if (error.response) {
      console.log("Datos del error:", error.response.data);
      console.log("Estado del error:", error.response.status);
      console.log("Cabeceras del error:", error.response.headers);
    } else if (error.request) {
      console.log("No se recibió respuesta del servidor:", error.request);
    } else {
      console.log("Error al configurar la petición:", error.message);
    }  
  }
}

// Empresas
export const getEmpresasServer = async (form: any) => {
  try {
    const res = await instance.post('/empresa/search/', form, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return res;
  } catch (error : any) {
    console.error("Error en la petición:", error.message);
    if (error.response) {
      console.log("Datos del error:", error.response.data);
      console.log("Estado del error:", error.response.status);
      console.log("Cabeceras del error:", error.response.headers);
    } else if (error.request) {
      console.log("No se recibió respuesta del servidor:", error.request);
    } else {
      console.log("Error al configurar la petición:", error.message);
    }  
  }
}

// Folder
export const getFolderServer = async (form: any = {}) => {
  try {
    const res = await instance.post('/fileManager/listFolderWithFlatStructure/', form, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return res;
  } catch (error : any) {
    console.error("Error en la petición:", error.message);
    if (error.response) {
      console.log("Datos del error:", error.response.data);
      console.log("Estado del error:", error.response.status);
      console.log("Cabeceras del error:", error.response.headers);
    } else if (error.request) {
      console.log("No se recibió respuesta del servidor:", error.request);
    } else {
      console.log("Error al configurar la petición:", error.message);
    }  
  }
}

// Folder
export const getFileManagerServer = async (form: any = {}) => {
  try {
    const res = await instance.post('/fileManager/listFolderWithFlatStructure/', form, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return res;
  } catch (error : any) {
    console.error("Error en la petición:", error.message);
    if (error.response) {
      console.log("Datos del error:", error.response.data);
      console.log("Estado del error:", error.response.status);
      console.log("Cabeceras del error:", error.response.headers);
    } else if (error.request) {
      console.log("No se recibió respuesta del servidor:", error.request);
    } else {
      console.log("Error al configurar la petición:", error.message);
    }  
  }
}

// Mufa
export const getMufasServer = async () => {
  try {
    const res = await instance.post('/mufa/getAllMufas', {}, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return res;
  } catch (error: any) {
    console.error("Error en la petición:", error.message);
    if (error.response) {
      console.log("Datos del error:", error.response.data);
      console.log("Estado del error:", error.response.status);
      console.log("Cabeceras del error:", error.response.headers);
    } else if (error.request) {
      console.log("No se recibió respuesta del servidor:", error.request);
    } else {
      console.log("Error al configurar la petición:", error.message);
    }  
  }
}

export const getAllDetailsServer = async (form: any = {}) => {
  try {
    const res = await instance.post('/mufa/buscarParamDetalle/', form, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return res;
  } catch (error : any) {
    console.error("Error en la petición:", error.message);
    if (error.response) {
      console.log("Datos del error:", error.response.data);
      console.log("Estado del error:", error.response.status);
      console.log("Cabeceras del error:", error.response.headers);
    } else if (error.request) {
      console.log("No se recibió respuesta del servidor:", error.request);
    } else {
      console.log("Error al configurar la petición:", error.message);
    }  
  }
}

// SubMufa
export const getSubMufasServer = async (form: any = {}) => {
  try {
    const res = await instance.post('/mufa/soloSubMufas/', form, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return res;
  } catch (error : any) {
    console.error("Error en la petición:", error.message);
    if (error.response) {
      console.log("Datos del error:", error.response.data);
      console.log("Estado del error:", error.response.status);
      console.log("Cabeceras del error:", error.response.headers);
    } else if (error.request) {
      console.log("No se recibió respuesta del servidor:", error.request);
    } else {
      console.log("Error al configurar la petición:", error.message);
    }  
  }
}

// Troncal / Nodo / Mufa / etc -  user

export const getAllFilterUser = async (form: any) => {
  console.log("ENvias", form);
  
  try {
    const res = await instance.post("/troncal/troncalUser", form, {
      headers: {
        'Content-Type': 'application/json',
      },
    })
    return res;
  } catch (error : any) {
    console.error("Error en la petición:", error.message);
    if (error.response) {
      console.log("Datos del error:", error.response.data);
      console.log("Estado del error:", error.response.status);
      console.log("Cabeceras del error:", error.response.headers);
    } else if (error.request) {
      console.log("No se recibió respuesta del servidor:", error.request);
    } else {
      console.log("Error al configurar la petición:", error.message);
    }  
  }
}

export default instance;