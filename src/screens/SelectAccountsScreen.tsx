import { CommonActions, useIsFocused, useNavigation } from '@react-navigation/native';
import React, { useCallback, useContext, useLayoutEffect, useState } from 'react';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import { View, KeyboardAvoidingView, TouchableHighlight } from 'react-native';
import { modDate } from '../functions/functions';
import { formatDate, Account, Orientation } from '../interfaces/interfaces';
import { useEffect } from 'react';
import { Select } from '../components/select/Select';
import { useAppSelector, useAppDispatch } from '../app/hooks';
import { Loading } from '../components/Loading';
import Toast from 'react-native-toast-message';
import { ScrollView } from 'react-native-gesture-handler';
import { useMyAccounts } from '../hooks/useQuery';
import { TypeReport } from '../types/types';
import { Calendar } from '../components/calendar/Calendar';
import { HandleContext } from '../context/HandleContext';
import { Button } from '../components/Button';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Color from 'color';
import { stylesApp } from '../App';
import { Fab } from '../components/Fab';
import { rootStackScreen } from '../navigation/Stack';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import TextInput from '../components/Input/TextInput';
import { IconButton } from '../components/IconButton';
import Text from '../components/Text';
import { updateAccounts } from '../features/appSlice';
import { DrawerScreenProps } from '@react-navigation/drawer';
import { RootDrawerNavigator } from '../navigation/Drawer';

type Stack = NativeStackScreenProps<rootStackScreen>;

type Accout = {
    name: string;
    report: string;
    start: string;
    end: string;
}

const calendars = [
    { label: 'Fecha inicio', date: modDate({ days: -30 }).DATE },
    { label: 'Fecha final', date: modDate({}).DATE },
]

const reports: Array<{ name: string, value: TypeReport, msg: string, setDates: boolean }> = [
    { name: 'APERTURA Y CIERRE', value: 'ap-ci', msg: 'Con este reporte podra consultar los horarios en los que se recibieron los eventos de apertura y cierre', setDates: true },
    { name: 'EVENTO DE ALARMA', value: 'event-alarm', msg: 'Con este reporte podra ver los eventos de alarma, asi como los eventos generados por su sistema de alarma', setDates: true },
    { name: 'PROBLEMAS DE BATERIA', value: 'batery', msg: '', setDates: false },
    { name: 'ESTADO DE SUCURSALES', value: 'state', msg: '', setDates: false },
    { name: 'HORARIOS DE APERTURAS Y CIERRES', value: 'apci-week', msg: '', setDates: false },
]

