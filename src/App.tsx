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
import Toast, { BaseToastProps } from 'react-native-toast-message';
import Color from 'color';
import Text from './components/Text';
import { setOrientation } from './features/appSlice';

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
                <QueryClientProvider client={queryClient}>
                    <HandleState>
                        <Root />
                    </HandleState>
                </QueryClientProvider>
            </StoreProvider>
        </SafeAreaProvider >
    )
}

export const Root = () => {
    const { theme } = useAppSelector((state) => state.app);
    const dispatch = useAppDispatch();
    return (
        <NavigationContainer theme={theme} ref={navigationRef}>
            <OrientationLocker
                orientation='UNLOCK'
                onChange={resp => resp.includes('PORTRAIT') ? dispatch(setOrientation(Orientation.portrait)) : dispatch(setOrientation(Orientation.landscape))}
            />
            <StackScreens />
            <Toast config={toastConfig} position='bottom' />
        </NavigationContainer>
    )
}

export const toastConfig = {
    success: ({ text1, text2 }: BaseToastProps) => {
        const { colors, dark, roundness } = useAppSelector(state => state.app.theme);
        return (
            <View style={[
                stylesApp.shadow,
                {
                    borderLeftWidth: 5,
                    borderLeftColor: colors.success,
                    backgroundColor: dark ? Color(colors.background).darken(.4).toString() : colors.background,
                    shadowColor: colors.success,
                    elevation: 2,
                    padding: 10,
                    paddingVertical: 15,
                    width: '90%',
                    borderRadius: roundness * 2,
                }
            ]}>
                {text1 && <Text variant='bodyLarge' style={[{ fontWeight: 'bold' }]}>{text1}</Text>}
                {text2 && <Text variant='bodyMedium' >{text2}</Text>}
            </View>
        )
    },
    error: ({ text1, text2 }: BaseToastProps) => {
        const { colors, dark, roundness } = useAppSelector(state => state.app.theme);
        return (
            <View style={[
                stylesApp.shadow,
                {
                    borderLeftWidth: 5,
                    borderLeftColor: colors.danger,
                    backgroundColor: dark ? Color(colors.background).darken(.4).toString() : colors.background,
                    shadowColor: colors.danger,
                    elevation: 2,
                    padding: 10,
                    paddingVertical: 15,
                    width: '90%',
                    borderRadius: roundness * 2,
                }
            ]}>
                {text1 && <Text variant='bodyLarge' style={[{ fontWeight: 'bold' }]}>{text1}</Text>}
                {text2 && <Text variant='bodyMedium' >{text2}</Text>}
            </View>
        )
    },
    info: ({ text1, text2 }: BaseToastProps) => {
        const { colors, dark, roundness } = useAppSelector(state => state.app.theme);
        return (
            <View style={[
                stylesApp.shadow,
                {
                    borderLeftWidth: 5,
                    borderLeftColor: colors.info,
                    backgroundColor: dark ? Color(colors.background).darken(.4).toString() : colors.background,
                    shadowColor: colors.info,
                    elevation: 2,
                    padding: 10,
                    paddingVertical: 15,
                    width: '90%',
                    borderRadius: roundness * 2,
                }
            ]}>
                {text1 && <Text variant='bodyLarge' style={[{ fontWeight: 'bold' }]}>{text1}</Text>}
                {text2 && <Text variant='bodyMedium' >{text2}</Text>}
            </View>
        )
    }
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