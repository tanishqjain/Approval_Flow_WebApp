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
            console.log('onBeforeAccountRegister JWS: ' + jws);

            //Verify and Decode the JWT
            let token = await security.verifyClientAssertionAndFetchPayload(jws);

            //Create a table entity
            try {
                const record = {
                    partitionKey: "ApprovalList",
                    rowKey: token.data.params.userName,
                    isApproved: false
                };

                //Insert the entity into Azure table storage
                let result = await tableClient.createEntity(record);

                //Error handling while setting the entity
                if (result.etag == '' || result.etag === null) {
                    console.log('Error in inserting record in table: ' + result)
                }

                //Send the response to Gigya extension
                ctx.body = {
                    "status": "OK"
                };

            } catch (error) {
                console.log('Error in inserting record in table: ' + error)
            }

        }
        else {
            ctx.throw(400, "Please pass a consent object on the query string or in the request body");
        }

    }

};