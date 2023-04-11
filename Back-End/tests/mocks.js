class MockResponse {
    constructor() {
        this.statusCode = null;
        this.data = null;
    }

    status(newStatus) {
        this.statusCode = newStatus;
        return this;
    }

    send(data) {
        this.data = data;
        return this;
    }
};

module.exports = { MockResponse };