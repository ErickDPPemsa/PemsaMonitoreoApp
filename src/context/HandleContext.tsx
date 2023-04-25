import { createContext, useEffect, useReducer } from "react";
import { ColorSchemeName, Dimensions, Platform, useColorScheme } from "react-native";
import { Account, BatteryStatus, GetReport, Group, Orientation, Percentajes, UpdateUserProps, User } from '../interfaces/interfaces';
import { logOut, setInsets, updateTheme, setScreen, setOrientation } from '../features/appSlice';
import { CombinedDarkTheme, CombinedLightTheme } from "../config/theme/Theme";
import { AP, APCI, Alarm, Bat, CI, Prue, TypeReport, otros } from "../types/types";
import { EdgeInsets, useSafeAreaInsets } from "react-native-safe-area-context";
import RNFetchBlob, { FetchBlobResponse } from 'react-native-blob-util';
import axios, { AxiosInstance } from "axios";
import { useAppDispatch } from '../app/hooks';
import { useQueryClient } from "@tanstack/react-query";
import EncryptedStorage from 'react-native-encrypted-storage';
import Toast from "react-native-toast-message";
import RNFS from 'react-native-fs';

interface funcDownload {
    endpoint: string;
    tokenTemp?: string;
    data: {
        accounts: Array<number>,
        typeAccount: number,
        dateStart?: string,
        dateEnd?: string,
        showGraphs: boolean
    }
    fileName: string,
}

type State = {
    domain: string;
    instance: AxiosInstance;
}

type Action =
    | { type: 'updateDomain', payload: string }
    | { type: 'updateInstance', payload: AxiosInstance }
    ;

const initialState: State = {
    domain: '',
    instance: axios.create(),
}


interface ContextProps extends State {
    handleError: (error: string) => void;
    downloadReport: (props: funcDownload) => void;
    updateDomain: (domain: string) => void;
    LogIn: (props: { email: string; password: string; }) => Promise<User>;
    CheckAuth: () => Promise<User>;
    AccepTerms: (token: string) => Promise<User>;
    GetMyAccount: () => Promise<{ accounts: Array<Account> }>;
    GetGroups: () => Promise<{ groups: Array<Group> }>;
    ReportEvents: ({ body, type }: {
        body: GetReport;
        type?: TypeReport | undefined;
    }) => Promise<{
        nombre: string;
        cuentas?: Account[] | undefined;
        fechas?: string[] | undefined;
        total?: number | undefined;
        percentajes?: Percentajes | undefined;
    }>;
    UpdateUser: ({ id, ...props }: UpdateUserProps) => Promise<User>
}

export const HandleContext = createContext({} as ContextProps);

