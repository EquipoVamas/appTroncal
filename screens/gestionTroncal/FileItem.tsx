import React, { useState } from 'react'
import { View, StyleSheet } from 'react-native'
import { Text, IconButton, Menu, Button } from 'react-native-paper'

import Icon from 'react-native-vector-icons/FontAwesome'
import { TouchableOpacity } from 'react-native-gesture-handler';

const FileItem = ({ data, onPress, folder = true} : any) => {
  return (
    <TouchableOpacity style={[style.containerIcons]} onPress={onPress} activeOpacity={0.8}>
      <IconButton
        icon={() => <Icon 
          name={data?.name?.includes('.xlsx') ? "file-excel-o" : data?.name?.includes('.png') ? "image" : data?.name?.includes('.pdf') ? "file-pdf-o" :  "folder"} 
          size={30} 
          color={
            data?.name?.includes('.xlsx')
            ? '#05bb34'
            : /\.(png|jpg|gif)$/.test(data?.name)
            ? '#0dcaf0'
            : data?.name?.includes('.pdf')
            ? '#dc3545' // ff3333
            : '#ffc107' // ffe800
          }
        />}
        size={35}
        style={{...style.iconDesign}}
        onPress={onPress}
      />

      <View style={style.containerIconsText}>
          <Text style={[style.textIcons]} numberOfLines={2} ellipsizeMode="middle">{data?.name}</Text>
          <Text style={style.textItems}>{folder ? data?.filesCount + data?.foldersCount + ' items | ' : ''}{data?.sizeFormatted} </Text>
      </View>
    </TouchableOpacity>
  );
}

const style = StyleSheet.create({
  containerIcons: {
    flexDirection: 'row',
    borderWidth: 2,
    padding: 3,
    borderRightColor: '#ffff',
    borderLeftColor: '#ffff',
    borderTopColor: '#ffff',
    borderBottomColor: '#eeeeee',
    alignItems: 'center'
  },
  containerIconsText: { 
    flexDirection: 'column',
    width: '100%',
    flex: 1
  },
  textIcons: {
    marginHorizontal: 8,
    fontSize: 15,
    fontWeight:  '100'
  },
  divider: {
    borderColor: '#eeeee',
    borderWidth: 1,
    flex: 1
  },
  textItems: { marginHorizontal: 8, color: 'gray', fontSize: 16},
  iconDesign: { borderRadius: 20 }
})

export default FileItem
