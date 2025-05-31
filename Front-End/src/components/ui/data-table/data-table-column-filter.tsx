import { Column } from '@tanstack/react-table';
import { Input } from '../input';
import { cn } from '@/lib/utils';
import { SearchIcon } from 'lucide-react';

interface DatatableColumnFilterProps<TData, TValue> extends React.InputHTMLAttributes<HTMLInputElement> {
    column?: Column<TData, TValue>;
}

export function DataTableColumnFilter<TData, TValue> ({ column, ...props }: DatatableColumnFilterProps<TData, TValue>) {
    return (
        <div className='flex flex-row gap-4'>
            <SearchIcon className='my-auto' />
            <Input
                value={(column?.getFilterValue() as string) ?? ''}
                onChange={(event) => column?.setFilterValue(event.target.value)}
                type={'search'}
                {...props}
                className={cn('w-full sm:w-[150px] lg:w-[250px]', props.className)}
            />
        </div>
    );
}