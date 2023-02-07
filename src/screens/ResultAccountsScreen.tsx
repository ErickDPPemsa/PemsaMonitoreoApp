import React, { createRef, useCallback, useContext, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { View, SectionList, ScrollView, Animated, ListRenderItemInfo, StyleSheet, Modal, Platform } from 'react-native';
import { useAppSelector } from '../app/hooks';
import { Loading } from '../components/Loading';
import Table from '../components/table/Table';
import { useReport } from '../hooks/useQuery';
import { Row } from '../components/table/Row';
import { AP, CI, TypeReport } from '../types/types';
import { TargetPercentaje } from '../components/TargetPercentaje';
import Color from 'color';
import { Account, BatteryStatus, Orientation, percentaje, formatDate } from '../interfaces/interfaces';
import { stylesApp } from '../App';
import { getDay, getKeys, modDate } from '../functions/functions';
import TextInput from '../components/Input/TextInput';
import { Icon, IconButton, IconMenu } from '../components/IconButton';
import { Button } from '../components/Button';
import { useQueryClient } from '@tanstack/react-query';
import { HandleContext } from '../context/HandleContext';
import Text from '../components/Text';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { rootStackScreen } from '../navigation/Stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

interface Props extends NativeStackScreenProps<rootStackScreen, 'ResultAccountsScreen'> { };

const Tab = createBottomTabNavigator();

export const ResultAccountsScreen = ({ navigation, route: { params: { accounts, end, report, start, keys, typeAccount, nameGroup } } }: Props) => {
    const { theme: { colors, fonts, roundness, dark }, orientation } = useAppSelector(state => state.app);

    const { data, isLoading, isFetching, refetch } =
        useReport({ accounts: [...accounts.map(a => a.code)], dateStart: start, dateEnd: end, type: report, typeAccount, key: JSON.stringify(accounts.map(a => a.code).sort()) });

    const [filterData, setFilterData] = useState<typeof data>();

    const queryClient = useQueryClient();
    const keyQuery = ["Events", JSON.stringify(accounts), report, start, end];
    const refModal = useRef<Modal>(null);

    const dates: { start: formatDate, end: formatDate } = { start: modDate({ days: -30 }), end: modDate({}) }

    const { downloadReport } = useContext(HandleContext);

    const backgroundColor: string = dark ? Color(colors.background).darken(.4).toString() : colors.background;


    const Download = (withGrap?: boolean) => {
        downloadReport({
            data: {
                accounts: accounts.map(a => a.code),
                showGraphs: withGrap ? true : false,
                typeAccount,
                dateStart: start,
                dateEnd: end
            },
            endpoint: (report === 'apci-week') ? 'download-ap-week' : (report === 'state') ? 'download-state' : 'download-batery',
            fileName: `${(report === 'apci-week') ? 'Aperturas y Cieres una semana' : (report === 'state') ? 'Estado de sucursales' : 'Estados de bateria'} ${start ?? ''} ${end ?? ''} ${nameGroup}.pdf`
        })
    }

    useLayoutEffect(() => {
        navigation.setOptions({
            title: (report === 'ap-ci') ? 'APERTURA Y CIERRE' : (report === 'event-alarm') ? 'EVENTO DE ALARMA' : (report === 'batery') ? 'Problemas de batería' : (report === 'state') ? 'Estado de sucursales' : 'Horario de aperturas y cierres',
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
    }, [navigation, isLoading, isFetching]);

    useEffect(() => {
        setFilterData(data);
    }, [data]);

    const _renderPercentajes = useCallback(() => {
        if (data && data.percentajes && orientation === Orientation.portrait) {
            const { percentajes } = data;
            return (
                <View style={{ paddingVertical: 5 }}>
                    <ScrollView horizontal alwaysBounceHorizontal contentContainerStyle={[{ marginLeft: 5 }]} showsHorizontalScrollIndicator={false}>
                        {Object.entries(percentajes).map((el, idx) => {
                            const { label, total, percentaje, text, events }: percentaje = el[1];
                            const title: string = label ?? el[0];
                            return (
                                <TargetPercentaje
                                    key={JSON.stringify(el)}
                                    max={100}
                                    text={title}
                                    percentage={percentaje}
                                    amount={`${events}/${total}`}
                                    textLarge={text}
                                    icon={
                                        (el[0] === 'sinRestaure') ? { name: 'warning-outline', backgroundColor: colors.danger }
                                            : (el[0] === 'conRestaure') ? { name: 'notifications-outline', backgroundColor: colors.warning }
                                                : (el[0] === 'abiertas') ? { name: 'lock-open-outline', backgroundColor: colors.success }
                                                    : (el[0] === 'cerradas') ? { name: 'lock-closed-outline', backgroundColor: colors.danger }
                                                        : (el[0] === 'sinEstado') ? { name: 'warning-outline', backgroundColor: colors.warning }
                                                            : (el[0] === 'Aperturas') ? { name: 'lock-open-outline', backgroundColor: colors.success }
                                                                : (el[0] === 'Cierres') ? { name: 'lock-closed-outline', backgroundColor: colors.danger }
                                                                    : { name: 'checkmark-circle-outline', backgroundColor: colors.success }
                                    } />
                            )
                        })}
                    </ScrollView>
                </View>
            )
        } else { return undefined }
    }, [filterData, orientation]);

    const _renderHead = useCallback(() => {
        const sizeName: number = 200;
        if (filterData && filterData.fechas) {
            const tam = new Array(filterData.fechas.length).fill({ size: 100, center: true });
            const days = filterData.fechas.map(a => getDay(modDate({ dateI: new Date(a) }).weekday));
            const ApCi = new Array(tam.length).fill(['AP', 'CI']);

            return (
                <>
                    <Row key={'days'} tamCol={[{ size: 30 }, { size: sizeName }, ...tam]} styleLabel={{ fontWeight: 'bold', textTransform: 'uppercase', color: colors.text }} fontSize={11 + 2} data={['', '', ...filterData.fechas]} />
                    <Row key={'nameDays'} tamCol={[{ size: 30 }, { size: sizeName }, ...tam]} styleLabel={{ fontWeight: 'bold', textTransform: 'uppercase', color: colors.text }} fontSize={11 + 2} data={['', '', ...days]} />
                    <Row key={'header'} style={{ borderBottomWidth: 1, borderColor: Color(colors.text).fade(.9).toString() }} tamCol={[{ size: 30, center: true }, { size: sizeName }, ...tam]} styleLabel={{ fontWeight: 'bold', textTransform: 'uppercase', color: colors.text }} fontSize={11 + 2} data={['#', 'Nombre', ...ApCi]} />
                </>
            )
        }
        return undefined;
    }, [filterData, colors]);

    const _renderDataDays = useCallback(() => {
        const sizeName: number = 200;
        if (filterData && filterData.fechas) {
            const tam = new Array(filterData.fechas.length).fill({ size: 100, center: true });
            const SN = new Array(filterData.fechas.length).fill(['--:--', '--:--']);
            return (
                <>
                    {
                        filterData.cuentas?.map((acc, idx) => {
                            if (acc.eventos) {
                                const test = filterData.fechas?.map(day => {
                                    const perDay = acc.eventos?.filter(ev => ev.FechaOriginal === day);
                                    if (perDay !== undefined) {
                                        if (perDay.length === 0) {
                                            return ['--:--', '--:--'];
                                        }
                                        if (perDay.length === 1) {
                                            return (perDay[0].DescripcionEvent.toLowerCase().includes('apert')) ? [perDay[0].Hora.slice(0, 5), '--:--'] : ['--:--', perDay[0].Hora.slice(0, 5)];
                                        }
                                        if (perDay.length > 1) {
                                            let ap: string = '--:--';
                                            let ci: string = '--:--';
                                            const test = perDay.map(s => {
                                                if (s.DescripcionEvent.toLowerCase().includes('apert')) {
                                                    if (ap === '--:--') {
                                                        ap = s.Hora.slice(0, 5);
                                                    }
                                                } else if (s.DescripcionEvent.toLowerCase().includes('cierr')) {
                                                    ci = s.Hora.slice(0, 5);
                                                }
                                                return [ap, ci]
                                            });
                                            return test[test.length - 1];
                                        }
                                    }
                                    return '';
                                });
                                return (
                                    <Row key={(idx + 1) + acc.CodigoCte} styleLabel={{ color: colors.text }} style={{ borderBottomWidth: 1, borderColor: Color(colors.text).fade(.9).toString() }} data={[`${idx + 1}`, acc.Nombre, ...test ?? []]} fontSize={11} tamCol={[{ size: 30, center: true }, { size: sizeName }, ...tam]} />
                                )
                            } else {
                                return (
                                    <Row key={(idx + 1) + acc.CodigoCte} styleLabel={{ color: colors.text }} style={{ borderBottomWidth: 1, borderColor: Color(colors.text).fade(.9).toString() }} data={[`${idx + 1}`, acc.Nombre, ...SN]} fontSize={11} tamCol={[{ size: 30, center: true }, { size: sizeName }, ...tam]} />
                                )
                            }
                        })
                    }
                    <Row key={'days'} tamCol={[]} styleLabel={{ fontWeight: 'bold', textTransform: 'uppercase' }} fontSize={10} data={['']} />
                </>
            )
        }
        return undefined;
    }, [filterData, colors, dark, Color]);

    const _renderTables = useCallback((report: TypeReport) => {
        if (filterData)
            if (report === 'apci-week') {
                return (
                    <View style={[styles.container, { backgroundColor: dark ? Color(colors.background).darken(.4).toString() : colors.background }]}>
                        <ScrollView horizontal={true}>
                            <View>
                                {_renderHead()}
                                <ScrollView >
                                    {_renderDataDays()}
                                </ScrollView>
                            </View>
                        </ScrollView>
                    </View>
                )
            }
        if (report === 'ap-ci' || report === 'event-alarm') {
            if (filterData?.cuentas) {
                return (
                    <View style={{ paddingVertical: 5 }}>
                        <SectionList
                            sections={filterData.cuentas.map(acc => { return { title: { name: acc.Nombre, address: acc.Direccion, ref: createRef<ScrollView>() }, data: [{ events: acc.eventos ?? [] }] } })}
                            renderItem={({ item, section }) => {
                                return (
                                    <></>
                                    // <Table
                                    //     // scrollRefHeader={section.title.ref}
                                    //     Data={item.events}
                                    //     /**@ts-ignore */
                                    //     titles={keys}
                                    // fontSize={10}
                                    // isShowHeader={false}
                                    // colorBackgroundTable={dark ? Color(colors.background).darken(.4).toString() : colors.background}
                                    // showIndices
                                    // />
                                )
                            }}
                            renderSectionHeader={({ section }) => (
                                <View style={{ marginHorizontal: 10, backgroundColor: dark ? Color(colors.background).darken(.4).toString() : colors.background, borderRadius: roundness }}>
                                    <Text style={{ paddingHorizontal: 5 }}>{section.title.name}</Text>
                                    <Text style={{ paddingHorizontal: 5 }}>{section.title.address}</Text>
                                    {/* <ScrollView ref={section.title.ref} horizontal showsHorizontalScrollIndicator={false}>
                                        <Row
                                            data={keys.map(r => r.label)}
                                            tamCol={keys.map(s => { return { size: s.size ?? 50, center: s.center } })}
                                            fontSize={13}
                                            styleLabel={{ padding: 0, margin: 0, textTransform: 'uppercase' }} />
                                    </ScrollView> */}
                                </View>
                            )}
                            keyExtractor={(item, idx) => `${idx}`}
                            stickySectionHeadersEnabled
                        />
                    </View>
                )
            }
            return undefined;
        }
        return undefined;
    }, [filterData, keys, colors, roundness, dark]);

    type dataFilter = "SR" | "CR" | "SE" | "A" | "C" | "S";

    const renderItem = useCallback(({ index, item, separators }: ListRenderItemInfo<Account>) => {
        let shadowColor: string = colors.primary;
        return (
            <View style={[styles.item, {
                borderRadius: roundness * 2,
                backgroundColor,
                shadowColor, elevation: 5
            }]}>
                {
                    report === 'batery'
                        ?
                        <>
                            <View key={index} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: .2, borderColor: Color(colors.primary).alpha(.2).toString() }}>
                                <Text style={[fonts.titleSmall, { flex: 1 }]}>#</Text>
                                <Text style={{ flex: 1, textAlign: 'right', paddingRight: 10, }}>{index + 1}</Text>
                            </View>
                            {
                                keys.map(({ key, label }, idx) => {
                                    const color = (item['estado'] === BatteryStatus.ERROR) ? colors.danger : (item['estado'] === BatteryStatus.RESTORE) ? colors.warning : (item['estado'] === BatteryStatus.WITHOUT_EVENTS) ? colors.success : undefined
                                    return (
                                        <View key={idx + label} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: .2, borderColor: Color(colors.primary).alpha(.2).toString() }}>
                                            <Text style={[fonts.titleSmall, { flex: 1, }, label === 'Estado' && { color }]}>{label}</Text>
                                            <Text adjustsFontSizeToFit numberOfLines={2} style={[{
                                                flex: 1,
                                                textAlign: 'right'
                                            }, label === 'Estado' && { color }]} > {
                                                    /*@ts-ignore */
                                                    Array.isArray(key) ? 'arr' : item[key]
                                                }</Text>
                                        </View>
                                    )
                                })
                            }
                        </>
                        :
                        <>
                            <View key={index + 1} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: .2, borderColor: Color(colors.primary).alpha(.2).toString() }}>
                                <Text style={[fonts.titleSmall, { flex: 1 }]}>#</Text>
                                <Text style={{ flex: 1, textAlign: 'right', paddingRight: 10, }}>{index + 1}</Text>
                            </View>
                            <View key={index + item.CodigoAbonado} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: .2, borderColor: Color(colors.primary).alpha(.2).toString() }}>
                                <Text style={[fonts.titleSmall, { flex: 1, }]}>Abonado</Text>
                                <Text adjustsFontSizeToFit numberOfLines={2} style={{ flex: 1, textAlign: 'right', paddingRight: 10, }}>{item.CodigoAbonado}</Text>
                            </View>
                            <View key={index + item.Nombre} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: .2, borderColor: Color(colors.primary).alpha(.2).toString() }}>
                                <Text style={[fonts.titleSmall, { flex: 1, }]}>Nombre</Text>
                                <Text adjustsFontSizeToFit numberOfLines={2} style={{ flex: 1, textAlign: 'right', paddingRight: 10, }}>{item.Nombre}</Text>
                            </View>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: .2, borderColor: Color(colors.primary).alpha(.2).toString() }}>
                                {
                                    (item.eventos && item.eventos[0])
                                        ?
                                        <>
                                            <Text style={[
                                                fonts.titleSmall,
                                                { flex: 1, color: item.eventos[0].DescripcionAlarm.toLowerCase().includes('apert') ? colors.success : colors.danger }
                                            ]}>Estado</Text>
                                            <Text style={[
                                                fonts.titleSmall,
                                                { flex: 1, textAlign: 'right', color: item.eventos[0].DescripcionAlarm.toLowerCase().includes('apert') ? colors.success : colors.danger }
                                            ]}>{item.eventos[0].DescripcionAlarm}</Text>
                                        </>
                                        :
                                        <>
                                            <Text style={[fonts.titleSmall, { flex: 1, color: colors.warning }]}>Estado</Text>
                                            <Text style={[{ color: colors.warning }]}>----</Text>
                                        </>
                                }
                            </View>
                            <View key={index + 'button'} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: .2, borderColor: Color(colors.primary).alpha(.2).toString() }}>
                                <Text style={[fonts.titleSmall, { flex: 1 }]}>{ }</Text>
                                <Button
                                    contentStyle={{ marginVertical: 4 }}
                                    labelStyle={[fonts.bodySmall, { textTransform: 'capitalize', fontWeight: 'bold' }]}
                                    mode='contained-tonal'
                                    text='Detalles'
                                    colorPressed={Color(colors.primary).fade(.8).toString()}
                                    onPress={() => {
                                        navigation.navigate('ResultAccountScreen', { account: item, start: dates.start.date.date, end: dates.end.date.date, filter: false, keys: getKeys('event-alarm'), typeAccount: 1, report: 'event-alarm' })
                                    }}
                                />
                            </View>
                        </>
                }
            </View>
        )
    }, [colors, backgroundColor])

    const _renderCards = useCallback((datafilter?: dataFilter) => {
        let data = (filterData?.cuentas ?? []);
        if (datafilter) {
            switch (datafilter) {
                case 'SR':
                    data = data.filter(acc => acc.estado === BatteryStatus.ERROR)
                    break;
                case 'CR':
                    data = data.filter(acc => acc.estado === BatteryStatus.RESTORE)
                    break;
                case 'SE':
                    data = data.filter(acc => acc.estado === BatteryStatus.WITHOUT_EVENTS)
                    break;
                case 'A':
                    data = data.filter(acc => acc.eventos && acc.eventos.find(f => AP.find(ff => ff === f.CodigoAlarma)))
                    break;
                case 'C':
                    data = data.filter(acc => acc.eventos && acc.eventos.find(f => CI.find(ff => ff === f.CodigoAlarma)))
                    break;
                case 'S':
                    data = data.filter(acc => !acc.eventos)
                    break;
            }
        }

        return (
            <View style={{ flex: 1, margin: 5 }}>
                <Animated.FlatList
                    data={data}
                    renderItem={renderItem}
                    keyExtractor={(_, idx) => `${idx}`}
                    ListEmptyComponent={<Text style={[fonts.titleMedium, { textAlign: 'center' }]}>Sin coincidencias</Text>}
                />
            </View>
        )
    }, [filterData, colors, fonts, dark, navigation, dates]);

    return (
        <>
            <Loading loading={isLoading} refresh={isFetching} />
            {_renderPercentajes()}
            <Text style={[{ borderLeftWidth: 3, borderColor: colors.primary, color: colors.text }, fonts.titleMedium]}>  {(data?.nombre) ? data.nombre : 'Grupo personalizado, cuentas individuales'}</Text>
            {
                (report === 'batery' || report === 'state')
                    ?
                    <Tab.Navigator screenOptions={{
                        header: () =>
                            <View style={{ marginHorizontal: 10 }}>
                                <TextInput
                                    placeholder={'Buscar cuenta'}
                                    iconLeft={'search'}
                                    containerStyle={{
                                        borderRadius: roundness * 2,
                                        borderWidth: .2,
                                        borderBottomWidth: .2,
                                        borderBottomColor: colors.primary,
                                        borderColor: colors.primary,
                                        marginVertical: 10,
                                        height: 45
                                    }}
                                    iconStyle={{ marginTop: 7 }}
                                />
                            </View>
                    }}>
                        <Tab.Screen name="Todos" options={{ tabBarIcon: (() => <Icon name='grid-outline' />) }}>
                            {
                                () => _renderCards()
                            }
                        </Tab.Screen>
                        <Tab.Screen
                            name={(report === 'state') ? "Abiertas" : "Sin restaure"}
                            options={{
                                tabBarIcon: (() =>
                                    <Icon
                                        name={(report === 'state') ? 'lock-open-outline' : 'warning-outline'}
                                        color={(report === 'state') ? colors.success : colors.danger}
                                    />
                                )
                            }}>
                            {
                                () => (report === 'state') ? _renderCards('A') : _renderCards('SR')
                            }
                        </Tab.Screen>
                        <Tab.Screen
                            name={(report === 'state') ? "Cerradas" : "Con restaure"}
                            options={{
                                tabBarIcon: (() =>
                                    <Icon
                                        name={(report === 'state') ? 'lock-closed-outline' : 'notifications-outline'}
                                        color={(report === 'state') ? colors.danger : colors.warning}
                                    />
                                )
                            }}>
                            {
                                () => (report === 'state') ? _renderCards('C') : _renderCards('CR')
                            }
                        </Tab.Screen>
                        <Tab.Screen
                            name={(report === 'state') ? "Sin estado" : "Sin Eventos"}
                            options={{
                                tabBarIcon: (() =>
                                    <Icon
                                        name={(report === 'state') ? 'warning-outline' : 'checkmark-circle-outline'}
                                        color={(report === 'state') ? colors.warning : colors.success}
                                    />
                                )
                            }}>
                            {
                                () => (report === 'state') ? _renderCards('S') : _renderCards('SE')
                            }
                        </Tab.Screen>
                    </Tab.Navigator>
                    : _renderTables(report)

            }
        </>
    )
}

const styles = StyleSheet.create({
    item: {
        padding: 5,
        margin: 5,
        ...stylesApp.shadow,
        elevation: 2,
        // borderWidth: 1
    },
    container: {
        flex: 1,
        borderRadius: 10,
        marginHorizontal: 5,
        marginVertical: 5,
        ...stylesApp.shadow,
        elevation: 2,
    },
    textTitlesHeader: {
        paddingHorizontal: 5,
        fontWeight: 'bold'
    },
    btnMenu: {
        alignItems: 'flex-start',
        marginVertical: 5
    }
});