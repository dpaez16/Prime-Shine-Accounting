const { MockResponse } = require('./mocks');
const UserService = require('../modules/users');

module.exports = {
    getMockUser: async () => {
        const req = {
            body: {
                name: 'Foo',
                email: 'foo@bar.com',
                password: 'foobar'
            }
        };

        const res = new MockResponse();
        await UserService.createUser(req, res);

        return res.data;
    }
};