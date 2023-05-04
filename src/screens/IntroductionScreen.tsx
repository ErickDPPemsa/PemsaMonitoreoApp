import React, { useContext, useRef, useState } from 'react';
import { StyleSheet, View, Animated, StyleProp, TextStyle, Image } from 'react-native';
import PagerView from 'react-native-pager-view';
import { useAppSelector } from '../app/hooks';
import { ScrollView } from 'react-native-gesture-handler';
import Text from '../components/Text';
import { Orientation } from '../interfaces/interfaces';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { rootStackScreen } from '../navigation/Stack';
import EncryptedStorage from 'react-native-encrypted-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AlertContext } from '../components/Alert/AlertContext';
import { Button } from '../components/Button';
import Reanimated, { FadeInDown } from 'react-native-reanimated';
import { HandleContext } from '../context/HandleContext';

type PagerViewOnPageScrollEventData = { position: number; offset: number; }

interface Props extends NativeStackScreenProps<rootStackScreen, 'IntroductionScreen'> { };

type data = Array<{
    title: string;
    description: Array<{
        text: string;
        style?: StyleProp<TextStyle>
    }>
    key: string;
}>

const data: data = [
    {
        title: 'BIENVENIDO',
        description:
            [
                { text: 'Ahora nos acercamos a usted para brindale el acceso de informacón de su sistema de alarma', style: { paddingTop: 10, } }
            ],
        key: 'first',
    },
    {
        title: '¿Para qué sirve la aplicación?',
        description:
            [
                { text: 'Podrá realizar consultas de los eventos recibidos en la central de monitoreo', style: { paddingVertical: 5 } },
                { text: 'Descargar en formato PDF las consultas realizadas', style: { paddingVertical: 5 } }
            ],
        key: 'second',
    },
    {
        title: '¿Como acceder a la aplicación?',
        description:
            [
                { text: '1: Seleccionar el botón de registro', style: { paddingTop: 10 } },
                { text: '2: Llenar los campos solicitados' },
                { text: '3: Aceptar los términos y condiciones y aviso de privacidad' },
                { text: '4: Seleccionar el botón de registrar' },
                { text: '' },
                { text: 'Cualquier duda o problema tecnico spbre su sistema de alarma que se presente, podrá cominicarse con nosotros y lo atenderemos con gusto' },
                { text: '' },
                { text: 'Correo electronico:', style: { textAlign: 'center' } },
                { text: 'correo@pem-sa.com', style: { textAlign: 'center' } },
                { text: 'Número telefónico', style: { textAlign: 'center' } },
                { text: '222 141 12 30', style: { textAlign: 'center' } },

            ],
        key: 'third',
    },
];

const DOT_SIZE = 7;

const Item = ({ title, description, scrollOffsetAnimatedValue }: {
    description: Array<{ text: string; style?: StyleProp<TextStyle> }>;
    title: string;
    scrollOffsetAnimatedValue: Animated.Value;
}) => {
    const opacity = scrollOffsetAnimatedValue.interpolate({ inputRange: [0, 0.5, 0.99], outputRange: [1, 0, 1], });
    return (
        <Animated.View style={{ paddingHorizontal: 30, opacity }} >
            <Text variant='headlineMedium' style={[styles.heading]}>{title}</Text>
            {description.map((el, key) => <Text key={key} style={[{ textAlign: 'center' }]}>{el.text}</Text>)}
        </Animated.View>
    );
};

const Dots = ({ positionAnimatedValue, scrollOffsetAnimatedValue }: { scrollOffsetAnimatedValue: Animated.Value; positionAnimatedValue: Animated.Value; }) => {
    const inputRange = [0, data.length];
    const margin: number = 2;
    const { theme: { colors } } = useAppSelector(state => state.app)
    const translateX = Animated.add(scrollOffsetAnimatedValue, positionAnimatedValue).interpolate({
        inputRange,
        outputRange: [0, data.length * (DOT_SIZE + (margin * 2))]
    });

    return (
        <View style={{ alignItems: 'center', marginVertical: 20 }}>
            <View style={{ flexDirection: 'row' }} >
                <Animated.View
                    style={[
                        styles.paginationDot, { margin, backgroundColor: colors.primary, zIndex: 1 },
                        {
                            position: 'absolute',
                            transform: [{ translateX: translateX }],
                        },
                    ]}
                />
                {data.map((item) => {
                    return (
                        <Animated.View key={item.key} style={[styles.paginationDot, { margin, borderWidth: 2, borderColor: colors.outlineVariant }]} />
                    );
                })}
            </View>
        </View>
    )
}

