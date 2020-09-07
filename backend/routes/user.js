const getDb = require('../database');
const shortid = require('shortid');
const moment = require('moment');
const crypto = require('crypto');

function md5(string) {
    return crypto.createHash('md5').update(string).digest("hex");
}

function splitName(fullName) {
    let countSpaces = fullName ? (fullName.match(/ /g) || []).length : 0;

    let firstName = "";
    let secondName = "";
    let familyName = "";

    if (countSpaces === 0) {
        familyName = fullName || "";
    }

    if (countSpaces === 1) {
        [firstName, familyName] = fullName.split(' ');
        secondName = "";
    }

    if (countSpaces === 2) {
        [familyName, firstName, secondName] = fullName.split(' ');
    }

    return {firstName, secondName, familyName};
}

module.exports = {
    async load(ctx, next) {
        const id = ctx.params.id;
        let forUser = ctx.request.body.forUser || false;

        if (!id) {
            ctx.body = {user: false};
            return next();
        }

        const db = await getDb();
        const users = db.collection('users');
        let user = await users.findOne({id});

        if (!user) {
            ctx.body = {user: false};
            return next();
        }

        for (const forbidden of ['passwordHash']) {
            delete user[forbidden];
        }

        if (forUser && forUser.role === 'recruiter') {
            const vacanciesCollection = db.collection('vacancies');

            let recruiterVacancies = await vacanciesCollection.find({
                recruiterId: forUser.id,
                deleted: {$in: [null, false]},
            }).toArray();

            let recruiterVacanciesId = recruiterVacancies.map(vacancy => vacancy.id);

            let query = {
                vacancyId: {$in: recruiterVacanciesId},
                deleted: {$in: [null, false]},
            };

            user.requests = await requests.find(query).toArray();
        }

        ctx.body = {user};
        return next();
    },
    async login(ctx, next) {
        const email = ctx.request.body.email;
        const password = ctx.request.body.password;

        if (!email || !password) {
            ctx.body = {user: false};
            return next();
        }

        let passwordHash = md5(password);

        const db = await getDb();
        let users = db.collection('users');
        let user = await users.findOne({
            email: email,
            passwordHash: passwordHash,
            deleted: {$in: [null, false]}
        });
        let isLoaded = Boolean(user);

        if (!isLoaded) {
            let error = 'Пользователь с такой почтой и паролем не найден';
            ctx.body = {user: false, error};
            return next();
        }

        delete user.passwordHash;
        ctx.body = {user};
        return next();
    },
    async register(ctx, next) {
        const email = ctx.request.body.email;
        const fullName = ctx.request.body.fullName;
        const password = ctx.request.body.password;
        const role = ctx.request.body.role || 'applicant';

        const passwordHash = md5(password);
        let userData = ctx.request.body;
        let {firstName, secondName, familyName} = splitName(fullName);

        let emailHash = md5( email.toLowerCase() );
        let gravatarUrl = "https://www.gravatar.com/avatar/"+emailHash+".jpg?d=identicon";

        delete userData.password;

        userData = Object.assign(userData, {
            id: shortid.generate(),
            dateRegistered: moment().toISOString(),
            lastUpdated: moment().toISOString(),
            fullName,
            firstName,
            secondName,
            familyName,
            email,
            role,
            gravatarUrl,
            passwordHash,
        });

        const db = await getDb();
        const users = db.collection('users');
        let existingUser = await users.findOne({ email: email });
        if (existingUser) {
            let error = 'Пользователь с такой электропочтой уже зарегистрирован';
            ctx.body = {user: false, error};
            return next();
        }
        else {
            let insertResult = await users.insertOne(userData);
            let user = insertResult.ops[0] || false;
            delete user.passwordHash;

            ctx.body = {user};
            return next();
        }
    },
    async list(ctx, next) {
        let filter = ctx.request.body && ctx.request.body.filter
            ? ctx.request.body.filter || {}
            : {};
        let forUser = ctx.request.body.forUser || false;
        let defaultFilter = {
            deleted: {$in: [null, false]},
        };

        let recruiterRequests = false;
        const db = await getDb();

        if (forUser && forUser.role === 'recruiter') {
            if (filter.vacancyId) {
                const requests = db.collection('requests');
                let query = {
                    vacancyId: filter.vacancyId,
                    deleted: {$in: [null, false]},
                }
                let activeRequests = await requests.find(query).toArray();
                let userIds = activeRequests.map(request => request.applicantId);

                delete filter.vacancyId;
                defaultFilter = {
                    id: {$in: userIds},
                    deleted: {$in: [null, false]},
                }

                recruiterRequests = activeRequests;
            }
            else {
                const vacanciesCollection = db.collection('vacancies');

                let recruiterVacancies = await vacanciesCollection.find({
                    recruiterId: forUser.id,
                    deleted: {$in: [null, false]},
                }).toArray();

                let recruiterVacanciesId = recruiterVacancies.map(vacancy => vacancy.id);

                let requestsQuery = {
                    vacancyId: {$in: recruiterVacanciesId},
                    deleted: {$in: [null, false]},
                };

                const requests = db.collection('requests');
                recruiterRequests = await requests.find(requestsQuery).toArray();
                let recruiterUserIds = recruiterRequests.map( request => request.applicantId );

                defaultFilter = {
                    id: {$in: recruiterUserIds},
                    deleted: {$in: [null, false]},
                }
            }
        }

        filter = Object.assign(defaultFilter, filter);

        const usersCollection = db.collection('users');
        let users = await usersCollection.find(filter).toArray();

        if (recruiterRequests && recruiterRequests.length > 0) {
            users = users.map( user => {
                let userRequests = recruiterRequests.filter( request => request.applicantId === user.id );
                user.requests = userRequests;
                return user;
            });
        }

        ctx.body = {users};
        return next();
    },
    async save(ctx, next) {
        const db = await getDb();
        const users = db.collection('users');

        let userFields = ctx.request.body.user;
        let editUser = ctx.request.body.editUser;

        let fullName = userFields.fullName;
        let {firstName, secondName, familyName} = splitName(fullName);

        let isNew = !userFields.id;
        let id = userFields.id;
        let user = false;

        if (isNew) {
            const passwordHash = userFields.password ? md5(userFields.password) : null;
            delete userFields.password;

            userFields = Object.assign(userFields, {
                id: shortid.generate(),
                firstName,
                secondName,
                familyName,
                passwordHash,
                dateRegistered: moment().toISOString(),
                lastUpdated: moment().toISOString(),
                updatedBy: editUser.id,
            });

            let result = await users.insertOne(userFields);
            user = result.ops[0];
        }
        else {
            if (userFields._id) {
                delete userFields._id;
            }

            if (userFields.password) {
                userFields.passwordHash = md5(userFields.password);
                delete userFields.password;
            }

            if (!userFields.passwordHash) {
                let existingUser = await users.findOne({id});
                userFields.passwordHash = existingUser.passwordHash;
            }

            userFields = Object.assign(userFields, {
                firstName,
                secondName,
                familyName,
                lastUpdated: moment().toISOString(),
                updatedBy: editUser.id,
            });

            let updateResult = await users.findOneAndReplace({id}, userFields, {returnOriginal: false});
            user = updateResult.value || false;
        }

        ctx.body = {user};
        return next();
    },
    async delete(ctx, next) {
        const id = ctx.request.body.id;
        const editUserFields = ctx.request.body.editUser;

        if (!id) {
            ctx.body = {user: false};
            return next();
        }

        const db = await getDb();
        const users = db.collection('users');
        let userFields = await users.findOne({id});

        userFields = Object.assign(userFields, {
            deleted: true,
            dateDeleted: moment().toISOString(),
            deletedBy: editUserFields.id,
        });

        let updateResult = await users.findOneAndReplace({id}, userFields, {returnOriginal: false});
        let user = updateResult.value || false;

        ctx.body = {user};
        return next();
    },
}