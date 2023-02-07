import { useQuery } from '@tanstack/react-query';


export function useUsers({ key }: { key: string; }) {
    return useQuery(['Events', key], () => { });
}