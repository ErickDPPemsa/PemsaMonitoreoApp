import { useQuery } from '@tanstack/react-query';
import Toast from 'react-native-toast-message';
import { useReportProps } from "../interfaces/interfaces";
import { useContext } from "react";
import { HandleContext } from "../context/HandleContext";

export function useReport({ accounts, dateEnd, dateStart, key, type, typeAccount }: useReportProps) {
    const { ReportEvents } = useContext(HandleContext);
    return useQuery(['Events', key, type, dateStart, dateEnd], () => ReportEvents({ type, body: { accounts, dateStart, dateEnd, typeAccount } }), {
        onError: error => Toast.show({ type: 'error', text1: 'Error', text2: String(error) }),
    })
}

export function useMyAccounts() {
    const { GetMyAccount } = useContext(HandleContext);
    return useQuery(['MyAccounts'], GetMyAccount, {
        onError: error => Toast.show({ type: 'error', text1: 'Error', text2: String(error) }),
        // onSuccess: () => Toast.show({ type: 'success', text2: 'Cuentas Actualizadas correctamente...', autoHide: true })
    });
}

export function useGroups() {
    const { GetGroups } = useContext(HandleContext);
    return useQuery(['MyGroups'], GetGroups, {
        onError: error => Toast.show({ type: 'error', text1: 'Error', text2: String(error) }),
        // onSuccess: () => Toast.show({ type: 'success', text2: 'Grupos Actualizadas correctamente...', autoHide: true })
    });
}

