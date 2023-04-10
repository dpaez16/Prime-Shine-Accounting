const User = require('../models/user');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { getJwtToken } = require('../modules/auth');

const BCRYPT_SALT = 12;

module.exports = {
    loginUser: async (req, res) => {
        let { email, password } = req.body;
        return User.findOne({email: email}).then(async foundUser => {
            if (!foundUser) {
                throw new Error('User not found.');
            }

            return bcrypt.compare(password, foundUser.password).then(isMatch => {
                if (isMatch) {
                    const token = getJwtToken(foundUser);
                    foundUser.token = token;

                    return res.status(200).send({...foundUser._doc, password: null});
                } else {
                    throw new Error('Password is incorrect.');
                }
            });
        })
        .catch(err => {
            res.status(400).send({ error: err.message });
        });
    },
    createUser: async (req, res) => {
        const args = {
            name: req.body.name,
            email: req.body.email,
            password: req.body.password
        };

        return User.findOne({email: args.email}).then(async user => {
            if (user) {
                throw new Error('User exists already.');
            }

            return bcrypt.hash(args.password, BCRYPT_SALT);
        })
        .then(async hashedPassword => {
            const newUser = new User({
                name: args.name,
                email: args.email,
                password: hashedPassword
            });
            
            return newUser.save();
        })
        .then((result) => {
            const token = getJwtToken(result);
            result.token = token;

            return res.status(200).send({ ...result._doc, password: null });
        })
        .catch(err => {
            return res.status(400).send({ error: err.message });
        });
    },
    editUser: async rawArgs => {
        let args = rawArgs.userInput;
        return bcrypt.hash(args.password, BCRYPT_SALT).then(async hashedPassword => {
            return User.findById(rawArgs.userID)
            .then(async user => {
                if (!user) {
                    throw new Error("Cannot find user.");
                }

                const oldEmail = user.email;
                user.name = args.name;
                user.email = args.email;
                user.password = hashedPassword;

                if (oldEmail !== args.email) {
                    return User.findOne({ email: args.email })
                    .then(foundUser => {
                        if (foundUser) {
                            throw new Error("User with that email exists.");
                        }
                        return user.save();
                    });
                }
                return user.save();
            })
            .then(result => {
                return { ...result._doc, password: null };
            });
        })
        .catch(err => {
            throw err;
        });
    },
    deleteUser: async rawArgs => {
        let userID = rawArgs.userID;

        return User.findById(userID).then(async user => {
            if (!user) {
                throw new Error("User not found.");
            }

            // delete user related stuff

            return Promise.all([]);
        })
        .then((res) => {
            return User.deleteOne({ _id: userID });
        })
        .then((res) => {
            return true;
        })
        .catch(err => {
            throw err;
        });
    }
}