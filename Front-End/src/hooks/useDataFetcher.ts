import { useEffect, useState } from 'react';

interface UseDataFetcherProps<T> {
    fetcher: () => Promise<T>;
    deps?: object[];
}

export function useDataFetcher<T>(props: UseDataFetcherProps<T>) {
    const [data, setData] = useState<T | undefined>(undefined);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | undefined>(undefined);

    const refetch = () => {
        setLoading(true);
        setData(undefined);
        setError(undefined);

        props.fetcher()
            .then((resData: T) => setData(resData))
            .catch((err: Error) => setError(err))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        refetch();
    }, props.deps ?? []);

    return {
        data,
        loading,
        error,
        refetch,
    };
};
