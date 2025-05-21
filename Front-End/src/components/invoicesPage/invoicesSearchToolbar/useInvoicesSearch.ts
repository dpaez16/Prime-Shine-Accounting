import { useRef, useState } from 'react';
import { DEFAULT_PAGE_SIZE } from '../invoicesPagination';
import { WaveCustomerID } from '@/types/waveCustomer';

export type WaveInvoiceFilterObj = {
    customerId: WaveCustomerID | null,
    invoiceDateStart: string  | null,
    invoiceDateEnd: string  | null,
    invoiceNumber: string | null,
    page: number,
    pageSize: number,
};

export type WaveInvoiceFilterKey = keyof WaveInvoiceFilterObj;

export const useInvoicesSearch = () => {
    const [filterParameters, setFilterParameters] = useState<WaveInvoiceFilterObj>({} as WaveInvoiceFilterObj);
    const pageNumRef = useRef<number>(1);
    const pageSizeRef = useRef<number>(DEFAULT_PAGE_SIZE);

    const handleFilterChange = <K extends WaveInvoiceFilterKey>(key: K, value: WaveInvoiceFilterObj[K]) => {
        let filterValue: string | number | null = null;

        if (key === 'page' || key === 'pageSize') {
            // You are meant to use setPageNum/setPageSize
            return;
        }

        if (typeof value === 'string') {
            filterValue = value ? value : filterValue;
        }

        if (typeof value === 'number') {
            filterValue = value !== 0 ? value : filterValue;
        }

        const newFilterParameters = {
            ...filterParameters,
            [key]: filterValue,
        };

        setFilterParameters(newFilterParameters);
    };

    const setPageNum = (newPageNum: number) => {
        pageNumRef.current = newPageNum;
    };

    const setPageSize = (newPageSize: number) => {
        pageSizeRef.current = newPageSize;
    };

    return {
        filterParameters,
        handleFilterChange,
        pageNumRef,
        setPageNum,
        pageSizeRef,
        setPageSize,
    };
};
