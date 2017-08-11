'use strict';
console.log('Loading the Calc function');

var AWSXRay = require('aws-xray-sdk-core');
var AWS = AWSXRay.captureAWS(require('aws-sdk'));
var documentClient = new AWS.DynamoDB.DocumentClient({signatureVersion: 'v4'});
const tableName = process.env.TABLE_NAME;
const createResponse = (statusCode, body) => {
    return {
        "statusCode": statusCode,
        "body": body || ""
    }
};
let response;

exports.handler = function(event, context, callback) {
    console.log('Received event:', JSON.stringify(event, null, 2));
    let operand1 = event.pathParameters.operand1;
    let operand2 = event.pathParameters.operand2;
    let operator = event.pathParameters.operator;

    if (operand1 === undefined || operand2 === undefined || operator === undefined) {
        console.log("400 Invalid Input");
        response = createResponse(400, "400 Invalid Input");
        return callback(null, response);
    }
    
    let res = {};
    res.a = Number(operand1);
    res.b = Number(operand2);
    res.op = operator;
    
    if (isNaN(operand1) || isNaN(operand2)) {
        console.log("400 Invalid Operand");
        response = createResponse(400, "400 Invalid Operand");
        return callback(null, response);
    }

    switch(operator)
    {
        case "add":
            res.c = res.a + res.b;
            break;
        case "sub":
            res.c = res.a - res.b;
            break;
        case "mul":
            res.c = res.a * res.b;
            break;
        case "div":
            if(res.b === 0){
                console.log("The divisor cannot be 0");
                response = createResponse(400, "400 The divisor cannot be 0");
                return callback(null, response);
            }
            else{
                res.c = res.a/res.b;
            }
            break;
        default:
            console.log("400 Invalid Operator");
            response = createResponse(400, "400 Invalid Operator");
            return callback(null, response);
            break;
    }
    console.log("result: "+res.c);
    console.log("Writing to DynamoDB");

    let item = {
        calcAnswer: res.c,
        operand1: res.a,
        operand2: res.b,
        operator: res.op
    };

    let params = {
        TableName: tableName,
        Item: item
    };

    documentClient.put(params, (err, data) => {
        if (err){
            console.log("An error occured while writing to Db: ",err);
            response = createResponse(500, err);
        }
        else{
            console.log("Successfully wrote result to DB");
            response = createResponse(200, JSON.stringify(res));
        }
        callback(null, response);
    });
};
