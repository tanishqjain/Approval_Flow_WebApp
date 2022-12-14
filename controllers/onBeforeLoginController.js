const security = require("../common/security.js");
const { TableClient, AzureNamedKeyCredential } = require("@azure/data-tables");

// Enter your storage account name and shared key
const account = process.env['STORAGE_ACCOUNT_NAME'];
const accountKey = process.env['STORAGE_ACCOUNT_KEY'];;
const tableName = process.env['STORAGE_ACCOUNT_TABLE_NAME'];

const credential = new AzureNamedKeyCredential(account, accountKey);
const tableClient = new TableClient(`https://${account}.table.core.windows.net`, `${tableName}`, credential);

module.exports = {

    async process(ctx, next) {

        if (ctx.request.query.jws || (ctx.request.body && ctx.request.body.jws)) {

            const jws = ctx.request.query.jws || (ctx.request.body && ctx.request.body.jws);
            console.log('onBeforeLogin JWS: ' + jws);

            //Verify and Decode the JWT
            let token = await security.verifyClientAssertionAndFetchPayload(jws);

            let response = {
                "status": "FAIL",
                "data": {
                    "userFacingErrorMessage": "You are not authorized"
                }
            }

            //Read the record from table
            try {
                let result = await tableClient.getEntity('ApprovalList', token.data.params.loginId);

                if (result.isApproved === true) {
                    response = {
                        "status": "OK"
                    }
                }

            } catch (error) {
                console.log('Error in reading record from table: ' + error)
            }

            ctx.body = response;

        }
        else {
            ctx.throw(400, "Please pass a consent object on the query string or in the request body");
        }

    }

};