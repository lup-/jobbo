const getDb = require('../database');
const shortid = require('shortid');
const moment = require('moment');

const MODERATION_ACCEPTED = 'accepted';
const MODERATION_REJECTED = 'rejected';

const STATUS_DRAFT = 'draft';
const STATUS_PUBLISHED = 'published';
const STATUS_ON_MODERATION = 'pending';

const REQUEST_PENDING = 'pending';
const REQUEST_ACCEPTED = 'accepted';
const REQUEST_REJECTED = 'rejected';


async function replaceVacancyFields(id, changedFields) {
    const db = await getDb();
    const vacancies = db.collection('vacancies');
    let vacancyFields = await vacancies.findOne({id});

    vacancyFields = Object.assign(vacancyFields, changedFields);

    let updateResult = await vacancies.findOneAndReplace({id}, vacancyFields, {returnOriginal: false});
    return updateResult.value || false;
}

async function replaceRequestFields(id, changedFields) {
    const db = await getDb();
    const requests = db.collection('requests');
    let requestFields = await requests.findOne({id});

    requestFields = Object.assign(requestFields, changedFields);

    let updateResult = await requests.findOneAndReplace({id}, requestFields, {returnOriginal: false});
    return updateResult.value || false;
}

function applyRequestsToVacancies(vacancies, requests) {
    return vacancies.map( vacancy => {
        let vacancyRequests = requests.filter( request => request.vacancyId === vacancy.id );
        if (vacancyRequests) {
            vacancy.requests = vacancyRequests;
        }

        return vacancy;
    });
}

