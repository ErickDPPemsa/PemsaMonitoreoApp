import Color from 'color';
import React, { useState, useCallback, useContext, useEffect } from 'react';
import { LayoutRectangle, Modal, Pressable, SafeAreaView, StatusBar, StyleSheet, View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { stylesApp } from '../../App';
import { useAppSelector } from '../../app/hooks';
import { HandleContext } from '../../context/HandleContext';

interface Props {
    children: React.ReactNode;
    open: boolean,
    positionActivator?: LayoutRectangle,
    close: (close: boolean) => void;
    animationType?: "none" | "slide" | "fade" | undefined;
}

export const Menu = ({ children, open, positionActivator, close, animationType }: Props) => {
    const { theme: { colors, roundness, dark }, orientation, insets } = useAppSelector(state => state.app);
    const plus: number = 2;

    const renderContent = ({ children }: { children: React.ReactNode }) => {
        return (
            React.Children.toArray(children as React.ReactNode | Array<React.ReactNode>)
                .filter((child) => child != null && typeof (child) !== 'boolean')//aseguramos que es un Elemento
                .map((child, i) => {
                    //@ts-ignore
                    if (!React.isValidElement(child) || ![].includes(child.type)) return child;
                    return child
                })
        )
    }

    const _renderOptions = useCallback(() => {
        if (positionActivator) {
            return (
                // Platform.OS === 'ios'
                //     ?
                //     <View style={[styles.modal,
                //     {
                //         width: '100%',
                //         bottom,
                //         borderRadius: roundness * plus,
                //         backgroundColor: dark ? Color(colors.background).darken(.4).toString() : colors.background,
                //         shadowColor: colors.onSurface
                //     },
                //     orientation === Orientation.landscape && {
                //         backgroundColor: 'red'
                //     }
                //     ]}>
                //         {_renderItems()}
                //     </View>
                //     :
                <View style={[
                    styles.modal,
                    stylesApp.shadow,
                    {
                        right: 20,
                        top: positionActivator.y + 10 + (insets ? insets?.top : 0), borderRadius: roundness * plus,
                        backgroundColor: dark ? Color(colors.background).darken(.4).toString() : colors.background,
                        shadowColor: colors.primary,
                        elevation: 5,
                    }]}>
                    {/* {_renderItems()} */}
                    {renderContent({ children })}
                </View>
            )
        } else {
            return (
                <View
                    style={[styles.modal, {
                        alignSelf: 'center',
                        width: '90%',
                        bottom: 0,
                        borderTopRightRadius: roundness * plus,
                        borderTopLeftRadius: roundness * plus,
                        maxHeight: 400,
                        backgroundColor: dark ? Color(colors.background).darken(.4).toString() : colors.background,
                        paddingBottom: 20,
                        ...stylesApp.shadow,
                        elevation: 5
                    }]}
                >
                    <ScrollView>
                        {renderContent({ children })}
                    </ScrollView>
                </View>
            )
        }
    }, [positionActivator, colors, orientation]);

    const [changeColor, setChangeColor] = useState(false)

    useEffect(() => {
        setChangeColor(false);
    }, [])


    return (
        <Modal
            visible={open}
            transparent
            animationType={animationType}
            hardwareAccelerated
            supportedOrientations={['landscape', 'portrait']}
            onShow={() => {
                setChangeColor(true)
            }}
        >
            <StatusBar backgroundColor={colors.backdrop} />
            <SafeAreaView style={[
                { flex: 1, backgroundColor: changeColor ? colors.backdrop : undefined }
            ]}>
                <Pressable style={{ flex: 1 }} onPress={() => close && close(true)} />
                {_renderOptions()}
            </SafeAreaView>
        </Modal>
    )
}

const styles = StyleSheet.create({
    containerModal: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modal: {
        position: 'absolute',
        padding: 15
    },
    containerItemModal: {
        borderWidth: .3,
        marginVertical: 3,
        padding: 5
    }
});