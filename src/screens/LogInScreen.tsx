import React, { useContext, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Image, KeyboardAvoidingView, StyleSheet, View, TextInput as NativeTextInput, TouchableWithoutFeedback, TouchableOpacity, ScrollView } from 'react-native';
import { useForm, SubmitHandler } from 'react-hook-form';
import { Input } from '../components/Input/Input';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { Loading } from '../components/Loading';
import { useMutation } from '@tanstack/react-query';
import { setUser } from '../features/appSlice';
import { SocialNetworks } from '../components/SocialNetworks';
import { Button } from '../components/Button';
import Text from '../components/Text';
import { Orientation } from '../interfaces/interfaces';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { rootStackScreen } from '../navigation/Stack';
import { Keyboard } from 'react-native';
import { stylesApp } from '../App';
import Color from 'color';
import { HandleContext } from '../context/HandleContext';
import { AlertContext } from '../components/Alert/AlertContext';
import Animated, { FadeInDown, log } from 'react-native-reanimated';
import TextInput from '../components/Input/TextInput';
import { AxiosError, AxiosResponse } from 'axios';
import { CheckBox } from '../components/CheckBox';
import { statusCheckBox } from '../types/types';
import EncryptedStorage from 'react-native-encrypted-storage';
import { Toast } from 'react-native-toast-message/lib/src/Toast';


type InputsLogIn = {
    email: string,
    password: string,
}

