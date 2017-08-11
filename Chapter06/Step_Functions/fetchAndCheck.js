'use strict';
console.log('Loading the Calc function');

function InvalidInputError(message) {
    this.name = "InvalidInputError";
    this.message = message;
}

function InvalidOperandError(message) {
    this.name = "InvalidOperandError";
    this.message = message;
}

exports.handler = function(event, context, callback) {
    console.log('Received event:', JSON.stringify(event, null, 2));
    let operand1 = event.operand1;
    let operand2 = event.operand2;
    let operator = event.operator;

    InvalidInputError.prototype = new Error();
    
    if (operand1 === undefined || operand2 === undefined || operator === undefined) {
        console.log("Invalid Input");
        const invalidInputError = new InvalidInputError("Invalid Input!");
        return callback(invalidInputError);
    }
    
    let res = {};
    res.a = Number(operand1);
    res.b = Number(operand2);
    res.op = operator;
    
    InvalidOperandError.prototype = new Error();

    if (isNaN(operand1) || isNaN(operand2)) {
        console.log("Invalid Operand");
        const invalidOperandError = new InvalidOperandError("Invalid Operand!");
        return callback(invalidOperandError);
    }

    callback(null, res);
};


