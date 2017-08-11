'use strict';
console.log('Loading the Subtraction function');

exports.handler = function(event, context, callback) {
    console.log('Received event:', JSON.stringify(event, null, 2));
    let operand1 = event.a;
    let operand2 = event.b;
    let operator = event.op;

    let res = {};
    res.a = Number(operand1);
    res.b = Number(operand2);
    res.op = operator;

    res.c = res.a - res.b;
    console.log("result: "+res.c);
    callback(null, res);
};


