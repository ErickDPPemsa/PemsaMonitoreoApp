import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useContext, useEffect, useLayoutEffect, useState } from 'react';
import { View } from 'react-native';
import { useAppSelector } from '../app/hooks';
import { rootStackScreen } from '../navigation/Stack';
import Pdf from 'react-native-pdf';
import Text from '../components/Text';
import { Button } from '../components/Button';
import { Loading } from '../components/Loading';
import { HandleContext } from '../context/HandleContext';

interface Props extends NativeStackScreenProps<rootStackScreen, 'PdfScreen'> { };
export const PdfScreen = ({ navigation, route: { params: { name, url } } }: Props) => {
    const { theme: { fonts, colors } } = useAppSelector(state => state.app);
    const [error, setError] = useState<string>();
    const [loading, setLoading] = useState<boolean>(false);
    const { handleError } = useContext(HandleContext);

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
                        handleError(String(error));
                    }}
                    style={{ flex: 1 }}
                    trustAllCerts={false}
                />
            }
        </View>
    )
}
