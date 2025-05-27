import { ScheduledCustomerCreateInput } from '@/types/scheduledCustomer';
import { useState } from 'react';

export const useCreateScheduledCustomerForm = () => {
    const [ formParams, setFormParams ] = useState<ScheduledCustomerCreateInput>({
        waveCustomerID: '',
        dayOffset: 0,
        startTime: '',
        endTime: '',
    });

    const setFormParam = <K extends keyof ScheduledCustomerCreateInput>(key: K, value: ScheduledCustomerCreateInput[K]) => {
        setFormParams({
            ...formParams,
            [key]: value,
        });
    };

    const datesValid = () => {
        if (!formParams.startTime || !formParams.endTime) {
            return false;
        }

        const start = new Date(formParams.startTime);
        const end = new Date(formParams.endTime);

        return start.getTime() <= end.getTime();
    };

    const formValid = (
        !!formParams.waveCustomerID &&
        datesValid()
    );

    return {
        formParams,
        setFormParam,
        formValid,
    };
};