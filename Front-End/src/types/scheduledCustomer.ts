import { WaveCustomer, WaveCustomerID } from './waveCustomer';

export type ScheduledCustomer = {
    scheduledCustomerID: string;
    waveCustomerID: WaveCustomerID;
    startTime: string;
    endTime: string;
    dayOffset: number;
};

export type FullScheduledCustomer = ScheduledCustomer & { metadata: WaveCustomer };
export type ScheduledCustomerID = ScheduledCustomer['scheduledCustomerID'];

export type ScheduledCustomerCreateInput = Omit<ScheduledCustomer, 'scheduledCustomerID'>;
