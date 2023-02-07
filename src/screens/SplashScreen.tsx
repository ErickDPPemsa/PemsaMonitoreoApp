import React, { useContext, useEffect, useRef } from 'react';
import { View, Animated, Easing } from 'react-native';
import { useAppSelector, useAppDispatch } from '../app/hooks';
import EncryptedStorage from 'react-native-encrypted-storage';
import Toast from 'react-native-toast-message';
import { setUser } from '../features/appSlice';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { rootStackScreen } from '../navigation/Stack';
import { HandleContext } from '../context/HandleContext';
import { useMutation } from '@tanstack/react-query';
import { CheckAuth } from '../api/Api';

interface Props extends NativeStackScreenProps<rootStackScreen, 'SplashScreen'> { };

export const SplashScreen = ({ navigation }: Props) => {
    const anim = useRef(new Animated.Value(1)).current;
    const { theme: { dark, colors } } = useAppSelector(state => state.app);
    const { handleError } = useContext(HandleContext);
    const appDispatch = useAppDispatch();

    const { mutate } = useMutation(['CheckAuth'], (token: string) => CheckAuth({ token }), {
        onSuccess: data => appDispatch(setUser(data)),
        onError: err => {
            handleError(String(err));
            start({ time: 0 });
        }
    })

    const toast = (error: string) => {
        Toast.show({
            type: 'error',
            text1: 'Error',
            text2: error,
            onHide: () => start({ time: 0 }),
        });
    }

    const start = ({ time }: { time?: number }) => setTimeout(async () => {
        try {
            const open = await EncryptedStorage.getItem('isWellcomeOff');
            (open && open === 'true') ? navigation.replace('LogInScreen') : navigation.replace('IntroductionScreen');
        } catch (error) {
            handleError(String(error));
            navigation.replace('IntroductionScreen');
        }
    }, time ?? 1500);

    Animated.loop(
        Animated.sequence([
            Animated.timing(anim, {
                toValue: 1.1,
                duration: 400,
                easing: Easing.ease,
                useNativeDriver: true,
            }),
            Animated.timing(anim, {
                toValue: 1,
                duration: 400,
                easing: Easing.ease,
                useNativeDriver: true,
            })
        ])
    ).start();

    useEffect(() => {
        EncryptedStorage.getItem('token').then(async token => {
            if (!token) {
                start({});
            } else {
                mutate(token);
            }
        }).catch(error => toast(String(error)));
    }, []);


    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Animated.Image
                style={[
                    { width: 150, height: 150, transform: [{ scale: anim, }] },
                    dark && { tintColor: colors.onSurface }
                ]}
                source={require('../assets/logo4.png')}
            />
        </View>
    )
}
