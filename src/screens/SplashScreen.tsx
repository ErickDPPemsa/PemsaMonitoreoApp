import React, { useContext, useEffect } from 'react';
import { View } from 'react-native';
import { useAppSelector } from '../app/hooks';
import EncryptedStorage from 'react-native-encrypted-storage';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { rootStackScreen } from '../navigation/Stack';
import { HandleContext } from '../context/HandleContext';
import Animated, { BounceIn, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';
import Text from '../components/Text';

interface Props extends NativeStackScreenProps<rootStackScreen, 'SplashScreen'> { };

export const SplashScreen = ({ navigation }: Props) => {
    const { theme: { dark, colors }, status } = useAppSelector(state => state.app);
    const { handleError, domain } = useContext(HandleContext);

    const start = () => setTimeout(async () => {
        try {
            const open = await EncryptedStorage.getItem('isWellcomeOff');
            (open && open === 'true')
                ? (domain !== '')
                    ? navigation.replace('LogInScreen')
                    : navigation.replace('DomainScreen')
                : navigation.replace('IntroductionScreen');

        } catch (error) {
            handleError(String(error));
            navigation.replace('IntroductionScreen');
        }
    }, 1000);

    const scale = useSharedValue(.95);

    useEffect(() => {
        scale.value = withRepeat(
            withTiming(1, { duration: 390 }),
            10000,
            true
        );
    }, []);

    useEffect(() => {
        if (status === 'unlogued') {
            start();
        }
    }, [status, domain]);

    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [{ scale: scale.value }],
        };
    });

    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Animated.Image entering={BounceIn}
                style={[
                    { width: '50%', height: 150, resizeMode: 'contain' },
                    dark && { tintColor: colors.onSurface },
                    animatedStyle
                ]}
                source={require('../assets/prelmo2.png')}
            />
            {(status === 'checking') && <Text>Checando...</Text>}
        </View>
    )
}
