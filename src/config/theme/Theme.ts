import { DarkTheme as NavigationDarkTheme, DefaultTheme as NavigationDefaultTheme, Theme } from '@react-navigation/native';
import { ThemeBase } from '../../types/types';
import { typescale } from '../typescale';
import Color from 'color';

const whiteTheme: ThemeBase = {
  dark: false,
  roundness: 4,
  fonts: typescale,
  colors: {
    primary: "rgb(43, 92, 176)",
    onPrimary: "rgb(255, 255, 255)",
    primaryContainer: "rgb(216, 226, 255)",
    onPrimaryContainer: "rgb(0, 26, 67)",
    secondary: "rgb(87, 94, 113)",
    onSecondary: "rgb(255, 255, 255)",
    secondaryContainer: "rgb(219, 226, 249)",
    onSecondaryContainer: "rgb(20, 27, 44)",
    tertiary: "rgb(113, 85, 115)",
    onTertiary: "rgb(255, 255, 255)",
    tertiaryContainer: "rgb(252, 215, 251)",
    onTertiaryContainer: "rgb(42, 19, 45)",
    error: "rgb(186, 26, 26)",
    onError: "rgb(255, 255, 255)",
    errorContainer: "rgb(255, 218, 214)",
    onErrorContainer: "rgb(65, 0, 2)",
    background: "rgb(254, 251, 255)",
    onBackground: "rgb(27, 27, 31)",
    surface: "rgb(254, 251, 255)",
    onSurface: "rgb(27, 27, 31)",//component Text
    surfaceVariant: "rgb(225, 226, 236)",
    onSurfaceVariant: "rgb(68, 71, 79)",
    outline: "rgb(117, 119, 128)",
    outlineVariant: "rgb(197, 198, 208)",
    shadow: "rgb(0, 0, 0)",
    scrim: "rgb(0, 0, 0)",
    inverseSurface: "rgb(48, 48, 52)",
    inverseOnSurface: "rgb(242, 240, 244)",
    inversePrimary: "rgb(174, 198, 255)",
    surfaceDisabled: "rgba(27, 27, 31, 0.12)",
    onSurfaceDisabled: "rgba(27, 27, 31, 0.38)",
    backdrop: "rgba(46, 48, 56, 0.2)",
    info: '#3fc3ee',
    danger: '#ff7782',
    warning: '#dfd32b',
    success: '#3acf9e',
    question: '#87adbd',
    test: '#2bcadf',
    other: '#977220'
  }
};

const darkTheme: ThemeBase = {
  dark: true,
  roundness: 4,
  fonts: typescale,
  colors: {
    primary: "rgb(174, 198, 255)",
    onPrimary: "rgb(0, 46, 107)",
    primaryContainer: "rgb(0, 67, 151)",
    onPrimaryContainer: "rgb(216, 226, 255)",
    secondary: "rgb(191, 198, 220)",
    onSecondary: "rgb(41, 48, 65)",
    secondaryContainer: "rgb(63, 71, 89)",
    onSecondaryContainer: "rgb(219, 226, 249)",
    tertiary: "rgb(223, 187, 222)",
    onTertiary: "rgb(64, 40, 67)",
    tertiaryContainer: "rgb(88, 62, 90)",
    onTertiaryContainer: "rgb(252, 215, 251)",
    error: "rgb(255, 180, 171)",
    onError: "rgb(105, 0, 5)",
    errorContainer: "rgb(147, 0, 10)",
    onErrorContainer: "rgb(255, 180, 171)",
    background: "rgb(25, 25, 35)",
    onBackground: "rgb(227, 226, 230)",
    surface: "rgb(27, 27, 31)",
    onSurface: "rgb(227, 226, 230)",
    surfaceVariant: "rgb(68, 71, 79)",
    onSurfaceVariant: "rgb(197, 198, 208)",
    outline: "rgb(142, 144, 153)",
    outlineVariant: "rgb(68, 71, 79)",
    shadow: "rgb(0, 0, 0)",
    scrim: "rgb(0, 0, 0)",
    inverseSurface: "rgb(227, 226, 230)",
    inverseOnSurface: "rgb(48, 48, 52)",
    inversePrimary: "rgb(43, 92, 176)",
    surfaceDisabled: "rgba(227, 226, 230, 0.12)",
    onSurfaceDisabled: "rgba(227, 226, 230, 0.38)",
    backdrop: "rgba(46, 48, 60, 0.4)",
    info: '#3fc3ee',
    danger: '#ff7782',
    warning: '#dfd32b',
    success: '#3acf9e',
    question: '#87adbd',
    test: '#2bcadf',
    other: '#977220'
  }
};

const CombinedLightTheme: ThemeBase & Theme = {
  ...NavigationDefaultTheme,
  ...whiteTheme,
  colors: {
    ...NavigationDefaultTheme.colors,
    ...whiteTheme.colors,
    card: whiteTheme.colors.background,
    text: whiteTheme.colors.onSurface,
    border: whiteTheme.colors.outline,
    info: Color(whiteTheme.colors.info).darken(.3).toString(),
    danger: Color(whiteTheme.colors.danger).darken(.3).toString(),
    warning: Color(whiteTheme.colors.warning).darken(.3).toString(),
    success: Color(whiteTheme.colors.success).darken(.3).toString(),
    question: Color(whiteTheme.colors.question).darken(.3).toString(),
    test: Color(whiteTheme.colors.test).darken(.3).toString(),
    // notification: 'steelblue',
  },
};

const CombinedDarkTheme: ThemeBase & Theme = {
  ...NavigationDarkTheme,
  ...darkTheme,
  colors: {
    ...NavigationDarkTheme.colors,
    ...darkTheme.colors,
    card: darkTheme.colors.background,
    text: darkTheme.colors.onSurface,
    border: darkTheme.colors.outline,
    // notification: 'steelblue',
  },
};

export { CombinedDarkTheme, CombinedLightTheme };