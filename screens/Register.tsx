import React, { useEffect, useState } from 'react'
import { useColorScheme, View, Button, StyleSheet, Image, Alert, Modal, ScrollView, Dimensions } from 'react-native'
import { SegmentedButtons, TextInput, IconButton, MD3Colors, Divider, Button as ButtonP, Text } from 'react-native-paper'
import Icon from 'react-native-vector-icons/EvilIcons'
import { useForm, Controller } from 'react-hook-form'
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { initDB, deleteTable, setFiles as setNewFiles, getOneItem, setMaterial as setNewMaterial} from '../services/db'
import RNFS from 'react-native-fs'
import { CameraRoll } from '@react-native-camera-roll/camera-roll'
import { NavigationProp, useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { Colors } from 'react-native/Libraries/NewAppScreen';
import Layout from '../components/Layout'
import { useLocation } from '../store/useLocation'
import { getDistance } from '../components/Functions'
import { generateRandomCode } from '../components/Functions'

const { width, height } = Dimensions.get('window');

type RootStackParamList = {
    Registro: { latitud: number; longitud: number, nombre: string; id: string, direccion: string, archivos?: [], materiales?: [] };
};

type RegistroScreenRouteProp = RouteProp<RootStackParamList, 'Registro'>;

interface itemAttachments {
    descripcion: string;
    nombre?: string;
    cantidad?: string;
}

const Register = () => {

    const route = useRoute<RegistroScreenRouteProp>();
    const navigation = useNavigation<NavigationProp<any>>();
    const { lastKnownLocation } = useLocation()
    const isDarkMode = useColorScheme() === 'dark';
    const [ itemsDat, setItemsDat] = useState<any>({});
    const [ modalRegister, setModalRegister ] = useState(false);
    const [ distance, setDistance ] = useState<any>("0m");
    const [ files, setFiles ] = useState<any>([]);
    const [ materiales, setMateriales ] = useState<any>([]);
    const { control, handleSubmit, setValue, formState: { errors }, reset, watch } = useForm<itemAttachments>()

    const guardarFiles = async (descripcion: string, file: any) => {
        const oldFile = {
            descripcion: descripcion,
            file: file,
            latitud:  lastKnownLocation?.latitude || "",
            longitud: lastKnownLocation?.longitude || "" , 
            distancia: distance
        }
        // Datos guardados
        const data:any = await getOneItem(itemsDat?.id);
        var filesData = data?.file ? JSON.parse(data?.file) : [];
        filesData = filesData ? filesData : [];

        // Ruta de Guardado
        const newFile = await savePhoto(oldFile);
        filesData.push(newFile);
        const res : any = await setNewFiles(itemsDat?.id, JSON.stringify(filesData));
        if(res){
            setValue("descripcion", "");
            setFiles((value:any) => { return [...value, newFile ] });
            return;
        }
        Alert.alert("", "Hubo un error al registrar la imagen...");
    }

    const guardarMaterial = async (data:any) => {
        setValue("cantidad", "");
        setValue("nombre", "");
        setMateriales((value:any) => {
            return [...value, { nombre: data.nombre, cantidad: data.cantidad, evidencia: data.cantidad, item:  generateRandomCode(12), edit: 1 }]
        })
        setModalRegister(false);
    }
    
    const savePhoto = async (file:any) => {
        return new Promise(async (resolve, reject) => {
            var filesStorage = {};
            const photo = file?.file;
            if (photo) {
                const directoryPath = `${RNFS.ExternalStorageDirectoryPath}/Pictures/Pruebas`;
                const filePath = `${directoryPath}/${photo.fileName}`;
                try {
                    await RNFS.mkdir(directoryPath);

    
                    await RNFS.copyFile(photo.uri, filePath);
        
                    CameraRoll.saveAsset(filePath, { type: 'photo', album: 'Pruebas'});
            
                    filesStorage ={ 
                            descripcion: file?.descripcion,
                            longitud: file?.longitud,
                            latitud: file?.latitud,
                            distancia: file?.distancia,
                            file: {
                                name: photo.fileName,
                                type: photo.type,
                                size: photo.fileSize,
                                uri: photo ? `file://${filePath}` : photo.uri 
                            }
                    }
                } catch (error) {
                    console.error("Error al guardar la foto:", error);
                    return null;
                }
            }
            
            resolve(filesStorage);
        })
    }

    const selectImage = () => {
        launchImageLibrary({ mediaType: 'photo', selectionLimit: 1 }, (response) => {
            if (response?.assets) {
                guardarFiles(watch("descripcion"), response?.assets[0])
            }
        });
    };

    const takePhoto = () => {
        launchCamera({ mediaType: 'photo' }, (response) => {
            if (response?.assets) {
                guardarFiles(watch("descripcion"), response?.assets[0])
            }
        });
    };

    const updateDis = () => {
        if(lastKnownLocation){
            setDistance(getDistance(lastKnownLocation?.latitude, lastKnownLocation?.longitude, route.params.latitud, route.params.longitud))
        }
    }

    const backMap = () => {
        let idReturn = itemsDat?.id;
        setFiles([]);
        setItemsDat({})
        setValue("descripcion", "");
        reset();
        navigation.navigate("Mapa", {
            id: idReturn,
            processReturn: 'RegisterFileOrMaterial'
        });
    }

    const deleteFile = async (name: string, uri:any, index?:any) => {
        const data:any = await getOneItem(itemsDat?.id);
        if(data){
            const filesData = JSON.parse(data?.file);
            if(filesData && filesData.length > 0){
                const filtered = filesData.filter((fil:any) => fil?.file?.name !== name);
                const res = await setNewFiles(itemsDat?.id, JSON.stringify(filtered));
                if(res){
                    await RNFS.unlink(uri);
                    setFiles((prev:any) => prev.filter((_:any, i:any) => i !== index))
                    return; 
                }
            }
        }
        setFiles((prev:any) => prev.filter((_:any, i:any) => i !== index))
    }

    const saveMaterial = async () => {
        const res = await setNewMaterial(itemsDat.id, JSON.stringify(materiales));
    }

    useEffect(() => {
        if(route.params){            
            setItemsDat(route.params);
            if(route.params.latitud && route.params.longitud){
                updateDis()
            }

            if(route.params.archivos){
                setFiles(route.params.archivos);
            }

            if(route.params.materiales){
                setMateriales(route.params.materiales);
            }
        }else{
            setItemsDat({})
        }
    }, [route])

    useEffect(() => {
        if(materiales && materiales.length > 0){
            saveMaterial();
        }
    }, [materiales])

    if(!itemsDat.nombre){
        return (
            <Layout centered>
                <View style={{ flex: 1, alignItems: "center", marginTop: 300}}>
                    <Icon name='archive' size={80}/>
                    <Text style={{ marginTop: 10, fontSize: 15 }}>Debe asignar un marcador del mapa...</Text>
                </View>
            </Layout>
        )
    }

    if(itemsDat.materiales){
        return(
            <>
                <Layout mode='column'>
                    <Layout>
                        <Text style={{fontWeight: "bold", textAlign: "center"}}>EQUIPO Y FERRETERÍA</Text>
                        <View style={styles.grid}>
                            <Text style={styles.textGridP}>Producto</Text>
                            <Text style={styles.textGrid2}>Cant</Text>
                            <Text style={styles.textGrid}>Evidencia</Text>
                            <Text style={styles.textGrid}>Acción</Text>
                        </View>
                        <Divider bold />
                        {
                            materiales && materiales.length > 0 ? (
                                <>
                                    {
                                        materiales.map((material:any, index:any) => (
                                            <View style={styles.grid} key={material.item + index} >
                                                <Text style={styles.textGridP}>{material.nombre}</Text>
                                                <Text style={styles.textGrid2}>{material.cantidad}</Text>
                                                {
                                                    material.edit == 1 ? ( 
                                                        <View style={{ width: "17%" }}>
                                                            <TextInput keyboardType='numeric' defaultValue={material.evidencia} value={material.evidencia} onChangeText={(e:any) => {
                                                                setMateriales((value:any) => {
                                                                    const newValue = value.filter((val:any) => val.item !== material.item )
                                                                    return [...newValue, {...material, evidencia: e ? e : 0}]
                                                                })
                                                            }}/>
                                                        </View>
                                                    ) : (
                                                        <Text style={styles.textGrid}>{material.evidencia}</Text>
                                                    )
                                                }
                                                {
                                                    material.edit == 1 ? (
                                                        <View style={styles.viewGrid}>
                                                            <Icon name='check' size={20} onPress={() => {
                                                                setMateriales((value:any) => {
                                                                    const newValue = value.filter((val:any) => val.item !== material.item )
                                                                    return [...newValue, {...material, edit: 0 }]
                                                                })
                                                            }}/>
                                                            <Icon name='close' size={20} onPress={() => {
                                                                setMateriales((value:any) => {
                                                                    const newValue = value.filter((val:any) => val.item !== material.item )
                                                                    return [...newValue, {...material, edit: 0, evidencia: 0 }]
                                                                })
                                                            }}/>
                                                        </View>
                                                    ) : (
                                                        <View style={styles.viewGrid}>
                                                            <Icon name='pencil' size={20} onPress={() => {
                                                                setMateriales((value:any) => {
                                                                    const newValue = value.filter((val:any) => val.item !== material.item )
                                                                    return [...newValue, {...material, edit: 1 }]
                                                                })
                                                            }}/>
                                                        </View>
                                                    )
                                                }
                                            </View>
                                        ))
                                    }
                                </>
                            ) : (
                                <Text style={{ textAlign: "center", marginVertical: 15 }}>Sin materiales asignados</Text>
                            )
                        }

                        {
                            modalRegister && (
                                <View style={styles.container}>
                                    <View style={styles.centeredView}>
                                        <Modal
                                            animationType="slide"
                                            transparent={true}
                                            visible={modalRegister}
                                            onRequestClose={() => { setModalRegister(!modalRegister); }}
                                        >
                                            <ScrollView>
                                                <View style={[ styles.modalView, { backgroundColor: isDarkMode ? Colors.darker : Colors.lighter }]}>
                                                    <Text style={{ textAlign: "center", fontWeight: "bold" }}>REGISTRAR UN NUEVO MATERIAL</Text>
                                                    <Controller
                                                        name="nombre"
                                                        control={control}
                                                        rules={{ required: true }}
                                                        render={({ field: { onChange, onBlur, value } }) => (
                                                            <TextInput
                                                                placeholder="Nombre del material"
                                                                onBlur={onBlur}
                                                                style={{ marginTop: 15}}
                                                                mode='outlined'
                                                                onChangeText={onChange}
                                                                value={value}
                                                            />
                                                        )}
                                                    />
                                                    {errors.nombre && <Text>El nombre es requerida..</Text>}
                                                    <Controller
                                                        name="cantidad"
                                                        control={control}
                                                        rules={{ required: true }}
                                                        render={({ field: { onChange, onBlur, value } }) => (
                                                            <TextInput
                                                                placeholder="Cantidad del material"
                                                                onBlur={onBlur}
                                                                style={{ marginTop: 15}}
                                                                mode='outlined'
                                                                keyboardType='numeric'
                                                                onChangeText={onChange}
                                                                value={value}
                                                            />
                                                        )}
                                                    />
                                                    {errors.nombre && <Text>La cantidad es requerida..</Text>}
                                                    <View style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 25}}>
                                                        <Button title='Registrar' color="#69A42F" onPress={handleSubmit(guardarMaterial)}/>
                                                        <Button title='Cancelar' color="#3E1054" onPress={() => setModalRegister(false) }/>
                                                    </View>
                                                </View>
                                            </ScrollView>
                                        </Modal>
                                    </View>
                                </View>
                            )
                        }
                    </Layout>
                    <View style={{ paddingVertical: 20, paddingHorizontal: 10, display: "flex", flexDirection: "column", gap: 20}}>
                        <Button title="Agregar material" color="#3E1054" onPress={() => setModalRegister(true) } />
                        <Button title="Volver" color="#69A42F" onPress={backMap} />
                    </View>
                </Layout>
            </>
        )
    }

    return (
        <Layout mode='column'>
            <Layout>
                <View style={[ { alignContent: "center" }, styles.topbot5 ]}>
                    {
                        itemsDat?.nombre && (
                            <View style={{ marginVertical: 10}}>
                                <View style={{ display: "flex", flexDirection: "row", gap: 10}}>
                                    <Text style={{ fontWeight: "bold" }}> Nombre: </Text>
                                    <Text>{itemsDat?.nombre}</Text>
                                </View>
                                <View style={{ display: "flex", flexDirection: "row", gap: 10}}>
                                    <Text style={{ fontWeight: "bold" }}> Latitud: </Text>
                                    <Text>{itemsDat?.latitud}</Text>
                                </View>
                                <View style={{ display: "flex", flexDirection: "row", gap: 10}}>
                                    <Text style={{ fontWeight: "bold" }}> Longitud: </Text>
                                    <Text>{itemsDat?.longitud}</Text>
                                </View>
                                <View style={{ display: "flex", flexDirection: "row", gap: 10, marginBottom: 7}}>
                                    <Text style={{ fontWeight: "bold" }}> Dirección: </Text>
                                    <Text>{itemsDat?.direccion}</Text>
                                </View>
                                <Divider bold />
                                <View style={{ display: "flex", flexDirection: "row", justifyContent: "center", alignItems: "center"}}>
                                    <Text style={{ color: "#69A42F", textAlign: "center", marginTop: 7  }}>Estas a { distance }</Text>
                                    <IconButton icon={() => <Icon name="redo" size={20} />} onPress={updateDis}/>
                                </View>
                            </View>
                        )
                    }
                    <Divider bold/>
                    <Text style={{ textAlign: "center", textTransform: "uppercase", fontSize: 12, marginBottom: 10, marginTop: 5 }}>Evidencias</Text>
                    <View
                        style={{
                            marginVertical: 13,
                            display: 'flex',
                            flexDirection: 'row',
                            gap: 10,
                            justifyContent: 'space-around',
                        }}>
                            <Button
                                title="PANORÁMICA"
                                onPress={() => {
                                        setValue("descripcion", 'VISTA FRONTAL - PANORÁMICA DEL POSTE');
                                        takePhoto();
                                    }
                                }
                            />
                            <Button
                                title="FERRETERÍA"
                                onPress={() => {
                                        setValue("descripcion", 'EQUIPOS Y/O FERRETERÍA EN POSTE')
                                        takePhoto();
                                    }
                                }
                            />
                            <Button
                                title="OTROS"
                                onPress={() => {
                                        setValue("descripcion", 'OTROS')
                                        takePhoto();
                                    }
                                }
                            />
                        </View>
                    <Controller
                        name="descripcion"
                        control={control}
                        rules={{ required: true }}
                        render={({ field: { onChange, onBlur, value } }) => (
                            <TextInput
                                placeholder="Descripción de la evidencia"
                                onBlur={onBlur}
                                style={[styles.topbot5]}
                                mode='outlined'
                                onChangeText={onChange}
                                value={value}
                            />
                        )}
                    />
                    {errors.descripcion && <Text>La descripción es requerida..</Text>}
                </View>
                <View style={{ marginVertical: 15 }}>
                    <SegmentedButtons 
                        value={""}
                        onValueChange={ () => {} }
                        buttons={[
                            { value: 'take', label: "Tomar foto", disabled: !itemsDat?.nombre , onPress() {
                                takePhoto()
                                }
                            },
                            { value: 'shoot', label: "Seleccionar foto", disabled: !itemsDat?.nombre, onPress(){
                                selectImage();
                            }}
                        ]}
                    />
                </View>
                {
                    files.length > 0 && (
                        <>
                            <Divider bold/>
                            <Text style={{ textAlign: "center", textTransform: "uppercase", fontSize: 12, marginBottom: 10, marginTop: 10 }}>Archivos subidos</Text>
                            <View style={{ display: "flex", flexWrap: "wrap", flexDirection: "row", flex: 1, justifyContent: "space-between" }}>
                                {
                                    files.map((file:any, index:any) => (
                                        <View key={index} style={[styles.alignCenter, { width: "40%", paddingHorizontal: 10, marginBottom: 15}]}>
                                            <View style={{ flex: 1, display: "flex", flexDirection: "column", alignContent: "center"}}>
                                                <Image
                                                    source={{ uri: file.file.uri }}
                                                    style={{ width: 200, height: 200}}
                                                />
                                                <Text style={{textAlign: "center"}}>{file?.descripcion}</Text>
                                                <Divider bold />
                                                <Text style={{textAlign: "center"}}>{file?.distancia}</Text>
                                            </View>
                                            <IconButton 
                                                icon={() => <Icon name='trash' color={MD3Colors.error50} size={25} />} 
                                                onPress={() => { 
                                                   deleteFile(file.file.name, file.file.uri, index)
                                                }}
                                                style={{ position: "absolute", top: 0, left: 0, borderWidth: 0}}
                                                size={10}
                                                mode='outlined'                                              
                                            />
                                        </View>
                                    ))
                                }
                            </View>
                        </>
                    )
                }
            </Layout>
            <View style={{ paddingVertical: 20, paddingHorizontal: 10}}>
                {/* <Button title="Agregar Evidencias" color="#69A42F" onPress={saveFilesItem} disabled={!itemsDat?.nombre}/> */}
                <Button title="Volver" color="#69A42F" onPress={backMap} disabled={!itemsDat?.nombre}/>
            </View>
        </Layout>
    )
}

const styles = StyleSheet.create({
    topbot5: {
      marginTop: 5,
    //   marginBottom: 10
    },
    grid2: {
      display: "flex",
      flexDirection: "row",
      gap: 5,
      textAlign: "center",
      alignContent: "center"
    },
    textCenter: {
      textAlign: "center"
    },
    alignCenter: {
      alignContent: "center",
      alignItems: "center"
    },
    image: {
      width: 200,
      height: 200,
      marginVertical: 20,
      alignContent: "center",
      alignItems: "center"
    },
    grid: {
        display: "flex", 
        justifyContent: "space-between",
        alignItems: "center", 
        flexDirection: "row", 
        gap: 5, 
        marginVertical: 10
    },
    textGrid: {
        textAlign: "center",
        width: "17%"
    },
    textGrid2: {
        textAlign: "center",
        width: "9%"
    },
    textGridP: {
        textAlign: "left",
        width: "47%"
    },
    viewGrid: {
        display: "flex",
        flexDirection: "row",
        justifyContent: "center",
        width: "17%",
        gap: 10
    },
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalView: {
        margin: 20,
        marginTop: 200,
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 25,
        //alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    container: {
        flex: 1,
        width: width,
        height: height * 0.95,
    }
})

export default Register