import React, { useCallback, useContext, useEffect, useRef, useState } from 'react'
import { Keyboard, Modal, TextInput as NativeTextInput, TouchableWithoutFeedback, View, SafeAreaView, StyleSheet, StatusBar, Platform, LayoutRectangle, Pressable } from 'react-native';
import { useAppSelector } from '../../app/hooks';
import { stylesApp } from '../../App';
import Color from 'color';
import { Orientation } from '../../interfaces/interfaces';
import TextInput from '../Input/TextInput';
import { ReciclerData } from '../ReciclerData';

interface Props<T> {
    valueField: keyof T;
    labelField: keyof T;
    itemsSelected: Array<T>;
    data: Array<T>;
    onChange: (item: Array<T>) => void;
    value: string;
    label?: string;
    animationType?: "slide" | "none" | "fade";
    maxHeight?: number;
}

export const Select = <T extends Object>(props: Props<T>) => {
    const {
        valueField,
        labelField,
        data,
        onChange,
        value,
        label,
        itemsSelected,
        animationType,
        maxHeight,
    } = props;

    const { theme: { colors, roundness, dark }, orientation, insets } = useAppSelector(state => state.app);
    const heightOption: number = 40;
    const ref = useRef<View>(null);
    const search = useRef<NativeTextInput>(null);
    const [visible, setVisible] = useState<boolean>(false);
    const [layout, setLayout] = useState<LayoutRectangle>();
    const [keyboardHeight, setKeyboardHeight] = useState<number>(0);
    const backgroundColor: string = dark ? Color(colors.background).darken(.4).toString() : colors.background;


    useEffect(() => {
        const keyboardOpen = Keyboard.addListener('keyboardDidShow', (event) => {
            setKeyboardHeight(event.endCoordinates.height);
        })
        const keyboardClose = Keyboard.addListener('keyboardDidHide', () => {
            setKeyboardHeight(0);
        })
        return () => {
            keyboardOpen.remove();
            keyboardClose.remove();
        }
    }, []);

    const _close = useCallback(() => {
        if (visible) setVisible(false);
    }, [visible]);

    const onSelect = useCallback(
        (items: Array<T>) => {
            onChange(items);
            search.current?.blur();
            Keyboard.dismiss();
            _close();
        },
        [onChange, _close]
    );

    const _renderDropDown = useCallback(() => {
        return (
            <TouchableWithoutFeedback>
                <TextInput
                    value={value}
                    label={value !== '' ? label ?? 'Cuenta seleccionada' : label ?? ''}
                    placeholder={visible ? 'Buscando ...' : label ?? 'Seleccione una cuenta'}
                    showSoftInputOnFocus={false}
                    iconRight={value !== '' ? 'close' : visible ? 'chevron-up' : 'chevron-down'}
                    editable={false}
                    onPress={() => setVisible(true)}
                    onRightPress={() => {
                        if (value !== '') {
                            onSelect([])
                        } else {
                            setVisible(true)
                        }
                    }}
                    containerStyle={{
                        borderRadius: roundness,
                        borderWidth: .2,
                        borderBottomWidth: .2,
                        borderBottomColor: colors.primary,
                        borderColor: colors.primary,
                        paddingLeft: 15,
                        marginVertical: 10,
                    }}
                    iconStyle={{ marginRight: 15 }}
                />
            </TouchableWithoutFeedback>
        )
    }, [value, visible, label, colors]);

    const _renderModal = useCallback(() => {
        return (
            <Modal
                transparent
                animationType={animationType}
                visible={visible}
                hardwareAccelerated
                supportedOrientations={['landscape', 'portrait']}
            >
                <StatusBar backgroundColor={colors.backdrop} />
                <SafeAreaView style={[modal.Modal, { backgroundColor: colors.backdrop }]}>
                    <Pressable style={{ width: '100%', height: '100%' }} onPress={() => _close()} />
                    <View style={[
                        modal.Container,
                        {
                            height: maxHeight ?? '100%',
                            width: layout?.width ?? '90%',
                            borderRadius: roundness * 2,
                            backgroundColor: backgroundColor,
                        },
                        stylesApp.shadow, { elevation: 5, shadowColor: colors.primary },
                        orientation === Orientation.landscape
                            ?
                            {
                                position: 'absolute',
                                bottom: insets ? insets.bottom : 0
                            }
                            : maxHeight ? {
                                position: 'absolute',
                                top: (layout && ((layout.height * 2) + layout.y + maxHeight) + (Platform.OS === 'ios' ? insets ? insets.top - insets.bottom + 5 : 0 : 0)) ?? undefined
                            } : {}
                    ]}>
                        <ReciclerData
                            data={data}
                            labelField={labelField}
                            valueField={valueField}
                            loading={false}
                            onChange={(item) => onSelect([item])}
                            selected={itemsSelected}
                        />
                    </View>
                </SafeAreaView>
            </Modal>
        )
    }, [visible, keyboardHeight, colors, dark, heightOption, maxHeight, insets, layout, orientation, backgroundColor]);

    return (
        <View style={{ justifyContent: 'center', flex: 1 }} ref={ref} onLayout={({ nativeEvent: { layout } }) => setLayout(layout)}>
            {_renderDropDown()}
            {_renderModal()}
        </View>
    )
};

const modal = StyleSheet.create({
    Modal: {
        flex: 1,
        alignItems: 'center',
    },
    Container: {
        backgroundColor: 'white',
        padding: 10
    }
});