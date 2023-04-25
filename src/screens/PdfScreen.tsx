import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useEffect, useLayoutEffect, useState } from 'react';
import { View } from 'react-native';
import { useAppSelector } from '../app/hooks';
import { rootStackScreen } from '../navigation/Stack';
import Pdf from 'react-native-pdf';
import Toast from 'react-native-toast-message';
import Text from '../components/Text';
import { Button } from '../components/Button';
import { Loading } from '../components/Loading';

interface Props extends NativeStackScreenProps<rootStackScreen, 'PdfScreen'> { };
export const PdfScreen = ({ navigation, route: { params: { name, url } } }: Props) => {
    const { theme: { fonts, colors } } = useAppSelector(state => state.app);
    const [error, setError] = useState<string>();
    const [loading, setLoading] = useState<boolean>(false);

    useLayoutEffect(() => {
        navigation.setOptions({
            title: `${name}`,
            headerTitleStyle: { ...fonts.titleLarge }
        });
    }, [navigation]);

    useEffect(() => {
        setLoading(true);
    }, []);


    const source = { uri: url, cache: true };

    return (
        <View style={{ flex: 1 }}>
            <Loading loading={loading} />
            {error &&
                <View style={{ width: '100%', height: '100%' }}>
                    <Text variant='titleMedium' style={{ color: colors.error, textAlign: 'center', padding: 15 }}>{error}</Text>
                    <Button icon='reload' text='recargar' mode='contained' contentStyle={{ alignSelf: 'center' }} onPress={() => { setLoading(true); setError(undefined) }} />
                </View>
            }
            {
                !error &&
                <Pdf
                    source={source}
                    onLoadComplete={(numberOfPages, filePath) => { setLoading(false) }}
                    onError={(error) => {
                        setError(String(error));
                        setLoading(false)
                        Toast.show({ text1: 'Error', text2: String(error) })
                    }}
                    style={{ flex: 1 }}
                    trustAllCerts={false}
                />
            }
        </View>
    )
}
