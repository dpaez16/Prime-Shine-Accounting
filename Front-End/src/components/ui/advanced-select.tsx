import React, { useEffect, useRef, useState } from 'react';

import { Button } from './button';
import { Input } from './input';
import { Popover, PopoverContent, PopoverTrigger } from './popover';
import { Separator } from './separator';
import { Check, ChevronDown, SearchIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Spinner } from './spinner';


interface AdvancedSelectProps {
    text?: string;
    placeholder?: string;
    clearSelection: () => void;
    filterText: string;
    setFilterText: (text: string) => void;
    children?: React.ReactNode;
    disabled?: boolean;
    isClearable?: boolean;
    loading?: boolean;
}

export const AdvancedSelect: React.FC<AdvancedSelectProps> = ({
    text,
    placeholder,
    clearSelection,
    filterText,
    setFilterText,
    children,
    isClearable,
    ...props
}) => {

    const ref = useRef<HTMLDivElement>(null);
    const triggerRef = useRef<HTMLButtonElement>(null);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                ref.current &&
                !ref.current.contains(event.target as Node) &&
                triggerRef.current &&
                !triggerRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [ref]);

    const disabled = (props.disabled || props.loading);
    const displayText = text ? <p>{text}</p> : <p className='text-muted-foreground'>{placeholder ?? ''}</p>;

    return <Popover
        open={isOpen}
        modal={true}
    >
        <PopoverTrigger
            onClick={() => {
                if (!disabled) {
                    setIsOpen(!isOpen);
                }
            }}
            ref={triggerRef}
        >
            <div className={
                cn(
                    'w-full border-2 border-border p-1.5 rounded-md flex items-center justify-between bg-background gap-2',
                    !disabled && 'hover:bg-accent hover:text-accent-foreground',
                    disabled && 'bg-muted cursor-not-allowed',
                )
            }>
                {props.loading ? <Spinner /> : displayText}
                <ChevronDown size={20} />
            </div>
        </PopoverTrigger>
        <PopoverContent
            ref={ref}
            align='start'
            className='w-full min-w-[300px] p-0'
        >
            <div className='text-sm w-full p-2 pb-2 flex flex-row items-center border-b-2'>
                <SearchIcon className='mr-2' size={18} />
                <Input
                    className='border-none w-full'
                    value={filterText}
                    onChange={(e) => setFilterText(e.target.value)}
                />
            </div>
            <div className='w-full flex flex-col overflow-y-auto max-h-[275px] px-1'>
                {
                    (children as React.ReactNode[]).map((child) => {
                        return <div
                            onClick={() => setIsOpen(false)}
                        >
                            {child}
                        </div>;
                    })
                }
            </div>
            {
                isClearable &&
                <>
                    <Separator orientation='horizontal' className='mt-2' />
                    <Button
                        variant='ghost'
                        className='w-full'
                        onClick={() => {
                            clearSelection();
                            setIsOpen(false);
                        }}
                    >
                        Clear Selection
                    </Button>
                </>
            }
        </PopoverContent>
    </Popover>;
};

export const renderSingleSelectOption = (
    key: string | number,
    label: string,
    isSelected: boolean,
    onClick: () => void,
) => {
    return (
        <div key={key} className='w-full'>
            <Button
                className='w-full justify-start'
                variant='ghost'
                onClick={onClick}
            >
                {isSelected && <Check className='h-4 w-4' />}
                {label}
            </Button>
        </div>
    );
};