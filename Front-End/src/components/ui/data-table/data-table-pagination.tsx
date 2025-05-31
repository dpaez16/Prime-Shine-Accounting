import { DataTableSubComponentProps } from './data-table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../select';
import { Button } from '../button';
import { ChevronLeftIcon, ChevronRightIcon, DoubleArrowLeftIcon, DoubleArrowRightIcon } from '@radix-ui/react-icons';

const PAGE_SIZES = [
    10,
    20,
    30,
    40,
    50,
];

export function DataTablePagination<TData>({ table }: DataTableSubComponentProps<TData>) {
    return <PaginationTools
        curPageSize={table.getState().pagination.pageSize}
        onPageSizeChange={(pageSize) => table.setPageSize(pageSize)}
        curPage={table.getState().pagination.pageIndex + 1}
        pageCount={table.getPageCount()}
        onPageChange={(pageIndex) => table.setPageIndex(pageIndex)}
        nextPage={() => table.nextPage()}
        prevPage={() => table.previousPage()}
        lastPage={() => table.setPageIndex(table.getPageCount() - 1)}
        firstPage={() => table.setPageIndex(0)}
        canGetNextPage={() => table.getCanNextPage()}
        canGetPreviousPage={() => table.getCanPreviousPage()}
    />;
}

interface PaginationToolsProps {
    curPageSize: number;
    onPageSizeChange: (pageSize: number) => void;
    curPage: number;
    pageCount: number;
    onPageChange: (pageIndex: number) => void;
    canGetNextPage?: () => boolean,
    nextPage?: () => void;
    canGetPreviousPage?: () => boolean,
    prevPage?: () => void;
    lastPage?: () => void;
    firstPage?: () => void;
}

export function PaginationTools({
    curPageSize,
    onPageSizeChange,
    curPage,
    pageCount,
    onPageChange,
    canGetNextPage = () => {
        return curPage <= pageCount - 1;
    },
    nextPage = () => {
        if (canGetNextPage()) {
            onPageChange(curPage + 1);
        }
    },
    canGetPreviousPage = () => {
        return curPage > 1;
    },
    prevPage = () => {
        if (canGetPreviousPage()) {
            onPageChange(curPage - 1);
        }
    },
    lastPage = () => {
        onPageChange(pageCount);
    },
    firstPage = () => {
        onPageChange(1);
    }
}: PaginationToolsProps) {
    return (
        <div className="flex flex-col xs:items-center px-2 w-full sm:flex-row justify-end">
                <div className="flex items-center space-x-2">
                    <p className="text-sm font-medium">Rows per page</p>
                    <Select
                        value={`${curPageSize}`}
                        onValueChange={(value) => {
                            onPageSizeChange(Number(value));
                        }}
                    >
                        <SelectTrigger className="h-8 w-[70px]">
                            <SelectValue placeholder={curPageSize} />
                        </SelectTrigger>
                        <SelectContent side="top">
                            {PAGE_SIZES.map((pageSize) => (
                                <SelectItem key={pageSize} value={`${pageSize}`}>
                                    {pageSize}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="flex w-[100px] items-center sm:justify-center text-sm font-medium">
                    Page {curPage} of{' '}
                    {pageCount}
                </div>
                <div className="flex items-center my-1 sm:my-0 sm:space-x-2">
                    <Button
                        variant="outline"
                        className="hidden h-8 w-8 p-0 lg:flex"
                        onClick={() => firstPage()}
                        disabled={!canGetPreviousPage()}
                    >
                        <span className="sr-only">Go to first page</span>
                        <DoubleArrowLeftIcon className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="outline"
                        className="h-8 w-8 p-0 mr-2 sm:mr-0 "
                        onClick={() => prevPage()}
                        disabled={!canGetPreviousPage()}
                    >
                        <span className="sr-only">Go to previous page</span>
                        <ChevronLeftIcon className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="outline"
                        className="h-8 w-8 p-0"
                        onClick={() => nextPage()}
                        disabled={!canGetNextPage()}
                    >
                        <span className="sr-only">Go to next page</span>
                        <ChevronRightIcon className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="outline"
                        className="hidden h-8 w-8 p-0 lg:flex"
                        onClick={() => lastPage()}
                        disabled={!canGetNextPage()}
                    >
                        <span className="sr-only">Go to last page</span>
                        <DoubleArrowRightIcon className="h-4 w-4" />
                    </Button>
                </div>
        </div>
    );
}