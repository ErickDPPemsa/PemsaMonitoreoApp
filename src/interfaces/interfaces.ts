import { GestureResponderEvent, StatusBarProps } from "react-native";
import { KeychainType, statusApp, statusCheckBox, ThemeBase, typeAccount, TypeReport } from "../types/types";
import { Theme } from "@react-navigation/native";
import { EdgeInsets } from "react-native-safe-area-context";
import keychain from 'react-native-keychain';

export interface AppSlice {
    status: statusApp;
    firstEntry: boolean;
    isCompatible: keychain.BIOMETRY_TYPE | null;
    isSave: boolean;
    isSaveWithBiometry: boolean;
    keychain: KeychainType;
    theme: ThemeBase & Theme;
    User?: User;
    orientation: Orientation;
    screenHeight: number;
    screenWidth: number;
    insets?: EdgeInsets;
    accountsSelected: Array<Account>;
    groupsSelected: Array<Group>;
};

export interface date {
    date: string;
    day: number;
    month: number;
    year: number;
};

export interface time {
    time: string;
    hour: number;
    minute: number;
    second: number;
};
export interface formatDate {
    DATE: Date;
    date: date;
    time: time;
    weekday: number;
}

export interface User {
    id: string;
    fullName: string;
    email: string;
    termsAndConditions: boolean;
    roles: Array<string>;
    token: string;
    refreshToken: string;
}

export interface UpdateUserProps {
    id: string;
    fullName: string;
    password: string;
    lastPassword: string;
}

export enum BatteryStatus {
    ERROR = "ERROR",
    RESTORE = "RESTORE",
    WITHOUT_EVENTS = "WITHOUT-EVENTS"
}
export enum Orientation {
    portrait = 'portrait',
    landscape = 'landscape'
}

export interface Account {
    CodigoCte: string;
    CodigoAbonado: string;
    Nombre: string;
    Direccion: string;
    Status?: string;
    nombre?: string;
    numeroEventos?: number;
    estado?: BatteryStatus;
    eventos?: Array<Events>;
}

export interface Group {
    Codigo: number;
    Nombre: string;
    Tipo: number;
}

export interface percentaje {
    total: number;
    events: number;
    percentaje: number;
    label?: string;
    text?: string;
}

export interface Percentajes {
    Aperturas?: percentaje;
    Cierres?: percentaje;
    APCI?: percentaje;
    Alarma?: percentaje;
    Pruebas?: percentaje;
    Battery?: percentaje;
    Otros?: percentaje;
    conRestaure?: percentaje;
    sinRestaure?: percentaje;
    sinEventos?: percentaje;
    abiertas?: percentaje;
    cerradas?: percentaje;
    sinEstado?: percentaje;
}

export interface GetReport {
    accounts: Array<number>;
    typeAccount: typeAccount;
    dateStart?: string;
    dateEnd?: string;
}

export interface Events {
    FechaOriginal: string;
    Hora: string;
    CodigoEvento: string;
    CodigoAlarma: string;
    DescripcionAlarm: string;
    CodigoZona: string;
    DescripcionZona: string;
    CodigoUsuario: string;
    NombreUsuario: string;
    DescripcionEvent: string;
    Particion: number;
    ClaveMonitorista: string;
    NomCalifEvento: string;
    FechaPrimeraToma: string;
    HoraPrimeraToma: string;
    FechaFinalizo: string;
    HoraFinalizo: string;
}

export interface Key<T> {
    label: string,
    key: keyof T | Array<keyof T>,
    size?: number,
    center?: boolean
}

export interface useReportProps {
    type: TypeReport,
    accounts: Array<number>,
    dateStart?: string,
    dateEnd?: string,
    typeAccount: typeAccount,
    key: string;
}

export interface dataReport {
    nombre: string;
    cuentas?: Account[] | undefined;
    fechas?: string[] | undefined;
    total?: number | undefined;
    percentajes?: Percentajes | undefined;
}

export interface PropsCheckBox {
    text: string;
    isChecked: statusCheckBox;
    disabled?: boolean;
    onPress?: ((event: GestureResponderEvent) => void) | null;
    uncheckedColor?: string;
    color?: string;
}