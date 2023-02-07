import React, { useEffect, useRef, useState } from 'react'
import { Pressable, PressableProps, View, StyleProp, ViewStyle, LayoutRectangle, Modal, SafeAreaView, TextStyle } from 'react-native';
import IconVI from 'react-native-vector-icons/Ionicons';
import Color from 'color';
import { useAppSelector } from '../app/hooks';
import { Props as ButtonProps } from './Button';
import { Orientation } from '../interfaces/interfaces';
import { Platform } from 'react-native';
import { Button } from './Button';
import { stylesApp } from '../App';
import { NativeTouchEvent } from 'react-native';

interface Props extends PressableProps {
    name: string;
    iconsize?: number;
    color?: string;
}

const renderContent = ({ children }: { children: React.ReactNode }) => {
    return (
        React.Children.toArray(children as React.ReactNode | Array<React.ReactNode>)
            .filter((child) => child != null && typeof (child) !== 'boolean')//aseguramos que es un Elemento
            .map((child, i) => {
                //@ts-ignore
                if (!React.isValidElement(child) || ![Text].includes(child.type)) return child;

                const props: { style?: StyleProp<TextStyle>; } = {};
                //@ts-ignore
                if (child.type === Text) {
                    props.style = [{ flex: 1, marginHorizontal: 10 }]
                }

                return React.cloneElement(child, props);
            })
    )
}

export const IconButton = React.forwardRef<View, Props>(
    (props: Props, ref) => {
        const { name, iconsize, color, disabled } = props;
        const { theme: { colors, dark } } = useAppSelector(state => state.app);
        const iconProps = { color, name };
        const size: number = 25;
        const iconColor: string = dark ? colors.primary : Color(colors.primary).darken(.3).toString();

        return (
            <Pressable {...props} ref={ref}>
                {
                    ({ pressed }) =>
                        <View style={[
                            {
                                width: (iconsize ?? size) + 5,
                                height: (iconsize ?? size) + 5,
                                borderRadius: (iconsize ?? size) * 2,
                                backgroundColor: pressed ? Color(iconProps.color ?? colors.primary).fade(.8).toString() : undefined,
                                justifyContent: 'center', alignItems: 'center'
                            }
                        ]}>
                            <IconVI {...iconProps} size={iconsize ?? size} color={disabled ? colors.surfaceDisabled : iconProps.color ?? iconColor} />
                        </View>
                }
            </Pressable >
        )
    }
);

interface PropsIcon {
    name: string;
    iconsize?: number;
    color?: string;
    style?: StyleProp<ViewStyle>;
}

export const Icon = React.forwardRef<View, PropsIcon>(
    (props: Props, ref) => {
        const { name, iconsize, color, disabled, style } = props;
        const stl = style as StyleProp<ViewStyle>;
        const { theme: { colors, dark } } = useAppSelector(state => state.app);
        const iconProps = { color, name };
        const size: number = 25;
        const iconColor: string = dark ? colors.primary : Color(colors.primary).darken(.3).toString();

        return (

            <View ref={ref} style={[
                {
                    width: (iconsize ?? size) + 5,
                    height: (iconsize ?? size) + 5,
                    borderRadius: (iconsize ?? size) * 2,
                    justifyContent: 'center', alignItems: 'center'
                },
                stl
            ]}>
                <IconVI {...iconProps} size={iconsize ?? size} color={disabled ? colors.surfaceDisabled : iconProps.color ?? iconColor} />
            </View>
        )
    }
);
interface IconPropsMenu {
    menu?: Array<ButtonProps>;
    disabled?: boolean;
}

export const IconMenu = React.forwardRef<Modal, IconPropsMenu>(
    ({ disabled, menu }: IconPropsMenu, ref) => {
        const { theme: { colors, dark, roundness }, insets, orientation, screenWidth, screenHeight } = useAppSelector(state => state.app);

        const [open, setOpen] = useState<boolean>(false);
        const [iconMeasure, seticonMeasure] = useState<{
            x: number;
            y: number;
            width: number;
            height: number;
        }>({ x: 0, y: 0, height: 0, width: 0 });

        const icon = useRef<View>(null);

        const radius: number = roundness * 3;
        const backgroundColor: string = dark ? Color(colors.background).darken(.4).toString() : colors.background;


        const updateSizes = () => {
            if (icon.current) {
                icon.current.measureInWindow((x, y, width, height) => {
                    seticonMeasure({ x, y, height, width });
                });
            }
        }

        useEffect(() => {
            setOpen(false);
            updateSizes();
        }, [orientation]);

        return (
            <>
                <IconButton
                    ref={icon}
                    disabled={disabled}
                    name={open ? 'ellipsis-horizontal-circle-outline' : 'ellipsis-vertical-circle-outline'}
                    color={colors.primary}
                    onPress={() => {
                        setOpen(true);
                        updateSizes();
                    }}
                />
                <Modal ref={ref} visible={open} animationType='fade' hardwareAccelerated transparent supportedOrientations={['landscape', 'portrait']} >
                    <SafeAreaView style={{ flex: 1, backgroundColor: Color(colors.backdrop).fade(.3).toString() }}>
                        <Pressable style={{ flex: 1 }} onPress={() => setOpen(false)} />
                        <View style={[
                            {
                                position: 'absolute',
                                top: iconMeasure.height + iconMeasure.y,
                                right: (orientation === Orientation.landscape ? screenHeight : screenWidth) - (iconMeasure.x + iconMeasure.width),
                                backgroundColor: backgroundColor, padding: 10,
                            },
                            stylesApp.shadow, { shadowColor: colors.primary, borderRadius: radius, shadowRadius: radius, elevation: 5 }
                        ]}>
                            {
                                menu?.map((op, idx) => {
                                    return (
                                        <View key={idx + 1}>
                                            <Button {...op}
                                                onPress={(props) => {
                                                    op.onPress && op.onPress(props);
                                                    setOpen(!open);
                                                }}
                                                variantText='labelMedium'
                                            />
                                            {Platform.OS === 'ios' && idx < menu.length - 1 && <View style={{ width: '100%', borderBottomWidth: 1, borderBottomColor: Color(colors.background).fade(.2).toString(), backgroundColor: colors.onSurface }} />}
                                        </View>
                                    )
                                })
                            }
                        </View>
                    </SafeAreaView>
                </Modal>
            </>
        )
    });