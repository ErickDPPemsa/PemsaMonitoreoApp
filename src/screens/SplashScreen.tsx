import React, { useContext, useEffect } from 'react';
import { View } from 'react-native';
import { useAppSelector, useAppDispatch } from '../app/hooks';
import EncryptedStorage from 'react-native-encrypted-storage';
import Toast from 'react-native-toast-message';
import { setUser } from '../features/appSlice';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { rootStackScreen } from '../navigation/Stack';
import { HandleContext } from '../context/HandleContext';
import { useMutation } from '@tanstack/react-query';
import Animated, { BounceIn, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';
import { AxiosError, AxiosResponse } from 'axios';

interface Props extends NativeStackScreenProps<rootStackScreen, 'SplashScreen'> { };

export const SplashScreen = ({ navigation }: Props) => {
    const { theme: { dark, colors } } = useAppSelector(state => state.app);
    const { handleError, CheckAuth, domain } = useContext(HandleContext);
    const appDispatch = useAppDispatch();

    const { mutate } = useMutation(['CheckAuth'], CheckAuth, {
        onSuccess: data => appDispatch(setUser(data)),
        onError: err => {
            const Error: AxiosError = err as AxiosError;
            const Response: AxiosResponse = Error.response as AxiosResponse;
            handleError(String(Response.data.message));
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
            (open && open === 'true') ? domain ? navigation.replace('LogInScreen') : navigation.replace('DomainScreen') : navigation.replace('IntroductionScreen');
        } catch (error) {
            handleError(String(error));
            navigation.replace('IntroductionScreen');
        }
    }, time ?? 1300);

    const scale = useSharedValue(.95);

    useEffect(() => {
        scale.value = withRepeat(
            withTiming(1, { duration: 390 }),
            10000,
            true
        );
    }, []);

    useEffect(() => {
        if (domain !== '') {
            EncryptedStorage.getItem('token').then(async token => {
                if (!token) {
                    start({});
                } else {
                    mutate();
                }
            }).catch(error => toast(String(error)));
        } else {
            start({});
        }
    }, [domain]);

    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [{ scale: scale.value }],
        };
    });

    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Animated.Image entering={BounceIn}
                style={[
                    { width: 150, height: 150 },
                    dark && { tintColor: colors.onSurface },
                    animatedStyle
                ]}
                source={require('../assets/logo4.png')}
            />
        </View>
    )
}
