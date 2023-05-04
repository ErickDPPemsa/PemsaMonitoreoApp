import 'react-native-gesture-handler';
import React from 'react';
import { Provider as StoreProvider } from "react-redux";
import { store } from './app/store';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createNavigationContainerRef, NavigationContainer } from '@react-navigation/native';
import { HandleProvider } from './context/HandleContext';
import { useAppDispatch, useAppSelector } from './app/hooks';
import { SafeAreaProvider, initialWindowMetrics } from 'react-native-safe-area-context';
import { StackScreens } from './navigation/Stack';
import { StyleSheet, View } from 'react-native';
import { OrientationLocker } from 'react-native-orientation-locker';
import { Orientation } from './interfaces/interfaces';
import Color from 'color';
import Text from './components/Text';
import { setOrientation } from './features/appSlice';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AlertProvider } from './components/Alert/AlertContext';
import PortalHost from './components/Portal/PortalContext';

export const navigationRef = createNavigationContainerRef();


export const App = () => {
    const queryClient = new QueryClient();
    const HandleState = ({ children }: any) => {
        return (
            <HandleProvider>
                {children}
            </HandleProvider>
        )
    }

    return (
        <SafeAreaProvider initialMetrics={initialWindowMetrics}>
            <StoreProvider store={store}>
                <PortalHost>
                    <AlertProvider>
                        <QueryClientProvider client={queryClient}>
                            <HandleState>
                                <Root />
                            </HandleState>
                        </QueryClientProvider>
                    </AlertProvider>
                </PortalHost>
            </StoreProvider>
        </SafeAreaProvider >
    )
}

export const Root = () => {
    const { theme } = useAppSelector((state) => state.app);
    const dispatch = useAppDispatch();
    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <NavigationContainer theme={theme} ref={navigationRef}>
                <OrientationLocker
                    orientation='UNLOCK'
                    onChange={resp => resp.includes('PORTRAIT') ? dispatch(setOrientation(Orientation.portrait)) : dispatch(setOrientation(Orientation.landscape))}
                />
                <StackScreens />
            </NavigationContainer>
        </GestureHandlerRootView>
    )
}

export const stylesApp = StyleSheet.create({
    shadow: {
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 0,
        },
        shadowOpacity: 0.20,
        shadowRadius: 3,
        elevation: 3,
    }
});