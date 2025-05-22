import { useSearchParams } from 'react-router-dom';

export type QueryParams = Record<string, string>;

export function useBrowserQuery<T extends QueryParams>() {
    const [searchParams] = useSearchParams();

    const searchParamsObj: Record<string, string> = {};
    for (const entry of searchParams.entries()) {
        const [param, value] = entry;
        searchParamsObj[param] = value;
    }

    return searchParamsObj as T;
}