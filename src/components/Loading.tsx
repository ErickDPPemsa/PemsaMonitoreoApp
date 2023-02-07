import Color from 'color';
import React, { useContext } from 'react';
import { ActivityIndicator, Platform, StyleSheet, View } from 'react-native';
import { useAppSelector } from '../app/hooks';
import Text from './Text';
// import ContentLoader, { Rect, Circle, Path } from "react-content-loader/native"
import { stylesApp } from '../App';
import { HandleContext } from '../context/HandleContext';

export const Loading = ({ loading, refresh, right }: { loading?: boolean, refresh?: boolean, right?: number }) => {
    const { theme: { colors, roundness, dark }, insets } = useAppSelector(state => state.app);
    // console.log(top - bottom);

    dark ? Color(colors.background).darken(.4).toString() : colors.background
    return (
        loading ?
            <View collapsable style={[
                { backgroundColor: colors.background, position: 'absolute', zIndex: 10, top: 0, justifyContent: 'center', alignItems: 'center' },
                loading && { width: '100%', height: '100%' }
            ]}>
                {/* <ContentLoader
                    viewBox="0 0 265 230"
                    backgroundColor={dark ? Color(colors.background).darken(.8).toString() : "#f3f3f3"}
                    foregroundColor={dark ? Color(colors.background).lighten(.2).toString() : "#ecebeb"}
                >
                    <Rect x="15" y="15" rx="4" ry="4" width="200" height="25" />
                    <Rect x="15" y="50" rx="2" ry="2" width="40" height="15" />
                    <Rect x="75" y="45" rx="16" ry="16" width="55" height="22" />
                    <Rect x="15" y="75" rx="3" ry="3" width="215" height="15" />
                    <Rect x="15" y="105" rx="3" ry="3" width="50" height="15" />
                    <Rect x="75" y="105" rx="3" ry="3" width="50" height="15" />
                    <Rect x="135" y="105" rx="3" ry="3" width="50" height="15" />
                    <Rect x="15" y="135" rx="16" ry="16" width="55" height="22" />
                    <Rect x="15" y="165" rx="2" ry="2" width="150" height="50" />
                </ContentLoader> */}
                <Text>Cargando ...</Text>
            </View>
            :
            refresh
                ?
                <View style={[
                    {
                        alignSelf: 'center',
                        backgroundColor: dark ? Color(colors.background).darken(.4).toString() : colors.background,
                        position: 'absolute',
                        zIndex: 100,
                        top: (insets && Platform.OS === 'ios') ? insets.top : 8,
                        padding: 7,
                        right,
                        borderRadius: 100
                    },
                    stylesApp.shadow, { shadowColor: colors.primary, elevation: 5 }
                ]}>
                    <ActivityIndicator color={colors.primary} size={25} />
                </View>
                :
                null
    )
}
const styles = StyleSheet.create({
    centeredView: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    modalView: {
        padding: 10,
        alignItems: "center",
        justifyContent: 'center',
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5
    },
});