'use strict';
console.log('Loading the Division function');

function ZeroDivisorError(message) {
    this.name = "ZeroDivisorError";
    this.message = message;
}

exports.handler = function(event, context, callback) {
    console.log('Received event:', JSON.stringify(event, null, 2));
    let operand1 = event.a;
    let operand2 = event.b;
    let operator = event.op;

    let res = {};
    res.a = Number(operand1);
    res.b = Number(operand2);
    res.op = operator;

    if(res.b === 0){
        console.log("The divisor cannot be 0");
        const zeroDivisortError = new ZeroDivisorError("The divisor cannot be 0!");
        callback(zeroDivisortError);
    }
    else{
        res.c = res.a/res.b;
        console.log("result: "+res.c);
        callback(null, res);
    }
};


