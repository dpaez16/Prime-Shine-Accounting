const express = require('express');
const { graphqlHTTP  } = require('express-graphql');
const { buildSchema } = require('graphql');
const { verifyToken } = require('./modules/auth');

const { loginUser, createUser, editUser, deleteUser } = require('./modules/users');

const app = express();

app.use(express.json());

app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST,GET,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

    if (req.method === "OPTIONS") {
        return res.sendStatus(200);
    }

    next();
});

app.post('/ps/login', loginUser);
app.post('/ps/register', createUser);

app.use('/ps/api', [verifyToken, graphqlHTTP({
    schema: buildSchema(`
        type User {
            _id: ID!
            name: String!
            email: String!
            password: String
        }

        input UserInput {
            name: String!
            email: String!
            password: String!
            token: String!
        }

        type RootMutation {
            editUser(userInput: UserInput!, userID: ID!): User

            deleteUser(userID: ID!): Boolean
        }

        schema {
            mutation: RootMutation
        }
    `),
    rootValue: {
        editUser: editUser,
        deleteUser: deleteUser,
    },
    graphiql: true
})]);

module.exports = app;
