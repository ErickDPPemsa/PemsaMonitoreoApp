import { createContext, useEffect } from "react";
import { ColorSchemeName, Dimensions, useColorScheme } from "react-native";
import { Orientation } from '../interfaces/interfaces';
import { useAppDispatch } from '../app/hooks';
import { logOut, setInsets, updateTheme, setScreen, setOrientation } from '../features/appSlice';
import { useQueryClient } from "@tanstack/react-query";
import { CombinedDarkTheme, CombinedLightTheme } from "../config/theme/Theme";
import Toast from "react-native-toast-message";
import { EdgeInsets, useSafeAreaInsets } from "react-native-safe-area-context";
// import { PERMISSIONS, requestMultiple, checkMultiple } from 'react-native-permissions';
// import RNFetchBlob, { FetchBlobResponse } from 'rn-fetch-blob';
// import { baseUrl } from "../api/Api";
// import { logOut } from '../features/appSlice';

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

interface ContextProps {
    handleError: (error: string) => void;
    downloadReport: (props: funcDownload) => void;
}

export const HandleContext = createContext({} as ContextProps);

export const HandleProvider = ({ children }: any) => {
    const appDispatch = useAppDispatch();
    const queryClient = useQueryClient();
    const color: ColorSchemeName = useColorScheme();
    const insets: EdgeInsets = useSafeAreaInsets();


    useEffect(() => {
        color === 'dark' ? appDispatch(updateTheme(CombinedDarkTheme)) : appDispatch(updateTheme(CombinedLightTheme));
    }, [color]);

    // const androidPermissions = [
    //     PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE,
    //     PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE,
    // ];


    useEffect(() => {
        // Platform.OS === 'android' &&
        //     checkMultiple(androidPermissions)
        //         .then(result => {
        //             requestMultiple(androidPermissions)
        //                 .then(response => {
        //                     // console.log(response);
        //                 })
        //                 .catch(error => {
        //                     // console.log(error);
        //                 });
        //         })
        //         .catch(error => Alert.alert('Error', String(error)));

        // dispatch({ type: 'setInsets', payload: insets });
        appDispatch(setInsets(insets));

        const { width, height } = Dimensions.get('screen');
        if (height >= width) {//portrait
            appDispatch(setOrientation(Orientation.portrait));
            appDispatch(setScreen({ height, width }));
        } else {//landscape
            appDispatch(setOrientation(Orientation.landscape));
            appDispatch(setScreen({ height: width, width: height }));
        }
    }, []);


    const handleError = async (error: string) => {
        Toast.show({ type: 'error', text1: 'Error', text2: error });
        if (error.includes('La sesión expiro, inicie sesión nuevamente') || (error.includes('Unauthorized') || error.includes('unauthorized'))) {
            queryClient.clear();
            await appDispatch(logOut());
        }
    }

    const downloadReport = async ({ endpoint, tokenTemp, data, fileName }: funcDownload) => {
        // const url = `${baseUrl}/reports/${endpoint}`;
        // const token = tokenTemp ?? await AsyncStorage.getItem('token');
        // const headers: HeadersInit_ | undefined = {};
        // (token) ? Object.assign(headers, { 'Content-type': 'application/json', 'Authorization': `Bearer ${token}` }) : Object.assign(headers, { 'Content-type': 'application/json', });
        // dispatch({ type: 'updateIsDownload', payload: true });
        // const path = (Platform.OS === 'ios' ? RNFetchBlob.fs.dirs.DocumentDir : RNFetchBlob.fs.dirs.DownloadDir)
        // const directory = path + '/' + fileName;

        // RNFetchBlob
        //     .fetch('POST', url, headers, JSON.stringify(data))
        //     .then(async (resp: FetchBlobResponse) => {
        //         if (resp.type === 'base64') {
        //             try {
        //                 const exist = await RNFetchBlob.fs.exists(directory);
        //                 if (exist) {
        //                     const files = await RNFetchBlob.fs.ls(path);
        //                     const numFiles = files.filter(a => a.includes(fileName.replace('.pdf', ''))).length;
        //                     const newFileName = fileName.replace('.pdf', ` ${numFiles}.pdf`);
        //                     const newDirectory = path + '/' + newFileName;
        //                     await RNFetchBlob.fs.createFile(newDirectory, resp.data, 'base64');
        //                     Toast.show({ text1: `${newFileName}`, text2: 'Creado existosamente', autoHide: true, visibilityTime: 2000 });
        //                 } else {
        //                     await RNFetchBlob.fs.createFile(directory, resp.data, 'base64');
        //                     Toast.show({ text1: `${fileName}`, text2: 'Creado existosamente', autoHide: true, visibilityTime: 2000 });
        //                 }
        //             } catch (error) {
        //                 throw (String(error))
        //             }
        //         }
        //         else {
        //             if (resp.type === 'utf8') throw (JSON.stringify(resp.data, null, 3));
        //             else { throw (JSON.stringify(resp, null, 3)); }
        //         }
        //     })
        //     .catch(error => {
        //         handleError(String(error));
        //         Toast.show({ text1: 'Error', text2: String(error), type: 'error' });
        //     })
        //     .finally(() => dispatch({ type: 'updateIsDownload', payload: false }))
    }

    return (
        <HandleContext.Provider
            value={{
                handleError,
                downloadReport
            }}
        >
            {children}
        </HandleContext.Provider>
    )
}