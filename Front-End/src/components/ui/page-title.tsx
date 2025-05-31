import { cn } from '@/lib/utils';
import React from 'react';

interface PageTitleProps {
    className?: string;
    children: React.ReactNode;
}

export const PageTitle: React.FC<PageTitleProps> = (props) => {
    return (
        <p className={cn('text-4xl font-semibold font-primary', props.className)}>
            {props.children}
        </p>
    );
};