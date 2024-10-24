import React, { useState } from 'react'
import { View, ScrollView, useColorScheme, RefreshControl  } from 'react-native'
import { ActivityIndicator } from 'react-native-paper'
import { Colors } from 'react-native/Libraries/NewAppScreen'
import { useBearStore } from '../store/storet';

interface Prop{
    children: any;
    inputData?: any;
    pullRefresh?: () => Promise<void>;
    mode?: "row" | "column";
    centered?: boolean;
    loading?: boolean;
}

const Layout = ({ children, mode = "row", pullRefresh, centered = false, loading = false } : Prop) => {
    const modes = useBearStore((state) => state.mode)
    const isDarkMode = modes === 'dark';
    const [refreshing, setRefreshing] = useState(false);

    const handleRefresh = async () => {
        setRefreshing(true);
        try {
            if (pullRefresh) {
                await pullRefresh();
            }
        } catch (error) {
            console.error("Error en el pull:", error);
            setRefreshing(false);
        } finally {
            setRefreshing(false);
        }
    };

    if(loading){
        return (
            <View style={ { flex: 1, justifyContent: 'center', alignItems:'center', backgroundColor: isDarkMode ? Colors.darker : Colors.lighter } }>
              <ActivityIndicator size={30} color={isDarkMode ? '#fff' : '#000'}/>
            </View>
        )
    }

    if(mode == "row"){
        return (
            <View style={{ flex: 1, paddingVertical: 20, paddingHorizontal: 10, backgroundColor: isDarkMode ? Colors.darker : Colors.lighter }} >
                <ScrollView 
                    showsVerticalScrollIndicator={false} 
                    contentInsetAdjustmentBehavior="automatic" 
                    contentContainerStyle={centered ? [{ justifyContent: "center", alignItems: "center", alignContent: "center" }] : []}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
                    }
                >
                    {children}
                </ScrollView>
            </View>
        )
    }

    return (
        <View style={{ flex: 1, backgroundColor: isDarkMode ? Colors.darker : Colors.lighter, flexDirection: "column", justifyContent: centered ? "center" : "space-between"}}>
            {children}
        </View>
    )
}

export default Layout