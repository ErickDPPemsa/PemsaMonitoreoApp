import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React, { useContext } from 'react';
import { useAppSelector, useAppDispatch } from '../app/hooks';
import { Modal } from '../screens/Modal';
import { LogInScreen } from '../screens/LogInScreen';
import { HandleContext } from '../context/HandleContext';
import { IntroductionScreen } from '../screens/IntroductionScreen';
import { SplashScreen } from '../screens/SplashScreen';
import { useQuery } from '@tanstack/react-query';
import { CheckAuth } from '../api/Api';
import { Drawer } from './Drawer';
import Toast from 'react-native-toast-message';
import { setUser } from '../features/appSlice';
import { Loading } from '../components/Loading';
import { TCAPScreen } from '../screens/TCAPScreen';
import { User, Account, Key, Events } from '../interfaces/interfaces';
import { SearchScreen } from '../screens/SearchScreen';
import { ChangePasswordScreen } from '../screens/ChangePasswordScreen';
import { DetailsInfoScreen } from '../screens/DetailsInfoScreen';
import { ResultAccountScreen } from '../screens/ResultAccountScreen';
import { TypeReport, typeAccount, filterEvents } from '../types/types';
import { ResultAccountsScreen } from '../screens/ResultAccountsScreen';

interface PropsModal {
    type: 'info' | 'error' | 'question' | 'warning' | 'success';
    title?: string;
    subtitle?: string;
    text?: string;
    icon?: boolean;
    timeClose?: number;
}

export type rootStackScreen = {
    SplashScreen: undefined;
    IntroductionScreen: undefined;
    LogInScreen: undefined;
    Drawer: undefined;
    Search: { type: 'Account' | 'Accounts' | 'Groups' };
    Modal: PropsModal;
    TCAP: { user: User } | undefined;
    ChangePasswordScreen: undefined;
    DetailsInfoScreen: undefined;
    ResultAccountScreen: {
        account: Account,
        start: string,
        end: string,
        report: Exclude<TypeReport, "batery" | "state" | "apci-week">,
        keys: Array<Key<Events>>,
        typeAccount: typeAccount,
        filter: boolean,
    };
    ResultAccountsScreen: {
        accounts: Array<{ name: string, code: number }>,
        nameGroup: string,
        start?: string,
        end?: string,
        report: TypeReport,
        keys: Array<Key<Events>> | Array<Key<Account>>,
        typeAccount: typeAccount
    };

}

const Stack = createNativeStackNavigator<rootStackScreen>();


export const StackScreens = () => {
    const { status: isAuth, User } = useAppSelector((state) => state.app);
    const { handleError } = useContext(HandleContext);
    const dispatchApp = useAppDispatch();

    const { isFetching } = useQuery(['checkAuth'], () => CheckAuth({ token: User?.refreshToken }), {
        retry: 0,
        refetchInterval: 300000,
        enabled: isAuth,
        onError: error => {
            handleError(String(error));
            Toast.show({ type: 'error', text1: 'Error', text2: String(error) })
        },
        onSuccess: (resp) => {
            // Toast.show({ type: 'error', text1: 'Error', text2: JSON.stringify(resp, null, 3) });
            dispatchApp(setUser(resp));
        }
    });

    return (
        <>
            <Loading refresh={isFetching} />
            <Stack.Navigator initialRouteName='SplashScreen'>
                {
                    isAuth
                        ?
                        <Stack.Group key={"Private"}>
                            <Stack.Screen name='Drawer' component={Drawer} options={{ headerShown: false }} />
                            <Stack.Screen name='ChangePasswordScreen' component={ChangePasswordScreen} />
                            <Stack.Screen name='DetailsInfoScreen' component={DetailsInfoScreen} />
                            <Stack.Screen name='ResultAccountScreen' component={ResultAccountScreen} />
                            <Stack.Screen name='ResultAccountsScreen' component={ResultAccountsScreen} />
                            <Stack.Screen name='Search' component={SearchScreen} options={{ animation: 'fade_from_bottom' }} />
                        </Stack.Group>
                        :
                        <Stack.Group screenOptions={{ headerShown: false }} key={"Public"}>
                            <Stack.Screen name='SplashScreen' component={SplashScreen} />
                            <Stack.Screen name='IntroductionScreen' component={IntroductionScreen} />
                            <Stack.Screen name='LogInScreen' component={LogInScreen} />
                        </Stack.Group>
                }
                <Stack.Group screenOptions={{ presentation: 'transparentModal' }}>
                    <Stack.Screen name="Modal" options={{ headerShown: false, animation: 'fade_from_bottom' }} component={Modal} />
                    <Stack.Screen name="TCAP" options={{ headerShown: false, }} component={TCAPScreen} />
                </Stack.Group>
            </Stack.Navigator>
        </>
    )
}