const Reducer = (state: State, action: Action): State => {
    switch (action.type) {
        case 'updateDomain': return { ...state, domain: action.payload }
        case 'updateInstance': return { ...state, instance: action.payload }
        default: return state;
    }

}
export const HandleProvider = ({ children }: any) => {
    const [state, dispatch] = useReducer(Reducer, initialState);
    const appDispatch = useAppDispatch();
    const queryClient = useQueryClient();
    const color: ColorSchemeName = useColorScheme();
    const insets: EdgeInsets = useSafeAreaInsets();

    state.instance.interceptors.request.use(
        async (config) => {
            config.headers.Authorization = `Bearer ${await getToken()}`;
            return config;
        },
        (error) => Promise.reject(error),
    );

    useEffect(() => {
        color === 'dark' ? appDispatch(updateTheme(CombinedDarkTheme)) : appDispatch(updateTheme(CombinedLightTheme));
    }, [color]);

    useEffect(() => {
        appDispatch(setInsets(insets));
        getDomain();
    }, []);

    useEffect(() => {
        if (state.domain !== '') {
            dispatch({
                type: 'updateInstance', payload: axios.create({
                    baseURL: state.domain
                })
            })
        }
    }, [state.domain]);

    const getDomain = async () => {
        const domain: string = await EncryptedStorage.getItem('domainServerPrelmo') ?? '';
        dispatch({ type: 'updateDomain', payload: domain });
    }

    const getToken = async () => {
        try {
            let newToken: string | undefined = undefined;
            const token: string = await EncryptedStorage.getItem('token') ?? '';
            const refreshToken: string = await EncryptedStorage.getItem('refreshToken') ?? '';
            newToken = await axios.get('auth/check-auth', { baseURL: state.domain, headers: { Authorization: `Bearer ${refreshToken}` } })
                .then(async resp => {
                    const data = resp.data as User;
                    try {
                        await EncryptedStorage.setItem('token', data.token);
                        await EncryptedStorage.setItem('refreshToken', data.refreshToken);
                        return data.token;
                    } catch { return undefined }
                })
                .catch(async err => { return undefined });
            return newToken ?? token;
        } catch (error) { return '' }
    }

    const handleError = async (error: string) => {
        Toast.show({ type: 'error', text1: 'Error', text2: error });
        if (error.includes('La sesión expiro, inicie sesión nuevamente') || (error.includes('Unauthorized') || error.includes('unauthorized'))) {
            queryClient.clear();
            await appDispatch(logOut());
        }
    }

    const downloadReport = async ({ endpoint, tokenTemp, data, fileName }: funcDownload) => {
        const url = `${state.domain}/download/${endpoint}`;
        const token = tokenTemp ?? await EncryptedStorage.getItem('token');
        const headers: HeadersInit_ | undefined = {};
        (token) ? Object.assign(headers, { 'Content-type': 'application/json', 'Authorization': `Bearer ${token}` }) : Object.assign(headers, { 'Content-type': 'application/json', });
        const path = (Platform.OS === 'ios' ? RNFS.DocumentDirectoryPath : RNFS.DownloadDirectoryPath)
        const directory = path + '/' + fileName;

        RNFetchBlob
            .fetch('POST', url, headers, JSON.stringify(data))
            .then(async (resp: FetchBlobResponse) => {
                if (resp.type === 'base64') {
                    try {
                        const exist = await RNFS.exists(directory);
                        if (exist) {
                            const files = await RNFS.readDir(path);
                            const numFiles = files.filter(a => a.name.includes(fileName.replace('.pdf', ''))).length;
                            const newFileName = fileName.replace('.pdf', ` ${numFiles}.pdf`);
                            const newDirectory = path + '/' + newFileName;
                            await RNFS.writeFile(newDirectory, resp.data, 'base64')
                                .then(response => {
                                    Toast.show({ text1: `${newFileName}`, text2: 'Creado existosamente', autoHide: true, visibilityTime: 2000 });
                                })
                                .catch(err => {
                                    Toast.show({ type: 'error', text1: 'Error', autoHide: true, visibilityTime: 2000 });
                                });
                        } else {
                            await RNFS.writeFile(directory, resp.data, 'base64')
                                .then(response => {
                                    Toast.show({ text1: `${fileName}`, text2: 'Creado existosamente' + ' ' + directory, autoHide: true, visibilityTime: 2000 });
                                })
                                .catch(err => {
                                    Toast.show({ type: 'error', text1: 'Error', autoHide: true, visibilityTime: 2000 });
                                });
                        }
                    } catch (error) {
                        throw (String(error))
                    }
                }
                else {
                    if (resp.type === 'utf8') throw (JSON.stringify(resp.data, null, 3));
                    else { throw (JSON.stringify(resp, null, 3)); }
                }
            })
            .catch(error => {
                handleError(String(error));
                Toast.show({ text1: 'Error', text2: String(error), type: 'error' });
            })
    }

    const updateDomain = async (domain: string) => {
        try {
            await EncryptedStorage.setItem('domainServerPrelmo', domain);
            dispatch({ type: 'updateDomain', payload: domain });
        } catch (error) {
            handleError(`${error}`);
        }
    }

    const LogIn = async (props: { email: string, password: string }) => {
        const response = await state.instance.post('auth', props);
        return response.data as User;
    }

    const CheckAuth = async () => {
        console.log(state.domain);

        const response = await state.instance.get('auth/check-auth');
        return response.data as User;
    }

    const AccepTerms = async (token: string) => {
        const response = await axios.get('user/accept-terms', { baseURL: state.domain, headers: { Authorization: `Bearer ${token}` } })
        return response.data as User;
    };

    const GetMyAccount = async () => {
        const response = await state.instance.get('accounts/my-individual-accounts');
        return response.data as { accounts: Array<Account> };
    };

    const GetGroups = async () => {
        const response = await state.instance.get('accounts/my-groups');
        return response.data as { groups: Array<Group> };
    };

    const ReportEvents = async ({ body, type }: { body: GetReport, type?: TypeReport }) => {
        const response = await state.instance.post(`reports/${type}`, body);

        const { data: dataResponse, ...rest } = response;
        const data = dataResponse as { nombre: string, cuentas?: Array<Account>, fechas?: Array<string>, total?: number, percentajes?: Percentajes };

        if (data.cuentas?.length === 1 && data.cuentas[0].eventos) {
            const total: number = data.cuentas[0].eventos.length;
            if (type === 'ap-ci') {
                let Aperturas = data.cuentas[0].eventos.filter(f => AP.find(ff => ff === f.CodigoAlarma)).length;
                let Cierres = data.cuentas[0].eventos.filter(f => CI.find(ff => ff === f.CodigoAlarma)).length;
                const percentajes: Percentajes = {
                    Aperturas: {
                        total,
                        percentaje: Aperturas * 100 / total,
                        events: Aperturas,
                        text: 'Aperturas recibidas'
                    },
                    Cierres: {
                        total,
                        percentaje: Cierres * 100 / total,
                        events: Cierres,
                        text: 'Cierres recibidos'
                    }
                }
                return { nombre: '', cuentas: [{ ...data.cuentas[0] }], percentajes }
            } else if (type === 'event-alarm') {
                let ApCi = data.cuentas[0].eventos.filter(f => APCI.find(ff => ff === f.CodigoAlarma)).length;
                let Alarma = data.cuentas[0].eventos.filter(f => Alarm.find(ff => ff === f.CodigoAlarma)).length;
                let Pruebas = data.cuentas[0].eventos.filter(f => Prue.find(ff => ff === f.CodigoAlarma)).length;
                let Bate = data.cuentas[0].eventos.filter(f => Bat.find(ff => ff === f.CodigoAlarma)).length;
                let Otros = data.cuentas[0].eventos.filter(f => otros.find(ff => ff === f.CodigoAlarma)).length;

                const percentajes: Percentajes = {
                    APCI: {
                        total,
                        events: ApCi,
                        percentaje: ApCi * 100 / total,
                        label: 'Ap/Ci',
                        text: 'Aperturas y Cierres \nrecibidos'
                    },
                    Alarma: {
                        total,
                        events: Alarma,
                        percentaje: Alarma * 100 / total,
                        label: 'Alarma',
                        text: 'Alarmas recibidas'
                    },
                    Pruebas: {
                        total,
                        events: Pruebas,
                        percentaje: Pruebas * 100 / total,
                        label: 'Pruebas',
                        text: 'Pruebas recibidas'
                    },
                    Battery: {
                        total,
                        events: Bate,
                        percentaje: Bate * 100 / total,
                        label: 'Bateria',
                        text: 'Eventos de batería \nrecibidos'
                    },
                    Otros: {
                        total,
                        events: Otros,
                        percentaje: Otros * 100 / total,
                        label: 'Otros',
                        text: 'Otros eventos \nrecibidos'
                    }
                }

                return {
                    nombre: '',
                    cuentas: [{ ...data.cuentas[0] }],
                    percentajes
                }
            }
        } else if (type === 'batery') {
            if (data && data.cuentas && data.total) {
                let conRestaure: number = 0, sinRestaure: number = 0, sinEventos: number = 0;
                sinRestaure = data.cuentas.filter(acc => acc.estado === BatteryStatus.ERROR).length;
                conRestaure = data.cuentas.filter(acc => acc.estado === BatteryStatus.RESTORE).length;
                sinEventos = data.cuentas.filter(acc => acc.estado === BatteryStatus.WITHOUT_EVENTS).length;

                const percentajes: Percentajes = {
                    sinRestaure: {
                        percentaje: sinRestaure / data.total * 100,
                        total: data.total,
                        events: sinRestaure,
                        label: 'Sin restaure',
                    },
                    conRestaure: {
                        percentaje: conRestaure / data.total * 100,
                        total: data.total,
                        events: conRestaure,
                        label: 'Con restaure',
                    },
                    sinEventos: {
                        percentaje: sinEventos / data.total * 100,
                        total: data.total,
                        events: sinEventos,
                        label: 'Sin eventos'
                    }
                }

                return {
                    nombre: data.nombre,
                    cuentas: [...data.cuentas],
                    total: data.total,
                    percentajes
                }
            }
        } else if (type === 'state') {
            if (data && data.cuentas) {
                let abiertas: number = 0, cerradas: number = 0, sinEstado: number = 0;
                abiertas = data.cuentas.filter(f => (f.eventos && f.eventos.find(f => AP.find(ff => ff === f.CodigoAlarma)))).length;
                cerradas = data.cuentas.filter(f => (f.eventos && f.eventos.find(f => CI.find(ff => ff === f.CodigoAlarma)))).length;
                sinEstado = data.cuentas.filter(f => !f.eventos).length;
                const percentajes: Percentajes = {
                    abiertas: {
                        percentaje: (abiertas * 100) / data.cuentas.length,
                        total: data.cuentas.length,
                        events: abiertas,
                        label: 'Abiertas',
                        text: 'Sucursales abiertas'
                    },
                    cerradas: {
                        percentaje: (cerradas * 100) / data.cuentas.length,
                        total: data.cuentas.length,
                        events: cerradas,
                        label: 'Cerradas',
                        text: 'Sucursales cerradas'
                    },
                    sinEstado: {
                        percentaje: (sinEstado * 100) / data.cuentas.length,
                        total: data.cuentas.length,
                        events: sinEstado,
                        label: 'Sin estado',
                        text: 'Sucursales sin estado'
                    }
                }
                return {
                    nombre: data.nombre,
                    cuentas: [...data.cuentas],
                    total: data.total,
                    percentajes
                }
            }
        } else if (type === 'apci-week') {
            if (data && data.cuentas) {
                let reciberAp: number = 0, reciberCi: number = 0;
                const acc = data.cuentas.map(acc => {
                    if (acc.eventos && data.fechas) {
                        const { eventos, ...rest } = acc;
                        const df = data.fechas.map(day => {
                            const perDay = acc.eventos?.filter(ev => ev.FechaOriginal === day);
                            if (perDay && perDay.length > 0) {
                                let Aperturas = perDay.filter(f => AP.find(ff => ff === f.CodigoAlarma)).slice(0, 1);
                                let Cierres = perDay.filter(f => CI.find(ff => ff === f.CodigoAlarma)).reverse().slice(0, 1);
                                reciberAp += Aperturas.length;
                                reciberCi += Cierres.length;
                                return [Aperturas, Cierres].flat()
                            } else {
                                return [];
                            }
                        }).flat();
                        return { ...rest, eventos: df };
                    } else {
                        return acc;
                    }
                });
                const total: number = acc.length * 7;
                const percentajes: Percentajes = {
                    Aperturas: {
                        total,
                        percentaje: reciberAp * 100 / total,
                        events: reciberAp,
                        label: 'Aperturas',
                        text: 'Aperturas recibidas'
                    },
                    Cierres: {
                        total,
                        percentaje: reciberCi * 100 / total,
                        events: reciberCi,
                        label: 'Cierres',
                        text: 'Cierres recibidos'
                    },
                }
                return {
                    nombre: data.nombre,
                    fechas: data.fechas,
                    cuentas: acc,
                    percentajes,
                }
            }
        }
        return data;
    }

    const UpdateUser = async ({ id, ...props }: UpdateUserProps) => {
        const response = await state.instance.patch(`user/update/${id}`, props);
        return response.data as User;
    };

    return (
        <HandleContext.Provider
            value={{
                ...state,
                handleError,
                downloadReport,
                updateDomain,
                LogIn,
                AccepTerms,
                CheckAuth,
                GetGroups,
                GetMyAccount,
                ReportEvents,
                UpdateUser,
            }}
        >
            {children}
        </HandleContext.Provider>
    )
}