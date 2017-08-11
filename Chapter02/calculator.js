///The Calculator-
/*
Sample CODE
uses context variable
shows logging
shows exception Handling*/


// ************************************ 	CODE 	***********************************

exports.handler = (event, context, callback) => {
    // TODO implement
    console.log("Hello, Starting the Version 1 of "+ context.functionName +" Lambda Function");
    console.log("The event we pass will have two numbers and an operand value");
    // operand can be +, -, /, *, add, sub, mul, div
    
    console.log('Received event:', JSON.stringify(event, null, 2));
    var error, result;
    
    if (isNaN(event.num1) || isNaN(event.num2)) {
        console.error("Invalid Numbers");			// different logging
        error = new Error("Invalid Numbers!");		// Exception Handling
        callback(error);
    }

    switch(event.operand)
    {
        case "+":
        case "add":
            result = event.num1 + event.num2;
            break;
        case "-":
        case "sub":
            result = event.num1 - event.num2;
            break;
        case "*":
        case "mul":
            result = event.num1 * event.num2;
            break;
        case "/":
        case "div":
            if(event.num2 === 0){
            	console.error("The divisor cannot be 0");
                error = new Error("The divisor cannot be 0");
                callback(error, null);
            }
            else{
                result = event.num1/event.num2;
            }
            break;
        default:
            callback("Invalid Operand");
            break;
    }
    console.log("The Result is: " + result);
    
    callback(null, result);	// sent to the caller, since its a RequestResponse invocation, it will be printed in
    										// the Execution Logs below on the screen (Not CloudWatch logs)
};

//************************************	EVENT 	**********************************************************
/*{
    "num1": 3,
    "num2": 0,
    "operand": "div"
}*/

// Try out different combinations

// ************************************ 	OUTPUT 	 	****************************************************
/*START RequestId: 11b2e480-e7fc-11e6-875e-1b1916c372fc Version: $LATEST
2017-01-31T21:27:29.639Z	11b2e480-e7fc-11e6-875e-1b1916c372fc	Hello, Starting the calculator_example Lambda Function
2017-01-31T21:27:29.639Z	11b2e480-e7fc-11e6-875e-1b1916c372fc	The event we pass will have two numbers and an operand value
2017-01-31T21:27:29.639Z	11b2e480-e7fc-11e6-875e-1b1916c372fc	Received event:
{
    "num1": 3,
    "num2": 0,
    "operand": "div"
}

2017-01-31T21:27:29.639Z	11b2e480-e7fc-11e6-875e-1b1916c372fc	The divisor cannot be 0
2017-01-31T21:27:29.639Z	11b2e480-e7fc-11e6-875e-1b1916c372fc
{
    "errorMessage": "The divisor cannot be 0",
    "errorType": "Error",
    "stackTrace": [
        "exports.handler (/var/task/index.js:34:25)"
    ]
}

2017-01-31T21:27:29.639Z	11b2e480-e7fc-11e6-875e-1b1916c372fc	The Result is: undefined
END RequestId: 11b2e480-e7fc-11e6-875e-1b1916c372fc
REPORT RequestId: 11b2e480-e7fc-11e6-875e-1b1916c372fc	Duration: 0.94 ms	Billed Duration: 100 ms Memory Size: 128 MB	Max Memory Used: 9 MB*/	
