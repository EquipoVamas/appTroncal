import { CameraRoll } from '@react-native-camera-roll/camera-roll'
import React from 'react'
import { Alert, View } from 'react-native'
import { Divider, IconButton, MD3Colors, Text } from 'react-native-paper'
import Icon from 'react-native-vector-icons/EvilIcons'
import { addFilePoste, updateFilePoste } from '../services/axios'
import { getItems, setStatus } from '../services/db'
import Net from '../services/networthService'
import { useBearStore } from '../store/storet'

const NetComponent = () => {
    const netWorth = useBearStore((state) => state.statusNet);

    const sendServer = async () => {
        const items:any = await getItems();
        if(items.length > 0){
            for(const itm of items){
                const id = itm.id;
                if(itm.id) delete itm.id;
                let filesJSON: any[] = [];
                if (typeof itm.file === 'string') {
                    try {
                        filesJSON = JSON.parse(itm.file);
                    } catch (error) {
                        filesJSON = [];
                    }
                }
                if (itm.file != null) delete itm.file;

                var evi:any = [];
                var filesUri:string[] = [];
                const formData = new FormData();
                if(filesJSON && filesJSON.length > 0){
                    filesJSON.forEach((fil:any) => {
                        if(fil?.file?.uri){
                            formData.append("fileArchivos", {
                                uri: fil.file.uri,
                                type: fil.file.type,
                                name: fil.file.name
                            });
                            filesUri.push(fil.file.uri.toString());
                            evi.push({ descripcion: fil?.descripcion || "S/N", latitud: fil.latitud, longitud: fil.longitud, distancia: fil.distancia })
                        }
                    })
                }
                formData.append("evidencias", JSON.stringify(evi));
                formData.append("data", JSON.stringify(itm));
                var reg :any = {};
                if(itm.estado == 1) {
                    reg = await addFilePoste(formData);
                }else if ( itm.estado == 0 && itm.editado == 1) {
                    reg = await updateFilePoste(formData);
                }else{
                    continue;
                }
                if(reg.data){
                    const act = await setStatus(id, reg?.data?._id);
                    if(filesUri.length > 0) await CameraRoll.deletePhotos(filesUri)                    
                }
            }
            Alert.alert("Postes enviados al servidor correctamente")
        }else{
            Alert.alert("No hay postes por enviar", "Registre uno nuevo...")
        }
    }

    return (
        <View style={{ marginBottom: 15}}>
            <View style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 10, justifyContent: "space-between"}}>
                <View style={{ display: "flex", flexDirection: "row", gap: 5, alignContent: 'center', alignItems: "center"}}>
                    <Text>Internet:</Text> 
                    <Net/>
                </View>
                {
                    netWorth && (
                        <View style={{ alignItems: "center" }}>
                            <IconButton
                                onPress={() => sendServer()}
                                icon={() => <Icon name='sc-telegram' color={MD3Colors.primary70} style={{ fontSize: 20}}/>}
                                size={15}
                            />
                        </View>
                    )
                }
            </View>
            <Divider bold />
        </View>
    )
}

export default NetComponent