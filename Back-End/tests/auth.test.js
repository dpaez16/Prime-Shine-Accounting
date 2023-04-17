const { expect, test } = require('@jest/globals');
const { verifyToken, getJwtToken } = require('../modules/auth');

const { MockResponse } = require('./mocks');
const { JWT_HEADER } = require('../modules/consts');

beforeAll(async () => {
    process.env.JWT_TOKEN = 'token';
});

describe('Auth Tests', () => {
    test('getJwtToken', async () => {
        const user = {
            _id: 'mockId',
            email: 'mockEmail'
        };

        let token = getJwtToken(user);
        expect(token).toBeTruthy();
    });

    test('verifyToken', async () => {
        let req = {
            headers: {}
        };
        req.headers[JWT_HEADER] = null;

        let res = new MockResponse();
        const next = jest.fn();

        // returns error due to missing token header
        verifyToken(req, res, next);
        expect(res.statusCode).toBe(403);

        // returns error due to bad JWT secret
        process.env.JWT_TOKEN = null;
        req.headers[JWT_HEADER] = 'token';
        verifyToken(req, res, next);
        expect(res.statusCode).toBe(401);

        // token is verifiable
        process.env.JWT_TOKEN = 'token';
        
        const user = {
            _id: 'mockId',
            email: 'mockEmail'
        };

        let token = getJwtToken(user);
        req.headers[JWT_HEADER] = token;
        verifyToken(req, res, next);
        expect(next).toHaveBeenCalled();
    });
});