module.exports = {
    async load(ctx, next) {
        const id = ctx.params.id;
        let forUser = ctx.request.body.forUser || false;

        if (!id) {
            ctx.body = {vacancy: false};
            return next();
        }

        const db = await getDb();
        const vacancies = db.collection('vacancies');
        let vacancy = await vacancies.findOne({id});

        if (vacancy && forUser && forUser.role === 'recruiter') {
            const requests = db.collection('requests');
            let query = {
                vacancyId: id,
                deleted: {$in: [null, false]},
            };

            let activeRequests = await requests.find(query).toArray();
            vacancy.requests = activeRequests;
        }

        ctx.body = {vacancy};
        return next();
    },
    async submit(ctx, next) {
        const id = ctx.request.body.id;
        const userFields = ctx.request.body.user;

        if (!id) {
            ctx.body = {vacancy: false};
            return next();
        }

        let vacancy = await replaceVacancyFields(id, {
            status: STATUS_ON_MODERATION,
            dateSubmitted: moment().toISOString(),
            submittedBy: userFields.id,
        });

        ctx.body = {vacancy};
        return next();
    },
    async moderation(ctx, next) {
        const id = ctx.request.body.id;
        const moderationStatus = ctx.request.body.status || false;
        const isAccepted = moderationStatus === MODERATION_ACCEPTED;
        const moderationComment = ctx.request.body.comment || false;
        const userFields = ctx.request.body.user;

        if (!id || !moderationStatus) {
            ctx.body = {vacancy: false};
            return next();
        }

        let vacancy = await replaceVacancyFields(id, {
            status: isAccepted ? STATUS_PUBLISHED : STATUS_DRAFT,
            dateModerated: moment().toISOString(),
            moderationStatus,
            moderationComment,
            moderatorId: userFields.id,
        });

        ctx.body = {vacancy};
        return next();
    },
    async list(ctx, next) {
        let filter = ctx.request.body && ctx.request.body.filter
            ? ctx.request.body.filter || {}
            : {};
        let forUser = ctx.request.body.forUser || false;
        let defaultFilter = {
            deleted: {$in: [null, false]},
        };

        filter = Object.assign(defaultFilter, filter);

        const db = await getDb();
        const vacanciesCollection = db.collection('vacancies');
        let vacancies = await vacanciesCollection.find(filter).toArray();

        if (forUser && forUser.role === 'applicant') {
            const requests = db.collection('requests');
            let query = {
                applicantId: forUser.id,
                deleted: {$in: [null, false]},
            };

            let activeRequests = await requests.find(query).toArray();
            vacancies = applyRequestsToVacancies(vacancies, activeRequests);
        }

        if (forUser && forUser.role === 'recruiter') {
            const requests = db.collection('requests');

            let vacancyPromises = vacancies.map( vacancy => {
                let query = {
                    vacancyId: vacancy.id,
                    deleted: {$in: [null, false]},
                };

                return requests.find(query).toArray().then(requests => {
                    vacancy.requests = requests;
                    return vacancy;
                });
            });

            vacancies = await Promise.all(vacancyPromises);
        }

        ctx.body = {vacancies};
        return next();
    },
    async save(ctx, next) {
        const db = await getDb();
        const vacancies = db.collection('vacancies');

        let vacancyFields = ctx.request.body.vacancy;
        let userFields = ctx.request.body.user;
        let isNew = !vacancyFields.id;
        let vacancy = false;

        if (isNew) {
            vacancyFields = Object.assign(vacancyFields, {
                id: shortid.generate(),
                status: STATUS_DRAFT,
                dateCreated: moment().toISOString(),
                lastUpdated: moment().toISOString(),
                recruiterId: userFields.id,
                updatedBy: userFields.id,
            });

            let result = await vacancies.insertOne(vacancyFields);
            vacancy = result.ops[0];
        }
        else {
            let id = vacancyFields.id;

            if (vacancyFields._id) {
                delete vacancyFields._id;
            }

            vacancyFields = Object.assign(vacancyFields, {
                status: STATUS_DRAFT,
                lastUpdated: moment().toISOString(),
                updatedBy: userFields.id,
            });

            let updateResult = await vacancies.findOneAndReplace({id}, vacancyFields, {returnOriginal: false});
            vacancy = updateResult.value || false;
        }

        ctx.body = {vacancy};
        return next();
    },
    async delete(ctx, next) {
        const id = ctx.request.body.id;
        const userFields = ctx.request.body.user;

        if (!id) {
            ctx.body = {vacancy: false};
            return next();
        }

        let vacancy = await replaceVacancyFields(id, {
            deleted: true,
            dateDeleted: moment().toISOString(),
            deletedBy: userFields.id,
        });

        ctx.body = {vacancy};
        return next();
    },
    async apply(ctx, next) {
        const vacancy = ctx.request.body.vacancy;
        const user = ctx.request.body.user;

        if (!vacancy || !user) {
            ctx.body = {vacancy: false, request: false};
            return next();
        }

        let requestFields = {
            id: shortid.generate(),
            status: REQUEST_PENDING,
            dateCreated: moment().toISOString(),
            lastUpdated: moment().toISOString(),
            vacancyId: vacancy.id,
            applicantId: user.id,
        };

        const db = await getDb();
        const requests = db.collection('requests');
        let result = await requests.insertOne(requestFields);
        let request = result.ops[0];

        if (!vacancy.requests) {
            vacancy.requests = [];
        }

        vacancy.requests.push(request);

        ctx.body = {vacancy, request};
        return next();
    },
    async applyStatus(ctx, next) {
        const id = ctx.request.body.id;
        const status = ctx.request.body.status;
        const editUser = ctx.request.body.editUser;

        let request = await replaceRequestFields( id, {
            status,
            lastUpdated: moment().toISOString(),
            recruiterId: editUser.id,
            updatedBy: editUser.id,
        });

        let vacancy = await replaceVacancyFields(request.vacancyId, {
            lastUpdated: moment().toISOString(),
        });

        ctx.body = {vacancy, request};
        return next();
    },
    async deleteRequest(ctx, next) {
        const id = ctx.request.body.id;
        const editUser = ctx.request.body.editUser;

        if (!id) {
            ctx.body = {vacancy: false};
            return next();
        }

        let request = await replaceRequestFields(id, {
            deleted: true,
            dateDeleted: moment().toISOString(),
            deletedBy: editUser.id,
        });

        ctx.body = {request};
        return next();
    },
}