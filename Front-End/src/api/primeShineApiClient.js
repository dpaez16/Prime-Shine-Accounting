export class PrimeShineAPIClient {
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

        return PrimeShineAPIClient.#createPreJWTFetchRequest(body, "login")
        .then(async (response) => {
            if (!response || (response.status !== 200 && response.status !== 201)) {
                const responseText = await response.text();
                throw new Error(`Could not login user: ${responseText}`);
            }

            return response.json();
        })
        .then(json => {
            return json;
        })
        .catch(err => {
            throw err;
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

        return PrimeShineAPIClient.#createPreJWTFetchRequest(body, "register")
        .then(async (response) => {
            if (!response || (response.status !== 200 && response.status !== 201)) {
                const responseText = await response.text();
                throw new Error(`Could not create user: ${responseText}`);
            }

            return response.json();
        })
        .then(json => {
            return json;
        })
        .catch(err => {
            throw err;
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
            query: `
            mutation($userInput: UserInput!, $userID: ID!) {
                editUser(userInput: $userInput, userID: $userID) {
                    _id
                    name
                    email
                }
            }
            `,
            variables: {
                userInput: {
                    name: name,
                    email: email,
                    password: password
                },
                userID: userId
            }
        };

        return PrimeShineAPIClient.#createFetchRequest(body, jwt)
        .then(async (response) => {
            if (!response || (response.status !== 200 && response.status !== 201)) {
                const responseText = await response.text();
                throw new Error(`Could not edit user: ${responseText}`);
            }

            return response.json();
        })
        .then(json => {
            if (json.errors !== undefined) {
                throw new Error(`Could not edit user: ${JSON.stringify(json.errors)}`);
            }

            return json.data.editUser;
        })
        .catch(err => {
            throw err;
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
            query: `
            mutation($userID: ID!) {
                deleteUser(userID: $userID)
            }
            `,
            variables: {
                userID: userId
            }
        };

        return PrimeShineAPIClient.#createFetchRequest(body, jwt)
        .then(async (response) => {
            if (!response || (response.status !== 200 && response.status !== 201)) {
                const responseText = await response.text();
                throw new Error(`Could not delete user: ${responseText}`);
            }

            return response.json();
        })
        .then(json => {
            if (json.errors !== undefined) {
                throw new Error(`Could not delete user: ${JSON.stringify(json.errors)}`);
            }

            return json.data.deleteUser;
        })
        .catch(err => {
            throw err;
        });
    }
};