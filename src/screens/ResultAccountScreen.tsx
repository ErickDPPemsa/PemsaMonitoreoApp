import React, { useCallback, useContext, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Animated, ListRenderItemInfo, Modal, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { useReport } from '../hooks/useQuery';
import { Loading } from '../components/Loading';
import { Account, Events, percentaje, Orientation, Percentajes } from '../interfaces/interfaces';
import { useAppSelector } from '../app/hooks';
import Color from 'color';
import { stylesApp } from '../App';
import { TargetPercentaje } from '../components/TargetPercentaje';
import Table from '../components/table/Table';
import { Icon, IconButton, IconMenu } from '../components/IconButton';
import { HandleContext } from '../context/HandleContext';
import { useQueryClient } from '@tanstack/react-query';
import Text from '../components/Text';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { rootStackScreen } from '../navigation/Stack';
import { Alarm, AP, APCI, Bat, CI, filterEvents, otros, Prue } from '../types/types';
import { RefreshControl } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';


interface Props extends NativeStackScreenProps<rootStackScreen, 'ResultAccountScreen'> { };

const Tab = createBottomTabNavigator();

export const ResultAccountScreen = ({ navigation, route: { params: { account, end, report, start, keys, typeAccount, filter } } }: Props) => {
    const { theme: { colors, fonts, roundness, dark }, orientation, screenWidth, screenHeight } = useAppSelector(state => state.app);
    const { data, isLoading, isFetching, refetch, error } = useReport({ accounts: [parseInt(account.CodigoCte)], dateStart: start, dateEnd: end, type: report, typeAccount, key: String(account.CodigoCte) });
    const queryClient = useQueryClient();
    const { handleError, downloadReport } = useContext(HandleContext);
    const [view, setView] = useState<'table' | 'default'>('default');

    const refModal = useRef<Modal>(null);


    const keyQuery = ["Events", String(account), report, start, end];
    const pages: Array<{ title: string, key: filterEvents, nameIcon: string, color: string }> = report === 'ap-ci'
        ?
        [
            { title: 'Aperturas', key: 'AP', nameIcon: 'lock-closed-outline', color: colors.success },
            { title: 'Cierres', key: 'CI', nameIcon: 'lock-open-outline', color: colors.danger }
        ]
        :
        [
            { title: 'Ap/Ci', key: 'APCI', nameIcon: 'shield-outline', color: colors.success },
            { title: 'Alarmas', key: 'Alarm', nameIcon: 'notifications-outline', color: colors.danger },
            { title: 'Pruebas', key: 'Prue', nameIcon: 'construct-outline', color: colors.test },
            { title: 'Baterias', key: 'Bat', nameIcon: 'battery-charging-outline', color: colors.warning },
            { title: 'Otros', key: 'otros', nameIcon: 'help-circle-outline', color: colors.other },
        ];


    useLayoutEffect(() => {
        navigation.setOptions({
            title: report === 'ap-ci' ? 'APERTURA Y CIERRE' : 'EVENTO DE ALARMA',
            headerLeft: (() =>
                <IconButton
                    iconsize={30}
                    style={{ paddingRight: 10 }}
                    name={Platform.OS === 'ios' ? 'chevron-back-outline' : 'arrow-back-outline'}
                    onPress={() => {
                        queryClient.removeQueries({ queryKey: keyQuery })
                        navigation.goBack();
                    }}
                />
            ),
            headerRight: (() =>
                <IconMenu
                    ref={refModal}
                    disabled={isLoading || isFetching}
                    menu={[
                        {
                            text: 'Descargar pdf con gráfica',
                            icon: 'document-outline',
                            onPress: () => {
                                // Download(true);
                            },
                            contentStyle: { ...styles.btnMenu }
                        },
                        {
                            text: 'Descargar pdf',
                            icon: 'document-outline',
                            onPress: () => {
                                // Download(true);
                            },
                            contentStyle: { ...styles.btnMenu }
                        },
                        view === 'default' ? {
                            text: 'ver tabla',
                            icon: 'list-outline',
                            onPress: () => setView('table'),
                            contentStyle: { ...styles.btnMenu }
                        } : {
                            text: 'ver lista',
                            icon: 'list-outline',
                            onPress: () => setView('default'),
                            contentStyle: { ...styles.btnMenu }
                        },
                        {
                            text: 'Recargar',
                            icon: 'document-outline',
                            onPress: () => refetch(),
                            contentStyle: { ...styles.btnMenu }
                        },
                    ]}
                />
            )
        });
    }, [navigation, isLoading, isFetching, setView, view]);

    const renderItem = useCallback(({ index, item, separators }: ListRenderItemInfo<Events>) => (
        <View style={[styles.item, { borderRadius: roundness, backgroundColor: colors.background, shadowColor: colors.primary, alignSelf: 'center', width: orientation === Orientation.landscape ? screenWidth + 100 : ((screenWidth / 100) * 95), height: 80, }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={{ flex: 1, flexDirection: 'row' }}>
                    <View >
                        <Text variant='labelMedium'>{item.FechaOriginal}</Text>
                        <Text variant='labelMedium'>{item.Hora}</Text>
                    </View>
                    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                        <Text variant='titleMedium' style={{ textAlign: 'center' }}>{item.DescripcionEvent}</Text>
                        <Text>Particón: {item.Particion}</Text>
                    </View>
                </View>
                <IconButton
                    iconsize={30}
                    name='information-circle-outline'
                    onPress={() => navigation.navigate('Modal', { type: 'info', btnClose: false, icon: true, subtitle: item.FechaOriginal + ' ' + item.Hora, text: JSON.stringify(item, null, 3) })}
                />
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 }}>
                <Text adjustsFontSizeToFit numberOfLines={1} style={{ flex: 1 }} variant='labelMedium'>{`${item.DescripcionZona} ${item.NombreUsuario}`.split('').length <= 1 ? 'Sistema / Llavero' : `${item.DescripcionZona} ${item.NombreUsuario}`}</Text>
                <Text variant='labelMedium'># {item.CodigoUsuario} {item.CodigoZona}</Text>
            </View>
        </View>
    ), [colors, roundness, orientation]);

    const _renderPercentajes = useCallback(() => {
        const Percentajes = (percentajes: Percentajes) => {
            {
                return (
                    Object.entries(percentajes).map((el, idx) => {
                        const { label, total, percentaje, text, events }: percentaje = el[1];
                        const title: string = label ?? el[0];
                        return (
                            <TargetPercentaje
                                key={JSON.stringify(el)}
                                max={100}
                                text={title}
                                amount={`${events}/${total}`}
                                percentage={percentaje}
                                textLarge={text}
                                icon={
                                    (el[0] === 'Aperturas')
                                        ? { name: 'lock-open-outline', backgroundColor: colors.success }
                                        : (el[0] === 'Cierres')
                                            ? { name: 'lock-closed-outline', backgroundColor: colors.danger }
                                            : (el[0] === 'APCI')
                                                ? { name: 'warning-outline', backgroundColor: colors.success }
                                                : (el[0] === 'Alarma')
                                                    ? { name: 'server-outline', backgroundColor: colors.danger }
                                                    : (el[0] === 'Pruebas')
                                                        ? { name: 'settings-outline', backgroundColor: colors.test }
                                                        : (el[0] === 'Battery')
                                                            ? { name: 'battery-dead-outline', backgroundColor: colors.warning }
                                                            : { name: 'help-circle-outline', backgroundColor: colors.other }
                                } />
                        )
                    })
                )
            }
        }

        if (data && data.cuentas) {
            if (data.cuentas.length === 1) {
                const { percentajes } = data;
                if (percentajes)
                    return (
                        <View style={{ paddingVertical: 5 }}>
                            {
                                (report === 'ap-ci')
                                    ?
                                    <View style={{ flexDirection: orientation === Orientation.portrait ? 'row' : 'column', alignItems: 'center', justifyContent: 'center' }}>
                                        {Percentajes(percentajes)}
                                    </View>
                                    :
                                    <ScrollView horizontal={orientation === Orientation.portrait} alwaysBounceHorizontal={orientation === Orientation.portrait} showsHorizontalScrollIndicator={false} >
                                        {Percentajes(percentajes)}
                                    </ScrollView>
                            }
                        </View>
                    )
                else return undefined;
            } else { return undefined }
        } else { return undefined }
    }, [data, colors, orientation, report]);

    const _renderData = useCallback((filter?: filterEvents) => {
        if (data && data.cuentas) {
            if (data.cuentas.length === 1) {
                const { Nombre, Direccion, eventos }: Account = data.cuentas[0];
                let Events = eventos ?? [];

                if (filter) {
                    switch (filter) {
                        case 'AP': Events = Events.filter(f => AP.find(ff => ff === f.CodigoAlarma)); break;
                        case 'CI': Events = Events.filter(f => CI.find(ff => ff === f.CodigoAlarma)); break;
                        case 'APCI': Events = Events.filter(f => APCI.find(ff => ff === f.CodigoAlarma)); break;
                        case 'Alarm': Events = Events.filter(f => Alarm.find(ff => ff === f.CodigoAlarma)); break;
                        case 'Prue': Events = Events.filter(f => Prue.find(ff => ff === f.CodigoAlarma)); break;
                        case 'Bat': Events = Events.filter(f => Bat.find(ff => ff === f.CodigoAlarma)); break;
                        case 'otros': Events = Events.filter(f => otros.find(ff => ff === f.CodigoAlarma)); break;
                    }
                }

                return (
                    <>
                        {
                            (view === 'default')
                                ?
                                <Animated.FlatList
                                    data={Events}
                                    renderItem={renderItem}
                                    keyExtractor={(_, idx) => `${idx}`}
                                    removeClippedSubviews={true}
                                    getItemLayout={(data, index) => (
                                        { length: orientation === Orientation.landscape ? screenWidth + 100 : ((screenWidth / 100) * 95), offset: 90 * index, index }
                                    )}
                                    refreshControl={
                                        <RefreshControl
                                            refreshing={false}
                                            onRefresh={() => refetch()}
                                        />
                                    }
                                />
                                :
                                <View style={[
                                    { flex: 1 },
                                    orientation === Orientation.landscape && { width: '95%', alignSelf: 'center' }
                                ]}>
                                    <Table
                                        Header={{ title: Nombre, subtitle: Direccion }}
                                        Data={Events}
                                        titles={keys}
                                        fontSize={11}
                                        pagination={{ iconBackgroundColor: colors.primaryContainer }}
                                        colorBackgroundTable={dark ? Color(colors.background).darken(.4).toString() : colors.background}
                                        showIndices
                                    />
                                </View>
                        }

                    </>
                )
            } else {
                return (<Text>more accounts</Text>)
            }

        }
        return undefined;
    }, [data, view, dark, Color, colors, screenWidth, screenHeight, orientation]);

    useEffect(() => {
        if (error) handleError(String(error));
    }, [error])

    const Download = (withGrap?: boolean) => {
        downloadReport({
            data: {
                accounts: [parseInt(account.CodigoCte)],
                showGraphs: withGrap ? true : false,
                typeAccount,
                dateStart: start,
                dateEnd: end
            },
            endpoint: (report === 'ap-ci') ? 'download-ap-ci' : 'download-event-alarm',
            fileName: `${(report === 'ap-ci') ? 'Apertura y cierre' : 'Evento de alarma'} ${start} ${end} ${account.Nombre}.pdf`
        })
    }


    return (
        <>
            <Loading loading={isLoading} refresh={isFetching} />
            <Text variant='titleSmall' style={[{ borderLeftWidth: 3, borderColor: colors.primary }]}>  Entre las fechas {start} a {end}</Text>
            {
                (!filter)
                    ?
                    <View style={{ flex: 1, margin: 5 }}>
                        {(!isLoading || !isFetching) && orientation === Orientation.portrait && _renderPercentajes()}
                        {_renderData()}
                    </View>
                    :
                    <View style={[
                        { flex: 1 },
                        orientation === Orientation.landscape && { flexDirection: 'row' }
                    ]}
                    >
                        {(!isLoading || !isFetching) && _renderPercentajes()}
                        <Tab.Navigator screenOptions={{ headerShown: false }}>
                            <Tab.Screen name="Todos" options={{ tabBarIcon: (() => <Icon name='grid-outline' color={colors.primary} />) }}>
                                {(props) =>
                                    <FilterScreen>
                                        {_renderData()}
                                    </FilterScreen>
                                }
                            </Tab.Screen>
                            {
                                <>
                                    {
                                        pages.map((p, idx) => (
                                            <Tab.Screen key={idx + p.key} name={p.title} options={{ tabBarIcon: (() => <Icon name={p.nameIcon} color={p.color} />) }}>
                                                {() =>
                                                    <FilterScreen>
                                                        {_renderData(p.key)}
                                                    </FilterScreen>
                                                }
                                            </Tab.Screen>

                                        ))
                                    }
                                </>
                            }
                        </Tab.Navigator>
                    </View>
            }
        </>
    )
}

interface PropsFilter {
    children: React.ReactNode;
}
const FilterScreen = ({ children }: PropsFilter) => {

    return (
        <View style={{ flex: 1 }}>
            {children}
        </View>
    )
}

const styles = StyleSheet.create({
    item: {
        padding: 10,
        margin: 4,
        ...stylesApp.shadow,
    },
    btnMenu: {
        alignItems: 'flex-start',
        marginVertical: 5
    }
});