const AnimatedPagerView = Animated.createAnimatedComponent(PagerView);

export const IntroductionScreen = ({ navigation }: Props) => {
    const scrollOffsetAnimatedValue = React.useRef(new Animated.Value(0)).current;
    const positionAnimatedValue = React.useRef(new Animated.Value(0)).current;
    const [page, setPage] = useState<number>(0);
    const { theme: { colors, dark }, orientation } = useAppSelector(state => state.app);
    const Pager = useRef<PagerView>(null);
    const { alert, clear } = useContext(AlertContext);
    const { domain, handleError } = useContext(HandleContext);

    const omitWellcome = async () => {
        try {
            clear();
            await EncryptedStorage.setItem('isWellcomeOff', 'true');
            (domain === '') ? navigation.replace('DomainScreen') : navigation.replace('LogInScreen');
        } catch (error) { handleError(String(error)) }
    }

    const cancel = async () => {
        try {
            clear();
            await EncryptedStorage.setItem('isWellcomeOff', 'false');
            (domain === '') ? navigation.replace('DomainScreen') : navigation.replace('LogInScreen');
        } catch (error) { handleError(String(error)) }
    }

    return (
        <SafeAreaView style={{ flex: 1 }}>
            <Reanimated.View entering={FadeInDown.duration(500)} style={[styles.container]}>
                <Image
                    source={require('../assets/prelmo.png')}
                    style={[
                        styles.imageStyle,
                        {
                            height: 200,
                            width: 200,
                        },
                        (orientation === Orientation.landscape) && [{
                            height: 100,
                            width: 100,
                            position: 'absolute',
                            bottom: 0,
                            left: 0
                        }],
                        dark && { tintColor: colors.onSurface }
                    ]}
                />
                <AnimatedPagerView
                    initialPage={positionAnimatedValue}
                    style={{ flex: 1 }}
                    ref={Pager}
                    onPageScroll={Animated.event<PagerViewOnPageScrollEventData>(
                        [{ nativeEvent: { offset: scrollOffsetAnimatedValue, position: positionAnimatedValue } }],
                        {
                            listener: ({ nativeEvent: { position, offset } }) => {
                                setPage(() => position)
                            }, useNativeDriver: true,
                        }
                    )}
                >
                    {data.map((item, key) => (
                        <ScrollView key={item.title}>
                            <Item {...item} scrollOffsetAnimatedValue={scrollOffsetAnimatedValue} />
                        </ScrollView>
                    ))
                    }
                </AnimatedPagerView >
                <Dots positionAnimatedValue={positionAnimatedValue} scrollOffsetAnimatedValue={scrollOffsetAnimatedValue} />
                <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                    <Button
                        mode='contained'
                        text={(page === data.length - 1) ? 'iniciar sesión' : 'siguiente'}
                        icon='arrow-forward-outline'
                        isAfterIcon
                        onPress={() => {
                            if (page === data.length - 1) {
                                alert({
                                    icon: true,
                                    type: 'question',
                                    text: '¿Desea omitir la bienvenida?',
                                    btnQuestion:
                                        <>
                                            <Button mode='contained' contentStyle={{ marginHorizontal: 3 }} text='si' onPress={omitWellcome} />
                                            <Button mode='contained' contentStyle={{ marginHorizontal: 3, backgroundColor: colors.danger }} text='no' onPress={cancel} />
                                        </>
                                });
                            } else {
                                Pager.current?.setPage(page + 1);
                            }
                        }}
                    />
                </View>
            </Reanimated.View >
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'space-between',
        padding: 20,
    },
    bootom: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    btns: {
        marginHorizontal: 5,
    },
    checkboxContainer: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
    },
    imageStyle: {
        resizeMode: 'contain',
        alignSelf: 'center',
    },
    heading: {
        textTransform: 'uppercase',
        fontWeight: '700',
        textAlign: 'center',
        // marginBottom: 15
    },
    description: {
        textAlign: 'justify',
    },
    pagination: {
        flex: 4,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    paginationDot: {
        width: DOT_SIZE,
        height: DOT_SIZE,
        borderRadius: DOT_SIZE / 2,
    },
});