const rp = require("request-promise");

// export the variables and functions so that other modules can use them
module.exports.fetchResponseFromEndpoint = fetchResponseFromEndpoint;

//
// Fetch response from endpoint
//
async function fetchResponseFromEndpoint(options) {
    let result = null;
    await rp(options).then(function (response) {
        console.log('Response from fetchResponseFromEndpoint: ' + JSON.stringify(response));
        result = response;
    }).catch(function (err) {
        console.log("Failed to fetch response from endpoint. " + JSON.stringify(err));
    });
    return result;
}