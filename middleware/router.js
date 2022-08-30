const KoaRouter = require('koa-router');
const router = new KoaRouter();
const onBeforeLogin = require('../controllers/onBeforeLoginController.js');
const onBeforeAccountsRegister = require('../controllers/onBeforeAccountsRegister');

router
  .get('/', async ctx => (ctx.body = 'Utility API'))
  .get('/api/', async ctx => (ctx.body = 'Utility API'))
  .get('/api/onBeforeLogin', onBeforeLogin.process)
  .post('/api/onBeforeLogin', onBeforeLogin.process)
  .get('/api/onBeforeAccountsregister', onBeforeAccountsRegister.process)
  .post('/api/onBeforeAccountsregister', onBeforeAccountsRegister.process);

module.exports = router;
