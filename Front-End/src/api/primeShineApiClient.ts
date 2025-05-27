import { ScheduledCustomer, ScheduledCustomerID } from '@/types/scheduledCustomer';
import { JWT, UserInfo } from '@/types/userInfo';
import { Schedule, ScheduleID } from '@/types/schedule';
import { BusinessInfo } from '../types/businessInfo';
import { WaveCustomerID } from '@/types/waveCustomer';

export default class PrimeShineAPIClient {
    static #createFetchRequest(
        path: string,
        body: object,
        jwt: JWT | null = null,
    ) {
        const url = '/api' + path;
        return fetch(url, {
            method: 'POST',
            body: JSON.stringify(body),
            headers: {
                'Content-Type': 'application/json',
                'Authorization': jwt ?? '',
            },
        })
            .then(async (response) => {
                if (!response || (response.status !== 200 && response.status !== 201)) {
                    const data = await response.json();
                    throw new Error(data.error);
                }

                return response.json();
            });
    }

    /**
    * Verifies the user's login session token.
    * @param token The user's login session token.
    * @returns A promise resolving to true if the user has a valid login session, false otherwise.
    */
    static handshake(jwt: JWT | null): Promise<boolean> {
        if (!jwt) {
            return Promise.resolve(false);
        }

        return PrimeShineAPIClient.#createFetchRequest('/handshake', {}, jwt)
            .then(() => true)
            .catch(() => false);
    }

    /**
    * Attempts to login the user to Prime Shine Accounting.
    * @param email - The user's email associated with their account.
    * @param password - The user's password associated with their account.
    * @return The promise with success returning the user's info + session, otherwise an error for rejection.
    */
    static loginUser(email: string, password: string) {
        const body = {
            email: email,
            password: password,
        };

        return PrimeShineAPIClient.#createFetchRequest('/login', body)
            .then((json) => {
                const { jwt, user, businessInfo } = json;
                return {
                    userInfo: { ...user, token: jwt } as UserInfo,
                    businessInfo: businessInfo as BusinessInfo,
                };
            })
            .catch((err) => {
                throw new Error(`Could not login user: ${err.message}`);
            });
    }

    /**
    * Attempts to register the user to Prime Shine Accounting.
    * @param name - The user's name to be associated with their account.
    * @param email - The user's email to be associated with their account.
    * @param password - The user's password to be associated with their account.
    * @return The promise with success returning the newly created user's info + session, otherwise an error for rejection.
    */
    static createUser(
        name: string,
        email: string,
        password: string,
    ) {
        const body = {
            name: name,
            email: email,
            password: password,
        };

        return PrimeShineAPIClient.#createFetchRequest('/register', body)
            .then((json) => {
                const { jwt, user, businessInfo } = json;
                return {
                    userInfo: { ...user, token: jwt } as UserInfo,
                    businessInfo: businessInfo as BusinessInfo,
                };
            })
            .catch((err) => {
                throw new Error(`Could not create user: ${err.message}`);
            });
    }

    /**
    * Attempts to edit the user's account information.
    * @param name - The user's name.
    * @param email - The user's email.
    * @param password - The user's password.
    * @param userId - The user's unique ID.
    * @param jwt - The user's JSON web token.
    * @return A promise resolving to a UserInfo object reflecting the changes.
    */
    static editUser(
        name: string,
        email: string,
        password: string,
        userId: string,
        jwt: JWT,
    ) {
        const body = {
            userID: userId,
            name: name,
            email: email,
            password: password,
        };

        return PrimeShineAPIClient.#createFetchRequest('/users/edit', body, jwt)
            .then((json) => {
                return json.user as UserInfo;
            })
            .catch((err) => {
                throw new Error(`Could not edit user: ${err.message}`);
            });
    }

    /**
    * Attempts to delete the user's account.
    * @param userId - The user's unique ID.
    * @param jwt - The user's JSON web token.
    * @return A promise resolving to true for a successful operation.
    */
    static deleteUser(userId: string, jwt: JWT): Promise<boolean> {
        const body = {
            userID: userId,
        };

        return PrimeShineAPIClient.#createFetchRequest('/users/delete', body, jwt)
            .then(() => true)
            .catch((err) => {
                throw new Error(`Could not delete user: ${err.message}`);
            });
    }

    /**
    * Fetches schedules for a particular user.
    * @param userId - The user's unique ID.
    * @param jwt - The user's JSON web token.
    * @return A promise resolving to a list of the user's schedules.
    */
    static fetchSchedules(userId: string, jwt: JWT) {
        const requestBody = {
            userID: userId,
        };

        return PrimeShineAPIClient.#createFetchRequest(
            '/schedule/query',
            requestBody,
            jwt,
        )
            .then((json) => {
                const schedules: Schedule[] = json.schedules ?? [];
                return schedules.map((schedule) => {
                    const newStartDay = new Date(schedule.startDay);
                    return { ...schedule, startDay: newStartDay } as Schedule;
                });
            })
            .catch((err) => {
                throw new Error(`Could not fetch schedules: ${err.message}`);
            });
    }

    /**
    * Creates a schedule.
    * @param startDay - The day that the schedule begins with.
    * @param userId - The user's unique ID.
    * @param jwt - The user's JSON web token.
    * @return A promise resolving to the newly created schedule.
    */
    static createSchedule(startDay: Date, userId: string, jwt: JWT) {
        const requestBody = {
            startDay: startDay,
            userID: userId,
        };

        return PrimeShineAPIClient.#createFetchRequest(
            '/schedule/create',
            requestBody,
            jwt,
        )
            .then((json) => {
                const schedule: Schedule = json.schedule;
                const newStartDay = new Date(schedule.startDay);
                return { ...schedule, startDay: newStartDay } as Schedule;
            })
            .catch((err) => {
                throw new Error(`Could not create schedule: ${err.message}`);
            });
    }

    /**
    * Edits a schedule.
    * @param startDay - The start day of the schedule.
    * @param scheduleId - The schedule's unique ID.
    * @param jwt - The user's JSON web token.
    * @return A promise resolving to the edited schedule.
    */
    static editSchedule(startDay: Date, scheduleId: ScheduleID, jwt: JWT) {
        const requestBody = {
            startDay: startDay,
            scheduleID: scheduleId,
        };

        return PrimeShineAPIClient.#createFetchRequest(
            '/schedule/edit',
            requestBody,
            jwt,
        )
            .then((json) => {
                const schedule: Schedule = json.schedule;
                const newStartDay = new Date(schedule.startDay);
                return { ...schedule, startDay: newStartDay } as Schedule;
            })
            .catch((err) => {
                throw new Error(`Could not edit schedule: ${err.message}`);
            });
    }

    /**
    * Deletes a schedule.
    * @param scheduleID - ID of the schedule.
    * @param jwt - The user's JSON web token.
    * @return A promise resolving to true for a successful operation.
    */
    static deleteSchedule(scheduleID: ScheduleID, jwt: JWT): Promise<boolean> {
        const requestBody = {
            scheduleID,
        };

        return PrimeShineAPIClient.#createFetchRequest(
            '/schedule/delete',
            requestBody,
            jwt,
        )
            .then(() => true)
            .catch((err) => {
                throw new Error(`Could not delete schedule: ${err.message}`);
            });
    }

    /**
     * Grabs a PDF of a schedule.
     *
     * @param scheduleID - The schedule to grab a PDF for.
     * @param jwt - The user's JSON web token.
     * @returns A promise resolving to the PDF contents.
     */
    static getSchedulePDF(scheduleID: ScheduleID, jwt: JWT) {
        const url = '/api/schedule/pdf';
        const body = {
            scheduleID,
        };

        return fetch(url, {
            method: 'POST',
            body: JSON.stringify(body),
            headers: {
                'Content-Type': 'application/json',
                'Authorization': jwt,
                'Accept': 'application/pdf',
            },
        })
            .then(async (response) => {
                if (!response || (response.status !== 200 && response.status !== 201)) {
                    const data = await response.json();
                    throw new Error(data.error);
                }

                return response.arrayBuffer();
            });
    }

    /**
    * Fetches scheduled customers for a schedule.
    * @param scheduleID - The schedule to grab scheduled customers from.
    * @param jwt - The user's JSON web token.
    * @return A promise resolving to a list of scheduled customers.
    */
    static fetchScheduledCustomers(scheduleID: ScheduleID, jwt: JWT) {
        const requestBody = {
            scheduleID,
        };

        return PrimeShineAPIClient.#createFetchRequest(
            '/scheduledCustomer/query',
            requestBody,
            jwt,
        )
            .then((json) => {
                const scheduledCustomers: ScheduledCustomer[] = json.scheduledCustomers ?? [];
                return scheduledCustomers;
            })
            .catch((err) => {
                throw new Error(`Could not get scheduled customers: ${err.message}`);
            });
    }

    /**
    * Creates a scheduled customer.
    * @param waveCustomerID - The scheduled customer's unique WaveApps ID.
    * @param startTime - The scheduled customer's service start time.
    * @param endTime - The scheduled customer's service end time.
    * @param dayOffset - 0-indexed value indicating the day where the scheduled customer should be scheduled in.
    * @param scheduleID - The schedule where the scheduled customer will live in.
    * @param jwt - The user's JSON web token.
    * @return A promise resolving to the newly created scheduled customer.
    */
    static createScheduledCustomer(
        waveCustomerID: WaveCustomerID,
        startTime: Date,
        endTime: Date,
        dayOffset: number,
        scheduleID: ScheduleID,
        jwt: JWT,
    ) {
        const requestBody = {
            waveCustomerID,
            startTime,
            endTime,
            dayOffset,
            scheduleID,
        };

        return PrimeShineAPIClient.#createFetchRequest(
            '/scheduledCustomer/create',
            requestBody,
            jwt,
        )
            .then((json) => {
                return json.scheduledCustomer as ScheduledCustomer;
            })
            .catch((err) => {
                throw new Error(`Could not create scheduled customer: ${err.message}`);
            });
    }

    /**
    * Edits a scheduled customer.
    * @param scheduledCustomerID - The scheduled customer's unique ID.
    * @param waveCustomerID - The scheduled customer's unique WaveApps ID.
    * @param startTime - The scheduled customer's service start time.
    * @param endTime - The scheduled customer's service end time.
    * @param dayOffset - 0-indexed value indicating the day where the scheduled customer is scheduled in.
    * @param scheduleID - The schedule where the scheduled customer lives in.
    * @param jwt - The user's JSON web token.
    * @returns A promise resolving to the edited scheduled customer.
    */
    static editScheduledCustomer(
        scheduledCustomerID: ScheduledCustomerID,
        waveCustomerID: WaveCustomerID,
        startTime: Date,
        endTime: Date,
        dayOffset: number,
        scheduleID: ScheduleID,
        jwt: JWT,
    ) {
        const requestBody = {
            scheduledCustomerID,
            waveCustomerID,
            startTime,
            endTime,
            dayOffset,
            scheduleID,
        };

        return PrimeShineAPIClient.#createFetchRequest(
            '/scheduledCustomer/edit',
            requestBody,
            jwt,
        )
            .then((json) => {
                return json.scheduledCustomer as ScheduledCustomer;
            })
            .catch((err) => {
                throw new Error(`Could not edit scheduled customer: ${err.message}`);
            });
    }

    /**
    * Deletes a scheduled customer.
    * @param scheduledCustomerID - The scheduled customer's unique ID.
    * @param jwt - The user's JSON web token.
    * @return A promise resolving to true for a successful operation.
    */
    static deleteScheduledCustomer(scheduledCustomerID: ScheduledCustomerID, jwt: JWT) {
        const requestBody = {
            scheduledCustomerID,
        };

        return PrimeShineAPIClient.#createFetchRequest(
            '/scheduledCustomer/delete',
            requestBody,
            jwt,
        )
            .then(() => true)
            .catch((err) => {
                throw new Error(`Could not delete scheduled customer: ${err.message}`);
            });
    }
}
