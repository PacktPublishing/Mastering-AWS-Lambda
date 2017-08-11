'use strict';
console.log('Loading the InsertInDB function');
let doc = require('dynamodb-doc');
let dynamo = new doc.DynamoDB();
const tableName = process.env.TABLE_NAME;

exports.handler = function(event, context, callback) {
    console.log('Received event:', JSON.stringify(event, null, 2));

    console.log("Writing to DynamoDB");

    let item = {
        "calcAnswer": event.c,
        "operand1": event.a,
        "operand2": event.b,
        "operator": event.op
    };

    let params = {
        "TableName": tableName,
        "Item": item
    };

    dynamo.putItem(params, (err, data) => {
        if (err){
            console.log("An error occured while writing to Db: ",err);
            callback(err);
        }
        else{
            console.log("Successfully wrote result to DB");
            callback(null, "success!");
        }
    });
};


