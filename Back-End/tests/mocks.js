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
    }
};

module.exports = { MockResponse };