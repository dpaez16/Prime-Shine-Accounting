import {
    ArrowDownIcon,
    ArrowUpIcon,
    CaretSortIcon,
} from '@radix-ui/react-icons';
import { Column } from '@tanstack/react-table';
import { cn } from '@/lib/utils';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../dropdown-menu';
import { Button } from '../button';

interface DataTableColumnHeaderProps<TData, TValue>
    extends React.HTMLAttributes<HTMLDivElement> {
    column: Column<TData, TValue>
    title: string
}

export function DataTableColumnHeader<TData, TValue>({
    column,
    title,
    className,
}: DataTableColumnHeaderProps<TData, TValue>) {
    if (!column.getCanSort()) {
        return <div className={cn('', className)}>{title}</div>;
    }

    let sortIcon;
    if (column.getIsSorted() === 'desc') {
        sortIcon = <ArrowDownIcon className="ml-2 h-4 w-4" />;
    } else if (column.getIsSorted() === 'asc') {
        sortIcon = <ArrowUpIcon className="ml-2 h-4 w-4" />;
    } else {
        sortIcon = <CaretSortIcon className="ml-2 h-4 w-4" />;
    }

    return (
        <div className={cn('flex items-center space-x-2', className)}>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="ghost"
                        size="sm"
                    >
                        <span>{title}</span>
                        {sortIcon}
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                    <DropdownMenuItem onClick={() => column.toggleSorting(false, column.getCanMultiSort())}>
                        <ArrowUpIcon className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
                        Asc
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => column.toggleSorting(true, column.getCanMultiSort())}>
                        <ArrowDownIcon className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
                        Desc
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => column.clearSorting()}>
                    <CaretSortIcon className="mr-2 h-3.5 w-3.5" />
                        Reset
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}
