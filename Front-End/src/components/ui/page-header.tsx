import { cn } from '@/lib/utils';
import React from 'react';

interface PageHeaderProps {
    className?: string;
    children: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = (props) => {
    return (
        <p className={cn('text-2xl font-semibold font-primary', props.className)}>
            {props.children}
        </p>
    );
};