import React from 'react';
import { WavePageInfo } from '@/types/wavePageInfo';
import { PaginationTools } from '@/components/ui/data-table/data-table-pagination';

interface InvoicesPaginationProps {
    pageInfo?: WavePageInfo;
    currentPageSize: number;
    handlePageChange: (pageNum: number) => void;
    handlePageSizeChange: (pageSize: number) => void;
}

export const InvoicesPagination: React.FC<InvoicesPaginationProps> = (props) => {
    const pageInfo = props.pageInfo;

    if (!pageInfo) {
        return null;
    }

    return (
        <PaginationTools
            curPageSize={props.currentPageSize}
            onPageSizeChange={props.handlePageSizeChange}
            onPageChange={props.handlePageChange}
            curPage={pageInfo.currentPage}
            pageCount={pageInfo.totalPages}
        />
    );
};