const security = require("../common/security.js");

module.exports = {

    async process(ctx, next) {

        if (ctx.request.query.jws || (ctx.request.body && ctx.request.body.jws)) {

            const jws = ctx.request.query.jws || (ctx.request.body && ctx.request.body.jws);
            console.log('onBeforeLogin JWS: ' + jws);
            let token = await security.verifyClientAssertionAndFetchPayload(jws);
            console.log('onBeforeLogin JWS: ' + token);
            
        }
        else {
            ctx.throw(400, "Please pass a consent object on the query string or in the request body");
        }

    }

};