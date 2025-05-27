import { ScheduledCustomer } from '@/types/scheduledCustomer';
import { useState } from 'react';

export const useEditScheduledCustomerForm = (scheduledCustomer: ScheduledCustomer) => {
    const [ formParams, setFormParams ] = useState<ScheduledCustomer>({
        scheduledCustomerID: scheduledCustomer.scheduledCustomerID,
        waveCustomerID: scheduledCustomer.waveCustomerID,
        dayOffset: scheduledCustomer.dayOffset,
        startTime: scheduledCustomer.startTime,
        endTime: scheduledCustomer.endTime,
    });

    const setFormParam = <K extends keyof ScheduledCustomer>(key: K, value: ScheduledCustomer[K]) => {
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