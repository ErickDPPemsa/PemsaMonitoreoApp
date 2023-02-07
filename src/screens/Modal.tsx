import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useCallback, useRef } from 'react';
import { Animated, Easing, Pressable, StyleSheet, View } from 'react-native';
import { Button } from '../components/Button';
import Text from '../components/Text';
import { rootStackScreen } from '../navigation/Stack';
import { useAppSelector } from '../app/hooks';
import Color from 'color';
import { ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { stylesApp } from '../App';
import { IconButton } from '../components/IconButton';
import { Orientation } from '../interfaces/interfaces';

interface Props extends NativeStackScreenProps<rootStackScreen, 'Modal'> { };
export const Modal = ({ navigation, route: { params: { type, icon, subtitle, text, title, timeClose, btnClose = true } } }: Props) => {
    const { theme: { colors, dark, roundness }, orientation } = useAppSelector(state => state.app);
    const backgroundColor: string = dark ? Color(colors.background).darken(.4).toString() : colors.background;

    const opacity = useRef(new Animated.Value(0)).current;
    const zoom = useRef(new Animated.Value(2)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const aminIn = useRef(new Animated.Value(0)).current;

    const AnimatedIcon = Animated.createAnimatedComponent(IconButton);

    const { iconColor, nameIcon } =
        type === 'info' ? { nameIcon: 'information-circle-outline', iconColor: colors.info }
            : type === 'warning' ? { nameIcon: 'alert-circle-outline', iconColor: colors.warning }
                : type === 'success' ? { nameIcon: 'checkmark-circle-outline', iconColor: colors.success }
                    : type === 'error' ? { nameIcon: 'close-circle-outline', iconColor: colors.error }
                        : type === 'question' ? { nameIcon: 'help-circle-outline', iconColor: colors.question }
                            : { nameIcon: 'palette', iconColor: colors.info };

    React.useEffect(() => {
        Animated.timing(aminIn, {
            toValue: 1,
            duration: 500,
            easing: Easing.bounce,
            useNativeDriver: true,
        }).start();

        Animated.parallel([
            Animated.timing(opacity, {
                toValue: 1,
                duration: 1000,
                easing: Easing.ease,
                useNativeDriver: true
            }),
            Animated.timing(zoom, {
                toValue: 1,
                duration: 1000,
                easing: Easing.in(Easing.bounce),
                useNativeDriver: true,
            }),
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 500,
                easing: Easing.ease,
                useNativeDriver: true,
            })
        ]).start();

        if (timeClose) {
            const time = setTimeout(() => {
                navigation.goBack();
            }, timeClose);
            return () => {
                clearTimeout(time);
            }
        }
    }, []);

    const styles = StyleSheet.create({
        full: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
        },
        press: {
            width: '100%',
            height: '100%'
        },
        containerModal: {
            position: 'absolute',
            backgroundColor: backgroundColor,
            borderRadius: roundness * 3,
            padding: 10,
            minWidth: 300,
            minHeight: 200,
        },
        modalHeader: {
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center'
        },
        modalBody: {
            flex: 8
        },
        modalFooter: {
            flex: 1,
            justifyContent: 'flex-end',
            alignItems: 'flex-end',
            marginTop: 10
        }
    });

    const _renderIcon = useCallback(() => {
        if (icon) {
            return (
                <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                    <AnimatedIcon
                        name={nameIcon}
                        color={iconColor}
                        iconsize={50}
                        style={{ transform: [{ scale: zoom }], opacity }}
                    />
                </View>
            )
        }
        return undefined;
    }, [icon]);


    return (
        <SafeAreaView style={styles.full}>
            <Pressable style={styles.press} onPress={() => navigation.goBack()} />
            <View style={[
                stylesApp.shadow,
                styles.containerModal,
                { shadowColor: colors.primary, elevation: 5 },
                orientation === Orientation.landscape ?
                    {
                        maxWidth: '70%',
                        maxHeight: '100%'
                    } :
                    {
                        maxWidth: '90%',
                        maxHeight: 500
                    }
            ]}>
                <View style={{ width: '100%', height: '100%' }}>
                    {
                        (title || subtitle) &&
                        <View style={styles.modalHeader}>
                            {_renderIcon()}
                            <View style={{ flex: 1, alignItems: 'center' }}>
                                {title && <Text variant='titleLarge'>{title}</Text>}
                                {subtitle && <Text variant='titleMedium'>{subtitle}</Text>}
                            </View>
                            <IconButton name='close' onPress={() => navigation.goBack()} />
                        </View>
                    }
                    <View style={styles.modalBody}>
                        <ScrollView>
                            <Text variant='titleSmall' style={{ textAlign: 'center' }}>{text}</Text>
                        </ScrollView>
                    </View>
                    <View style={styles.modalFooter}>
                        {btnClose && <Button mode='contained' contentStyle={{ marginHorizontal: 5, alignSelf: 'flex-end' }} text='cerrar' onPress={() => navigation.goBack()} />}
                    </View>
                </View>
            </View>
        </SafeAreaView >
    )
}
