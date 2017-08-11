exports.handler = (event, context, callback) => {
    // TODO implement
    console.log("Hello, Starting the Version 1 of "+ context.functionName +" Lambda Function");
    console.log("The event we pass will have two numbers and an operand value");
    // operand can be +, -, /, *, add, sub, mul, div
    
    console.log('Received event:', JSON.stringify(event, null, 2));
    var error, result;
    
    if (isNaN(event.num1) || isNaN(event.num2)) {
        console.error("Invalid Numbers");			// different logging
        //error = new Error("Invalid Numbers!");		// Exception Handling
        return callback("Invalid Numbers!");
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
                //error = new Error("The divisor cannot be 0");
                return callback("The divisor cannot be 0");
            }
            else{
                result = event.num1/event.num2;
            }
            break;
        default:
            return callback("Invalid Operand");
            break;
    }
    console.log("The Result is: " + result);
    return callback(null, result); // sent to the caller, since its a RequestResponse invocation, it will be printed in
                                            // the Execution Logs below on the screen (Not CloudWatch logs)
    
    
};

//************************************	EVENT 	**********************************************************
/*{
    "num1": 3,
    "num2": 0,
    "operand": "div"
}*/
