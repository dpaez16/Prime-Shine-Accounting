export default class PrimeShineAPIClient {
    static #createPreJWTFetchRequest(body, apiPath) {
        const url = `${process.env.REACT_APP_SCHEDULE_API_ENDPOINT_URL}/ps/${apiPath}`;
        return fetch(url, {
            method: "POST",
            body: JSON.stringify(body),
            headers: {
                "Content-Type": "application/json"
            }
        });
    }

    static #createFetchRequest(body, jwt) {
        const url = `${process.env.REACT_APP_SCHEDULE_API_ENDPOINT_URL}/ps/graphql`;
        return fetch(url, {
            method: "POST",
            body: JSON.stringify(body),
            headers: {
                "Content-Type": "application/json",
                "Authorization": jwt
            }
        });
    }

    static #createFetchRequest2(path, body, jwt = null) {
        const url = `${process.env.REACT_APP_SCHEDULE_API_ENDPOINT_URL}/api` + path;
        return fetch(url, {
            method: "POST",
            body: JSON.stringify(body),
            headers: {
                "Content-Type": "application/json",
                "Authorization": jwt
            }
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
     * Attempts to login the user to Prime Shine Accounting.
     * @param {string} email - The user's email associated with their account.
     * @param {string} password - The user's password associated with their account.
     * @return {Promise<Object>} The promise with success returning the user's info + session, otherwise an error for rejection.
     */
    static loginUser(email, password) {
        const body = {
            email: email,
            password: password
        };

        return PrimeShineAPIClient.#createFetchRequest2('/login', body)
        .then(json => {
            const {jwt, user} = json;
            return {...user, token: jwt};
        })
        .catch(err => {
            throw new Error(`Could not login user: ${err.message}`);
        });
    }

    /**
     * Attempts to register the user to Prime Shine Accounting.
     * @param {string} name - The user's name to be associated with their account.
     * @param {string} email - The user's email to be associated with their account.
     * @param {string} password - The user's password to be associated with their account.
     * @return {Promise<Object>} The promise with success returning the newly created user's info + session, otherwise an error for rejection.
     */
    static createUser(name, email, password) {
        const body = {
            name: name,
            email: email,
            password: password
        };

        return PrimeShineAPIClient.#createFetchRequest2("/register", body)
        .then(json => {
            const {jwt, user} = json;
            return {...user, token: jwt};
        })
        .catch(err => {
            throw new Error(`Could not create user: ${err.message}`);
        });
    }

    /**
     * Attempts to edit the user's account information.
     * @param {string} name - The user's name.
     * @param {string} email - The user's email.
     * @param {string} password - The user's password.
     * @param {string} userId - The user's unique ID.
     * @param {string} jwt - The user's JSON web token.
     * @return {Promise<Object>} The promise with success returning the edited user's info, otherwise an error for rejection.
     */
    static editUser(name, email, password, userId, jwt) {
        const body = {
            userID: userId,
            name: name,
            email: email,
            password: password,
        };

        return PrimeShineAPIClient.#createFetchRequest2("/users/edit", body, jwt)
        .then(json => {
            return json.user;
        })
        .catch(err => {
            throw new Error(`Could not edit user: ${err.message}`);
        });
    }

    /**
     * Attempts to delete the user's account.
     * @param {string} userId - The user's unique ID.
     * @param {string} jwt - The user's JSON web token.
     * @return {Promise<boolean>} The promise with success returning a boolean flag indiciating whether the delete was successful, otherwise an error for rejection.
     */
    static deleteUser(userId, jwt) {
        const body = {
            userID: userId,
        };

        return PrimeShineAPIClient.#createFetchRequest2("/users/delete", body, jwt)
        .then(json => {
            return json.success;
        })
        .catch(err => {
            throw new Error(`Could not delete user: ${err.message}`);
        });
    }

    /**
     * Fetches schedules for a particular user.
     * @param {string} userId - The user's unique ID.
     * @param {string} jwt - The user's JSON web token.
     * @return {Promise<Array<Object>>} The promise with success returning the requested schedules, otherwise an error for rejection.
     */
    static fetchSchedules(userId, jwt) {
        const requestBody = {
            userID: userId,
        };

        return PrimeShineAPIClient.#createFetchRequest2('/schedule/query', requestBody, jwt)
        .then(json => {
            return json.schedules ?? [];
        })
        .then((schedules) => {
            return schedules.map((schedule) => {
                const newStartDay = new Date(schedule.startDay);
                return { ...schedule, ...{startDay: newStartDay} };
            });
        })
        .catch(err => {
            throw new Error(`Could not fetch schedules: ${err.message}`);
        });
    }

    /**
     * Creates a schedule.
     * @param {Date} startDay - The day that the schedule begins with.
     * @param {string} userId - The user's unique ID.
     * @param {string} jwt - The user's JSON web token.
     * @return {Promise<Object>} The promise with success returning the newly created schedule, otherwise an error for rejection.
     */
    static createSchedule(startDay, userId, jwt) {
        const requestBody = {
            query: `
            mutation($startDay: String!, $userID: ID!) {
                createSchedule(startDay: $startDay, userID: $userID) {
                    _id
                    startDay
                    user
                }
            }
            `,
            variables: {
                startDay: startDay,
                userID: userId
            }
        };

        return PrimeShineAPIClient.#createFetchRequest(requestBody, jwt)
        .then(async (response) => {
            if (!response || (response.status !== 200 && response.status !== 201)) {
                const responseText = await response.text();
                throw new Error(`Could not create schedule: ${responseText}`);
            }

            return response.json();
        })
        .then(json => {
            if (json.errors !== undefined) {
                throw new Error(`Could not create schedule: ${JSON.stringify(json.errors)}`);
            }

            return json.data.createSchedule;
        })
        .then(schedule => {
            const newStartDay = new Date(Number(schedule.startDay));
            return { ...schedule, ...{startDay: newStartDay} };
        })
        .catch(err => {
            throw err;
        });
    }

    /**
     * Edits a schedule.
     * @param {Date} startDay - The start day of the schedule.
     * @param {scheduleId} scheduleId - The schedule's unique ID.
     * @param {string} jwt - The user's JSON web token.
     * @return {Promise<Object>} The promise with success returning the edited schedule, otherwise an error for rejection.
     */
    static editSchedule(startDay, scheduleId, jwt) {
        const requestBody = {
            query: `
            mutation($startDay: String!, $scheduleID: ID!) {
                editSchedule(startDay: $startDay, scheduleID: $scheduleID) {
                    _id
                    startDay
                    user
                }
            }
            `,
            variables: {
                startDay: startDay,
                scheduleID: scheduleId
            }
        };

        return PrimeShineAPIClient.#createFetchRequest(requestBody, jwt)
        .then(async (response) => {
            if (!response || (response.status !== 200 && response.status !== 201)) {
                const responseText = await response.text();
                throw new Error(`Could not edit schedule: ${responseText}`);
            }

            return response.json();
        })
        .then(json => {
            if (json.errors !== undefined) {
                throw new Error(`Could not edit schedule: ${JSON.stringify(json.errors)}`);
            }

            return json.data.editSchedule;
        })
        .then(schedule => {
            const newStartDay = new Date(Number(schedule.startDay));
            return { ...schedule, ...{startDay: newStartDay} };
        })
        .catch(err => {
            throw err;
        });
    }

    /**
     * Deletes a schedule.
     * @param {Date} startDay - The start day for the schedule.
     * @param {string} userId - The user's unique ID.
     * @param {string} jwt - The user's JSON web token.
     * @return {Promise<boolean>} The promise with success returning a boolean flag indiciating whether the delete was successful, otherwise an error for rejection. 
     */
    static deleteSchedule(startDay, userId, jwt) {
        const requestBody = {
            query: `
            mutation($startDay: String!, $userID: ID!) {
                deleteSchedule(startDay: $startDay, userID: $userID)
            }
            `,
            variables: {
                startDay: startDay,
                userID: userId
            }
        };

        return PrimeShineAPIClient.#createFetchRequest(requestBody, jwt)
        .then(async (response) => {
            if (!response || (response.status !== 200 && response.status !== 201)) {
                const responseText = await response.text();
                throw new Error(`Could not delete schedule: ${responseText}`);
            }

            return response.json();
        })
        .then(json => {
            if (json.errors !== undefined) {
                throw new Error(`Could not delete schedule: ${JSON.stringify(json.errors)}`);
            }

            return json.data.deleteSchedule;
        })
        .catch(err => {
            throw err;
        });
    }

    /**
     * Creates a schedule day for a schedule.
     * @param {number} dayOffset - 0-indexed offset for the day of the week.
     * @param {string} scheduleId - The schedule's unique ID.
     * @param {string} jwt - The user's JSON web token.
     * @return {Promise<Object>} The promise with success returning the newly created schedule day, otherwise an error for rejection. 
     */
    static createScheduleDay(dayOffset, scheduleId, jwt) {
        const requestBody = {
            query: `
            mutation($dayOffset: Int!, $scheduleID: ID!) {
                createScheduleDay(dayOffset: $dayOffset, scheduleID: $scheduleID) {
                    _id
                    dayOffset
                    schedule
                }
            }
            `,
            variables: {
                dayOffset: dayOffset,
                scheduleID: scheduleId
            }
        };

        return PrimeShineAPIClient.#createFetchRequest(requestBody, jwt)
        .then(async (response) => {
            if (!response || (response.status !== 200 && response.status !== 201)) {
                const responseText = await response.text();
                throw new Error(`Could not create schedule day: ${responseText}`);
            }

            return response.json();
        })
        .then(json => {
            if (json.errors !== undefined) {
                throw new Error(`Could not create schedule day: ${JSON.stringify(json.errors)}`);
            }

            return json.data.createScheduleDay;
        })
        .catch(err => {
            throw err;
        });
    }

    /**
     * Fetches schedule days for a schedule.
     * @param {string} scheduleId - The schedule's unique ID.
     * @param {string} jwt - The user's JSON web token.
     * @return {Promise<Array<Object>>} The promise with success returning the requested schedule days, otherwise an error for rejection.
     */
    static fetchScheduleDays(scheduleId, jwt) {
        const requestBody = {
            scheduleID: scheduleId
        };

        return PrimeShineAPIClient.#createFetchRequest2("/scheduleDay/query", requestBody, jwt)
        .then(json => {
            return json.scheduleDays ?? [];
        })
        .catch(err => {
            throw new Error(`Could not get schedule days: ${err.message}`);
        });
    }

    /**
     * Deletes a schedule day for a schedule.
     * @param {number} dayOffset - 0-indexed offset for the day of the week.
     * @param {string} scheduleId - The schedule's unique ID.
     * @param {string} jwt - The user's JSON web token.
     * @return {Promise<boolean>} The promise with success returning a boolean flag indiciating whether the delete was successful, otherwise an error for rejection.
     */
    static deleteScheduleDay(dayOffset, scheduleId, jwt) {
        const requestBody = {
            query: `
            mutation($dayOffset: Int!, $scheduleID: ID!) {
                deleteScheduleDay(dayOffset: $dayOffset, scheduleID: $scheduleID)
            }
            `,
            variables: {
                dayOffset: dayOffset,
                scheduleID: scheduleId
            }
        };

        return PrimeShineAPIClient.#createFetchRequest(requestBody, jwt)
        .then(async (response) => {
            if (!response || (response.status !== 200 && response.status !== 201)) {
                const responseText = await response.text();
                throw new Error(`Could not delete schedule day: ${responseText}`);
            }

            return response.json();
        })
        .then(json => {
            if (json.errors !== undefined) {
                throw new Error(`Could not delete schedule day: ${JSON.stringify(json.errors)}`);
            }

            return json.data.deleteScheduleDay;
        })
        .catch(err => {
            throw err;
        });
    }

    /**
     * Fetches scheduled customers for a schedule day.
     * @param {string} scheduleDayId - The schedule day's unique ID.
     * @param {string} jwt - The user's JSON web token.
     * @return {Promise<Array<Object>>} The promise with success returning the requested scheduled customers, otherwise an error for rejection.
     */
    static fetchScheduledCustomers(scheduleDayId, jwt) {
        const requestBody = {
            scheduleDayID: scheduleDayId
        };

        return PrimeShineAPIClient.#createFetchRequest2("/scheduledCustomer/query", requestBody, jwt)
        .then(json => {
            return json.scheduledCustomers ?? [];
        })
        .catch(err => {
            throw new Error(`Could not get scheduled customers: ${err.message}`);
        });
    }

    /**
     * Creates a scheduled customer.
     * @param {string} customerId - The scheduled customer's unique WaveApps ID.
     * @param {Date} serviceStartTime - The scheduled customer's service start time.
     * @param {Date} serviceEndTime - The scheduled customer's service end time.
     * @param {string} scheduleId - The schedule's unique ID.
     * @param {string} jwt - The user's JSON web token.
     * @return {Promise<Object>} The promise with success returning the newly created scheduled customer, otherwise an error for rejection.
     */
    static createScheduledCustomer(customerId, serviceStartTime, serviceEndTime, scheduleDayId, jwt) {
        const requestBody = {
            query: `
            mutation($scheduledCustomerInput: ScheduledCustomerInput!) {
                createScheduledCustomer(scheduledCustomerInput: $scheduledCustomerInput) {
                    _id
                    customerId
                    serviceStartTime
                    serviceEndTime
                    scheduleDay
                }
            }
            `,
            variables: {
                scheduledCustomerInput: {
                    customerId: customerId,
                    serviceStartTime: serviceStartTime,
                    serviceEndTime: serviceEndTime,
                    scheduleDay: scheduleDayId
                }
            }
        };

        return PrimeShineAPIClient.#createFetchRequest(requestBody, jwt)
        .then(async (response) => {
            if (!response || (response.status !== 200 && response.status !== 201)) {
                const responseText = await response.text();
                throw new Error(`Could not create scheduled customer: ${responseText}`);
            }

            return response.json();
        })
        .then(json => {
            if (json.errors !== undefined) {
                throw new Error(`Could not create scheduled customer: ${JSON.stringify(json.errors)}`);
            }

            return json.data.createScheduledCustomer;
        })
        .catch(err => {
            throw err;
        });
    }
    
    /**
     * Edits a scheduled customer.
     * @param {string} scheduledCustomerId - The scheduled customer's unique ID.
     * @param {string} customerId - The scheduled customer's unique WaveApps ID.
     * @param {Date} serviceStartTime - The scheduled customer's service start time.
     * @param {Date} serviceEndTime - The scheduled customer's service end time.
     * @param {string} scheduleDayId - The schedule's unique ID.
     * @param {string} jwt - The user's JSON web token.
     * @returns {Promise<Object>} The promise with success returning the edited scheduled customer, otherwise an error for rejection. 
     */
    static editScheduledCustomer(scheduledCustomerId, customerId, serviceStartTime, serviceEndTime, scheduleDayId, jwt) {
        const requestBody = {
            query: `
            mutation($scheduledCustomerInput: ScheduledCustomerInput!, $scheduledCustomerID: ID!) {
                editScheduledCustomer(scheduledCustomerInput: $scheduledCustomerInput, scheduledCustomerID: $scheduledCustomerID) {
                    _id
                    customerId
                    serviceStartTime
                    serviceEndTime
                    scheduleDay
                }
            }
            `,
            variables: {
                scheduledCustomerInput: {
                    customerId: customerId,
                    serviceStartTime: serviceStartTime,
                    serviceEndTime: serviceEndTime,
                    scheduleDay: scheduleDayId
                },
                scheduledCustomerID: scheduledCustomerId
            }
        };

        return PrimeShineAPIClient.#createFetchRequest(requestBody, jwt)
        .then(async (response) => {
            if (!response || (response.status !== 200 && response.status !== 201)) {
                const responseText = await response.text();
                throw new Error(`Could not edit scheduled customer: ${responseText}`);
            }

            return response.json();
        })
        .then(json => {
            if (json.errors !== undefined) {
                throw new Error(`Could not edit scheduled customer: ${JSON.stringify(json.errors)}`);
            }

            return json.data.editScheduledCustomer;
        })
        .catch(err => {
            throw err;
        });
    }
    
    /**
     * Deletes a scheduled customer.
     * @param {string} scheduledCustomerId - The scheduled customer's unique ID.
     * @param {string} jwt - The user's JSON web token.
     * @return {Promise<boolean>} The promise with success returning a boolean flag indiciating whether the delete was successful, otherwise an error for rejection.
     */
    static deleteScheduledCustomer(scheduledCustomerId, jwt) {
        const requestBody = {
            query: `
            mutation($scheduledCustomerId: ID!) {
                deleteScheduledCustomer(scheduledCustomerID: $scheduledCustomerId)
            }
            `,
            variables: {
                scheduledCustomerId: scheduledCustomerId
            }
        };

        return PrimeShineAPIClient.#createFetchRequest(requestBody, jwt)
        .then(async (response) => {
            if (!response || (response.status !== 200 && response.status !== 201)) {
                const responseText = await response.text();
                throw new Error(`Could not delete scheduled customer: ${responseText}`);
            }

            return response.json();
        })
        .then(json => {
            if (json.errors !== undefined) {
                throw new Error(`Could not delete scheduled customer: ${JSON.stringify(json.errors)}`);
            }

            return json.data.deleteScheduledCustomer;
        })
        .catch(err => {
            throw err;
        });
    }
};