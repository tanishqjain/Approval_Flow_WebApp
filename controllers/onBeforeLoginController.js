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

            let token = await security.verifyClientAssertionAndFetchPayload(jws);
            
            let response = {
                "status": "FAIL",
                "data": {
                    "userFacingErrorMessage": "You are not authorized"
                }
            }

            if(await isUserApproved(token.data.params.loginId)){
                response = {
                    "status": "OK"
                }
            }
            
            ctx.body = response;
            
        }
        else {
            ctx.throw(400, "Please pass a consent object on the query string or in the request body");
        }

    }

};

async function isUserApproved(userName){
    try {
        let result = await tableClient.getEntity('ApprovalList',userName);
        if (result.isApproved === true){
            return true
        }
        else{
            return false
    }
    } catch (error) {
        return false
    }
    
}

async function createUserRecord(userName){
    
    try {
        const record = {
            partitionKey: "ApprovalList",
            rowKey: userName,
            isApproved: false
          };
        
        let result = await tableClient.createEntity(record);

        if(result.etag !== '' && result.etag !== null){
            return true
        }
        else{
            console.log('Error in inserting record in table: ' + result)
            return false
        }

    } catch (error) {
        console.log('Error in inserting record in table: ' + error)
    }

}