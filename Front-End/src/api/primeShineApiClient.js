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
                "token": jwt
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
};