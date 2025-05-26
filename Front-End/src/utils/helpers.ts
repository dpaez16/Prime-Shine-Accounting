import { WaveCustomer } from '@/types/waveCustomer';
import { DAYS_OF_WEEK } from './consts';
import { WaveAPIClient } from '@/api/waveApiClient';
import { JWT } from '@/types/userInfo';
import { BusinessID } from '@/types/businessInfo';

export const deleteItemFromArray = function(arr, valObj) {
    const val = valObj._id;
    const idx = arr.findIndex(obj => obj._id === val);
    arr.splice(idx, 1);
    return arr;
};

export const replaceItemFromArray = function(arr, valObj, newObj) {
    const val = valObj._id;
    const idx = arr.findIndex(obj => obj._id === val);
    arr.splice(idx, 1, newObj);
    return arr;
};

/**
 * Constructs a date string in `mm/dd/yyyy` format.
 * @param {Date} date - The date to convert to a string.
 * @return {Date} The constructed date.
 */
export const dateToStr = function(date: Date) {
    const month = date.getUTCMonth() + 1;
    const day = date.getUTCDate();
    const year = date.getUTCFullYear();

    const monthStr = month.toString().padStart(2, '0');
    const dayStr = day.toString().padStart(2, '0');

    return `${monthStr}/${dayStr}/${year}`;
};

/**
 * Constructs a date suitable for WaveApps. Time is set to 00:00.
 * @param {string} date - The day constructed in `mm/dd/yyyy` format.
 * @return {Date} The constructed date.
 */
export const constructDate = function(date: string) {
    // Wave likes invoice dates in yyyy-mm-dd
    return new Date(`${date} 00:00`);
};

/**
 * Constructs a time in `hh:mm AM/PM` format.
 * @param {string} dateEpochStr - The date serialized in epoch format.
 * @return {string} The constructed date.
 */
export const constructTimeStr = function(dateEpochStr: string) {
    const date = new Date(dateEpochStr);

    let hours = date.getHours();
    const minutes = `${date.getMinutes()}`.padStart(2, '0');
    const timePeriod = hours < 12 ? 'AM' : 'PM';

    if (hours > 12) {
        hours -= 12;
    }

    return `${hours}:${minutes} ${timePeriod}`;
};

/**
 * Constructs a time in `hh:mm` format.
 * @param {string} dateEpochStr - The date serialized in epoch format.
 * @return {string} The constructed date.
 */
export const constructMilitaryTimeStr = function(dateEpochStr: string) {
    const date = new Date(dateEpochStr);

    const hours = `${date.getHours()}`.padStart(2, '0');
    const minutes = `${date.getMinutes()}`.padStart(2, '0');

    return `${hours}:${minutes}`;
};

export const fuseDateTime = function(dateStr: string, timeStr: string) {
    return new Date(`${dateStr} ${timeStr}`);
};

export const getDayOfWeekStr = function(dateStr: string) {
    const date = fuseDateTime(dateStr, '00:00');
    const dayOfWeekIdx = date.getDay();
    return DAYS_OF_WEEK[dayOfWeekIdx];
};

export const grabWorkingDays = function(dates: string[]) {
    return dates.filter(date => getDayOfWeekStr(date) !== DAYS_OF_WEEK[0]);
};

/**
 * Fetches all customers from Wave.
 * @param businessId - The business's unique ID.
 * @returns A promise resolving to a list of all Wave customers.
 */
export const fetchAllCustomers = function(businessId: BusinessID, jwt: JWT | null) {
    return WaveAPIClient.fetchAllCustomers(businessId, jwt)
        .then(json => json.customers as WaveCustomer[]);
};

export const downloadBuffer = (buffer: ArrayBuffer, filename: string) => {
    const blob = new Blob([buffer]);
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.setAttribute('download', filename);

    document.body.appendChild(link);
    link.click();
    link.remove();

    window.URL.revokeObjectURL(url);
};