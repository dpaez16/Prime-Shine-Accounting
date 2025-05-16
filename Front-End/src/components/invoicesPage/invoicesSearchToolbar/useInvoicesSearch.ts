import { useState } from 'react';
import { WaveInvoiceFilterKey, WaveInvoiceFilterObj } from '@/api/waveApiClient';

export const useInvoicesSearch = () => {
    const [filterParameters, setFilterParameters] = useState<WaveInvoiceFilterObj>({} as WaveInvoiceFilterObj);
    const [pageNum, setPageNum] = useState<number>(1);

    const handleFilterChange = (key: WaveInvoiceFilterKey, value: string | null) => {
        const filterValue = value && value.length > 0 ? value : null;
        const newFilterParameters = {
            ...filterParameters,
            [key]: filterValue,
        };

        setFilterParameters(newFilterParameters);
    };

    return {
        filterParameters,
        handleFilterChange,
        pageNum,
        setPageNum,
    };
};
