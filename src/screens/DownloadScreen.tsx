import React, { useEffect, useLayoutEffect, useState } from 'react'
import { Platform, View } from 'react-native'
import Text from '../components/Text'
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { rootStackScreen } from '../navigation/Stack';
import RNFS from 'react-native-fs';


interface Props extends NativeStackScreenProps<rootStackScreen, 'DownloadScreen'> { };
export const DownloadScreen = ({ navigation }: Props) => {
    const [path, setPath] = useState<string>();

    useLayoutEffect(() => {
        navigation.setOptions({
            title: 'Descargas'
        });
    }, [navigation]);

    useEffect(() => {
        const path = (Platform.OS === 'ios' ? RNFS.DocumentDirectoryPath : RNFS.DownloadDirectoryPath);
        setPath(path);
    }, []);

    return (
        <View style={{ flex: 1 }}>
            <Text variant='titleSmall'>{path}</Text>
            <Text>Download screen</Text>
        </View>
    )
}
