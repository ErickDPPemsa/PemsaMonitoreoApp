import React, { useEffect, useState } from 'react'

export const useDebouncedValue = (input: string = '', time: number = 500) => {
    const [debounceValue, setDebounceValue] = useState<string>(input);

    useEffect(() => {
        const timeout = setTimeout(() => {
            setDebounceValue(input);
        }, time);

        return () => {
            clearTimeout(timeout);
        }
    }, [input])


    return debounceValue;
}