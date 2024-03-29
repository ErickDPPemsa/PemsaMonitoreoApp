import React, { useContext, useEffect, useLayoutEffect, useState } from 'react';
import { View, Platform } from 'react-native';
import { Props } from './SearchScreen';
import { IconButton } from '../components/IconButton';
import { useAppSelector, useAppDispatch } from '../app/hooks';
import { stylesApp } from '../App';
import Color from 'color';
import TextInput from '../components/Input/TextInput';
import { Loading } from '../components/Loading';
import { Group } from '../interfaces/interfaces';
import { ReciclerData } from '../components/ReciclerData';
import { useGroups } from '../hooks/useQuery';
import { useDebouncedValue } from '../hooks/useDebouncedValue';
import { updateGroups } from '../features/appSlice';
import { HandleContext } from '../context/HandleContext';

export const ListGroupScreen = ({ navigation, route: { params: { type } } }: Props) => {
    const { insets, theme: { colors, roundness, dark }, groupsSelected } = useAppSelector(state => state.app);
    const { isLoading, data, refetch, isFetching, error } = useGroups();
    const dispatch = useAppDispatch();
    const { handleError } = useContext(HandleContext);
    const [textQueryValue, setTextQueryValue] = useState<string>('');
    const debaucedValue = useDebouncedValue(textQueryValue, 300);
    const [filter, setFilter] = useState<Array<Group>>([]);
    const backgroundColor: string = dark ? Color(colors.background).darken(.4).toString() : colors.background;

    useEffect(() => {
        if (error) handleError(String(error));
    }, [error]);

    useLayoutEffect(() => {
        navigation.setOptions({
            header: (({ back, navigation, options }) => {
                return (
                    <View style={[
                        {
                            width: '100%',
                            backgroundColor: backgroundColor,
                            flexDirection: 'row',
                            alignItems: 'flex-end',
                            paddingTop: Platform.OS === 'ios' ? insets ? insets.top - 10 : 0 : 0
                        },
                        stylesApp.shadow,
                        {
                            elevation: 5,
                            shadowColor: colors.primary,
                            paddingBottom: 6,
                        }
                    ]}>
                        <IconButton
                            iconsize={30}
                            style={{ paddingHorizontal: 10, marginBottom: 2 }}
                            onPress={() => navigation.goBack()}
                            name={Platform.OS === 'android' ? 'arrow-back-outline' : 'chevron-back-outline'}
                        />
                        <TextInput
                            iconLeft='search'
                            placeholder={'Buscar grupo'}
                            containerStyle={[
                                {
                                    flex: 1,
                                    borderRadius: roundness * 4,
                                    borderWidth: .2,
                                    borderBottomWidth: .2,
                                    borderBottomColor: colors.primary,
                                    borderColor: colors.primary,
                                    marginTop: 6,
                                    height: 40,
                                    marginRight: 15,
                                }
                            ]}
                            iconStyle={{
                                marginTop: 6
                            }}
                            inputStyle={{
                                marginTop: 6
                            }}
                            onChangeText={setTextQueryValue}
                        />
                    </View>
                )
            }
            ),
        });
    }, [navigation, colors]);

    useEffect(() => {
        if (data) {
            setFilter(data.groups);
        }
    }, [data])

    useEffect(() => {
        if (data) {
            setFilter(() => data.groups.filter(f => String(f['Nombre']).toLowerCase().includes(debaucedValue.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, ""))));
        }
    }, [debaucedValue]);

    useEffect(() => {
        if (textQueryValue.length === 0 && data) {
            setFilter(data.groups);
        }
    }, [textQueryValue]);

    const update = (item: Group) => {
        dispatch(updateGroups([item]));
        navigation.goBack();
    }

    return (
        <View style={{ flex: 1 }}>
            <Loading loading={isLoading} />
            <ReciclerData
                data={filter}
                labelField='Nombre'
                valueField='Codigo'
                loading={isFetching}
                onChange={update}
                selected={groupsSelected}
                onRefresh={() => refetch()}
            />
        </View>
    )
}
