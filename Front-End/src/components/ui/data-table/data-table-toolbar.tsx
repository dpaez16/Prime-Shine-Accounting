import React from 'react';
import { DataTableToolbarProps } from './data-table';

interface DataTableToolbarComponentProps<TData> extends DataTableToolbarProps<TData> {
    children: React.ReactNode;
}

export const DataTableToolbar = <TData,>(props: DataTableToolbarComponentProps<TData>) => {
      return (
            <div className="flex flex-col md:flex-row items-center md:justify-between my-4">
                  <div className="flex flex-1 flex-wrap items-center gap-2">
                        {props.children}
                  </div>
            </div>
      );
};
