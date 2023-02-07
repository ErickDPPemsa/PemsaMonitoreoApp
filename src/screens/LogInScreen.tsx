import React, { useContext, useEffect, useRef, useState } from 'react';
import { Image, KeyboardAvoidingView, StyleSheet, View, TextInput as NativeTextInput, TouchableWithoutFeedback, TouchableOpacity } from 'react-native';
import { useForm, SubmitHandler } from 'react-hook-form';
import { Input } from '../components/Input/Input';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { Loading } from '../components/Loading';
import { useMutation } from '@tanstack/react-query';
import { LogIn } from '../api/Api';
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
import { Alert } from '../components/Alert';
import { HandleContext } from '../context/HandleContext';

type InputsLogIn = {
    email: string,
    password: string,
}

interface Props extends NativeStackScreenProps<rootStackScreen, 'LogInScreen'> { };
export const LogInScreen = ({ navigation }: Props) => {
    const { theme: { dark: isDark, colors, roundness }, orientation } = useAppSelector(store => store.app);
    const backgroundColor: string = isDark ? Color(colors.background).darken(.4).toString() : colors.background;
    const [isHelp, setIsHelp] = useState<boolean>(false);
    const dispatchApp = useAppDispatch();
    const { control, handleSubmit, reset, setValue, formState } = useForm<InputsLogIn>({ defaultValues: { email: '', password: '' } });
    const { handleError } = useContext(HandleContext);

    const { isLoading, mutate } = useMutation(['LogIn'], LogIn, {
        retry: 0,
        onError: async err => handleError(String(err)),
        onSuccess: async data => {
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

    useEffect(() => {
        setValue('email', 'jefemonitoreo@pem-sa.com');
        setValue('password', '123456');
    }, []);

    return (
        <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
            <View style={[style.container, { backgroundColor: colors.background }]}>
                <Loading refresh={isLoading} />
                <View style={[
                    style.auth,
                    { backgroundColor: backgroundColor, borderRadius: roundness * 4, shadowColor: colors.primary },
                    (orientation === Orientation.landscape) && {
                        height: "90%",
                        width: '80%',
                        flexDirection: 'row',
                        alignItems: 'center'
                    }
                ]}>
                    <View style={[
                        style.logo,
                        { backgroundColor: backgroundColor, elevation: 2, shadowColor: colors.primary, justifyContent: 'center', alignItems: 'center' },
                        (orientation === Orientation.landscape) && {
                            top: 0,
                            marginBottom: 0,
                            marginHorizontal: 10
                        }
                    ]}>
                        <Image
                            source={require('../assets/logo4.png')}
                            style={[
                                isDark && { tintColor: colors.onSurface },
                                {
                                    height: '80%',
                                    width: '70%',
                                }
                            ]}
                        />
                    </View>
                    <View style={[
                        (orientation === Orientation.landscape) && {
                            flex: 1,
                        }
                    ]}>
                        <KeyboardAvoidingView style={[{ paddingVertical: 5 }]}>
                            <Input
                                editable={!isLoading}
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
                                editable={!isLoading}
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
                            <TouchableOpacity onPress={() =>
                                navigation.navigate('Modal', {
                                    type: 'info',
                                    icon: true,
                                    text: 'Contacta a tu titular para recuperar tu contraseña',
                                })}
                                disabled={isLoading} >
                                <Text variant='titleSmall' style={[{ textAlign: 'right', marginVertical: 15 }]}>Olvidé mi contraseña</Text>
                            </TouchableOpacity>
                        </KeyboardAvoidingView>
                        <View style={[
                            (orientation === Orientation.landscape) && {
                                flex: 1,
                                flexDirection: 'row-reverse',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }
                        ]}>
                            <Button
                                text='Iniciar Sesión'
                                mode='contained'
                                onPress={handleSubmit(onSubmit)}
                                loading={isLoading}
                                disabled={isLoading}
                                labelStyle={{ paddingVertical: 5, paddingHorizontal: 20 }}
                                contentStyle={{ marginBottom: 15 }}
                            />
                            <View style={[
                                (orientation === Orientation.landscape) && {
                                    flex: 1,
                                }
                            ]}>
                                <SocialNetworks />
                                <TouchableOpacity style={{ marginVertical: 15 }} onPress={() => navigation.navigate('TCAP')} disabled={isLoading} >
                                    <Text variant='titleSmall' style={{ textAlign: 'center' }}>Términos y condiciones y aviso de privacidad</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </View>
                <Alert visible={isHelp} type='info' icon subtitle='Contacta a tu titular para recuperar tu contraseña' dismissable renderCancel onCancel={(cancel: boolean) => { setIsHelp(!cancel) }} />
            </View>
        </TouchableWithoutFeedback>
    )
}

export const style = StyleSheet.create({
    container: {
        flex: 1,
        position: 'relative',
        justifyContent: 'center'
    },
    auth: {
        width: '90%',
        alignSelf: 'center',
        paddingHorizontal: 14,
        paddingBottom: 30,
        ...stylesApp.shadow,
        elevation: 5
    },
    logo: {
        width: 130,
        height: 130,
        borderRadius: 1000,
        alignSelf: 'center',
        top: -65,
        marginBottom: -65,
        ...stylesApp.shadow,
        elevation: 4,
        shadowRadius: 2
    },
});