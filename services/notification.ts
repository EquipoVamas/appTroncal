import notifee from '@notifee/react-native'

export const onDisplayNotification = async (mensaje:string = "") => {

  // Solicitar permiso
  await notifee.requestPermission();

  // Crear un canal
  const channelId = await notifee.createChannel({
    id: "default",
    name: "Default Channel"
  })

  // Disparar notificacion
  await notifee.displayNotification({
    title: "SEMIPERU",
    body: mensaje,
    android: {
      channelId,
      smallIcon: "ic_launcher",
      pressAction: {
        id: "defaultt"
      }
    }
  })
}