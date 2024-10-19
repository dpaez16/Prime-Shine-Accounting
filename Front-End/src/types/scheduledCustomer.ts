import { WaveCustomer } from './waveCustomer';

export type ScheduledCustomer = {
  _id: string;
  customerId: string;
  serviceStartTime: string;
  serviceEndTime: string;
  scheduleDay: string;
  metadata: WaveCustomer;
};
