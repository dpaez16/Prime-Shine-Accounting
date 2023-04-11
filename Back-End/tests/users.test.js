const { expect, test } = require('@jest/globals');
const { MockResponse } = require('./mocks');

const db = require('./dbUtil');
const UserService = require('../modules/users');

beforeAll(async () => {
    await db.connect()
    process.env.JWT_TOKEN = 'token';
});
beforeEach(async () => await db.clear());
afterAll(async () => await db.close());


describe('Users Schema', () => {
    test('createUser', async () => {
        let req = {
            body: {
                name: 'Foo',
                email: 'foo@bar.com',
                password: 'foobar'
            }
        };
        let res = new MockResponse();

        // should be able to create new user
        await UserService.createUser(req, res);
        expect(res.statusCode).toBe(200);
        expect(res.data).toHaveProperty('name', req.body.name);
        expect(res.data).toHaveProperty('email', req.body.email);
        expect(res.data).toHaveProperty('password');
        expect(res.data).toHaveProperty('token');

        // cannot create duplicate user
        await UserService.createUser(req, res);
        expect(res.statusCode).toBe(400);
    });
    
    test('loginUser', async () => {
        let req = {
            body: {
                email: 'fake@email.com',
                password: 'password'
            }
        };
        let res = new MockResponse();

        // cannot find non-existent user
        await UserService.loginUser(req, res);
        expect(res.statusCode).toBe(400);

        let actualPassword = 'foobar';
        req = {
            body: {
                name: 'Foo',
                email: 'foo@bar.com',
                password: actualPassword
            }
        };

        await UserService.createUser(req, res);

        // incorrect password login error
        req.body.password = 'incorrectPassword';
        await UserService.loginUser(req, res);

        expect(res.statusCode).toBe(400);

        // successful login
        req.body.password = actualPassword;
        await UserService.loginUser(req, res);
        expect(res.data).toHaveProperty('_id');
        expect(res.data).toHaveProperty('name', req.body.name);
        expect(res.data).toHaveProperty('email', req.body.email);
        expect(res.data).toHaveProperty('password');
        expect(res.data).toHaveProperty('token');
    });

    test('editUser', async () => {
        let reqA = {
            body: {
                name: 'Foo',
                email: 'foo@bar.com',
                password: 'password'
            }
        };

        let reqB = {
            body: {
                name: 'Bar',
                email: 'bar@foo.com',
                password: 'password'
            }
        };

        let res = new MockResponse();

        // grabbing random userID
        await UserService.createUser(reqA, res);
        let randomUserID = res.data._id;
        await UserService.deleteUser({ userID: randomUserID });

        // creating userA
        await UserService.createUser(reqA, res);
        reqA.body.userID = res.data._id;

        // creating userB
        await UserService.createUser(reqB, res);
        reqB.body.userID = res.data._id;
        
        // userID is incorrect
        let correctUserID = reqA.body.userID;
        reqA.body.userID = randomUserID;
        await expect(UserService.editUser({ userInput: reqA.body })).rejects.toThrow(Error);

        // trying to change email to email that's in use
        reqA.body.userID = correctUserID;
        reqA.body.email = reqB.body.email;
        await expect(UserService.editUser({ userInput: reqA.body })).rejects.toThrow(Error);

        // successfully updating email
        reqA.body.email = 'foobar@foobar.com';
        let updatedUserExp = expect(await UserService.editUser({ 
            userInput: reqA.body,
            userID: res.data._id
        }));
        updatedUserExp.toHaveProperty('_id');
        updatedUserExp.toHaveProperty('name', reqA.body.name);
        updatedUserExp.toHaveProperty('email', reqA.body.email);
        updatedUserExp.toHaveProperty('password');

        // successfully updating user with same credentials
        reqA.body.email = 'foobar@foobar.com';
        updatedUserExp = expect(await UserService.editUser({ 
            userInput: reqA.body, 
            userID: res.data._id
        }));
        updatedUserExp.toHaveProperty('_id');
        updatedUserExp.toHaveProperty('name', reqA.body.name);
        updatedUserExp.toHaveProperty('email', reqA.body.email);
        updatedUserExp.toHaveProperty('password');
    });

    test('deleteUser', async () => {
        let req = {
            body: {
                name: 'Foo',
                email: 'foo@bar.com',
                password: 'password'
            }
        };

        let res = new MockResponse();

        // deleting real user
        await UserService.createUser(req, res);
        req.userID = res.data._id;
        expect(await UserService.deleteUser(req)).resolves;

        // can't delete non-existent user
        await expect(UserService.deleteUser(req)).rejects.toThrow(Error);
    });
});