interface Props extends DrawerScreenProps<RootDrawerNavigator, 'SelectAccountsScreen'> { };
export const SelectAccountsScreen = ({ navigation, route }: Props) => {
    const navStack = useNavigation();
    const { theme: { colors, fonts, roundness }, orientation, accountsSelected } = useAppSelector(state => state.app);
    const { control, handleSubmit, reset, setValue: setValueForm } = useForm<Accout>({ defaultValues: { name: '', start: '', end: '', report: '' } });
    const [report, setReport] = useState<typeof reports>();
    const [dates, setDates] = useState<Array<{ name: string, date?: formatDate }>>();
    const [hideCalendars, setHideCalendars] = useState<boolean>(false);
    const dispatch = useAppDispatch();
    const isFocus = useIsFocused();

    useLayoutEffect(() => {
        navigation.setOptions({
            title: 'Consulta Avanzada'
        })
    }, [navigation]);


    const onSubmit: SubmitHandler<Accout> = async (props) => {
        if (dates && accountsSelected.length > 0 && report) {
            const missingDates = dates.filter(s => s.date === undefined).map(name => name.name);
            if (missingDates?.length === 0) {
                const start = dates.find(f => f.name === 'Fecha inicio')?.date?.date.date ?? modDate({}).date.date;
                const end = dates.find(f => f.name === 'Fecha final')?.date?.date.date ?? modDate({}).date.date;
                if (accountsSelected.length === 1) {
                    // navigate('ResultAccountScreen', { account: { name: accounts[0].Nombre, code: parseInt(accounts[0].CodigoCte) }, end, report: report[0].value, start, keys: getKeys(report[0].value), typeAccount: 1 })
                } else {
                    // navigate('ResultAccountsScreen', {
                    //     accounts: valueSelect ? valueSelect.map(v => { return { name: v.Nombre, code: parseInt(v.CodigoCte) } }).sort() : [],
                    //     report: report[0].value,
                    //     keys: report[0].value === 'batery' ? getKeysAccount(report[0].value) : getKeys(report[0].value),
                    //     typeAccount: 1,
                    //     start: (report[0].value === 'ap-ci' || report[0].value === 'event-alarm') ? start : undefined,
                    //     end: (report[0].value === 'ap-ci' || report[0].value === 'event-alarm') ? end : undefined,
                    //     nameGroup: 'Custom Group'
                    // });
                }
            } else {
                Toast.show({ type: 'customError', text1: 'Error al asignar Fechas', text2: `Fechas faltantes:\n${missingDates}` })
            }
        }
    };

    const _renderSelectAccounts = useCallback(() => {
        return (
            <Controller
                control={control}
                rules={{ required: { message: 'Debe seleccionar al menos una cuenta', value: true } }}
                name='name'
                render={({ field: { value, onChange }, fieldState: { error } }) =>
                    <>
                        <TextInput
                            editable={false}
                            value={value}
                            label={'Seleccione una cuenta'}
                            placeholder={'Seleccione una cuenta'}
                            showSoftInputOnFocus={false}
                            iconRight={'chevron-down'}
                            onPress={() => {

                                navStack.dispatch(CommonActions.navigate('Search', { type: 'Accounts' }));
                            }}
                            onRightPress={() => {
                                navStack.dispatch(CommonActions.navigate('Search', { type: 'Accounts' }));
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
                        {error && <Text style={[fonts.titleSmall, { marginLeft: 15, color: colors.error }]}>{error.message}</Text>}
                    </>
                }
            />
        )
    }, [control, colors]);

    const _renderSelectReport = useCallback(() => {
        if (reports) {
            return (
                <Controller
                    control={control}
                    rules={{ required: { message: 'Debe seleccionar un reporte', value: true } }}
                    name='report'
                    render={({ field: { value, onChange }, fieldState: { error } }) =>
                        <>
                            <Select
                                maxHeight={200}
                                animationType='fade'
                                valueField='value'
                                labelField='name'
                                value={value}
                                label='Seleccionar reporte'
                                itemsSelected={report ?? []}
                                data={accountsSelected?.length === 1 ? reports.slice(0, 2) : reports}
                                onChange={(value) => {
                                    setReport(value);
                                    if (value.length > 0) {
                                        onChange(value[0].name);
                                    } else {
                                        onChange('')
                                    }
                                }}
                            />
                            {error && <Text style={[fonts.titleSmall, { marginLeft: 15, color: colors.error }]}>{error.message}</Text>}
                        </>
                    }
                />
            )
        }
        return undefined;
    }, [control, report, setReport, reports, colors, accountsSelected])

    useEffect(() => {
        if (accountsSelected.length === 0) setValueForm('name', '');
        if (accountsSelected.length === 1) {
            setReport([reports[0]]);
            setValueForm('report', reports[0].name);
        }
        if (accountsSelected.length > 0) {
            setValueForm('name', accountsSelected[0].Nombre);
        }
    }, [accountsSelected, isFocus]);

    useEffect(() => {
        if (report && report.length > 0 && report[0].setDates) setHideCalendars(false);
        else setHideCalendars(true);
    }, [report]);

    return (
        <View style={{ flex: 1, padding: 10, justifyContent: 'center', alignItems: 'center' }}>
            <View style={[
                { width: '100%' },
                orientation === Orientation.landscape && {
                    width: '80%'
                }
            ]}>
                <ScrollView>
                    <Text variant='titleMedium' style={[{ textAlign: 'center' }]}>Seleccione el inicio y fin de la consulta;</Text>
                    <Text variant='titleMedium' style={[{ textAlign: 'center' }]}>Recuerde que solo se puede consultar hasta 30 dias naturales</Text>
                    {
                        <KeyboardAvoidingView>
                            {_renderSelectAccounts()}
                            <View style={[{ padding: 10, maxHeight: 200, backgroundColor: Color(colors.primary).fade(.8).toString(), borderRadius: roundness * 2 }]}>
                                <ScrollView >
                                    {
                                        accountsSelected?.map(acc =>
                                            <View
                                                key={acc.CodigoCte}
                                                style={[
                                                    stylesApp.shadow,
                                                    {
                                                        backgroundColor: colors.background,
                                                        flexDirection: 'row',
                                                        alignItems: 'center',
                                                        justifyContent: 'space-between',
                                                        borderRadius: roundness * 2,
                                                        paddingHorizontal: 10,
                                                        paddingVertical: 5,
                                                        marginVertical: 4,
                                                        elevation: 5
                                                    }
                                                ]}
                                            >
                                                <Text style={[fonts.titleMedium, { color: colors.text, textAlign: 'left' }]}>{acc.Nombre}</Text>
                                                <IconButton name='close' onPress={() => { dispatch(updateAccounts(accountsSelected.filter(f => f.CodigoCte !== acc.CodigoCte))) }} />
                                            </View>
                                        )
                                    }
                                </ScrollView>
                            </View>
                            {_renderSelectReport()}
                            <View style={[
                                orientation === Orientation.landscape && {
                                    flexDirection: 'row',
                                    justifyContent: 'flex-end'
                                }
                            ]}>
                                <Calendar
                                    calendars={calendars}
                                    backgroundColor={colors.background}
                                    textColor={colors.text}
                                    colorOutline={colors.primary}
                                    limitDays={30}
                                    onChange={setDates}
                                    Textstyle={fonts.titleMedium}
                                    hideInputs={hideCalendars}
                                />
                                <View style={{ padding: 10, alignItems: 'flex-end' }}>
                                    <Button
                                        text='CONSULTAR'
                                        style={{ marginVertical: 5 }}
                                        mode='contained'
                                        onPress={handleSubmit(onSubmit)}
                                        contentStyle={{ paddingVertical: 5 }}
                                    />
                                </View>
                            </View>
                        </KeyboardAvoidingView>
                    }
                </ScrollView>
            </View>
        </View >
    )
}