interface Props extends NativeStackScreenProps<rootStackScreen, 'LogInScreen'> { };
export const LogInScreen = ({ navigation, route }: Props) => {
    const { theme: { dark: isDark, colors } } = useAppSelector(store => store.app);
    const backgroundColor: string = isDark ? Color(colors.background).darken(.4).toString() : colors.background;
    const dispatchApp = useAppDispatch();
    const { control, handleSubmit, reset, setValue, getValues } = useForm<InputsLogIn>({ defaultValues: { email: '', password: '' } });
    const { handleError, domain, LogIn } = useContext(HandleContext);
    const { alert } = useContext(AlertContext);
    const [isChecked, setIsChecked] = useState<statusCheckBox>();
    const [isGettingData, setIsGettingData] = useState<boolean>(false);
    const [savedData, setSavedData] = useState<InputsLogIn>();

    const { isLoading, mutate } = useMutation(['LogIn'], LogIn, {
        retry: 0,
        onError: async err => {
            const Error: AxiosError = err as AxiosError;
            const Response: AxiosResponse = Error.response as AxiosResponse;
            handleError(String(Response.data.message));
        },
        onSuccess: async data => {
            if (isChecked === 'checked') {
                await EncryptedStorage.setItem('PrelmoAccountCredentialsSaved', JSON.stringify(getValues()));
            }
            if (data.termsAndConditions)
                dispatchApp(setUser(data));
            else
                navigation.navigate('TCAP', { user: data });
        },
    });

    const onSubmit: SubmitHandler<InputsLogIn> = async (data) => {
        mutate(data);
    };

    const nextInput = useRef<NativeTextInput>(null);

    useLayoutEffect(() => {
        navigation.setOptions({
            headerShown: true,
            title: 'Prelmo',
            headerLeft: (({ canGoBack, label, tintColor }) =>
                <View style={{ height: '100%', width: 50 }}>
                    <Image
                        source={require('../assets/logo4.png')}
                        style={[
                            isDark && { tintColor: colors.onSurface },
                            {
                                height: '170%',
                                width: '100%',
                                resizeMode: 'contain',
                            }
                        ]}
                    />
                </View>
            )
        })
    }, [navigation, isDark])

    useEffect(() => {
        setIsGettingData(true);
        const state = navigation.getState();
        const routes = state.routes;
        navigation.reset({
            ...state,
            routes: routes.slice(0),
            index: 0
        });
        EncryptedStorage.getItem('PrelmoAccountCredentialsSaved')
            .then(response => {
                if (response) {
                    try {
                        const { email, password }: InputsLogIn = JSON.parse(response);
                        setSavedData({ email, password });
                        setValue('email', email);
                        // setValue('password', password);
                    } catch (error) { Toast.show({ text1: 'Error', text2: `${error}` }) }
                } else {
                    setSavedData(undefined);
                }
            })
            .catch(err => {
                Toast.show({ text1: 'Error', text2: `${err}` });
            })
            .finally(() => {
                setIsGettingData(false);
            })
    }, []);


    return (
        <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
            <Animated.View
                entering={FadeInDown.delay(350).duration(400)}
                style={[style.container, { backgroundColor: colors.background }]}
            >
                <Loading refresh={(isLoading || isGettingData)} />
                <View style={{ justifyContent: 'center' }}>
                    <View>
                        <ScrollView>
                            <Text style={{ textAlign: 'center', marginVertical: 5 }} variant='titleLarge'>Bienvenido</Text>
                            <Text style={{ textAlign: 'center', color: colors.outline, marginVertical: 5 }} variant='titleSmall'>Ingrese sus datos para iniciar sesión</Text>
                            <KeyboardAvoidingView style={[{ paddingVertical: 5 }]}>
                                <TextInput
                                    iconLeft='server'
                                    placeholder='exammple.domain.com'
                                    label='Dirección del Servidor'
                                    value={domain.replace('https://', '').replace('http://', '').replace('/', '')}
                                    editable={(domain === '') ? true : false}
                                    containerStyle={{ marginVertical: 5 }}
                                    action={<Button
                                        mode='text'
                                        text='cambiar'
                                        variantText='labelSmall'
                                        labelStyle={{ textTransform: 'capitalize', fontWeight: 'bold' }}
                                        onPress={(() => navigation.navigate('DomainScreen'))}
                                    />}
                                />
                                <Input
                                    editable={(!isLoading && !isGettingData)}
                                    formInputs={control._defaultValues}
                                    control={control}
                                    name={'email'}
                                    iconLeft='mail'
                                    placeholder='ejemplo@correo.com'
                                    keyboardType='email-address'
                                    rules={{ required: { value: true, message: 'Campo requerido' } }}
                                    label='Correo'
                                    returnKeyType='next'
                                    onSubmitEditing={() => {
                                        nextInput.current?.focus();
                                    }}
                                    autoCapitalize='none'
                                />
                                <Input
                                    editable={(!isLoading && !isGettingData)}
                                    onRef={(nextInput) => { nextInput = nextInput }}
                                    formInputs={control._defaultValues}
                                    control={control}
                                    name={'password'}
                                    iconLeft='lock-closed'
                                    keyboardType='default'
                                    secureTextEntry
                                    placeholder='**********'
                                    rules={{ required: { value: true, message: 'Campo requerido' } }}
                                    label='Contraseña'
                                    onSubmitEditing={handleSubmit(onSubmit)}
                                    returnKeyType='done'
                                    autoCapitalize='none'
                                />
                            </KeyboardAvoidingView>
                            {
                                !savedData &&
                                <CheckBox
                                    text='Recordar contraseña'
                                    onChange={(props) => setIsChecked(props)}
                                />
                            }
                            <Button
                                text='Iniciar Sesión'
                                mode='contained'
                                onPress={handleSubmit(onSubmit)}
                                loading={(isLoading || isGettingData)}
                                disabled={(isLoading || isGettingData)}
                                labelStyle={{ paddingVertical: 5, paddingHorizontal: 20 }}
                                contentStyle={{ marginBottom: 15 }}
                            />
                        </ScrollView>
                    </View>
                </View>

                <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginVertical: 5 }}>
                    <TouchableOpacity
                        onPress={() => navigation.navigate('PdfScreen', { name: 'Registro', url: `${domain}/docs/REGISTRO-PLATAFORMA.pdf` })}
                        disabled={isLoading} >
                        <Text variant='titleSmall' style={[{ textAlign: 'center', marginVertical: 10 }]}>Regístrate</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => {
                        alert({ type: 'info', icon: true, text: 'Contacta a tu titular para recuperar tu contraseña', title: 'Alerta' });
                    }}
                        disabled={isLoading} >
                        <Text variant='titleSmall' style={[{ textAlign: 'center', marginVertical: 10 }]} >Olvidé mi contraseña</Text>
                    </TouchableOpacity>
                </View>

                <TouchableOpacity style={{ marginVertical: 15 }} onPress={() => navigation.navigate('TCAP')} disabled={isLoading} >
                    <Text variant='titleSmall' style={{ textAlign: 'center' }}>Términos y condiciones y aviso de privacidad</Text>
                </TouchableOpacity>
                <SocialNetworks />
            </Animated.View>
        </TouchableWithoutFeedback>
    )
}

export const style = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: 15,
        paddingHorizontal: '10%',

    }
});