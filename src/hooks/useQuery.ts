import { useQuery } from '@tanstack/react-query';
import { useReportProps } from "../interfaces/interfaces";
import { useContext } from "react";
import { HandleContext } from "../context/HandleContext";

export function useReport({ accounts, dateEnd, dateStart, key, type, typeAccount }: useReportProps) {
    const { ReportEvents, handleError } = useContext(HandleContext);
    return useQuery(['Events', key, type, dateStart, dateEnd], () => ReportEvents({ type, body: { accounts, dateStart, dateEnd, typeAccount } }), {
        onError: error => handleError(String(error)),
    })
}

export function useMyAccounts() {
    const { GetMyAccount, handleError } = useContext(HandleContext);
    return useQuery(['MyAccounts'], GetMyAccount, {
        onError: error => handleError(String(error)),
        // onSuccess: () => Toast.show({ type: 'success', text2: 'Cuentas Actualizadas correctamente...', autoHide: true })
    });
}

export function useGroups() {
    const { GetGroups, handleError } = useContext(HandleContext);
    return useQuery(['MyGroups'], GetGroups, {
        onError: error => handleError(String(error)),
        // onSuccess: () => Toast.show({ type: 'success', text2: 'Grupos Actualizadas correctamente...', autoHide: true })
    });
}

