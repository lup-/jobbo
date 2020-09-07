const Koa = require('koa');
const Router = require('@koa/router');
const bodyParser = require('koa-bodyparser');
const multer = require('koa-multer');

const vacancy = require('./routes/vacancy');
const user = require('./routes/user');
const file = require('./routes/file');

const PORT = 3000;
const HOST = '0.0.0.0';

const app = new Koa();
const upload = multer({ dest: './uploads/' });
const router = new Router({
    methods: ['OPTIONS', 'GET', 'POST', 'DELETE'],
});

router
    .get('/api/vacancy/:id', vacancy.load)
    .post('/api/vacancy/:id', vacancy.load)
    .post('/api/vacancy', vacancy.save)
    .post('/api/vacancy/list', vacancy.list)
    .post('/api/vacancy/submit', vacancy.submit)
    .post('/api/vacancy/moderation', vacancy.moderation)
    .post('/api/vacancy/delete', vacancy.delete);

router
    .post('/api/vacancy/apply', vacancy.apply)
    .post('/api/vacancy/applyStatus', vacancy.applyStatus)
    .post('/api/vacancy/deleteRequest', vacancy.deleteRequest);

router
    .get('/api/user/:id', user.load)
    .post('/api/user/:id', user.load)
    .post('/api/user/update', user.save)
    .post('/api/user/list', user.list)
    .post('/api/user/login', user.login)
    .post('/api/user/register', user.register)
    .post('/api/user/delete', user.delete);

router
    .post('/api/file/resume', upload.single('resume'), file.resume);

app
    .use(bodyParser({
        formLimit: '50mb',
        jsonLimit: '1mb',
     }))
    .use(router.routes())
    .use(router.allowedMethods());

app.listen(PORT, HOST);