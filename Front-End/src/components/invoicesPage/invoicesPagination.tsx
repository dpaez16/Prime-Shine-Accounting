import React from 'react';
import useLocalization from '@/hooks/useLocalization';
import { WavePageInfo } from '@/types/wavePageInfo';
import { Dropdown, DropdownProps, Pagination, PaginationProps } from 'semantic-ui-react';

interface InvoicesPaginationProps {
    pageInfo?: WavePageInfo;
    currentPageSize: number;
    handlePageChange: (pageNum: number) => void;
    handlePageSizeChange: (pageSize: number) => void;
}

const PAGE_SIZE_VALUES = [
    50,
    40,
    30,
    20,
    10,
];

export const DEFAULT_PAGE_SIZE = PAGE_SIZE_VALUES[0] ?? 50;

export const InvoicesPagination: React.FC<InvoicesPaginationProps> = (props) => {
    const { t } = useLocalization();
    const pageInfo = props.pageInfo;

    if (!pageInfo) {
        return null;
    }

    const handlePageChange = (
        _: React.MouseEvent<HTMLAnchorElement>,
        data: PaginationProps,
    ) => {
        const value = parseInt(data.activePage as string);
        props.handlePageChange(value);
    };

    const handlePageSizeChange = (
        _: React.SyntheticEvent<HTMLElement>,
        data: DropdownProps,
    ) => {
        const value = parseInt(data.value as string);
        props.handlePageSizeChange(value);
    };

    const pageSizeOptions = PAGE_SIZE_VALUES.map(pageSize => {
        return {
            key: pageSize.toString(),
            value: pageSize.toString(),
            text: pageSize.toString(),
        };
    });

    return (
        <div className='flex flex-row items-center gap-4 justify-end'>
            <span>{t('Results per page')}:</span>
            <Dropdown
                selection
                value={props.currentPageSize.toString()}
                options={pageSizeOptions}
                onChange={handlePageSizeChange}
            />
            <Pagination
                boundaryRange={0}
                activePage={pageInfo.currentPage}
                siblingRange={1}
                totalPages={pageInfo.totalPages}
                onPageChange={handlePageChange}
            />
        </div>
    );
};