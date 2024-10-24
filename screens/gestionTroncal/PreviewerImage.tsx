import React, {useState}  from 'react';
import { StyleSheet, View, Image, Dimensions, TouchableOpacity } from 'react-native';
import { Dialog, IconButton, Portal, Text } from 'react-native-paper';
import Carousel from 'react-native-reanimated-carousel';
const {width, height} = Dimensions.get('screen');
import Icon from 'react-native-vector-icons/FontAwesome';
import ImageViewer from 'react-native-image-zoom-viewer';
import Modal from 'react-native-modal';

const PreviewerImage = ({ visible, setVisible, images = [], defaultImage } : any) => {

  const hideDialog = () => setVisible(false);
  const [isModalVisible, setModalVisible] = useState(false);
  const [modalImage, setModalImage] = useState<any>(null);

  const openModal = () => {
    const imageUrls = images.map((val: any) => {
      if (val?.name?.includes('.xlsx')) {
        return { url: '../../assets/excel.png' }; // Correctly use require for local assets
      } else if (/\.(png|jpg|gif)$/.test(val?.name)) {
        return { url: val?.location }; // Use the remote URL for image files
      } else if (val?.name?.includes('.pdf')) {
        return { url: '../../assets/pdf.png' }; // Correctly use require for local assets
      } 
    });
    
    setModalImage(imageUrls);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setModalImage(null);
  };
  return (
    <Portal>
      <Dialog visible={visible} onDismiss={hideDialog} style={style.container}>
        <Dialog.Content>
          <View style={{flex: 1}}>
            <IconButton
              icon={() => <Icon name="close" size={30} />}
              size={30}
              onPress={hideDialog}
              style={style.iconClose}
            />
            <Carousel
              loop
              width={width * 0.77}
              height={height * 0.8}
              defaultIndex={(() => {
                const index = images.findIndex(
                  (img: any) => img?.name === defaultImage,
                );
                return index !== -1 ? index : 0; // Fallback to index 0 if no match is found
              })()}
              data={images}
              autoPlay
              scrollAnimationDuration={1000}
              renderItem={({item}: any) => (
                <TouchableOpacity onPress={() => openModal()}>
                  <Image
                    source={
                      item?.name?.includes('.xlsx')
                        ? require('../../assets/excel.png')
                        : /\.(png|jpg|gif)$/.test(item?.name)
                        ? {uri: item?.location}
                        : item?.name?.includes('.pdf')
                        ? require('../../assets/pdf.png')
                        : null
                    }
                    style={{width: '100%', height: '100%'}}
                    resizeMode="contain"
                  />
                </TouchableOpacity>
              )}
            />
    <Modal isVisible={isModalVisible} onBackdropPress={closeModal}>
        <View style={{ flex: 1 }}>
          <ImageViewer imageUrls={modalImage || []} />
        </View>
      </Modal>
          </View>
        </Dialog.Content>
      </Dialog>
    </Portal>
  );
};


const style = StyleSheet.create({
  container : {
    flex: 1
  },
  containerImg: {
    flex: 1,
    justifyContent: 'center',
    alignContent: 'center',
    alignItems: 'center',
  },
  fullScreenImage: {
    width: 350, height: 800,
  },
  iconClose: {position: 'absolute', zIndex: 999}
});

export default PreviewerImage;