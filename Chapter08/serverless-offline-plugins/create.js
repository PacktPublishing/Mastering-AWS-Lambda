// food name and description
'use strict';
console.log('Loading the foodFeedback function');
var AWS = require("aws-sdk");
var dynamodb = require('serverless-dynamodb-client');
var docClient = dynamodb.doc;
const uuidv4 = require('uuid/v4');
const tableName = process.env.TABLE_NAME;
const createResponse = (statusCode, body) => {
    return {
        "statusCode": statusCode,
        "body": body || ""
    }
};
let response;

module.exports.handler = function(event, context, callback) {
    console.log('Received event:', JSON.stringify(event, null, 2));
    let name = event.pathParameters.name;
    let description = event.pathParameters.description;
    console.log("Writing to DynamoDB");

    let item = {
        "id": uuidv4(),
        "name": name,
        "description": description
    };

    let params = {
        "TableName": tableName,
        "Item": item
    };

    docClient.put(params, (err, data) => {
        if (err){
            console.log("An error occured while writing to Db: ",err);
            response = createResponse(500, err);
        }
        else{
            console.log("Successfully wrote result to DB");
            response = createResponse(200, JSON.stringify(params));
        }
        callback(null, response);
    });
};


