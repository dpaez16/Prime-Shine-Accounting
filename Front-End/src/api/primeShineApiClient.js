export default class PrimeShineAPIClient {
    static #createFetchRequest(path, body, jwt = null) {
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

        return PrimeShineAPIClient.#createFetchRequest('/login', body)
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

        return PrimeShineAPIClient.#createFetchRequest("/register", body)
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

        return PrimeShineAPIClient.#createFetchRequest("/users/edit", body, jwt)
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

        return PrimeShineAPIClient.#createFetchRequest("/users/delete", body, jwt)
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

        return PrimeShineAPIClient.#createFetchRequest('/schedule/query', requestBody, jwt)
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
            startDay: startDay,
            userID: userId,
        };

        return PrimeShineAPIClient.#createFetchRequest("/schedule/create", requestBody, jwt)
        .then(json => {
            return json.schedule;
        })
        .then(schedule => {
            const newStartDay = new Date(schedule.startDay);
            return { ...schedule, ...{startDay: newStartDay} };
        })
        .catch(err => {
            throw new Error(`Could not create schedule: ${err.message}`);
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
            startDay: startDay,
            scheduleID: scheduleId,
        };

        return PrimeShineAPIClient.#createFetchRequest("/schedule/edit", requestBody, jwt)
        .then(json => {
            return json.schedule;
        })
        .then(schedule => {
            const newStartDay = new Date(schedule.startDay);
            return { ...schedule, ...{startDay: newStartDay} };
        })
        .catch(err => {
            throw new Error(`Could not edit schedule: ${err.message}`);
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
            startDay: startDay,
            userID: userId,
        };

        return PrimeShineAPIClient.#createFetchRequest("/schedule/delete", requestBody, jwt)
        .then(json => {
            return json.success;
        })
        .catch(err => {
            throw new Error(`Could not delete schedule: ${err.message}`);
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
            dayOffset: dayOffset,
            scheduleID: scheduleId,
        };

        return PrimeShineAPIClient.#createFetchRequest("/scheduleDay/create", requestBody, jwt)
        .then(json => {
            return json.scheduleDay;
        })
        .catch(err => {
            throw new Error(`Could not create schedule day: ${err.message}`);
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

        return PrimeShineAPIClient.#createFetchRequest("/scheduleDay/query", requestBody, jwt)
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
            dayOffset: dayOffset,
            scheduleID: scheduleId,
        };

        return PrimeShineAPIClient.#createFetchRequest("/scheduleDay/delete", requestBody, jwt)
        .then(json => {
            return json.success;
        })
        .catch(err => {
            throw new Error(`Could not delete schedule day: ${err.message}`);
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

        return PrimeShineAPIClient.#createFetchRequest("/scheduledCustomer/query", requestBody, jwt)
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
            customerID: customerId,
            serviceStartTime: serviceStartTime,
            serviceEndTime: serviceEndTime,
            scheduleDayID: scheduleDayId,
        };

        return PrimeShineAPIClient.#createFetchRequest("/scheduledCustomer/create", requestBody, jwt)
        .then(json => {
            return json.scheduledCustomer;
        })
        .catch(err => {
            throw new Error(`Could not create scheduled customer: ${err.message}`);
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
            scheduledCustomerID: scheduledCustomerId,
            customerID: customerId,
            serviceStartTime: serviceStartTime,
            serviceEndTime: serviceEndTime,
            scheduleDayID: scheduleDayId,
        };

        return PrimeShineAPIClient.#createFetchRequest("/scheduledCustomer/edit", requestBody, jwt)
        .then(json => {
            return json.scheduledCustomer;
        })
        .catch(err => {
            throw new Error(`Could not edit scheduled customer: ${err.message}`);
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
            scheduledCustomerID: scheduledCustomerId,
        };

        return PrimeShineAPIClient.#createFetchRequest("/scheduledCustomer/delete", requestBody, jwt)
        .then(json => {
            return json.success;
        })
        .catch(err => {
            throw new Error(`Could not delete scheduled customer: ${err.message}`);
        });
    }
};