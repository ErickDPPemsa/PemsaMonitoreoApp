import React, { useContext, useEffect } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Row } from './Row';
import { stylesApp } from '../../App';
import { TableProvider, TableContext } from '../../context/TableContext';
import { Key } from '../../interfaces/interfaces';
import { HandleContext } from '../../context/HandleContext';
import { useAppSelector } from '../../app/hooks';
import Color from 'color';
import Text from '../Text';


type Props<T> = {
    Header?: {
        title?: string;
        subtitle?: string;
    }
    isShowHeader?: boolean;
    Data: Array<T>;
    titles: Array<Key<T>>;
    fontSize: number;
    scrollRefHeader?: React.RefObject<ScrollView>;
    pagination?: {
        iconBackgroundColor: string;
    };
    isDataObject?: boolean;
    showIndices?: boolean;
    colorBackgroundTable?: string;
}

const TableState = ({ children }: any) => {
    return (
        <TableProvider>
            {children}
        </TableProvider>
    )
}

const RenderTable = <T extends Object>({ Header, Data, titles, fontSize, scrollRefHeader, pagination, isDataObject, isShowHeader = true, showIndices, colorBackgroundTable }: Props<T>) => {
    // const [events, setEvents] = useState<Array<any>>();
    // const [filter, setfilter] = useState<Array<any>>();
    // const numberOfItemsPerPageList = [15, 25, 35, 50];
    // const [page, setPage] = useState(0);
    // const [numberOfItemsPerPage, setdNumberOfItemsPerPage] = useState(numberOfItemsPerPageList[0]);
    const { data, updateData } = useContext(TableContext);
    // const { screenWidth } = useContext(HandleContext);
    const { theme: { colors, roundness } } = useAppSelector(state => state.app);

    useEffect(() => {
        const data = Data.map((events, idx) => {
            let arr = titles.map(el => (Array.isArray(el.key)) ? el.key.map(k => events[k]).join(' ').toString() : String(events[el.key]));
            return arr;
        });
        updateData(data);
        // setEvents(data);
        // setfilter(data);
        // setfilter(pagination ? data.slice(0, numberOfItemsPerPage) : data);
    }, [Data, titles, pagination]);

    // useEffect(() => {
    //     if (events) {
    //         setfilter(events.slice(0, numberOfItemsPerPage));
    //     }
    // }, [numberOfItemsPerPage]);

    // useEffect(() => {
    //     setPage(0);
    //     console.log('entro');
    // }, []);

    //version erick

    // const _renderPagination = React.useCallback(() => {
    //     if (events && pagination) {
    //         const from = page * numberOfItemsPerPage;
    //         const to = Math.min((page + 1) * numberOfItemsPerPage, events.length);

    //         return (
    //             <View style={[styles.containerPagination]}>
    //                 <View>
    //                     <SimpleSelect
    //                         data={numberOfItemsPerPageList}
    //                         onChange={value => setdNumberOfItemsPerPage(value)}
    //                         value={numberOfItemsPerPage}
    //                         Width={50}
    //                     />
    //                     <Text style={{ fontWeight: 'bold', padding: 3 }}>Filas</Text>
    //                 </View>
    //                 <Text style={{ fontWeight: 'bold', paddingHorizontal: 5 }}>{`${from + 1}-${to} of ${events.length}`}</Text>

    //                 <View style={{ flexDirection: 'row' }}>
    //                     <IconButton icon={'skip-previous-outline'} onPress={() => { }} />
    //                     <IconButton icon={'chevron-left'} onPress={() => {
    //                         setPage(page - 1)
    //                     }} />
    //                     <IconButton icon={'chevron-right'} onPress={() => {
    //                         if (to <= events.length) {
    //                             setPage(page + 1);
    //                         }
    //                     }} />
    //                     <IconButton icon={'skip-next-outline'} onPress={() => { }} />
    //                 </View>
    //             </View>
    //         )
    //     }
    //     return undefined
    // }, [events, pagination, numberOfItemsPerPage, page, numberOfItemsPerPageList]);

    const _renderHeader = React.useCallback(() => {
        if (Header)
            return (
                <View style={{ paddingVertical: 5 }}>
                    {Header.title && <Text variant='labelLarge'>{Header.title}</Text>}
                    {Header.subtitle && <Text variant='labelLarge'>{Header.subtitle}</Text>}
                </View>
            )
        return undefined;
    }, [Header, colors])

    const _renderTH = React.useCallback(() => {
        if (titles && isShowHeader)
            return (
                <Row tamCol={titles.map(s => { return { size: s.size ?? 10, center: s.center } })} styleLabel={{ fontWeight: 'bold', textTransform: 'uppercase', color: colors.text }} fontSize={fontSize + 2} data={titles.map(r => r.label)} />
            )
        return undefined;
    }, [titles, isShowHeader, colors]);

    const _renderBody = React.useCallback(() => {
        if (data)
            if (data.length === 0) return <Text style={{ textAlign: 'center', width: 100 }}>Sin Eventos</Text>;
            else
                return (
                    data.map((ev, idx) =>
                        <Row
                            key={idx + ev.toString()}
                            tamCol={titles.map(s => { return { size: s.size ?? 10, center: s.center } })}
                            style={{
                                borderBottomColor: Color(colors.text).fade(.9).toString(), borderBottomWidth: 1
                            }}
                            styleLabel={{ color: colors.text }}
                            fontSize={fontSize}
                            data={ev} />
                    )
                )
        return <Text style={{ textAlign: 'center', width: 100, color: colors.text }}>Sin Eventos</Text>;
    }, [data, colors, Color])

    return (
        <View style={[styles.container, {
            backgroundColor: colorBackgroundTable ?? colors.background,
            borderRadius: roundness * 2,
            padding: 5
        }]}>
            {_renderHeader()}
            <ScrollView horizontal={true}
                onScroll={({ nativeEvent }) => { scrollRefHeader?.current?.scrollTo({ x: nativeEvent.contentOffset.x, y: nativeEvent.contentOffset.y, animated: true }); }}
            >
                <View>
                    {_renderTH()}
                    <ScrollView >
                        {_renderBody()}
                    </ScrollView>
                </View>
            </ScrollView>
            {/* {_renderPagination()} */}
        </View>
    )
}

const Table = <T extends Object>(props: Props<T>) => {
    return (
        <TableState>
            <RenderTable {...props} />
        </TableState>
    )
}

export default Table;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        marginVertical: 5,
        ...stylesApp.shadow
    },
    textTitlesHeader: {
        paddingHorizontal: 5,
        fontWeight: 'bold'
    },
    containerPagination: {
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
        flexWrap: 'wrap'
    }
});