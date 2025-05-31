import { ColumnDef, RowData } from "@tanstack/react-table";
import { DataTableColumnHeader } from "./data-table-column-header";
import { Button } from "../button";

export const clickableTableItemStyle = 'whitespace-break-spaces font-medium text-left px-2 p-1.5 hover:bg-accent hover:cursor-pointer rounded-sm';

interface ColumnProps {
    id: string;
    accessorKey: string;
    columnHeader: string;
    enableSorting?: boolean;
}

interface TextColumnProps<T extends RowData> extends ColumnProps {
    textFormatterFunc?: (text: string) => string;
    onClick?: (entry: T) => void;
}

export function generateGenericTextColumn<T extends RowData>(data: TextColumnProps<T>): ColumnDef<T> {
    const formatterFunc = data.textFormatterFunc ? data.textFormatterFunc : (text: string) => text;

    const column: ColumnDef<T> = {
        id: data.id,
        accessorKey: data.accessorKey,
        enableSorting: data.enableSorting,
        header: ({ column }) => {
            return (
                <DataTableColumnHeader column={column} title={data.columnHeader} />
            );
        },
        meta: {
            label: data.columnHeader,
        },
        cell: ({ cell }) => {
            if (data.onClick !== undefined) {
                return (
                    <Button
                        variant='ghost'
                        onClick={() => data.onClick!(cell.row.original as T)}
                        className={clickableTableItemStyle}
                    >
                        {formatterFunc(cell.getValue<string>())}
                    </Button>
                );
            }

            return <p className='text-primary'>{formatterFunc(cell.getValue<string>())}</p>;
        }
    };

    return column;
}

interface NumericColumnProps<T extends RowData> extends ColumnProps {
    numberFormatterFunc?: (num: number | null) => string;
    onClick?: (entry: T) => void;
}

export function generateGenericNumericColumn<T extends RowData>(data: NumericColumnProps<T>): ColumnDef<T> {
    const formatterFunc = data.numberFormatterFunc ? data.numberFormatterFunc : (num: number) => num.toString();

    const column: ColumnDef<T> = {
        id: data.id,
        accessorKey: data.accessorKey,
        enableSorting: data.enableSorting,
        header: ({ column }) => {
            return (
                <DataTableColumnHeader column={column} title={data.columnHeader} />
            );
        },
        meta: {
            label: data.columnHeader,
        },
        cell: ({ cell }) => {
            if (data.onClick !== undefined) {
                return (
                    <Button
                        variant='ghost'
                        onClick={() => data.onClick!(cell.row.original as T)}
                        className={clickableTableItemStyle}
                    >
                        {formatterFunc(cell.getValue<number>())}
                    </Button>
                );
            }

            return <p className='text-primary'>{formatterFunc(cell.getValue<number>())}</p>;
        }
    };

    return column;
}

interface DateColumnProps<T extends RowData> extends ColumnProps {
    dateFormatterFunc: (date: Date | null) => string;
    onClick?: (entry: T) => void;
}

export function generateGenericDateColumn<T extends RowData>(data: DateColumnProps<T>): ColumnDef<T> {
    const column: ColumnDef<T> = {
        id: data.id,
        accessorKey: data.accessorKey,
        enableSorting: data.enableSorting,
        header: ({ column }) => {
            return (
                <DataTableColumnHeader column={column} title={data.columnHeader} />
            );
        },
        meta: {
            label: data.columnHeader,
        },
        cell: ({ cell }) => {
            if (data.onClick !== undefined) {
                return (
                    <Button
                        variant='ghost'
                        onClick={() => data.onClick!(cell.row.original as T)}
                        className={clickableTableItemStyle}
                    >
                        {data.dateFormatterFunc(cell.getValue<Date>())}
                    </Button>
                );
            }

            return <p className='text-primary'>{data.dateFormatterFunc(cell.getValue<Date>())}</p>;
        },
    };

    return column;
}
