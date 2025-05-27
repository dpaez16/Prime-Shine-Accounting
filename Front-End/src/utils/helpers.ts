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
 * @param date - The date to convert to a string.
 * @return The constructed date.
 */
export const dateToStr = (date: Date) => {
    const month = date.getUTCMonth() + 1;
    const day = date.getUTCDate();
    const year = date.getUTCFullYear();

    const monthStr = month.toString().padStart(2, '0');
    const dayStr = day.toString().padStart(2, '0');

    return `${monthStr}/${dayStr}/${year}`;
};

/**
 * Constructs a date suitable for WaveApps. Time is set to 00:00.
 * @param date - The day constructed in `mm/dd/yyyy` format.
 * @return The constructed date.
 */
export const constructDate = (date: string) => {
    // Wave likes invoice dates in yyyy-mm-dd
    return new Date(`${date} 00:00`);
};

/**
 * Constructs a time in `hh:mm AM/PM` format.
 * @param dateEpochStr - The date serialized in epoch format.
 * @return The constructed date.
 */
export const constructTimeStr = (dateEpochStr: string) => {
    const date = new Date(dateEpochStr);

    let hours = date.getHours();
    const minutes = `${date.getMinutes()}`.padStart(2, '0');
    const timePeriod = hours < 12 ? 'AM' : 'PM';

    if (hours > 12) {
        hours -= 12;
    }

    return `${hours.toString().padStart(2, '0')}:${minutes} ${timePeriod}`;
};

/**
 * Constructs a time in `hh:mm` format.
 * @param dateEpochStr - The date serialized in epoch format.
 * @return The constructed date.
 */
export const constructMilitaryTimeStr = (dateEpochStr: string) => {
    const date = new Date(dateEpochStr);

    const hours = `${date.getHours()}`.padStart(2, '0');
    const minutes = `${date.getMinutes()}`.padStart(2, '0');

    return `${hours}:${minutes}`;
};

/**
 * Fuses a mm/dd/yyyy date string with a hh:mm time string into a Date object.
 * @param dateStr - The mm/dd/yyyy date string.
 * @param timeStr - The hh:mm time string.
 * @returns The newly constructed Date object.
 */
export const fuseDateTime = (dateStr: string, timeStr: string) => {
    return new Date(`${dateStr} ${timeStr}`);
};

/**
 * Get the day of the week from a mm/dd/yyyy date string.
 * @param dateStr - The mm/dd/yyyy date string.
 * @returns The day of the week.
 */
export const getDayOfWeekStr = (dateStr: string) => {
    const date = fuseDateTime(dateStr, '00:00');
    const dayOfWeekIdx = date.getDay();
    return DAYS_OF_WEEK[dayOfWeekIdx];
};

export const grabWorkingDays = (dates: string[]) => {
    return dates.filter(date => getDayOfWeekStr(date) !== DAYS_OF_WEEK[0]);
};

/**
 * Fetches all customers from Wave.
 * @param businessId - The business's unique ID.
 * @returns A promise resolving to a list of all Wave customers.
 */
export const fetchAllCustomers = (businessId: BusinessID, jwt: JWT | null) => {
    return WaveAPIClient.fetchAllCustomers(businessId, jwt)
        .then(json => json.customers as WaveCustomer[]);
};

/**
 * Downloads a file to the client.
 * @param buffer - The file's contents that will be downloaded. 
 * @param filename - The name that the downloaded file will be named as.
 */
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