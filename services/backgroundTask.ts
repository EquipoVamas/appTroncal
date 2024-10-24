import BackgroundService from 'react-native-background-actions'
import { getAllDetalleLocal, getTypeStatusLocal, updateDetalleLocal,updateDetalleArchivos } from './dataBase'
import { addFilePoste, updateFilePoste, registerDetails, registerFileDetails, updateDetailsData } from '../services/axios'
import { CameraRoll } from '@react-native-camera-roll/camera-roll'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { onDisplayNotification } from '../services/notification'
import { useBearStore } from '../store/storet'

export const sleep = (time:number) => new Promise((resolve:any) => setTimeout(() => resolve(), time));

var valueTask = 0;

const sendServerTask = async () => {
  await sleep(1000 * 60 * 5); // 5 MINUTOS
  const { statusApp, statusNet, envAuto } = useBearStore.getState()

  if (!envAuto) {
    // console.log("Tarea detenida porque envAuto es false");
    return await BackgroundService.stop();
  }

  const token = await AsyncStorage.getItem("token");
  if(statusNet && token){
    // console.log("Conectado...");

    // Detalles
    const detalles:any = await getAllDetalleLocal();
    var successItems = 0;
    var successFiles = 0;
    var errorItems = 0;
    var errorFiles = 0;

    if(detalles.length > 0){
      let itemCount = 0;
      for(const det of detalles){
        // console.log("El detalle ahora es", det);
        const tipoEstados:any = await getTypeStatusLocal();

        // enviado - editado - URL
        var data = {
          ...det,
          codInterno: det.nombre || null,
          enviado: 0,
          editado : 0
        };

        // Sin enviar
        if(det.enviado == 0){
          delete data.id;
          const formData = new FormData();
          formData.append("data", JSON.stringify(data));
          const idTipoEstado :any = tipoEstados.find((val: any) => val.nombre === 'Pendiente');
          if (!idTipoEstado) throw new Error("Status 'Pendiente' not found");
          data.idTipoEstado = idTipoEstado.item;
          // console.log("Enviado al servidor...", data.idMufa, data.idSubMufa);
          const res = await registerDetails(data.idMufa, data.idSubMufa, formData);
          // console.log("Esto devuelve ekse server", res);
          if(res?.data){
            // console.log("Actualizado local...", res?.data );
            await updateDetalleLocal({ "item": res?.data?._id, "enviado": 1 }, det.id);

            var files = JSON.parse(data?.archivos) || [];
            if(files.length > 0){
              for(const file of files){
                var filesOld:any = [];
                if(file.enviado == 0){
                  const formFile = new FormData();
                  formFile.append("data", JSON.stringify(file));
                  formFile.append("file", file?.file);
                  const fileRest = await registerFileDetails(res?.data?._id, formFile);
                  if(fileRest && fileRest?.data){
                    successFiles++;
                    filesOld.push({...file, enviado: 1});
                    await updateDetalleArchivos(JSON.stringify(filesOld), det.id)
                    // Eliminar imagenes
                  }else{
                    errorFiles++;
                  }
                }else{
                  filesOld.push(file);
                }
              }
            }
            
            successItems++;
            // Posible limpieza de archivos...
          }else{
            errorItems++;
          }

        }else if(det.enviado == 1 && det.editado == 1 ){
          var datos = {
            idTipoEstado: det?.idTipoEstado,
            alto: det?.altura || null,
            nivelTension: det?.nivelTension || null,
            codInterno: det?.codInterno || null,
            idPropietario: det?.idPropietario || null,
            nombre : det?.nombre,
            longitud: det?.longitud,
            latitud: det?.latitud
          }

          const formData = new FormData();
          formData.append("data", JSON.stringify(datos));
    
          await updateDetailsData(data?.item, formData);
          
          // Actualiza el detalle y actualiza o reemplaza imagenes
          let filesData: any = typeof det?.archivos === 'string' ? JSON.parse(det?.archivos) : [];

          const archivo = filesData.filter(( value : any ) => value?.enviado == 0);
          
          if( archivo.length > 0) {
            for (const arch of archivo) {
              // Validar solo las imágenes que estén en enviado == 0
              if (arch.enviado === 0) {
                const formData = new FormData();
                formData.append('data', JSON.stringify(arch));
                formData.append('file', arch?.file);

                // Enviar archivo al backend y verificar respuesta
                const response = await registerFileDetails(det?.item, formData);

                if (response) {
                  filesData = filesData.map((val: any) => {
                    if (val?.orden === arch.orden) {
                      return {...val, enviado: 1};
                    }
                    return val;
                  });

                  // Actualizar la base de datos local con los archivos modificados
                  await updateDetalleLocal(
                    {archivos: JSON.stringify(filesData)},
                    det?.id,
                  );
                }

                // Verificar si todos los archivos tienen enviado == 1
                const allSent = filesData.every(
                  (file: any) => file.enviado === 1,
                );

                if (allSent) {
                  // Si todos los archivos están enviados, cambiar el estado de 'editado' a 0
                  await updateDetalleLocal( { editado: 0 }, det?.id);
                }
              }
            }
          }
        }else{
          continue;
        }

        itemCount++;
        valueTask = itemCount / detalles.length;
        // console.log("Llegaste aqui luego de actualizar...", itemCount, valueTask);
        await BackgroundService.updateNotification({ progressBar: { max: 100, value: valueTask }})
        if(valueTask >= 100) await BackgroundService.stop();
      }
      
      if(BackgroundService.isRunning()) await BackgroundService.stop()
      if(successItems > 0 || errorItems > 0) onDisplayNotification(`Se enviaron ${successItems} registros. <br/> Fallaron ${errorItems} registros.`)
      if(successFiles > 0 || errorFiles > 0) onDisplayNotification(`Se enviaron ${successFiles} archivos. <br/> Fallaron en enviar ${errorFiles}.`)
      if(envAuto) await BackgroundService.start(sendServerTask, options);
      
    }

  }

}

export const options = {
  taskName: 'SEMIPERU',
  taskTitle: 'Envío automático',
  taskDesc: 'Enviando registros al servidor...',
  taskIcon: {
      name: 'ic_launcher',
      type: 'mipmap',
  },
  color: '#ff00ff',
  progressBar: {
    max: 100,
    value: valueTask
  }

};

export const taskService = async () => {
  // console.log("Iniciando tarea en segundo plano...--------------------------------------------------------------");
  
  await BackgroundService.start(sendServerTask, options);
}


