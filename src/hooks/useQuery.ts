import { TypeReport, typeAccount } from "../types/types";
import { useQuery } from '@tanstack/react-query';
import { GetGroups, GetMyAccount, ReportEvents } from "../api/Api";
import Toast from 'react-native-toast-message';
import { useReportProps } from "../interfaces/interfaces";

export function useReport({ accounts, dateEnd, dateStart, key, type, typeAccount }: useReportProps) {
    return useQuery(['Events', key, type, dateStart, dateEnd], () => ReportEvents({ type, body: { accounts, dateStart, dateEnd, typeAccount } }), {
        onError: error => Toast.show({ type: 'error', text1: 'Error', text2: String(error) }),
    })
}

export function useMyAccounts() {
    return useQuery(['MyAccounts'], GetMyAccount, {
        onError: error => Toast.show({ type: 'error', text1: 'Error', text2: String(error) }),
        // onSuccess: () => Toast.show({ type: 'success', text2: 'Cuentas Actualizadas correctamente...', autoHide: true })
    });
}

export function useGroups() {
    return useQuery(['MyGroups'], GetGroups, {
        onError: error => Toast.show({ type: 'error', text1: 'Error', text2: String(error) }),
        // onSuccess: () => Toast.show({ type: 'success', text2: 'Grupos Actualizadas correctamente...', autoHide: true })
    });
}

