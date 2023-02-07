import React, { useCallback, useContext, useRef, useState } from 'react';
import { Animated, Easing, Modal, StatusBar, StyleSheet, View, Pressable, SafeAreaView } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import Icon from 'react-native-vector-icons/Ionicons';
import { useAppSelector } from '../app/hooks';
import { Button } from './Button';
import { stylesApp } from '../App';
import Color from 'color';
import { HandleContext } from '../context/HandleContext';
import Text from './Text';
import { Orientation } from '../interfaces/interfaces';

interface Props {
    type: 'info' | 'error' | 'question' | 'warning' | 'success' | 'theme';
    icon?: boolean;
    title?: string,
    subtitle?: string,
    msg?: string
    visible: boolean;
    dismissable?: boolean;
    func?: () => void;
    timeClose?: number;
    questionProps?: {
        textConfirm: string;
        textCancel: string;
        funcConfirm: () => void;
        funcCancel: () => void;
    }
    textCancel?: string;
    onCancel?: (cancel: boolean) => void;
    renderCancel?: boolean
}

export const Alert = ({ icon, visible, dismissable, type, timeClose, func, questionProps, msg, subtitle, title, renderCancel, textCancel, onCancel }: Props) => {

    const { theme: { colors, dark, fonts, roundness }, orientation } = useAppSelector((state) => state.app);
    const opacity = useRef(new Animated.Value(0)).current;
    const zoom = useRef(new Animated.Value(2)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const aminIn = useRef(new Animated.Value(0)).current;
    const AnimatedIcon = Animated.createAnimatedComponent(Icon);
    const [isVisible, setIsVisible] = useState<boolean>(false);
    const minWidth: number = 70;
    const minHeight: number = 25;

    const closeAlert = () => {
        opacity.setValue(0);
        zoom.setValue(2);
        fadeAnim.setValue(0);
        aminIn.setValue(0);
        onCancel && onCancel(true);
        setIsVisible(false);
    }
    const { iconColor, nameIcon } =
        type === 'info' ? { nameIcon: 'information-circle-outline', iconColor: colors.info }
            : type === 'warning' ? { nameIcon: 'alert-circle-outline', iconColor: colors.warning }
                : type === 'success' ? { nameIcon: 'check-circle-outline', iconColor: colors.success }
                    : type === 'error' ? { nameIcon: 'close-circle-outline', iconColor: colors.error }
                        : { nameIcon: 'help-circle-outline', iconColor: colors.question };


    React.useEffect(() => {
        if (isVisible) {
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
        }
    }, [isVisible]);

    React.useEffect(() => {
        if (isVisible && timeClose) {
            const time = setTimeout(() => {
                closeAlert();
                onCancel && onCancel(true);
            }, timeClose);
            return () => {
                clearTimeout(time);
            }
        }
    }, []);

    React.useEffect(() => {
        setIsVisible(visible)
    }, [visible])


    const _renderIcon = useCallback(() => {
        if (icon) {
            return (
                <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                    <AnimatedIcon
                        name={nameIcon}
                        color={iconColor}
                        size={40}
                        style={{ transform: [{ scale: zoom }], opacity }}
                    />
                </View>
            )
        }
        return undefined;
    }, [icon]);

    const _renderButtons = useCallback(() => {
        if (type === 'question' && questionProps) {
            const { funcCancel, funcConfirm, textCancel, textConfirm } = questionProps;
            return (
                <Animated.View style={{ marginTop: 10, flexDirection: 'row', justifyContent: 'flex-end', transform: [{ scale: aminIn }] }}>
                    <Button
                        contentStyle={{ marginHorizontal: 5 }}
                        customButtonColor={colors.danger}
                        text={textCancel ?? 'no'}
                        mode='contained'
                        onPress={() => {
                            closeAlert()
                            funcCancel()
                        }}
                    />
                    <Button
                        contentStyle={{ marginHorizontal: 5 }}
                        customButtonColor={colors.success}
                        text={textConfirm ?? 'si'}
                        mode='contained'
                        onPress={() => {
                            closeAlert()
                            funcConfirm()
                        }}
                    />
                </Animated.View>
            )
        }
        if (renderCancel) {
            return (
                <View style={{ alignItems: 'flex-end' }}>
                    <Button
                        text={textCancel ?? 'cerrar'}
                        mode='contained'
                        onPress={() => {
                            onCancel && onCancel(true)
                            closeAlert()
                        }}
                    />
                </View>
            )
        }
        return undefined;
    }, [type, questionProps, renderCancel, textCancel])

    return (
        <Modal visible={isVisible} transparent animationType='fade' supportedOrientations={['landscape', 'portrait']}>
            <StatusBar backgroundColor={colors.backdrop} />
            <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <Pressable style={{ width: '100%', height: '100%', backgroundColor: Color(colors.backdrop).fade(.7).toString() }} onPress={() => {
                    if (dismissable) {
                        onCancel && onCancel(true);
                        setIsVisible(false)
                    }
                }} />
                <View style={[styles.modal, {
                    backgroundColor: dark ? Color(colors.background).darken(.4).toString() : colors.background,
                    borderRadius: roundness * 3, minHeight, minWidth, width: '80%',
                    shadowColor: colors.onSurface
                },
                orientation === Orientation.landscape && {
                    width: '50%',
                }
                ]}>
                    {_renderIcon()}
                    <View style={{ justifyContent: 'center', flex: 1 }}>
                        <View>
                            <ScrollView>
                                <Animated.View style={{ opacity }}>
                                    {title && <Text variant='titleLarge' style={[styles.title]}>{title}</Text>}
                                    {subtitle && <Text variant='titleMedium' style={[styles.title]}>{subtitle}</Text>}
                                    {msg && <Text variant='titleSmall' style={[styles.title]}>{msg}</Text>}
                                </Animated.View>
                            </ScrollView>
                        </View>
                    </View>
                    {_renderButtons()}
                </View>
            </SafeAreaView>
        </Modal>
    )
}
export const styles = StyleSheet.create({
    btnSeparate: {
        marginHorizontal: 5
    },
    btnConfirm: {
        backgroundColor: 'steelblue'
    },
    modal: {
        position: 'absolute',
        padding: 20,
        ...stylesApp.shadow
    },
    title: {
        textAlign: 'center',
        marginVertical: 4
    }
});