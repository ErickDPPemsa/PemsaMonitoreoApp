import React from 'react'
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native'
import { stylesApp } from '../App';
import { useAppSelector } from '../app/hooks';
import Donut from './Donut';
import Color from 'color';
import Text from './Text';
import { IconButton } from './IconButton';
import { style } from '../screens/LogInScreen';

interface Props {
    percentage?: number;
    max: number;
    icon?: {
        name: string;
        backgroundColor?: string;
        colorIcon?: string;
    }
    text: string;
    textLarge?: string;
    style?: StyleProp<ViewStyle>;
    amount?: number | string;
}
export const TargetPercentaje = ({ max, percentage, icon, text, textLarge, style, amount }: Props) => {
    const { theme: { colors, roundness, fonts, dark } } = useAppSelector(state => state.app);
    return (
        <View style={[stylesApp.shadow, {
            padding: 10,
            backgroundColor: colors.background, alignItems: 'center', margin: 5,
            shadowColor: icon ? icon.backgroundColor : colors.primary,
            borderRadius: roundness * 2, width: 140,
            borderWidth: .2, borderColor: icon ? icon.backgroundColor : colors.outline
        }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <IconButton name={icon ? icon.name : 'home'} color={icon ? icon.backgroundColor : undefined} />
                <Text variant='labelSmall' style={{ flex: 1, textAlign: 'center' }}>{text}</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Donut radius={30} color={colors.primary} max={max} percentage={percentage ?? 0} strokeWidth={5} />
                <View style={{ marginHorizontal: 5, alignItems: 'center' }}>
                    <Text variant='labelSmall' style={[{ color: colors.text, fontWeight: 'bold' }]}>{text}</Text>
                    {amount && <Text variant='labelSmall' style={[{ color: colors.text, marginVertical: 2, fontWeight: '700' }]}>{amount}</Text>}
                </View>
            </View>
            <Text variant='labelSmall' style={{ textAlign: 'center' }}>{textLarge}</Text>
        </View>
    )
}
