import React, { useContext, useEffect, useLayoutEffect, useState } from 'react';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { style } from './LogInScreen';
import { Icon } from '../components/IconButton';
import Text from '../components/Text';
import { Image, KeyboardAvoidingView, View } from 'react-native';
import { Input } from '../components/Input/Input';
import { SubmitHandler, useForm } from 'react-hook-form';
import { Button } from '../components/Button';
import { useAppSelector } from '../app/hooks';
import Color from 'color';
import { rootStackScreen } from '../navigation/Stack';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import axios from 'axios';
import { HandleContext } from '../context/HandleContext';
import { Loading } from '../components/Loading';

interface Props extends NativeStackScreenProps<rootStackScreen, 'DomainScreen'> { };

export const DomainScreen = ({ navigation, route }: Props) => {
    const { theme: { dark: isDark, colors } } = useAppSelector(store => store.app);
    const backgroundColor: string = isDark ? Color(colors.background).darken(.4).toString() : colors.background;
    const { control, handleSubmit, reset, setValue, setError } = useForm<{ domain: string }>({ defaultValues: { domain: '', } });
    const { updateDomain, domain } = useContext(HandleContext);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const onSubmit: SubmitHandler<{ domain: string }> = async ({ domain }) => {
        setIsLoading(true);
        await axios.get(`https://${domain}`)
            .then(response => {
                reset();
                updateDomain(response.request['responseURL']);
                navigation.replace('LogInScreen');
            })
            .catch(async err => {
                try {
                    const response = await axios.get(`http://${domain}`);
                    reset();
                    updateDomain(response.request['responseURL']);
                    navigation.replace('LogInScreen');
                } catch (error) {
                    setError('domain', { message: `${error}`, type: "validate" });
                }
            })
            .finally(() => {
                setIsLoading(false);
            });
    };

    useLayoutEffect(() => {
        navigation.setOptions({
            headerShown: true,
            title: 'Prelmo',
        })
    }, [navigation])

    useEffect(() => {
        setValue('domain', domain.replace('https://', '').replace('http://', '').replace('/', ''));
    }, []);


    return (
        <Animated.View
            entering={FadeInDown.delay(350).duration(400)}
            style={[
                style.container,
                {
                    alignItems: 'center',
                    backgroundColor: colors.background,
                    padding: 15
                }
            ]}>
            <Loading refresh={isLoading} />
            <Icon name='code-working-outline' iconsize={45} />
            <Text style={{ marginVertical: 15 }} variant='titleLarge'>¡Bienvenido!</Text>
            <Text style={{ textAlign: 'center', marginHorizontal: 10, color: colors.outline }}>Para empezar a utilizar esta aplicación, proporcione la dirección del servidor de su central de alarmas</Text>
            <KeyboardAvoidingView style={[{ padding: 10 }]}>
                <Input
                    formInputs={control._defaultValues}
                    control={control}
                    name={'domain'}
                    iconLeft='server'
                    placeholder='exammple.domain.com'
                    keyboardType='url'
                    rules={{
                        required: { value: true, message: 'Campo requerido' },
                    }}
                    label='Dirección del Servidor'
                    onSubmitEditing={handleSubmit(onSubmit)}
                    returnKeyType='done'
                    autoCapitalize='none'
                />
            </KeyboardAvoidingView>
            <Button
                text='OK'
                mode='contained'
                onPress={handleSubmit(onSubmit)}
                contentStyle={{ marginVertical: 15 }}
                disabled={isLoading}
            />
        </Animated.View>
    )
}
