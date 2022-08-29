const KoaRouter = require('koa-router');
const router = new KoaRouter();
const onBeforeLogin = require('../controllers/onBeforeLoginController.js');

router
  .get('/', async ctx => (ctx.body = 'Utility API'))
  .get('/api/', async ctx => (ctx.body = 'Utility API'))
  .get('/api/onBeforeLogin', onBeforeLogin.process)
  .post('/api/onBeforeLogin', onBeforeLogin.process);

module.exports = router;
