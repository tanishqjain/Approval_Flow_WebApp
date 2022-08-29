const common = require("../common/common.js");
const jwt = require("jsonwebtoken");
const getPem = require("rsa-pem-from-mod-exp");
const NodeCache = require('node-cache');
const cache = new NodeCache();

// export the variables and functions so that other modules can use them
module.exports.verifyClientAssertionAndFetchPayload = verifyClientAssertionAndFetchPayload;
module.exports.fetchJWTPublicKey = fetchJWTPublicKey;

//
// Verify jws and fetch payload
//
async function verifyClientAssertionAndFetchPayload(jws) {

    let n = process.env["nEncoding"];
    let e = process.env["eExponent"];
    let kid = process.env["kidId"];

    let token = null;

    try {
        var decoded = await jwt.decode(jws, { complete: true });

        if (decoded && decoded.payload) {

            const apiKey = decoded.payload.apiKey;

            // If the kid of the header of the payload doesn't match the kid stored in Azure Key Vault,
            // then, the public key has changed. Therefore, fetch the latest public key to verify the JWS.
            if (kid != decoded.header.kid) {
                const publicKey = await fetchJWTPublicKey(apiKey);
                const key = publicKey.keys[0];
                n = key.n;
                console.log("n: " + n);
                e = key.e;
                console.log("e: " + e);
            }

            // verify the JWS and return the payload
            var cert = getPem(n, e);
            await jwt.verify(jws, cert, { algorithms: ["RS256"] }, function (err, payload) {
                if (err) {
                    console.log("Error verifying the jws. " + JSON.stringify(err));
                }
                else if (payload) {
                    token = payload;
                }
            });

        }

    } catch (err) {
        console.log("Failed to verify the jws", err);
    }
    return token;
}

//
// Fetch response for token
//
async function fetchJWTPublicKey(apiKey) {
    let response = null;
    const getJWTPublicKeyEndpoint = "https://accounts.us1.gigya.com//accounts.getJWTPublicKey";
    const queries = {
        apiKey: apiKey,
        V2: "true"
    };
    try {
        var options = {
            uri: getJWTPublicKeyEndpoint,
            qs: queries,
            headers: {
                "Content-Type": "application/json",
                "Accept": "*/*"
            },
            method: "GET",
            json: true
        };
        response = await common.fetchResponseFromEndpoint(options);
    } catch (err) {
        console.log("Fetch response failed", err);
    }
    return response;
}