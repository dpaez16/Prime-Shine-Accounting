import WaveAPIClient from '../api/waveApiClient';

export const deleteItemFromArray = function(arr, valObj) {
    const val = valObj._id;
    const idx = arr.findIndex(obj => obj._id === val);
    arr.splice(idx, 1);
    return arr;
}

export const replaceItemFromArray = function(arr, valObj, newObj) {
    const val = valObj._id;
    const idx = arr.findIndex(obj => obj._id === val);
    arr.splice(idx, 1, newObj);
    return arr;
}

/**
 * Constructs a date string in `mm/dd/yyyy` format.
 * @param {string} dateEpochStr - The date serialized in epoch format.
 * @return {Date} The constructed date.
 */
export const dateToStr = function(dateEpochStr) {
    const dateNum = Number(dateEpochStr);
    const date = new Date(dateNum);
    
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const year = date.getFullYear();

    return `${month}/${day}/${year}`;
}

/**
 * Constructs a date suitable for WaveApps. Time is set to 00:00.
 * @param {string} date - The day constructed in `mm/dd/yyyy` format.
 * @return {Date} The constructed date.
 */
export const constructDate = function(date) {
    // Wave likes invoice dates in yyyy-mm-dd
    return new Date(`${date} 00:00`);
}

/**
 * Constructs a time in `hh:mm AM/PM` format.
 * @param {string} dateEpochStr - The date serialized in epoch format.
 * @return {Date} The constructed date.
 */
export const constructTimeStr = function(dateEpochStr) {
    const dateNum = Number(dateEpochStr);
    const date = new Date(dateNum);

    let hours = date.getHours();
    const minutes = `${date.getMinutes()}`.padStart(2, '0');
    const timePeriod = hours < 12 ? "AM" : "PM";

    if (hours > 12) {
        hours -= 12;
    }

    return `${hours}:${minutes} ${timePeriod}`;
}

export const fuseDateTime = function(dateStr, timeStr) {
    return new Date(`${dateStr} ${timeStr}`);
}

/**
 * Fetches all customers from Wave.
 * @param {string} businessId - The business's unique ID.
 * @returns {Promise<Array<Object>>} The promise with success returning all customers, otherwise an error for rejection.
 */
export const fetchAllCustomers = async function(businessId) {
    let pageNum = 1;
    let allCustomers = [];

    while (true) {
        const results = await WaveAPIClient.fetchCustomers(businessId, pageNum);    
        const { pageInfo, customers } = results;
        const { totalPages } = pageInfo;

        allCustomers = [...allCustomers, ...customers];

        if (totalPages === pageNum) {
            break;
        }

        pageNum += 1;
    }

    return allCustomers;
}