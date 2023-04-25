import React, { useEffect, useState } from 'react';
import { Pressable, View } from 'react-native';
import { statusCheckBox } from '../types/types';
import { useAppSelector } from '../app/hooks';
import { PropsCheckBox } from '../interfaces/interfaces';
import { IconButton } from './IconButton';
import Color from 'color';
import Text from './Text';

export const CheckBox = ({ color, disabled, uncheckedColor, onChange, text }: PropsCheckBox) => {
    const [isChecked, setIsChecked] = useState<statusCheckBox>('unchecked');
    const { theme: { colors } } = useAppSelector(state => state.app);

    useEffect(() => {
        onChange && onChange(isChecked);
    }, [isChecked]);

    return (
        <Pressable
            onPress={() => setIsChecked((isChecked === 'checked') ? 'unchecked' : 'checked')}
            android_ripple={{ color: Color(colors.primary).fade(.9).toString() }}
            style={{ marginVertical: 5 }}
        >
            {
                ({ pressed }) => (
                    <View style={[
                        { height: 50, flexDirection: 'row', alignItems: 'center' },
                        pressed && { backgroundColor: Color(colors.primary).fade(.9).toString() },
                    ]}>
                        <IconButton
                            style={{ marginHorizontal: 5 }}
                            name={(isChecked === 'checked') ? 'checkbox' : 'stop-outline'}
                            onPress={() => (isChecked === 'checked') ? setIsChecked('unchecked') : setIsChecked('checked')}
                        />
                        <Text>{text}</Text>
                    </View>
                )
            }
        </Pressable>
    )
}