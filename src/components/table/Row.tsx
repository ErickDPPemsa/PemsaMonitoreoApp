import React from 'react';
import { StyleProp, View, ViewStyle, TextStyle, StyleSheet } from 'react-native';
import Text from '../Text';

type PropsRow = {
    data: Array<string | Array<string>>;
    fontSize: number;
    tamCol?: Array<{ size: number, center?: boolean }>;
    style?: StyleProp<ViewStyle>;
    styleLabel?: StyleProp<TextStyle>;
}

export const Row = ({ data, fontSize, style, styleLabel, tamCol }: PropsRow) => {
    return (
        <View style={[styles.containerRow, style]}>
            {data.map((col, idx) => {
                const width: number | undefined = (tamCol && tamCol[idx]) ? tamCol[idx].size : undefined;
                const center: boolean | undefined = (tamCol && tamCol[idx]) ? tamCol[idx].center : undefined;
                if (Array.isArray(col)) return (
                    <View key={col.toString() + idx} style={[styles.textHeader, { flexDirection: 'row' }]}>
                        {col.map((c, cidx) => <Text key={c + cidx} style={[{ marginHorizontal: 1, fontSize, color: '#37474f', width: width ? (width / col.length) - 2 : undefined, textAlign: center ? 'center' : 'left' }, styleLabel]}>{c}</Text>)}
                    </View>
                )
                return (<Text style={[styles.textHeader, { fontSize, color: '#37474f', width, textAlign: center ? 'center' : 'left' }, styleLabel]} key={col.toString() + idx}>{col.toString()}</Text>)
            })}
        </View>
    )
}
const styles = StyleSheet.create({
    containerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 5,
    },
    textHeader: {
        margin: 2,
    },
});