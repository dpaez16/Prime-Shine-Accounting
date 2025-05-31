import React from 'react';
import { Skeleton } from './skeleton';
import { cn } from '@/lib/utils';
import { Spinner } from './spinner';

type LoadingSegmentProps = {
    className?: string;
};

export const LoadingSegment: React.FC<LoadingSegmentProps> = (props) => {
    return (
        <div className={cn('flex flex-col gap-4', props.className)}>
            <Skeleton />
            <div className='flex flex-row gap-4 justify-between'>
                <Skeleton className='w-full' />
                <div>
                    <Spinner />
                </div>
                <Skeleton className='w-full' />
            </div>
            <Skeleton />
        </div>
    );
};
