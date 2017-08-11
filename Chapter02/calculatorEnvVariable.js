exports.myHandler = (event, context, callback) => {
    console.log("Starting Version "+ process.env.AWS_LAMBDA_FUNCTION_VERSION +" of "+ context.functionName +" in "+process.env.AWS_REGION);
    // operand can be +, -, /, *, add, sub, mul, div
    
    console.log('Received event:', JSON.stringify(event, null, 2));
    var error;
    
    if (isNaN(process.env.NUM1) || isNaN(process.env.NUM2)) {
        console.error("Invalid Numbers");
        error = new Error("Invalid Numbers!");
        callback(error);
    }
    var res = {};
    res.a = Number(process.env.NUM1);
    res.b = Number(process.env.NUM2);
    var result;
    switch(process.env.OPERAND)
    {
        case "+":
        case "add":
            result = res.a + res.b;
            break;
        case "-":
        case "sub":
            result = res.a - res.b;
            break;
        case "*":
        case "mul":
            result = res.a * res.b;
            break;
        case "/":
        case "div":
            if(res.b === 0){
            	console.error("The divisor cannot be 0");
                error = new Error("The divisor cannot be 0");
                callback(error, null);
                //break;
            }
            else{
                result = res.a/res.b;
                //break;
            }
            break;
        default:
            callback("Invalid Operand");
            break;
    }
    console.log("The Result is: " + result);
    
    callback(null, result);	
};
