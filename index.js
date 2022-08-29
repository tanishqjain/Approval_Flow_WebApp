const Koa = require('koa');
const app = new Koa();
const router = require('./middleware/router');
const logger = require('koa-logger');
const bodyParser = require('koa-body');
const cors = require('@koa/cors');

var options = {
  origin: '*'
};

app.use(cors(options));
app.use(logger());
app.use(bodyParser());
app.use(router.routes());
app.use(router.allowedMethods());

app.on('error', (err, ctx) => {
  console.log('server error', err, ctx);
});

const port = process.env.PORT || 1337;
  app.listen(port, () =>
  console.log(`Server running on http://localhost:${port}`)
  );